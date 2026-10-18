import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/api/admin-route";
import { uuidSchema } from "@/lib/channel-manager/validation";

type Context = { params: Promise<{ id: string; mappingId: string }> };

export const POST = (request: Request, context: Context) =>
  withAdminRoute(
    request,
    async ({ admin }) => {
      const { id, mappingId } = await context.params;
      uuidSchema.parse(id);
      uuidSchema.parse(mappingId);
      const token = randomBytes(32).toString("base64url");
      const hash = createHash("sha256").update(token).digest("hex");
      const hint = `…${token.slice(-4)}`;
      const { data, error } = await admin
        .from("channel_room_mappings")
        .update({ export_token_hash: hash, export_token_hint: hint })
        .eq("id", mappingId)
        .eq("channel_id", id)
        .select("id")
        .single();
      if (error) throw error;
      const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? request.url).origin;
      return NextResponse.json({ mappingId: data.id, exportUrl: `${origin}/api/calendar/${token}`, tokenHint: hint });
    },
    { mutation: true },
  );
