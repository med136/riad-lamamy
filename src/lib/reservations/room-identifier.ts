export type RoomIdentifier = string;

export function parseRoomIdentifier(value: unknown): RoomIdentifier | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const identifier = String(value).trim();
  return identifier.length > 0 ? identifier : null;
}
