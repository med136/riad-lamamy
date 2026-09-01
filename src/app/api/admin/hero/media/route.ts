import { NextResponse } from "next/server";
import { requireAdminSession, UnauthorizedAdminError } from "@/lib/auth/admin";
import { deleteHeroMedia, HeroStorageError } from "@/lib/hero-local-storage";
import { POST as uploadHeroMedia } from "@/app/api/admin/hero/upload/route";

export const runtime = "nodejs";

// Compatibility alias for clients deployed before /api/admin/hero/upload.
export async function POST(request: Request) {
  return uploadHeroMedia(request);
}

export async function DELETE(request: Request) {
  try {
    await requireAdminSession();
    const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
    if (!body || typeof body.url !== "string") {
      return NextResponse.json(
        { success: false, error: "URL du média requise." },
        { status: 400 },
      );
    }

    await deleteHeroMedia(body.url);
    return NextResponse.json({ success: true });
  } catch (error) {
    const status =
      error instanceof UnauthorizedAdminError
        ? 401
        : error instanceof HeroStorageError
          ? error.status
          : 500;
    const message = error instanceof Error ? error.message : "Suppression impossible.";
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
