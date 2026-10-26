# Dar LaMamy — Channel Manager Design

Date: 2026-10-17
Status: approved design, pending implementation plan

## 1. Objective

Build a central reservation and inventory system for Dar LaMamy that prevents double bookings and can synchronize each room with Booking.com, Airbnb, and other channels.

The first production integration uses bidirectional iCalendar feeds. The architecture must also support future partner APIs or an external channel manager without replacing the admin interface or the canonical reservation model.

All channel configuration must be manageable from the Dar LaMamy admin interface. No source-code edit should be required to add, enable, disable, map, or synchronize a channel.

## 2. Product principles

- Supabase is the canonical store for rooms, reservations, channel mappings, and synchronization history.
- A local room is mapped independently to one listing or calendar per external channel.
- Disabling a channel stops synchronization but preserves mappings, imported reservations, and audit history.
- External calendar URLs and future API credentials are secrets. They must never be returned to browser clients after being saved.
- External bookings block inventory but remain distinguishable from direct website reservations.
- The database, not the browser, is the final authority for rejecting overlapping active reservations.
- Synchronization operations are idempotent and observable.

## 3. Delivery strategy

### Phase 0 — Stabilize direct reservations

The existing API reads room fields that are not consistently present in the deployed schema. Before channel work begins:

- normalize the `rooms` schema and generated TypeScript types;
- make room listing, pricing, availability, and reservation creation use the same canonical fields;
- validate prices and capacities only on the server;
- create direct reservations atomically;
- add API and integration tests for pricing, availability, successful creation, invalid dates, capacity, and overlap rejection.

This phase is a release prerequisite because external synchronization must not be built on an inconsistent inventory model.

### Phase 1 — Configurable iCalendar channels

- Add channel management and per-room mappings in the admin.
- Import external `.ics` feeds into canonical reservations.
- Expose one protected, unguessable export feed per local room.
- Add manual synchronization, enable/disable controls, last-run status, and sanitized errors.
- Initially support presets for Airbnb, Booking.com, Expedia/Vrbo, Tripadvisor, and a custom iCalendar channel.

### Phase 2 — Automation and operations

- Run recurring imports through one authenticated server-side synchronization endpoint.
- Add retries with bounded exponential backoff.
- Add stale-feed, repeated-failure, unmapped-room, and conflict alerts.
- Add a central admin calendar and channel filters.
- Add operational dashboards for success rate and last successful synchronization.

### Phase 3 — Partner API connectors

- Add connector implementations behind the same channel interface when credentials and partner approvals are available.
- Support reservations, modifications, cancellations, availability, rates, and restrictions according to each provider's capabilities.
- Keep iCalendar available as a fallback per mapping.

## 4. Domain model

### `booking_channels`

One row per configured platform connection.

- `id uuid primary key`
- `name text not null`
- `provider text not null` — `airbnb`, `booking`, `expedia`, `tripadvisor`, or `custom`
- `connection_type text not null` — initially `ical`; later `api` or `channel_manager`
- `enabled boolean not null default true`
- `sync_interval_minutes integer not null default 15`
- `encrypted_credentials text null`
- `last_sync_at timestamptz null`
- `last_success_at timestamptz null`
- `last_status text null`
- `last_error_code text null`
- timestamps and creating/updating admin identifiers

Constraints restrict provider, connection type, and reasonable synchronization intervals.

### `channel_room_mappings`

One row per local room and channel listing.

- `id uuid primary key`
- `channel_id uuid not null`
- `room_id uuid not null`
- `external_listing_id text null`
- `external_listing_name text null`
- `encrypted_import_url text null`
- `export_token_hash text not null`
- `enabled boolean not null default true`
- `last_import_cursor text null`
- `last_sync_at timestamptz null`
- `last_success_at timestamptz null`
- timestamps

A unique constraint on `(channel_id, room_id)` prevents duplicate mappings. Export tokens are generated from cryptographically secure random bytes. Only their hashes are stored.

### `reservations`

The current table remains canonical and is extended with:

- `source text not null default 'direct'`
- `channel_id uuid null`
- `channel_mapping_id uuid null`
- `external_uid text null`
- `external_revision text null`
- `external_status text null`
- `imported_at timestamptz null`
- `last_seen_at timestamptz null`
- `raw_external_data jsonb null`

Personally identifiable data from external feeds is stored only when provided and needed operationally. Raw data is server-only and subject to a retention limit.

