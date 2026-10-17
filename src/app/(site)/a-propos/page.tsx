import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { baseMessages, isSupportedLanguage, LANGUAGE_COOKIE } from "@/lib/i18n";
import AboutHero from "@/components/AboutHero";
import Values from "@/components/Values";
import Team from "@/components/Team";
import { Experience } from "@/components/Experience";
import { ContentSection } from "@/components/cms/ContentSection";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cookieLanguage = (await cookies()).get(LANGUAGE_COOKIE)?.value;
  const language = isSupportedLanguage(cookieLanguage) ? cookieLanguage : "fr";
  let title = baseMessages[language]["about.seo.title"];
  let description = baseMessages[language]["about.seo.description"];
  let image = "/images/about/hero-darlamamy-about.jpeg";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey) {
    try {
      const client = createClient(url, anonKey);
      const [translations, sections] = await Promise.all([
        client.from("cms_translations")
          .select("translation_key, value")
          .eq("language", language)
          .in("translation_key", ["about.seo.title", "about.seo.description"]),
        client.from("cms_page_sections")
          .select("settings")
          .eq("page_key", "about")
          .eq("section_key", "hero")
          .maybeSingle(),
      ]);

      if (!translations.error) {
        for (const row of translations.data ?? []) {
          if (row.translation_key === "about.seo.title" && row.value?.trim()) title = row.value.trim();
          if (row.translation_key === "about.seo.description" && row.value?.trim()) description = row.value.trim();
        }
      }

      if (!sections.error) {
        const settings = sections.data?.settings;
        if (settings && typeof settings === "object" && !Array.isArray(settings)) {
          const heroImage = (settings as Record<string, unknown>).heroImage;
          if (typeof heroImage === "string" && (
            /^https:\/\//.test(heroImage) || (heroImage.startsWith("/") && !heroImage.startsWith("//"))
          )) image = heroImage;
        }
      }
    } catch {
      // Supabase is optional for server metadata: keep the current defaults.
    }
  }

  return {
    title,
    description,
    alternates: { canonical: "https://darlamamy.com/a-propos" },
    openGraph: {
      title,
      description,
      url: "https://darlamamy.com/a-propos",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: "Dar LaMamy à Fès" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function AboutPage() {
  return (
    <main className="bg-[#FFFDF8]">
      <ContentSection pageKey="about" sectionKey="hero"><AboutHero /></ContentSection>
      <ContentSection pageKey="about" sectionKey="values"><Values /></ContentSection>
      <ContentSection pageKey="about" sectionKey="team"><Team /></ContentSection>
      <ContentSection pageKey="about" sectionKey="experience"><Experience /></ContentSection>
    </main>
  );
}
