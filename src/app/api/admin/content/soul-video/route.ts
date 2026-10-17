import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/cms/requireAdmin";
import {
  ALLOWED_SOUL_VIDEO_TYPES,
  MAX_SOUL_VIDEO_BYTES,
} from "@/lib/home-soul";

export const dynamic = "force-dynamic";

type SignedUploadBody = { contentType?: string; size?: number };

/**
 * Creates a one-time, time-limited signed Supabase upload token.
 * The file itself goes browser -> Storage, avoiding Next/Vercel request-size limits.
 * An authenticated administrator must request a token for each video.
 */
export async function POST(request: Request) {
  try {
    const { admin } = await requireAdmin();
    const body = await request.json() as SignedUploadBody;
    if (!body || !ALLOWED_SOUL_VIDEO_TYPES.includes(body.contentType as typeof ALLOWED_SOUL_VIDEO_TYPES[number])) {
      return NextResponse.json({ error: "Utilisez une vidéo MP4 ou WebM." }, { status: 400 });
    }
    if (!Number.isSafeInteger(body.size) || (body.size as number) <= 0 || (body.size as number) > MAX_SOUL_VIDEO_BYTES) {
      return NextResponse.json({ error: "La vidéo doit être inférieure à 45 Mo." }, { status: 400 });
    }

    const { data: buckets, error: bucketError } = await admin.storage.listBuckets();
    if (bucketError) throw bucketError;

    const mime = body.contentType as string;
    const validBucket = (buckets ?? []).find((bucket) => {
      if (!["public", "room-images"].includes(bucket.id) || !bucket.public) return false;
      const allowed = bucket.allowed_mime_types;
      if (allowed?.length && !allowed.includes(mime) && !allowed.includes("video/*")) return false;
      if (bucket.file_size_limit && (body.size as number) > bucket.file_size_limit) return false;
      return true;
    });

    if (!validBucket) {
      return NextResponse.json({
        error: "Aucun bucket Supabase public n’accepte cette vidéo. Vérifiez le type MIME et la limite de taille dans Storage.",
      }, { status: 422 });
    }

    const ext = mime === "video/webm" ? "webm" : "mp4";
    const path = `cms/home/soul/${crypto.randomUUID()}.${ext}`;
    const { data, error } = await admin.storage.from(validBucket.id).createSignedUploadUrl(path);
    if (error || !data) throw error ?? new Error("Signature indisponible");

    const { data: publicData } = admin.storage.from(validBucket.id).getPublicUrl(path);
    return NextResponse.json(
      { token: data.token, bucket: validBucket.id, path, publicUrl: publicData.publicUrl },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de l’initialisation de l’upload";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
