import { z } from "zod";

export const uuidSchema = z.uuid();
export const channelProviderSchema = z.enum(["airbnb", "booking", "expedia", "vrbo", "tripadvisor", "custom"]);
export const connectionTypeSchema = z.enum(["import", "export", "bidirectional"]);
export const channelCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    provider: channelProviderSchema,
    connectionType: connectionTypeSchema,
    importUrl: z.url().startsWith("https://").optional(),
    syncIntervalMinutes: z.number().int().min(15).max(10080).default(60),
  })
  .strict();
export const channelUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    connectionType: connectionTypeSchema.optional(),
    importUrl: z.url().startsWith("https://").nullable().optional(),
    syncIntervalMinutes: z.number().int().min(15).max(10080).optional(),
    enabled: z.boolean().optional(),
  })
  .strict();
export const mappingCreateSchema = z
  .object({ roomId: z.number().int().positive(), externalRoomId: z.string().trim().max(200).nullable().optional() })
  .strict();
export const mappingUpdateSchema = z
  .object({ enabled: z.boolean().optional(), externalRoomId: z.string().trim().max(200).nullable().optional() })
  .strict();
