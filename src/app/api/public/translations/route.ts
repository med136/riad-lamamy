import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isSupportedLanguage } from "@/lib/i18n";

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("lang");
  if (!isSupportedLanguage(requested)) return NextResponse.json({ error: "Unsupported language" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.json({ overrides: {} });

  const supabase = createClient(url, anon);
  const { data, error } = await supabase
    .from("cms_translations")
    .select("translation_key, value")
    .eq("language", requested);

  if (error) {
    console.error("CMS translations public read failed:", error.message);
    return NextResponse.json({ overrides: {} });
  }

  const overrides: Record<string, string> = {};
  for (const row of data ?? []) overrides[row.translation_key] = row.value;

  return NextResponse.json({ overrides }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
