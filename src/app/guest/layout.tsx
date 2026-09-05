import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import GuestProvider from "@/components/guest/GuestProvider";
import { defaultLanguage, isSupportedLanguage, LANGUAGE_COOKIE } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Conciergerie digitale | Dar LaMamy",
  description:
    "Votre espace séjour Dar LaMamy : informations utiles, services, transferts et découverte de Fès.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GuestLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const savedLanguage = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const initialLanguage = isSupportedLanguage(savedLanguage)
    ? savedLanguage
    : defaultLanguage;

  return <GuestProvider initialLanguage={initialLanguage}>{children}</GuestProvider>;
}
