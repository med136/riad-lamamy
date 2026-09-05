import { NextResponse } from "next/server";
import { CMS_PAGES } from "@/lib/cms/catalog";
import { requireAdmin } from "@/lib/cms/requireAdmin";

export async function GET(request: Request) {
  try {
    const { admin } = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get("page");

    let query = admin.from("cms_page_sections").select("*").order("position", { ascending: true });
    if (pageKey) query = query.eq("page_key", pageKey);
    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ items: data ?? [], catalog: CMS_PAGES });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const { user, admin } = await requireAdmin();
    const body = (await request.json()) as {
      pageKey?: string;
      sections?: Array<{ sectionKey: string; label: string; position: number; isVisible: boolean; settings?: Record<string, unknown> }>;
    };

    if (!body.pageKey || !Array.isArray(body.sections)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const rows = body.sections.map((section) => ({
      page_key: body.pageKey,
      section_key: section.sectionKey,
      label: section.label,
      position: Number(section.position) || 0,
      is_visible: Boolean(section.isVisible),
      settings: section.settings ?? {},
      updated_by: user.id,
    }));

    const { error } = await admin.from("cms_page_sections").upsert(rows, { onConflict: "page_key,section_key" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
