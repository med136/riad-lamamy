import { NextResponse } from "next/server";
import { requireAdminSession, UnauthorizedAdminError } from "@/lib/auth/admin";
import { isAllowedHeroStorageUrl } from "@/lib/hero-media";
import { createAdminClient } from "@/lib/supabase/adminClient";
import type { HeroMediaApiItem, HeroMediaType } from "@/types/hero-media";

export const dynamic = "force-dynamic";

type HeroMediaRow = {
  id: string;
  image_url: string | null;
  media_type?: HeroMediaType | null;
  media_url?: string | null;
  poster_url?: string | null;
  alt_text?: string | null;
  display_order: number | null;
  is_active?: boolean | null;
};

const isVideoUrl = (value: string | null | undefined) =>
  Boolean(value && /\.(?:mp4|webm)(?:$|[?#])/i.test(value));

const toApiItem = (row: HeroMediaRow): HeroMediaApiItem => ({
  id: row.id,
  media_type:
    row.media_type === "video" || (!row.media_type && isVideoUrl(row.media_url || row.image_url))
      ? "video"
      : "image",
  media_url: row.media_url || row.image_url || "",
  poster_url: row.poster_url ?? null,
  alt_text: row.alt_text ?? null,
  position: row.display_order ?? 0,
  is_active: row.is_active ?? true,
});

const errorResponse = (error: unknown) => {
  const status = error instanceof UnauthorizedAdminError ? 401 : 500;
  const message = error instanceof Error ? error.message : "Erreur interne.";
  return NextResponse.json({ error: message }, { status });
};

export async function GET() {
  try {
    await requireAdminSession();
    const supabase = createAdminClient();
    const { data: heroSettings, error: heroError } = await supabase
      .from("hero_settings")
      .select("id")
      .limit(1)
      .single();
    if (heroError || !heroSettings) {
      return NextResponse.json({ error: "Hero settings not found" }, { status: 404 });
    }

    const modernResult = await supabase
      .from("hero_carousel_images")
      .select("id, image_url, media_type, media_url, poster_url, alt_text, display_order, is_active")
      .eq("hero_settings_id", heroSettings.id)
      .order("display_order", { ascending: true });
    let data = modernResult.data as HeroMediaRow[] | null;
    let error = modernResult.error;
    if (error) {
      const legacyResult = await supabase
        .from("hero_carousel_images")
        .select("id, image_url, display_order")
        .eq("hero_settings_id", heroSettings.id)
        .order("display_order", { ascending: true });
      data = legacyResult.data as HeroMediaRow[] | null;
      error = legacyResult.error;
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(((data || []) as HeroMediaRow[]).map(toApiItem));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = (await request.json()) as {
      media_type?: HeroMediaType;
      media_url?: string;
      poster_url?: string | null;
      alt_text?: string | null;
    };
    if (!body.media_url || !isAllowedHeroStorageUrl(body.media_url)) {
      return NextResponse.json({ error: "URL de média Hero non autorisée." }, { status: 400 });
    }
    if (body.media_type !== "image" && body.media_type !== "video") {
      return NextResponse.json({ error: "Type de média invalide." }, { status: 400 });
    }
    if (body.poster_url && !isAllowedHeroStorageUrl(body.poster_url)) {
      return NextResponse.json({ error: "URL de poster non autorisée." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: heroSettings, error: heroError } = await supabase
      .from("hero_settings")
      .select("id")
      .limit(1)
      .single();
    if (heroError || !heroSettings) {
      return NextResponse.json({ error: "Hero settings not found" }, { status: 404 });
    }

    const { data: last } = await supabase
      .from("hero_carousel_images")
      .select("display_order")
      .eq("hero_settings_id", heroSettings.id)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const position = (last?.display_order ?? 0) + 1;

    const modernInsert = await supabase
      .from("hero_carousel_images")
      .insert({
        hero_settings_id: heroSettings.id,
        image_url: body.media_url,
        media_type: body.media_type,
        media_url: body.media_url,
        poster_url: body.poster_url ?? null,
        alt_text: body.alt_text?.trim().slice(0, 180) || null,
        display_order: position,
        is_active: true,
      })
      .select("id, image_url, media_type, media_url, poster_url, alt_text, display_order, is_active")
      .single();
    if (!modernInsert.error) {
      return NextResponse.json(toApiItem(modernInsert.data as HeroMediaRow), { status: 201 });
    }

    // Compatibility with databases that still have the original image-only schema.
    if (modernInsert.error.code === "42703") {
      const legacyInsert = await supabase
        .from("hero_carousel_images")
        .insert({
          hero_settings_id: heroSettings.id,
          image_url: body.media_url,
          display_order: position,
        })
        .select("id, image_url, display_order")
        .single();
      if (legacyInsert.error) {
        return NextResponse.json({ error: legacyInsert.error.message }, { status: 500 });
      }
      return NextResponse.json(toApiItem(legacyInsert.data as HeroMediaRow), { status: 201 });
    }

    return NextResponse.json({ error: modernInsert.error.message }, { status: 500 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession();
    const body = (await request.json()) as { items?: Array<{ id: string }> };
    if (!Array.isArray(body.items)) {
      return NextResponse.json({ error: "Liste de médias requise." }, { status: 400 });
    }
    const supabase = createAdminClient();
    const results = await Promise.all(
      body.items.map((item, index) =>
        supabase.from("hero_carousel_images").update({ display_order: index + 1 }).eq("id", item.id),
      ),
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
