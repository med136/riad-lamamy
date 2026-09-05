import { NextResponse } from "next/server";
import { allMessageKeys, baseMessages, type Language, type MessageKey } from "@/lib/i18n";
import { CMS_PAGES, keyMatchesPrefixes } from "@/lib/cms/catalog";
import { requireAdmin } from "@/lib/cms/requireAdmin";

function metadataForKey(key: string) {
  for (const page of CMS_PAGES) {
    for (const section of page.sections) {
      if (keyMatchesPrefixes(key, section.translationPrefixes)) {
        return { namespace: key.split(".")[0] || "general", pageKey: page.key, sectionKey: section.key };
      }
    }
  }
  return { namespace: key.split(".")[0] || "general", pageKey: null, sectionKey: null };
}

export async function GET() {
  try {
    const { admin } = await requireAdmin();
    const { data, error } = await admin
      .from("cms_translations")
      .select("translation_key, language, value, updated_at")
      .order("translation_key");

    if (error) throw error;

    const overrides = new Map<string, string>();
    for (const row of data ?? []) overrides.set(`${row.translation_key}:${row.language}`, row.value);

    const items = allMessageKeys.map((key) => {
      const meta = metadataForKey(key);
      return {
        key,
        namespace: meta.namespace,
        pageKey: meta.pageKey,
        sectionKey: meta.sectionKey,
        fr: overrides.get(`${key}:fr`) ?? baseMessages.fr[key],
        en: overrides.get(`${key}:en`) ?? baseMessages.en[key],
        baseFr: baseMessages.fr[key],
        baseEn: baseMessages.en[key],
        overriddenFr: overrides.has(`${key}:fr`),
        overriddenEn: overrides.has(`${key}:en`),
      };
    });

    return NextResponse.json({ items });
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
      items?: Array<{ key: MessageKey; language: Language; value: string }>;
    };

    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) return NextResponse.json({ error: "No translations supplied" }, { status: 400 });

    const validKeys = new Set(allMessageKeys);
    const rows = items
      .filter((item) => validKeys.has(item.key) && (item.language === "fr" || item.language === "en"))
      .map((item) => {
        const meta = metadataForKey(item.key);
        return {
          translation_key: item.key,
          language: item.language,
          value: String(item.value ?? "").trim(),
          namespace: meta.namespace,
          page_key: meta.pageKey,
          section_key: meta.sectionKey,
          updated_by: user.id,
        };
      });

    if (!rows.length) return NextResponse.json({ error: "No valid translations supplied" }, { status: 400 });

    const { error } = await admin
      .from("cms_translations")
      .upsert(rows, { onConflict: "translation_key,language" });
    if (error) throw error;

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    const { admin } = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const language = searchParams.get("language");
    if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    let query = admin.from("cms_translations").delete().eq("translation_key", key);
    if (language === "fr" || language === "en") query = query.eq("language", language);
    const { error } = await query;
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
