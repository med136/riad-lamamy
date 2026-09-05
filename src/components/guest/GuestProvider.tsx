"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LanguageProvider } from "@/components/LanguageProvider";
import type { Language } from "@/lib/i18n";

export type GuestSettings = {
  email: string;
  phone: string;
  whatsapp: string;
  address: string[];
  wifiName: string;
  wifiPassword: string;
  checkIn: string;
  checkOut: string;
  houseRules: string;
};

const EMPTY_SETTINGS: GuestSettings = {
  email: "",
  phone: "",
  whatsapp: "",
  address: [],
  wifiName: "",
  wifiPassword: "",
  checkIn: "",
  checkOut: "",
  houseRules: "",
};

type GuestSettingsContextValue = {
  settings: GuestSettings;
  loading: boolean;
};

const GuestSettingsContext = createContext<GuestSettingsContextValue>({
  settings: EMPTY_SETTINGS,
  loading: true,
});

function stringSetting(data: Record<string, unknown>, key: string) {
  const value = data[key];
  return typeof value === "string" ? value.trim() : "";
}

function contactNumber(data: Record<string, unknown>, key: string) {
  const value = stringSetting(data, key);
  const digits = value.replace(/\D/g, "");
  const localDigits = digits.slice(-8);
  const looksLikePlaceholder = /x/i.test(value) || new Set(localDigits).size < 3;
  return digits.length >= 8 && !looksLikePlaceholder ? value : "";
}

function GuestSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSettings() {
      try {
        const response = await fetch("/api/public/settings", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const payload: unknown = await response.json();
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) return;
        const data = payload as Record<string, unknown>;

        const address = [
          stringSetting(data, "address_line_1"),
          stringSetting(data, "address_line_2"),
          [
            stringSetting(data, "address_postal_code"),
            stringSetting(data, "address_city"),
          ]
            .filter(Boolean)
            .join(" "),
          stringSetting(data, "address_country"),
        ].filter(Boolean);

        setSettings({
          email: stringSetting(data, "contact_email"),
          phone: contactNumber(data, "contact_phone"),
          whatsapp: contactNumber(data, "whatsapp_phone"),
          address,
          wifiName: stringSetting(data, "wifi_name"),
          wifiPassword: stringSetting(data, "wifi_password"),
          checkIn: stringSetting(data, "check_in_time"),
          checkOut: stringSetting(data, "check_out_time"),
          houseRules: stringSetting(data, "house_rules"),
        });
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Guest settings error:", error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadSettings();
    return () => controller.abort();
  }, []);

  const value = useMemo(() => ({ settings, loading }), [settings, loading]);
  return (
    <GuestSettingsContext.Provider value={value}>
      {children}
    </GuestSettingsContext.Provider>
  );
}

export default function GuestProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage: Language;
}) {
  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <GuestSettingsProvider>{children}</GuestSettingsProvider>
    </LanguageProvider>
  );
}

export function useGuestSettings() {
  return useContext(GuestSettingsContext);
}
