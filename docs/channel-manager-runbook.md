# Reservation & Channel Manager runbook

## Release status

The direct-reservation and iCalendar channel-manager code is implemented and verified against the disposable local Supabase stack. Production migrations, real partner feeds, scheduler activation, and live-data smoke tests are deliberately not performed without explicit approval.

## Required secrets

- `CHANNEL_ENCRYPTION_KEY`: exactly 32 random bytes encoded as base64. It encrypts imported iCalendar URLs with AES-256-GCM. Back it up in the deployment secret store; losing it makes saved import URLs unreadable.
- `CHANNEL_SCHEDULER_SECRET`: a long independent random bearer secret used only by `POST /api/internal/channel-sync`.
- Existing server-only `SUPABASE_SERVICE_ROLE_KEY`. Never expose any of these as `NEXT_PUBLIC_*`.
- `NEXT_PUBLIC_SITE_URL`: the canonical HTTPS origin. Admin mutations with a missing or different `Origin` are rejected.

Example generation commands (run locally and store the output directly in the secret manager):

```bash
openssl rand -base64 32
openssl rand -base64 48
```

## Pre-deployment gate

1. Take a database backup and confirm restore access.
2. Run `npm run audit:channel-schema` against production in read-only mode. Active overlap count must be zero.
3. Review every pending migration with `supabase migration list`; do not run `supabase db push` until the owner explicitly approves.
4. Confirm `CHANNEL_ENCRYPTION_KEY`, `CHANNEL_SCHEDULER_SECRET`, `NEXT_PUBLIC_SITE_URL`, and Supabase secrets exist in the target environment.
5. Deploy application code first only when its database compatibility has been reviewed; apply migrations in their timestamp order during the approved maintenance window.
6. Create channels disabled, validate each import, create mappings/tokens, and only then activate one channel at a time.

## Scheduler

Call the protected endpoint every 15 minutes from the hosting platform scheduler:

```text
POST https://<canonical-host>/api/internal/channel-sync
Authorization: Bearer <CHANNEL_SCHEDULER_SECRET>
```

Expected success is HTTP 200 with aggregate counts. HTTP 401 means the bearer secret is wrong; 503 means it is not configured. Mapping leases prevent overlapping workers. Transient failures retry with bounded backoff and channel health becomes degraded/failing. Alert when a channel is failing, its last successful sync exceeds twice its configured interval, or the scheduler stops producing runs.

## Operator workflow

1. Admin → Canaux & calendriers → create a disabled provider/custom channel.
2. Save the provider HTTPS iCalendar URL. The UI never reads it back.
3. Link rooms independently. For exports, generate the private URL and paste it into the partner immediately; the plaintext URL is displayed once and only a hint/hash remains.
4. Validate imports, run a manual synchronization, inspect the run history, then activate.
5. Use Calendrier central for room/source/status filtering and open conflicts.
6. Resolve conflicts only by ignoring the external event, cancelling a provably imported block, or marking it resolved after a documented external/manual correction.

## Incident and rollback

- Disable the affected mapping or channel first. This stops future sync without deleting reservations, conflicts, or run history.
- Rotate an exposed export token; the previous URL becomes invalid immediately.
- For an encryption-key compromise, disable imports, deploy a new key, and re-enter/validate every import URL. Existing ciphertext cannot be safely re-encrypted without the old key.
- Never delete imported reservations to roll back. Keep audit history and cancel blocks through the conflict workflow where appropriate.
- Application rollback is safe while additive tables/columns remain. Do not drop channel tables or reservation metadata during an incident. A destructive schema rollback requires a separately reviewed migration and restored backup.

## Post-deployment smoke checks

- Unauthorized `/api/admin/*` requests return 401/403 and cross-origin mutations return 403.
- Direct overlapping bookings produce one success and one `409 availability_conflict`; same-day turnover succeeds.
- A repeated import remains idempotent; external cancellation releases inventory; a local overlap creates a visible conflict without overwriting the local stay.
- Export feeds contain only opaque `Unavailable` blocks—no guest identity, price, notes, or internal reservation IDs.
- Scheduler runs and health are visible in admin history. No import URL, encryption key, scheduler secret, token hash, guest PII, or raw feed is logged.
