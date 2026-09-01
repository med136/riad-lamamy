import { NextResponse } from "next/server";
import { requireAdminSession, UnauthorizedAdminError } from "@/lib/auth/admin";
import {
  deleteHeroMedia,
  HeroStorageError,
  isLocalHeroMediaUrl,
} from "@/lib/hero-local-storage";
import { createAdminClient } from "@/lib/supabase/adminClient";

type RouteContext = { params: Promise<{ id: string }> };

const handleError = (error: unknown) => {
  const status = error instanceof UnauthorizedAdminError ? 401 : 500;
  const message = error instanceof Error ? error.message : "Erreur interne.";
  return NextResponse.json({ error: message }, { status });
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = (await request.json()) as {
      poster_url?: string | null;
      alt_text?: string | null;
      is_active?: boolean;
      media_url?: string;
      media_type?: "image" | "video";
      filename?: string | null;
      mime_type?: string | null;
      size?: number | null;
    };
    if (
      body.poster_url &&
      !isLocalHeroMediaUrl(body.poster_url)
    ) {
      return NextResponse.json({ error: "URL de poster non autorisée." }, { status: 400 });
    }
    if (
      body.media_url &&
      !isLocalHeroMediaUrl(body.media_url)
    ) {
      return NextResponse.json({ error: "URL de média non autorisée." }, { status: 400 });
    }
    if (body.media_url && body.media_type !== "image" && body.media_type !== "video") {
      return NextResponse.json({ error: "Type de média invalide." }, { status: 400 });
    }

    const update: Record<string, string | boolean | number | null> = {};
    if ("poster_url" in body) update.poster_url = body.poster_url ?? null;
    if ("alt_text" in body) update.alt_text = body.alt_text?.trim().slice(0, 180) || null;
    if (typeof body.is_active === "boolean") update.is_active = body.is_active;
    if (body.media_url) {
      update.image_url = body.media_url;
      update.media_url = body.media_url;
      update.media_type = body.media_type ?? "image";
      update.file_name = body.filename ?? null;
      update.mime_type = body.mime_type ?? null;
      update.file_size = body.size ?? null;
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Aucune modification valide." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const currentResult = await supabase
      .from("hero_carousel_images")
      .select("media_url, image_url, poster_url")
      .eq("id", id)
      .maybeSingle();
    let current = currentResult.data as {
      media_url?: string | null;
      image_url?: string | null;
      poster_url?: string | null;
    } | null;
    if (currentResult.error?.code === "42703") {
      const legacyCurrent = await supabase
        .from("hero_carousel_images")
        .select("image_url")
        .eq("id", id)
        .maybeSingle();
      current = legacyCurrent.data;
    }

    let updateResult = await supabase.from("hero_carousel_images").update(update).eq("id", id);
    if (updateResult.error?.code === "42703" && body.media_url) {
      updateResult = await supabase
        .from("hero_carousel_images")
        .update({ image_url: body.media_url })
        .eq("id", id);
    }
    if (updateResult.error) {
      return NextResponse.json({ error: updateResult.error.message }, { status: 500 });
    }

    const previousUrls = [
      "poster_url" in body && current?.poster_url !== body.poster_url ? current?.poster_url : null,
      body.media_url && (current?.media_url || current?.image_url) !== body.media_url
        ? current?.media_url || current?.image_url
        : null,
    ].filter((url): url is string => Boolean(url && isLocalHeroMediaUrl(url)));
    for (const previousUrl of previousUrls) {
      await deleteHeroMedia(previousUrl).catch((cleanupError) => {
          if (!(cleanupError instanceof HeroStorageError && cleanupError.status === 404)) {
            console.error("Previous Hero media cleanup failed:", cleanupError);
          }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const supabase = createAdminClient();
    const modernRead = await supabase
      .from("hero_carousel_images")
      .select("media_url, image_url, poster_url")
      .eq("id", id)
      .single();
    let data = modernRead.data as {
      media_url?: string | null;
      image_url: string | null;
      poster_url?: string | null;
    } | null;
    let readError = modernRead.error;

    if (readError?.code === "42703") {
      const legacyRead = await supabase
        .from("hero_carousel_images")
        .select("image_url")
        .eq("id", id)
        .single();
      data = legacyRead.data;
      readError = legacyRead.error;
    }

    if (readError || !data) {
      return NextResponse.json({ error: readError?.message || "Média introuvable." }, { status: 404 });
    }

    const { error } = await supabase.from("hero_carousel_images").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const localUrls = [data.media_url || data.image_url, data.poster_url].filter(
      (url): url is string => Boolean(url && isLocalHeroMediaUrl(url)),
    );
    for (const url of localUrls) {
      await deleteHeroMedia(url).catch((cleanupError) => {
        if (!(cleanupError instanceof HeroStorageError && cleanupError.status === 404)) {
          console.error("Hero media cleanup failed:", cleanupError);
        }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
