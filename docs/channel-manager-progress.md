# Channel Manager Progress

Updated: 2026-10-17  
Branch: `codex/channel-manager`  
Specification: `docs/superpowers/specs/2026-10-17-channel-manager-design.md`  
Plan: `docs/superpowers/plans/2026-10-17-channel-manager.md`

## Milestones

| Milestone | Status | Evidence |
| --- | --- | --- |
| Baseline and schema audit | Complete | Live read-only audit completed; 2 unit tests and TypeScript passed |
| Phase 0 direct reservations | Not started | Existing live test returns `404 Room not found` from pricing |
| Phase 1 iCalendar channels | Not started | — |
| Phase 2 automation and operations | Not started | — |
| Final security and end-to-end verification | Not started | — |

## Current defects

- The public room endpoint maps legacy `price`/`max_capacity`, while pricing and availability select canonical `base_price`/`max_guests`/`status`. The deployed request for a listed room returned `404 {"error":"Room not found"}`.
- Migration history contains a room-normalization migration, but deployed behavior indicates schema drift or an unapplied/incomplete normalization. The read-only audit must establish the real state before any constraint is enabled.

## Verification log

| Date | Command | Result |
| --- | --- | --- |
| 2026-10-17 | Browser reservation flow | Pricing request reproduced `404 Room not found`; no test reservation created |
| 2026-10-17 | `node --test --experimental-strip-types src/lib/channel-manager/schema-audit.test.ts` | PASS — 2/2 |
| 2026-10-17 | `npx tsc --noEmit` | PASS |
| 2026-10-17 | `npm run audit:channel-schema` | PASS — zero active overlaps; missing `base_price`, `seasonal_prices`, channel reservation metadata, and `blocked` enum value |
| 2026-10-17 | `npm run test:channel` | PASS — 2/2 |
| 2026-10-17 | Full Node test discovery | BASELINE DEFECT — 53/54 passed; `hero-media.test.ts` cannot load a TypeScript parameter property under Node strip-only mode |

## Migration status

- No Channel Manager migration has been applied locally or remotely.
- Existing reservation data has not been modified.
- The overlap constraint remains disabled until the preflight reports zero existing active overlaps.
- Live preflight found zero active overlaps, but constraint activation also remains gated on canonical room columns and the `blocked` status migration.

## External prerequisites

- Real Booking.com/Airbnb partner APIs are Phase 3 and require provider approval; they are not required for the iCalendar release.
- Production scheduler activation, real channel URLs, production migration application, and live smoke tests require explicit approval.

## Rollback posture

- Migrations will be additive first.
- Existing reservations remain canonical and are never deleted by synchronization.
- Channels and mappings default to disabled.
- Disabling a mapping or channel preserves imported reservations and audit history.
- Export tokens can be rotated without changing reservation data.
