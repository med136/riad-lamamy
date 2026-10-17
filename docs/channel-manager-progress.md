# Channel Manager Progress

Updated: 2026-10-17  
Branch: `codex/channel-manager`  
Specification: `docs/superpowers/specs/2026-10-17-channel-manager-design.md`  
Plan: `docs/superpowers/plans/2026-10-17-channel-manager.md`

## Milestones

| Milestone | Status | Evidence |
| --- | --- | --- |
| Baseline and schema audit | Complete | Live read-only audit completed; 2 unit tests and TypeScript passed |
| Phase 0 direct reservations | Verified (DB/domain) | Fresh local rebuild, 11/11 DB tests, 5/5 focused unit tests, targeted lint, TypeScript, and production build pass; isolated HTTP smoke pending |
| Phase 1 iCalendar channels | In progress | Core channel/mapping/run/conflict schema, RLS, and redacted DTOs verified locally |
| Phase 2 automation and operations | Not started | — |
| Final security and end-to-end verification | Not started | — |

## Resolved baseline defects

- The migration chain now rebuilds from zero. Historical ordering, duplicate migration, incompatible ID types, optional-column indexes, room price normalization, gallery seed, and legacy function errors were repaired without deleting reservation data.
- Rooms now expose canonical `base_price`, `max_guests`, `seasonal_prices`, and `status` fields while preserving the legacy price values.
- Reservations now carry direct/channel source metadata and accept `blocked` status through a constrained text representation.
- A half-open PostgreSQL exclusion constraint prevents active overlaps at the database layer; the authoritative RPC translates conflicts to `availability_conflict`.

## Verification log

| Date | Command | Result |
| --- | --- | --- |
| 2026-10-17 | Browser reservation flow | Pricing request reproduced `404 Room not found`; no test reservation created |
| 2026-10-17 | `node --test --experimental-strip-types src/lib/channel-manager/schema-audit.test.ts` | PASS — 2/2 |
| 2026-10-17 | `npx tsc --noEmit` | PASS |
| 2026-10-17 | `npm run audit:channel-schema` | PASS — zero active overlaps; missing `base_price`, `seasonal_prices`, channel reservation metadata, and `blocked` enum value |
| 2026-10-17 | `npm run test:channel` | PASS — 2/2 |
| 2026-10-17 | Full Node test discovery | BASELINE DEFECT — 53/54 passed; `hero-media.test.ts` cannot load a TypeScript parameter property under Node strip-only mode |
| 2026-10-17 | `supabase db reset` | PASS — complete migration history and seed rebuild locally |
| 2026-10-17 | Phase 0 live concurrency test | PASS — exactly one of two overlapping writes succeeds; same-day turnover succeeds; 11/11 total |
| 2026-10-17 | `supabase db lint` | PASS — no schema errors |
| 2026-10-17 | `npx tsc --noEmit` | PASS after Phase 0 migration work |
| 2026-10-17 | `npm run test:channel` | PASS — 5/5 schema-audit and reservation-domain tests |
| 2026-10-17 | Focused ESLint for reservation domain/routes/form | PASS |
| 2026-10-17 | `npm run build` | PASS — 64 routes/pages generated |
| 2026-10-17 | Repository-wide `npm run lint` | BASELINE DEFECT — 129 existing errors across unrelated legacy files; modified reservation files pass targeted lint |
| 2026-10-17 | Isolated HTTP smoke on port 3001 | BLOCKED SAFELY — existing build embedded remote public URL while runtime key was local; requests failed with invalid key and created no reservation |
| 2026-10-17 | Channel core `supabase db reset` | PASS — channel tables, foreign keys, indexes, triggers, RLS, and seed rebuild |
| 2026-10-17 | Live channel RLS test | PASS — anon secret-table read rejected; service role creates disabled channel and cleans it |
| 2026-10-17 | Channel DTO tests | PASS — 2/2, ciphertext and token hashes absent from serialized DTOs |

## Migration status

- Phase 0 has been applied and verified only on the disposable local Supabase stack; it has not been pushed to production.
- Existing reservation data has not been modified.
- The local overlap constraint is enabled after a zero-overlap preflight. Production application remains gated on explicit approval and a fresh production preflight.

## External prerequisites

- Real Booking.com/Airbnb partner APIs are Phase 3 and require provider approval; they are not required for the iCalendar release.
- Production scheduler activation, real channel URLs, production migration application, and live smoke tests require explicit approval.

## Rollback posture

- Migrations will be additive first.
- Existing reservations remain canonical and are never deleted by synchronization.
- Channels and mappings default to disabled.
- Disabling a mapping or channel preserves imported reservations and audit history.
- Export tokens can be rotated without changing reservation data.
