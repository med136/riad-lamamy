"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultLanguage,
  isSupportedLanguage,
  LANGUAGE_COOKIE,
  translate,
  type Language,
  type MessageKey,
} from "@/lib/i18n";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
};

const setCookieValue = (name: string, value: string) => {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 180;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
};

export function LanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage?: Language;
  children: ReactNode;
}) {
  const [language, setLanguage] = useState<Language>(
    initialLanguage ?? defaultLanguage
  );
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    let next: unknown = null;
    try {
      next = window.localStorage.getItem(LANGUAGE_COOKIE);
    } catch {
      // ignore
    }
    if (!next) next = getCookieValue(LANGUAGE_COOKIE);

    const supported = isSupportedLanguage(next) ? next : null;
    if (supported) {
      setLanguage((current) => (current === supported ? current : supported));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCookieValue(LANGUAGE_COOKIE, language);
    try {
      window.localStorage.setItem(LANGUAGE_COOKIE, language);
    } catch {
      // ignore
    }
    document.documentElement.lang = language;
  }, [language]);


  useEffect(() => {
    if (typeof window === "undefined") return;
    const controller = new AbortController();
    const loadOverrides = async () => {
      try {
        const res = await fetch(`/api/public/translations?lang=${language}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.overrides && typeof data.overrides === "object") {
          setOverrides(data.overrides as Record<string, string>);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Translation overrides load failed:", error);
        }
      }
    };
    void loadOverrides();
    return () => controller.abort();
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const t = (key: MessageKey) => overrides[key] ?? translate(language, key);
    return { language, setLanguage, t };
  }, [language, overrides]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within <LanguageProvider />");
  }
  return ctx;
};
