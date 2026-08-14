import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { cookies } from "next/headers";
import { defaultLanguage, isSupportedLanguage, LANGUAGE_COOKIE } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riad Dar Al Andalus - Marrakech",
  description: "Un riad d'exception au coeur de la medina de Marrakech.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const language = isSupportedLanguage(langCookie) ? langCookie : defaultLanguage;

  return (
    <html lang={language} className="scroll-smooth">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
