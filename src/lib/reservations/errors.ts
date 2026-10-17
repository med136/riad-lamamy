export type ReservationErrorCode =
  | "invalid_dates"
  | "capacity_exceeded"
  | "room_unavailable"
  | "availability_conflict"
  | "room_not_found";

const statusByCode: Record<ReservationErrorCode, number> = {
  invalid_dates: 400,
  capacity_exceeded: 400,
  room_unavailable: 409,
  availability_conflict: 409,
  room_not_found: 404,
};

export class ReservationError extends Error {
  readonly code: ReservationErrorCode;
  readonly httpStatus: number;

  constructor(code: ReservationErrorCode, message = code) {
    super(message);
    this.name = "ReservationError";
    this.code = code;
    this.httpStatus = statusByCode[code];
  }
}

export const isAvailabilityConflict = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string; details?: string };
  return (
    candidate.code === "23P01" ||
    candidate.message?.includes("availability_conflict") === true ||
    candidate.details?.includes("availability_conflict") === true
  );
};
