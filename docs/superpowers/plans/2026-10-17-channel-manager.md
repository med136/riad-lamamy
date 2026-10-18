# Dar LaMamy Channel Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver and verify Phases 0–2 of the approved Dar LaMamy Reservation & Channel Manager: authoritative direct reservations, configurable iCalendar channels, secure synchronization, admin operations, and conflict management.

**Architecture:** Supabase/PostgreSQL remains the canonical inventory store. Focused server-side domain modules own reservation creation, secret handling, iCalendar parsing/export, and synchronization; Next.js route handlers expose authorized admin/internal/public-feed boundaries; admin pages consume redacted DTOs only. PostgreSQL constraints and advisory locks provide the final concurrency guarantees.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase/PostgreSQL, Zod 4, Node test runner, Playwright CLI, iCalendar-compatible text generation/parsing.

**Spec:** `docs/superpowers/specs/2026-10-17-channel-manager-design.md`

## Global Constraints

- Preserve every existing valid reservation and all business data.
- Never enable an external channel automatically.
- Do not modify live reservation data or deploy production migrations without explicit approval.
- Active inventory statuses are exactly `pending`, `confirmed`, and `blocked`.
- Date ranges are half-open: `[check_in, check_out)`, so same-day turnover is allowed.
- All channel secrets remain server-only, encrypted at rest, redacted from API responses, logs, and feeds.
- Public iCalendar feeds contain no guest PII, price, internal notes, private import URLs, or credentials.
- Phase 3 provider APIs are out of scope; do not simulate partner access.
- Every admin route uses server-side admin authorization and validated input.
- Real PostgreSQL/Supabase integration tests are required for overlap, RLS, idempotency, locking, and persistence before production-ready status.

## Review Focus

- Two concurrent direct requests for the same room/date range: exactly one persists and the other receives stable `409 availability_conflict` (Task 3).
- Malicious import URL resolving or redirecting to loopback/private/metadata space: request is rejected before content is processed (Task 5).
- A previously imported event disappears during one partial provider response: it becomes stale and is cancelled only after a second authoritative observation (Task 7).
- An external modification overlaps a confirmed local stay: local data is preserved and an actionable conflict is created (Task 7).
- Disabled channel or mapping invoked by scheduler/manual retry: no fetch or mutation occurs, while a clear skipped/logged result is returned (Tasks 7 and 9).

---

### Task 1: Establish baseline, schema evidence, and progress ledger

**Files:**
- Create: `docs/channel-manager-progress.md`
- Create: `scripts/audit-channel-manager-schema.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run audit:channel-schema`, a read-only schema/preflight report consumed before migrations and final acceptance.
- Produces: progress ledger containing milestone state, executed commands/results, migration state, defects, rollback, and external blockers.

- [ ] **Step 1: Add a failing contract test for the audit report parser**

