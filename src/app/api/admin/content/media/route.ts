import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/cms/requireAdmin";

export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

function safePart(value: FormDataEntryValue | null, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

export async function POST(request: Request) {
  try {
    const { admin } = await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Format non autorisé. Utilisez JPG, PNG, WebP ou AVIF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image trop volumineuse (10 Mo maximum)." }, { status: 400 });
    }

    const pageKey = safePart(formData.get("pageKey"), "page");
    const sectionKey = safePart(formData.get("sectionKey"), "hero");
    const extension = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const objectPath = `cms/${pageKey}/${sectionKey}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const bytes = await file.arrayBuffer();

    const buckets = ["public", "room-images"];
    let usedBucket: string | null = null;

    for (const bucket of buckets) {
      const { error } = await admin.storage.from(bucket).upload(objectPath, bytes, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

      if (!error) {
        usedBucket = bucket;
        break;
      }

      if (/Bucket not found/i.test(error.message || "")) continue;
      throw error;
    }

    if (!usedBucket) {
      return NextResponse.json(
        { error: "Aucun bucket Supabase public disponible pour l’upload." },
        { status: 500 },
      );
    }

    const { data } = admin.storage.from(usedBucket).getPublicUrl(objectPath);
    return NextResponse.json({ publicUrl: data.publicUrl, bucket: usedBucket, path: objectPath });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
