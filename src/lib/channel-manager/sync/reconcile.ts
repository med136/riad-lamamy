import type { ParsedCalendarEvent } from "../ical/parser.ts";

export type ExistingExternalReservation = {
  id: string;
  uid: string;
  revision: string | null;
  status: string;
  missingObservations: number;
};

export type ReconciliationAction =
  | { kind: "create"; event: ParsedCalendarEvent }
  | { kind: "touch"; reservationId: string; event: ParsedCalendarEvent }
  | { kind: "update"; reservationId: string; event: ParsedCalendarEvent }
  | { kind: "cancel"; reservationId: string; event?: ParsedCalendarEvent; reason: "external_cancelled" | "missing_twice" }
  | { kind: "mark_stale"; reservationId: string }
  | { kind: "conflict"; reservationId?: string; event: ParsedCalendarEvent; reason: "local_overlap" };

export type ReconciliationObservation = {
  authoritative: boolean;
  mappingEnabled: boolean;
  overlapsLocal?: (event: ParsedCalendarEvent, reservationId?: string) => boolean;
};

export type ReconciliationPlan = {
  skipped: boolean;
  actions: ReconciliationAction[];
};

export function reconcileExternalEvents(
  existing: ExistingExternalReservation[],
  incoming: ParsedCalendarEvent[],
  observation: ReconciliationObservation,
): ReconciliationPlan {
  if (!observation.mappingEnabled) return { skipped: true, actions: [] };
  const actions: ReconciliationAction[] = [];
  const existingByUid = new Map(existing.map((reservation) => [reservation.uid, reservation]));
  const seen = new Set<string>();

  for (const event of incoming) {
    seen.add(event.uid);
    const reservation = existingByUid.get(event.uid);
    if (event.status === "cancelled") {
      if (reservation && reservation.status !== "cancelled") {
        actions.push({ kind: "cancel", reservationId: reservation.id, event, reason: "external_cancelled" });
      }
      continue;
    }
    if (observation.overlapsLocal?.(event, reservation?.id)) {
      actions.push({ kind: "conflict", reservationId: reservation?.id, event, reason: "local_overlap" });
      continue;
    }
    if (!reservation) {
      actions.push({ kind: "create", event });
    } else if (reservation.revision === event.revision) {
      actions.push({ kind: "touch", reservationId: reservation.id, event });
    } else {
      actions.push({ kind: "update", reservationId: reservation.id, event });
    }
  }

  if (observation.authoritative) {
    for (const reservation of existing) {
      if (seen.has(reservation.uid) || reservation.status === "cancelled") continue;
      if (reservation.missingObservations >= 1) {
        actions.push({ kind: "cancel", reservationId: reservation.id, reason: "missing_twice" });
      } else {
        actions.push({ kind: "mark_stale", reservationId: reservation.id });
      }
    }
  }

  return { skipped: false, actions };
}
