import type { createAdminClient } from "../../supabase/adminClient";
import { decryptChannelSecret } from "../secrets";
import { fetchCalendarSafely } from "../fetch-calendar";
import { parseICalendar } from "../ical/parser";
import { createSyncRepository } from "./repository";
import { syncMapping, type SyncTrigger } from "./service";

export function runMappingSync(
  mappingId: string,
  trigger: SyncTrigger,
  admin: ReturnType<typeof createAdminClient>,
) {
  const key = process.env.CHANNEL_ENCRYPTION_KEY;
  if (!key) throw new Error("channel_encryption_key_missing");
  return syncMapping(mappingId, trigger, {
    ...createSyncRepository(admin),
    decryptUrl: (payload) => decryptChannelSecret(payload, key),
    fetchCalendar: (url) => fetchCalendarSafely({ url }),
    parseCalendar: (text, source) => parseICalendar(text, { source }),
  });
}