A partial unique index on `(channel_mapping_id, external_uid)` for external rows makes imports idempotent.

### `channel_sync_runs`

Audit record for every manual or scheduled operation:

- channel and optional mapping;
- trigger type (`manual`, `scheduled`, `webhook`);
- start and completion timestamps;
- status;
- counts for fetched, created, updated, cancelled, skipped, and conflicted items;
- sanitized error code and message;
- correlation identifier.

Detailed credentials, full private calendar URLs, and raw authorization headers must never be logged.

### `reservation_conflicts`

Records external events that cannot safely be applied, including the room, dates, source event, conflicting reservation, resolution status, and admin notes. A conflict never silently overwrites an existing confirmed stay.

## 5. Inventory and overlap protection

Statuses that consume inventory are `pending`, `confirmed`, and `blocked`. Cancelled or rejected reservations do not consume inventory.

PostgreSQL enforces non-overlap for inventory-consuming reservations with an exclusion constraint based on `room_id` and a half-open date range `[check_in, check_out)`. This allows one guest to check out on the same day another guest checks in.

All reservation creation paths call one server-side transaction/RPC that:

1. validates the room and guest capacity;
2. validates booking rules and dates;
3. calculates the authoritative price for direct reservations;
4. inserts the reservation;
5. converts database overlap violations into a stable `409 availability_conflict` response.

Client-side availability checks remain advisory. Only the transactional insert is authoritative.

## 6. Connector boundary

Channel integrations implement one internal contract:

- `validateConfiguration()`
- `pullReservations(mapping, window)`
- `pushAvailability(mapping, changes)` when supported
- `pushRates(mapping, changes)` when supported
- `healthCheck()`

The iCalendar connector implements import and export. It does not claim to synchronize guest payments, complete guest profiles, prices, promotions, or provider-specific restrictions.

Future Booking.com, Airbnb, or third-party channel-manager connectors can implement richer capabilities without changing the canonical reservation service or admin screens. The UI reads declared connector capabilities and disables unsupported controls.

## 7. iCalendar synchronization

### Import

For each enabled mapping, the worker fetches the decrypted import URL server-side with strict timeouts, response-size limits, redirect limits, and content validation.

The parser uses `UID` as the external identity and stores a stable revision derived from `SEQUENCE`, `LAST-MODIFIED`, dates, and status. Repeated imports update the same reservation rather than creating duplicates.

- New active event: create an external reservation or a conflict record.
- Changed dates/status: update the canonical reservation if safe; otherwise create a conflict.
- Cancelled event: mark the imported reservation cancelled.
- Event missing from a successfully fetched authoritative window: mark it stale first; cancel only after a second successful observation to avoid destructive changes caused by partial feeds.

Imports cover the provider-supported future window plus a short historical reconciliation window.

### Export

Each enabled room mapping has a read-only `.ics` endpoint identified by a long random token. The feed exports only inventory-consuming date ranges with opaque event identifiers and minimal descriptions. It excludes guest PII, internal notes, prices, and source credentials.

Regenerating the export token immediately invalidates the previous URL.

### Scheduling

The production scheduler invokes one authenticated synchronization endpoint every 15 minutes. The endpoint obtains a database advisory lock per mapping, preventing concurrent runs. Admin users may request a manual synchronization, but it uses the same queue/lock path.

Airbnb and other external platforms may refresh imported feeds on their own slower schedule, so the admin must display both the local last-sync time and a warning that external propagation is not instantaneous.

## 8. Admin experience

Add **Admin → Canaux de réservation** with:

### Channel list

- platform logo/name and connection type;
- enabled/disabled switch;
- health state: healthy, stale, warning, or error;
- last successful synchronization;
- active room mappings;
- actions: configure, synchronize now, disable, archive.

### Channel editor

- provider preset or custom channel;
- display name;
- synchronization interval;
- connection-specific credentials;
- validation button before activation;
- capability summary.

After a secret is saved, the API returns only a boolean such as `has_import_url`; it never returns the secret value. Replacing a secret requires entering it again.

### Room mappings

For every local room:

- enable mapping;
- external listing identifier/name;
- private import URL;
- generated Dar LaMamy export URL with copy and rotate actions;
- mapping-level health and last synchronization.

### Central calendar

- month/week/list views;
- filters by room, source, channel, and status;
- distinct source colors plus accessible text labels;
- conflict banner and resolution workflow;
- direct link to the reservation detail.

