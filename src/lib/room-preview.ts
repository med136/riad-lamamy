export function selectRoomPreviewItems<T>(rooms: T[]): T[] {
  return rooms.slice(0, 4);
}
