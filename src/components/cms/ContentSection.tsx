"use client";

import { useEffect, useState, type ReactNode } from "react";

type PublicSection = {
  section_key: string;
  is_visible: boolean;
};

const sectionCache = new Map<string, Promise<PublicSection[]>>();

function loadSections(pageKey: string) {
  const cached = sectionCache.get(pageKey);
  if (cached) return cached;

  const request = fetch(`/api/public/content/sections?page=${encodeURIComponent(pageKey)}`)
    .then(async (res) => {
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data?.items) ? (data.items as PublicSection[]) : [];
    })
    .catch(() => []);

  sectionCache.set(pageKey, request);
  return request;
}

export function ContentSection({
  pageKey,
  sectionKey,
  children,
}: {
  pageKey: string;
  sectionKey: string;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let active = true;
    void loadSections(pageKey).then((items) => {
      if (!active) return;
      const item = items.find((entry) => entry.section_key === sectionKey);
      if (item) setVisible(item.is_visible !== false);
    });
    return () => {
      active = false;
    };
  }, [pageKey, sectionKey]);

  if (!visible) return null;
  return <>{children}</>;
}
