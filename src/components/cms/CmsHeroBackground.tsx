"use client";

import { useEffect, useState } from "react";

type PublicSection = {
  section_key: string;
  settings?: Record<string, unknown> | null;
};

const settingsCache = new Map<string, Promise<PublicSection[]>>();

function loadPageSections(pageKey: string) {
  const cacheKey = pageKey;
  const cached = settingsCache.get(cacheKey);
  if (cached) return cached;

  const request = fetch(
    `/api/public/content/sections?page=${encodeURIComponent(pageKey)}`,
    { cache: "no-store" },
  )
    .then(async (res) => {
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data?.items) ? (data.items as PublicSection[]) : [];
    })
    .catch(() => []);

  settingsCache.set(cacheKey, request);
  return request;
}

export function CmsHeroBackground({
  pageKey,
  fallbackSrc,
  className = "",
  position = "center",
}: {
  pageKey: string;
  fallbackSrc: string;
  className?: string;
  position?: string;
}) {
  const [src, setSrc] = useState(fallbackSrc);

  useEffect(() => {
    let active = true;

    void loadPageSections(pageKey).then((items) => {
      if (!active) return;
      const hero = items.find((item) => item.section_key === "hero");
      const image = hero?.settings?.heroImage;
      if (typeof image === "string" && image.trim()) {
        setSrc(image.trim());
      } else {
        setSrc(fallbackSrc);
      }
    });

    return () => {
      active = false;
    };
  }, [pageKey, fallbackSrc]);

  return (
    <div
      className={className}
      style={{
        backgroundImage: `url("${src.replace(/["\\]/g, "\\$&")}")`,
        backgroundPosition: position,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
      aria-hidden="true"
    />
  );
}
