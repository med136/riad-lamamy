import { NextResponse } from "next/server";
import { requireAdminSession, UnauthorizedAdminError } from "@/lib/auth/admin";
import { HeroStorageError, storeHeroMedia } from "@/lib/hero-local-storage";
import { HeroMediaValidationError } from "@/lib/hero-media";
import type { HeroMediaType } from "@/types/hero-media";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const formData = await request.formData();
    const file = formData.get("file");
    const requestedType = formData.get("mediaType");
    const kind = formData.get("kind");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier fourni." },
        { status: 400 },
      );
    }

    let expectedType: HeroMediaType | undefined;
    if (kind === "poster") expectedType = "image";
    else if (requestedType === "image" || requestedType === "video") expectedType = requestedType;
    else if (requestedType) {
      return NextResponse.json(
        { success: false, error: "Type de média demandé invalide." },
        { status: 400 },
      );
    }

    const media = await storeHeroMedia(file, expectedType);
    return NextResponse.json({ success: true, media }, { status: 201 });
  } catch (error) {
    const status =
      error instanceof UnauthorizedAdminError
        ? 401
        : error instanceof HeroStorageError || error instanceof HeroMediaValidationError
          ? error.status
          : 500;
    const message = error instanceof Error ? error.message : "Téléversement impossible.";
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
