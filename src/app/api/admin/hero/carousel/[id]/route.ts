import { NextResponse } from "next/server";
import { requireAdminSession, UnauthorizedAdminError } from "@/lib/auth/admin";
import { getHeroStorageObjectPath, isAllowedHeroStorageUrl } from "@/lib/hero-media";
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
    };
    if (body.poster_url && !isAllowedHeroStorageUrl(body.poster_url)) {
      return NextResponse.json({ error: "URL de poster non autorisée." }, { status: 400 });
    }

    const update: Record<string, string | boolean | null> = {};
    if ("poster_url" in body) update.poster_url = body.poster_url ?? null;
    if ("alt_text" in body) update.alt_text = body.alt_text?.trim().slice(0, 180) || null;
    if (typeof body.is_active === "boolean") update.is_active = body.is_active;
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Aucune modification valide." }, { status: 400 });
    }

    const supabase = createAdminClient();
    let previousPosterUrl: string | null = null;
    if ("poster_url" in body) {
      const { data: current } = await supabase
        .from("hero_carousel_images")
        .select("poster_url")
        .eq("id", id)
        .maybeSingle();
      previousPosterUrl = current?.poster_url ?? null;
    }
    const { error } = await supabase.from("hero_carousel_images").update(update).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (previousPosterUrl && previousPosterUrl !== body.poster_url) {
      const previousPath = getHeroStorageObjectPath(previousPosterUrl);
      if (previousPath) await supabase.storage.from("room-images").remove([previousPath]);
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

    const paths = [data.media_url || data.image_url, data.poster_url]
      .map((url) => (url ? getHeroStorageObjectPath(url) : null))
      .filter((path): path is string => Boolean(path));
    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage.from("room-images").remove(paths);
      if (storageError && process.env.NODE_ENV === "development") {
        console.warn("Hero media cleanup failed:", storageError.message);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
