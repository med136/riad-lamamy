"use client";
import { useEffect, useState } from "react";

type Section = { section_key: string; settings?: Record<string,unknown> | null };
export function usePublicServicesSettings(sectionKey: string) {
  const [settings, setSettings] = useState<Record<string,unknown>>({});
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response=await fetch("/api/public/content/sections?page=services",{signal:controller.signal,cache:"no-store"});
        if(!response.ok)return;
        const body=await response.json();
        const section:Section|undefined=Array.isArray(body.items)
          ?(body.items as Section[]).find(x=>x.section_key===sectionKey)
          :undefined;
        if (!controller.signal.aborted) setSettings(section?.settings && typeof section.settings === "object" ? section.settings : {});
      } catch(error) { if (!controller.signal.aborted) console.error("Services CMS unavailable",error); }
    })();
    return () => controller.abort();
  }, [sectionKey]);
  return settings;
}
export function internalServiceLink(raw:unknown) {
  return typeof raw === "string" && /^\/(?!\/)[a-zA-Z0-9/_?&=#.%+~-]{0,199}$/.test(raw) ? raw : "/contact";
}