Create `src/lib/channel-manager/schema-audit.test.ts` asserting that missing canonical room columns and overlapping active reservations are reported separately and that no mutation statement is generated.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test --experimental-strip-types src/lib/channel-manager/schema-audit.test.ts`
Expected: FAIL because the audit module does not exist.

- [ ] **Step 3: Implement the audit module and read-only script**

Create `src/lib/channel-manager/schema-audit.ts` with `summarizeSchemaAudit(input: SchemaAuditInput): SchemaAuditSummary`. The script connects using server-only Supabase configuration, reads information schema plus overlap candidates, and prints a redacted JSON report without changing data.

- [ ] **Step 4: Add scripts and initialize the progress ledger**

Add `test:channel`, `test:channel:integration`, and `audit:channel-schema` package scripts. Record the current direct-booking `Room not found` defect and schema/migration evidence.

- [ ] **Step 5: Verify and commit**

Run focused test, TypeScript validation, and the audit when credentials permit. Commit as `chore: establish channel manager verification baseline`.

### Task 2: Canonical schema and safe overlap migration

**Files:**
- Create: `supabase/migrations/<timestamp>_channel_manager_phase0.sql` using `supabase migration new channel_manager_phase0`
- Modify: `src/lib/database.types.ts`
- Modify: `src/lib/supabase/types.ts`
- Modify: `src/types/supabase.ts`
- Test: `tests/integration/channel-manager/phase0-schema.test.ts`

**Interfaces:**
- Produces: canonical room fields `base_price`, `max_guests`, `status`, `seasonal_prices` backfilled from legacy fields.
- Produces: reservation source/external metadata columns and `create_reservation_authoritatively(...)` RPC.
- Produces: preflight view/function that enumerates existing active overlaps before constraint activation.
- Produces: half-open active-reservation exclusion constraint enabled only after preflight passes.

- [ ] **Step 1: Write failing real-database tests**

Assert legacy room values survive backfill, same-day turnover inserts succeed, true overlaps fail, inactive statuses do not block, existing rows persist, and two concurrent RPC calls yield one success plus one conflict.

- [ ] **Step 2: Run the integration test and confirm the expected missing-schema failure**

Run: `npm run test:channel:integration -- phase0-schema`.

- [ ] **Step 3: Generate and implement the migration**

Use `supabase migration new channel_manager_phase0`. Add `btree_gist` if needed, non-destructive backfills, preflight function, check constraints, indexes, and authoritative transaction/RPC. Raise SQLSTATE `23P01` for overlap and map it later to the stable API error.

- [ ] **Step 4: Regenerate or reconcile TypeScript database types**

Keep field names identical across all three existing generated/manual type files until the project is consolidated in a future change.

- [ ] **Step 5: Verify migration safety and commit**

Run migration lint/list, integration test against disposable/local Supabase, and confirm row counts before/after. Commit as `feat(db): enforce authoritative reservation inventory`.

### Task 3: Authoritative reservation domain and public APIs

**Files:**
- Create: `src/lib/reservations/domain.ts`
- Create: `src/lib/reservations/repository.ts`
- Create: `src/lib/reservations/errors.ts`
- Test: `src/lib/reservations/domain.test.ts`
- Modify: `src/app/api/reservations/route.ts`
- Modify: `src/app/api/reservations/availability/route.ts`
- Modify: `src/app/api/reservations/pricing/route.ts`
- Modify: `src/components/BookingForm.tsx`

**Interfaces:**
- Produces: `quoteReservation(input, deps): Promise<ReservationQuote>`.
- Produces: `createDirectReservation(input, deps): Promise<ReservationResult>`.
- Produces: stable API errors `invalid_dates`, `capacity_exceeded`, `room_unavailable`, and `availability_conflict`.

- [ ] **Step 1: Write failing unit/API contract tests**

Cover price, seasonal price, capacity, minimum/maximum stay, closed dates, invalid dates, canonical room-not-found behavior, same-day turnover, and SQL overlap-to-HTTP-409 mapping.

- [ ] **Step 2: Run focused tests and verify failures**

Run domain tests plus route-level contract tests.

- [ ] **Step 3: Implement focused domain/repository modules**

Make browser estimates advisory. The POST route calls the authoritative RPC and returns the committed server quote/reference.

- [ ] **Step 4: Update all three reservation endpoints and BookingForm error handling**

Use the same canonical room fields and shared validation. Display a specific availability-conflict message without clearing guest input.

- [ ] **Step 5: Verify and commit**

Run focused unit/API tests, real concurrency integration test, TypeScript, and a browser booking flow against the disposable schema. Commit as `fix: make direct reservations authoritative`.

### Task 4: Channel schema, RLS, and redacted DTOs

**Files:**
- Create: `supabase/migrations/<timestamp>_channel_manager_core.sql`
- Create: `src/lib/channel-manager/types.ts`
- Create: `src/lib/channel-manager/dto.ts`
- Test: `src/lib/channel-manager/dto.test.ts`
- Test: `tests/integration/channel-manager/channel-rls.test.ts`

**Interfaces:**
- Produces: `booking_channels`, `channel_room_mappings`, `channel_sync_runs`, and `reservation_conflicts` tables.
- Produces: `toChannelAdminDto(row): ChannelAdminDto` and `toMappingAdminDto(row): MappingAdminDto`, which expose presence flags and redacted hosts but never secrets.

- [ ] **Step 1: Write failing DTO and real RLS tests**

Assert anon/authenticated clients cannot read or mutate sensitive tables, service/admin paths can operate after authorization, and serialized DTOs contain no plaintext secret fields.

- [ ] **Step 2: Generate and implement the migration**

Use `supabase migration new channel_manager_core`; add constraints, partial unique external-event identity, indexes, RLS, grants/revokes, timestamps, and audit-safe delete behavior.

- [ ] **Step 3: Implement shared types and redaction**

Define provider, connection type, health, run status, mapping, conflict, and capability types once.

- [ ] **Step 4: Verify and commit**

Run migration lint, DTO tests, and real RLS tests. Commit as `feat(db): add secure channel manager model`.

### Task 5: Encryption and SSRF-safe calendar fetching

**Files:**
- Create: `src/lib/channel-manager/secrets.ts`
- Create: `src/lib/channel-manager/network-policy.ts`
- Create: `src/lib/channel-manager/fetch-calendar.ts`
- Test: `src/lib/channel-manager/secrets.test.ts`
- Test: `src/lib/channel-manager/network-policy.test.ts`
- Modify: `.env.local.example`
- Modify: `.env.example`

**Interfaces:**
- Produces: `encryptChannelSecret(plaintext, key): string` and `decryptChannelSecret(payload, key): string` using versioned AES-256-GCM envelopes.
- Produces: `validateCalendarUrl(url, resolver): Promise<ValidatedTarget>`.
- Produces: `fetchCalendarSafely(input): Promise<CalendarFetchResult>` with HTTPS-only production policy, DNS/IP validation on every redirect, restricted ports, timeout, and response-size cap.

- [ ] **Step 1: Write failing secret and SSRF tests**

Cover encryption roundtrip/tamper/wrong key, redaction, localhost literals, IPv4/IPv6 private ranges, metadata IPs, DNS rebinding, unsafe redirect, non-HTTPS, oversized bodies, timeout, and valid public HTTPS.

- [ ] **Step 2: Run tests and verify failure**

Run both focused test files.

- [ ] **Step 3: Implement security primitives**

Use Node `crypto`, explicit DNS resolution, redirect-by-redirect validation, abort signals, streaming byte limits, and sanitized errors.

- [ ] **Step 4: Document required encryption key configuration**

Add only variable names/examples; never commit a real key.

- [ ] **Step 5: Verify and commit**

Run security tests, TypeScript, and lint for these files. Commit as `feat: secure channel calendar credentials and fetches`.

### Task 6: iCalendar parser and privacy-safe exporter

**Files:**
- Create: `src/lib/channel-manager/ical/parser.ts`
- Create: `src/lib/channel-manager/ical/exporter.ts`
- Create: `src/lib/channel-manager/ical/revision.ts`
- Create: `src/lib/channel-manager/ical/fixtures/*.ics`
- Test: `src/lib/channel-manager/ical/parser.test.ts`
- Test: `src/lib/channel-manager/ical/exporter.test.ts`

**Interfaces:**
- Produces: `parseICalendar(text, options): ParsedCalendarEvent[]` with UID, revision, half-open dates, status, and minimal source metadata.
- Produces: `buildAvailabilityCalendar(room, reservations): string` with opaque event IDs and no sensitive fields.

- [ ] **Step 1: Write fixture-driven failing tests**

Cover CRLF/folded lines, escaped values, all-day and timezone timestamps, duplicate UID revisions, cancellation, malformed event rejection, and a feed containing Unicode. Export tests assert RFC framing and absence of guest names, email, phone, price, notes, and source secrets.

- [ ] **Step 2: Run tests and verify failure**

Run parser/exporter tests.

- [ ] **Step 3: Implement parser, revision hashing, and exporter**

Keep the parser bounded and deterministic; reject unbounded recurrence expansion in release one and record an actionable unsupported-recurrence error.

- [ ] **Step 4: Verify and commit**

Run fixture tests, TypeScript, and lint. Commit as `feat: add safe ical import and export`.

### Task 7: Idempotent synchronization and conflict reconciliation

**Files:**
- Create: `src/lib/channel-manager/sync/service.ts`
- Create: `src/lib/channel-manager/sync/repository.ts`
- Create: `src/lib/channel-manager/sync/reconcile.ts`
- Test: `src/lib/channel-manager/sync/reconcile.test.ts`
- Test: `tests/integration/channel-manager/sync-persistence.test.ts`

**Interfaces:**
- Produces: `syncMapping(mappingId, trigger, deps): Promise<SyncRunSummary>`.
- Produces: `reconcileExternalEvents(existing, incoming, observation): ReconciliationPlan`.
- Consumes: secure fetcher and iCalendar parser from Tasks 5–6.

- [ ] **Step 1: Write failing reconciliation/unit tests**

Cover create, idempotent repeat, revision update, explicit cancellation, first missing observation becoming stale, second authoritative missing observation cancelling, external overlap becoming conflict, and disabled mapping skipping without fetch.

- [ ] **Step 2: Write failing real persistence tests**

Assert imported reservations block direct availability, duplicate imports retain one row, cancellations release inventory safely, conflict records preserve local reservations, and audit counts are accurate.

- [ ] **Step 3: Implement reconciliation and repository transaction boundaries**

Persist run start/completion, per-event decisions, stale observations, conflicts, and sanitized errors. Never overwrite an overlapping confirmed local reservation.

- [ ] **Step 4: Verify and commit**

Run unit and real integration tests. Commit as `feat: synchronize external calendar reservations`.

### Task 8: Authorized channel administration APIs

**Files:**
- Create: `src/lib/channel-manager/validation.ts`
- Create: `src/lib/api/admin-route.ts`
- Create: `src/app/api/admin/channels/route.ts`
- Create: `src/app/api/admin/channels/[id]/route.ts`
- Create: `src/app/api/admin/channels/[id]/mappings/route.ts`
- Create: `src/app/api/admin/channels/[id]/mappings/[mappingId]/route.ts`
- Create: `src/app/api/admin/channels/[id]/validate/route.ts`
- Create: `src/app/api/admin/channels/[id]/sync/route.ts`
- Create: `src/app/api/admin/channels/[id]/runs/route.ts`
- Create: `src/app/api/admin/channels/[id]/mappings/[mappingId]/rotate-token/route.ts`
- Test: `src/lib/channel-manager/validation.test.ts`
- Test: `tests/api/channel-admin-routes.test.ts`

**Interfaces:**
- Produces: authenticated CRUD, validation, manual sync, history, and token rotation endpoints returning redacted DTOs.

- [ ] **Step 1: Write failing authorization/input/redaction tests**

Every method must reject no session, reject invalid origin on mutations, validate UUIDs/provider/interval/URL, reject unknown fields, and never echo secrets.

- [ ] **Step 2: Implement shared admin route wrapper and Zod schemas**

Normalize `UnauthorizedAdminError`, validation errors, database errors, and safe response headers.

- [ ] **Step 3: Implement CRUD and operational routes**

Generate secure export tokens, store only hashes, show plaintext only once at creation/rotation, and preserve history on disable/archive.

- [ ] **Step 4: Verify and commit**

Run route tests, TypeScript, lint, and unauthorized HTTP smoke tests. Commit as `feat(api): add secure channel administration`.

### Task 9: Secure export endpoint, scheduler, locking, retries, and monitoring

**Files:**
- Create: `src/app/api/calendar/[token]/route.ts`
- Create: `src/app/api/internal/channel-sync/route.ts`
- Create: `src/lib/channel-manager/sync/scheduler.ts`
- Create: `src/lib/channel-manager/sync/retry.ts`
- Create: `supabase/migrations/<timestamp>_channel_manager_scheduler.sql`
- Create or Modify: `vercel.json` only if deployment target is confirmed as Vercel; otherwise document scheduler command without inventing infrastructure.
- Test: `src/lib/channel-manager/sync/retry.test.ts`
- Test: `tests/integration/channel-manager/scheduler-locking.test.ts`
- Test: `tests/api/calendar-export-route.test.ts`

**Interfaces:**
- Produces: hashed-token calendar export route.
- Produces: `runScheduledSync(now, deps): Promise<SchedulerSummary>` shared by scheduled and manual execution.
- Produces: per-mapping PostgreSQL advisory lock and bounded retry policy.

- [ ] **Step 1: Write failing feed privacy/auth, retry, and lock tests**

Cover invalid/rotated token, disabled mapping, content headers, no PII, scheduler secret, disabled channel skip, two concurrent workers, transient retry/backoff, permanent failure, stale-health transition, and mapping isolation.

- [ ] **Step 2: Implement token lookup and export**

Hash the presented token, query enabled mapping, and export canonical inventory only.

- [ ] **Step 3: Implement scheduler workflow and migration helpers**

Select due enabled mappings, obtain advisory lock, call the same `syncMapping` used manually, apply bounded exponential backoff, and persist health/log state.

- [ ] **Step 4: Verify and commit**

Run focused API/unit tests plus real locking integration test. Commit as `feat: automate safe channel synchronization`.

### Task 10: Admin channel management interface

**Files:**
- Create: `src/app/admin/canaux/page.tsx`
- Create: `src/components/admin/channels/ChannelList.tsx`
- Create: `src/components/admin/channels/ChannelEditor.tsx`
- Create: `src/components/admin/channels/RoomMappingsEditor.tsx`
- Create: `src/components/admin/channels/SyncHistory.tsx`
- Create: `src/components/admin/channels/channel-ui.ts`
- Test: `src/components/admin/channels/channel-ui.test.ts`
- Modify: `src/components/admin/Sidebar.tsx`
- Modify: `src/components/admin/Header.tsx`

**Interfaces:**
- Consumes: redacted Task 8 APIs.
- Produces: Admin → Canaux de réservation with provider/custom creation, enable/disable, mapping, validation, copy-once export URL, rotation, manual sync, health, and history.

- [ ] **Step 1: Write failing UI state/formatting tests**

Cover accessible health/status labels, disabled actions, secret presence indicators, copy-once token state, responsive mapping rows, and error messages.

- [ ] **Step 2: Implement page and focused components using existing admin styles**

Never retain import URLs after successful save. Require explicit confirmation for token rotation and channel archival.

- [ ] **Step 3: Run focused tests and browser accessibility/responsive checks**

Verify desktop and mobile layouts, keyboard operation, loading/error/empty states, and no secret in network response after save.

- [ ] **Step 4: Commit**

Commit as `feat(admin): manage reservation channels`.

### Task 11: Central calendar and conflict workflow

**Files:**
- Create: `src/app/admin/calendrier/page.tsx`
- Create: `src/components/admin/calendar/ReservationCalendar.tsx`
- Create: `src/components/admin/calendar/CalendarFilters.tsx`
- Create: `src/components/admin/calendar/ConflictPanel.tsx`
- Create: `src/lib/channel-manager/calendar.ts`
- Create: `src/app/api/admin/reservation-calendar/route.ts`
- Create: `src/app/api/admin/reservation-conflicts/route.ts`
- Create: `src/app/api/admin/reservation-conflicts/[id]/route.ts`
- Test: `src/lib/channel-manager/calendar.test.ts`
- Test: `tests/api/conflict-routes.test.ts`
- Modify: `src/components/admin/Sidebar.tsx`
- Modify: `src/components/admin/Header.tsx`

**Interfaces:**
- Produces: filtered month/list calendar data and conflict resolution actions that never silently overwrite a valid reservation.

- [ ] **Step 1: Write failing aggregation and authorization tests**

Cover room/source/channel/status filters, same-day boundaries, accessible source/status labels, unresolved counts, invalid resolution, and unauthorized requests.

- [ ] **Step 2: Implement admin APIs and calendar projection**

Return minimal operational guest fields only to authorized admins; paginate list/history data.

- [ ] **Step 3: Implement responsive calendar/list UI and conflict panel**

Provide month view where space allows and an accessible list fallback on small screens. Resolution choices are dismiss external event, cancel imported block, or mark resolved after an explicit external/manual correction.

- [ ] **Step 4: Verify and commit**

Run focused tests and browser end-to-end flows. Commit as `feat(admin): add reservation calendar and conflicts`.

### Task 12: Full integration, security audit, PR, and release evidence

**Files:**
- Modify: `docs/channel-manager-progress.md`
- Modify: `README.md`
- Modify: `.env.example`
- Create: `docs/channel-manager-runbook.md`
- Create: `tests/e2e/channel-manager.spec.ts` if the repository adopts Playwright test runner; otherwise record equivalent Playwright CLI evidence without adding an unused framework.

**Interfaces:**
- Produces: reviewed feature branch, pull request, complete evidence matrix, migration/rollback runbook, and explicit deployment prerequisites.

- [ ] **Step 1: Run final database verification**

Run schema audit, migration lint/list, RLS tests, persistence, concurrency, idempotency, cancellation, locking, and row-preservation checks against production-like disposable Supabase.

- [ ] **Step 2: Run final application verification**

Run all Node tests, relevant API/integration suites, `npx tsc --noEmit`, `npm run lint`, and `npm run build`.

- [ ] **Step 3: Run end-to-end workflows**

Verify channel creation, independent room mappings, export token/rotation, valid import, duplicate import, update/cancellation, direct availability blocking, conflict visibility/resolution, manual sync, scheduler authentication/logging, unauthorized access, and responsive admin UI.

- [ ] **Step 4: Review security and complete operational docs**

Confirm secrets never appear in client payloads/logs/feeds, SSRF defenses pass, external channels default disabled, scheduler and encryption secrets are documented, rollout requires dry-run/approval, and rollback preserves audit/history.

- [ ] **Step 5: Review complete diff and create PR**

Run `git diff --check`, inspect every migration and route, push the feature branch, create and attach a PR with the evidence matrix, and do not merge.

- [ ] **Step 6: Record truthful release status**

Use IMPLEMENTED/VERIFIED/PRODUCTION-READY/OPERATIONAL/BLOCKED precisely. Production deployment, real external configuration, scheduler activation, and live smoke tests remain pending explicit approval.