### Synchronization history

- manual and scheduled runs;
- processed counts and duration;
- sanitized errors;
- retry action;
- correlation ID for support.

## 9. API surface and authorization

All configuration and operational endpoints live under `/api/admin/channels/*` and use the existing server-side admin authorization guard.

Representative endpoints:

- `GET/POST /api/admin/channels`
- `GET/PATCH/DELETE /api/admin/channels/:id`
- `GET/POST /api/admin/channels/:id/mappings`
- `PATCH/DELETE /api/admin/channels/:id/mappings/:mappingId`
- `POST /api/admin/channels/:id/validate`
- `POST /api/admin/channels/:id/sync`
- `GET /api/admin/channels/:id/runs`
- `GET/PATCH /api/admin/reservation-conflicts`
- `POST /api/internal/channel-sync` for the authenticated scheduler
- `GET /api/calendar/:token.ics` for read-only calendar export

Admin mutations validate payloads with Zod, enforce CSRF/origin protections appropriate to the existing session model, and are rate-limited. Internal scheduling uses a dedicated secret and never an admin browser session.

Supabase RLS denies public access to channel configuration, mappings, sync logs, conflict details, and external raw data. Public clients cannot read secret-bearing rows. Server routes use server-only credentials after explicit authorization.

## 10. Secret handling and outbound-request safety

Private calendar URLs and future provider credentials are encrypted using authenticated encryption with a server-held key that is not stored in Supabase or exposed through `NEXT_PUBLIC_*` variables.

Outbound imports must defend against SSRF:

- only `https` is accepted in production;
- DNS and resolved addresses are rejected for loopback, link-local, private, multicast, and metadata ranges;
- redirects are revalidated;
- ports are restricted;
- response size, duration, and content type are bounded.

The admin UI displays redacted host information only.

## 11. Error handling and observability

Stable error codes separate configuration, authentication, provider, parsing, conflict, timeout, and internal failures. User-facing messages remain actionable and do not expose secrets or stack traces.

Repeated failures trigger backoff and change channel health to warning/error. One broken mapping does not stop other mappings. A run records partial success accurately.

Operational metrics include:

- last successful synchronization per mapping;
- synchronization duration and success rate;
- number of imported changes;
- unresolved conflicts;
- stale enabled mappings;
- consecutive failures.

## 12. Testing and acceptance criteria

### Automated tests

- room-schema and direct-reservation regression tests;
- transactional overlap tests, including simultaneous requests;
- iCalendar parsing fixtures for create, update, cancellation, duplicate, missing event, timezone, and malformed feed;
- connector contract tests;
- encryption/redaction tests;
- SSRF protection tests;
- admin authorization tests for every mutation;
- RLS tests proving public/unauthorized users cannot read or mutate channel data;
- export-feed privacy tests;
- synchronization retry, locking, and partial-failure tests.

### End-to-end acceptance

An admin can:

1. add and enable an Airbnb channel without code changes;
2. map each Dar LaMamy room to its external calendar;
3. copy a separate export URL for each room;
4. run synchronization and see its result;
5. see an imported stay block direct booking availability;
6. run the same import twice without duplicates;
7. disable the channel while preserving imported history;
8. resolve a detected overlap from the central calendar;
9. verify that no private URL or guest PII appears in public APIs or exported feeds.

The release is complete only when the direct reservation flow and the iCalendar import/export flow pass production-like integration tests against the deployed Supabase schema.

## 13. Explicit non-goals for the first release

- scraping Booking.com, Airbnb, or any other provider;
- claiming real-time propagation through iCalendar;
- synchronizing payments through iCalendar;
- building provider API integrations without approved credentials and partner access;
- automatically overwriting a confirmed local reservation to resolve an external conflict;
- storing plaintext provider secrets.

## 14. Rollout and recovery

Migrations are additive first. Existing direct reservations remain intact. New overlap enforcement is enabled only after a preflight report identifies and resolves existing conflicting rows.

iCalendar channels launch disabled. An admin configures and validates mappings, runs a dry-run import, reviews proposed changes, and explicitly enables live synchronization.

The system supports:

- disabling an individual mapping or channel;
- rotating export tokens;
- retrying failed runs;
- replaying an import idempotently;
- retaining audit records during rollback.

No external connection is enabled automatically during deployment.
