import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageKey = searchParams.get("page");
  if (!pageKey) return NextResponse.json({ error: "Missing page" }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.json({ items: [] });

  const supabase = createClient(url, anon);
  const { data, error } = await supabase
    .from("cms_page_sections")
    .select("section_key, label, position, is_visible, settings")
    .eq("page_key", pageKey)
    .order("position");

  if (error) return NextResponse.json({ items: [] });
  return NextResponse.json({ items: data ?? [] }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
