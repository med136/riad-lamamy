import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { HeroStorageError, getHeroMediaFile } from "@/lib/hero-local-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ category: string; filename: string }>;
};

const cacheHeaders = {
  "Accept-Ranges": "bytes",
  "Cache-Control": "public, max-age=2592000, immutable",
};

const errorResponse = (error: unknown) => {
  const status = error instanceof HeroStorageError ? error.status : 500;
  return new Response(status === 404 ? "Not found" : "Unable to serve media", { status });
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { category, filename } = await params;
    const media = await getHeroMediaFile(category, filename);
    const range = request.headers.get("range");

    if (range) {
      const match = range.match(/^bytes=(\d*)-(\d*)$/);
      if (!match) return new Response(null, { status: 416 });

      let start: number;
      let end: number;

      if (!match[1] && match[2]) {
        // Suffix byte range, e.g. bytes=-500
        const suffixLength = Number(match[2]);
        if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
          return new Response(null, {
            status: 416,
            headers: { "Content-Range": `bytes */${media.size}` },
          });
        }
        start = Math.max(media.size - suffixLength, 0);
        end = media.size - 1;
      } else {
        start = match[1] ? Number(match[1]) : 0;
        const requestedEnd = match[2] ? Number(match[2]) : media.size - 1;
        end = Math.min(requestedEnd, media.size - 1);
      }

      if (
        !Number.isSafeInteger(start) ||
        !Number.isSafeInteger(end) ||
        start < 0 ||
        start >= media.size ||
        start > end
      ) {
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${media.size}` },
        });
      }

      const stream = Readable.toWeb(createReadStream(media.filePath, { start, end }));
      return new Response(stream as ReadableStream<Uint8Array>, {
        status: 206,
        headers: {
          ...cacheHeaders,
          "Content-Type": media.mimeType,
          "Content-Length": String(end - start + 1),
          "Content-Range": `bytes ${start}-${end}/${media.size}`,
        },
      });
    }

    const stream = Readable.toWeb(createReadStream(media.filePath));
    return new Response(stream as ReadableStream<Uint8Array>, {
      headers: {
        ...cacheHeaders,
        "Content-Type": media.mimeType,
        "Content-Length": String(media.size),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function HEAD(_request: Request, { params }: RouteContext) {
  try {
    const { category, filename } = await params;
    const media = await getHeroMediaFile(category, filename);
    return new Response(null, {
      headers: {
        ...cacheHeaders,
        "Content-Type": media.mimeType,
        "Content-Length": String(media.size),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
