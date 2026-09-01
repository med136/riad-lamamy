"use client";

import { useState } from "react";
import Image from "next/image";
import type { HeroMediaItem } from "@/types/hero-media";

type HeroSlideMediaProps = {
  item: HeroMediaItem;
  isFirst: boolean;
  prefersReducedMotion: boolean;
  documentVisible: boolean;
  registerVideo: (
    id: string,
    element: HTMLVideoElement | null,
  ) => void;
};

export function HeroSlideMedia({
  item,
  isFirst,
  prefersReducedMotion,
  documentVisible,
  registerVideo,
}: HeroSlideMediaProps) {
  const [videoFailed, setVideoFailed] =
    useState(false);

  const [videoReady, setVideoReady] =
    useState(false);

  const showVideo =
    item.mediaType === "video" &&
    !prefersReducedMotion &&
    !videoFailed;

  const fallbackImage =
    item.posterUrl ||
    (item.mediaType === "image"
      ? item.mediaUrl
      : null);

  return (
    <div className="absolute inset-0 bg-[#f6f1e8]">
      {fallbackImage && (
        <Image
          src={fallbackImage}
          alt={item.altText || ""}
          fill
          priority={isFirst}
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {showVideo && (
        <video
          ref={(element) =>
            registerVideo(item.id, element)
          }
          src={item.mediaUrl}
          poster={item.posterUrl || undefined}
          autoPlay={documentVisible}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady
              ? "opacity-100"
              : "opacity-0"
          }`}
          onCanPlay={(event) => {
            setVideoReady(true);

            if (documentVisible) {
              void event.currentTarget
                .play()
                .catch(() => undefined);
            }
          }}
          onPlaying={() =>
            setVideoReady(true)
          }
          onError={() => {
            registerVideo(item.id, null);
            setVideoReady(false);
            setVideoFailed(true);

            if (
              process.env.NODE_ENV ===
              "development"
            ) {
              console.warn(
                "Hero video failed to load",
                item.mediaUrl,
              );
            }
          }}
        />
      )}
    </div>
  );
}