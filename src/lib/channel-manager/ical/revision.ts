import { createHash } from "node:crypto";

export const calendarRevision = (parts: readonly unknown[]) =>
  createHash("sha256").update(JSON.stringify(parts)).digest("hex");
