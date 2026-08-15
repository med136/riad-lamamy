import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdminSession, UnauthorizedAdminError } from "@/lib/auth/admin";
import { validateHeroFile } from "@/lib/hero-media";
import { createAdminClient } from "@/lib/supabase/adminClient";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const formData = await request.formData();
    const file = formData.get("file");
    const kind = formData.get("kind") === "poster" ? "poster" : "media";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
    }

    const validated = await validateHeroFile(file, kind === "poster" ? "image" : undefined);
    const folder =
      kind === "poster"
        ? "posters"
        : validated.mediaType === "video"
          ? "videos"
          : "images";
    const objectPath = `hero/${folder}/${randomUUID()}.${validated.extension}`;
    const supabase = createAdminClient();
    const { error } = await supabase.storage.from("room-images").upload(
      objectPath,
      await file.arrayBuffer(),
      {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from("room-images").getPublicUrl(objectPath);
    return NextResponse.json({
      media_type: validated.mediaType,
      media_url: data.publicUrl,
      kind,
    });
  } catch (error) {
    const status = error instanceof UnauthorizedAdminError ? 401 : 400;
    const message = error instanceof Error ? error.message : "Upload impossible.";
    return NextResponse.json({ error: message }, { status });
  }
}

