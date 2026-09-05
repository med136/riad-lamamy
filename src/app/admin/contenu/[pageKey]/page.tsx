"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, GripVertical, Languages, Save } from "lucide-react";
import toast from "react-hot-toast";
import { findCmsPage, keyMatchesPrefixes } from "@/lib/cms/catalog";

type TranslationItem = {
  key: string;
  pageKey: string | null;
  sectionKey: string | null;
  fr: string;
  en: string;
};

type SectionState = {
  sectionKey: string;
  label: string;
  position: number;
  isVisible: boolean;
};

export default function ContentPageEditor() {
  const params = useParams<{ pageKey: string }>();
  const pageKey = params.pageKey;
  const page = findCmsPage(pageKey);
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [sections, setSections] = useState<SectionState[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(page?.sections[0]?.key ?? null);
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!page) return;
    const load = async () => {
      try {
        const [translationsRes, sectionsRes] = await Promise.all([
          fetch("/api/admin/translations", { cache: "no-store" }),
          fetch(`/api/admin/content/sections?page=${encodeURIComponent(pageKey)}`, { cache: "no-store" }),
        ]);
        const translationsJson = await translationsRes.json();
        const sectionsJson = await sectionsRes.json();
        if (!translationsRes.ok) throw new Error(translationsJson?.error || "Translations indisponibles");
        if (!sectionsRes.ok) throw new Error(sectionsJson?.error || "Sections indisponibles");
        setTranslations(Array.isArray(translationsJson.items) ? translationsJson.items : []);
        const dbItems = Array.isArray(sectionsJson.items) ? sectionsJson.items : [];
        setSections(page.sections.map((definition, index) => {
          const existing = dbItems.find((item: any) => item.section_key === definition.key);
          return {
            sectionKey: definition.key,
            label: definition.label,
            position: existing?.position ?? (index + 1) * 10,
            isVisible: existing?.is_visible ?? true,
          };
        }));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erreur de chargement");
      }
    };
    void load();
  }, [pageKey, page]);

  const activeDefinition = page?.sections.find((section) => section.key === activeSection) ?? null;
  const activeTranslations = useMemo(() => {
    if (!activeDefinition) return [];
    return translations.filter((item) => keyMatchesPrefixes(item.key, activeDefinition.translationPrefixes));
  }, [translations, activeDefinition]);

  const updateTranslation = (key: string, value: string) => {
    setTranslations((current) => current.map((item) => item.key === key ? { ...item, [language]: value } : item));
  };

  const toggleSection = (sectionKey: string) => {
    setSections((current) => current.map((section) => section.sectionKey === sectionKey ? { ...section, isVisible: !section.isVisible } : section));
  };

  const saveAll = async () => {
    if (!page) return;
    setSaving(true);
    try {
      const translationRows = translations
        .filter((item) => page.sections.some((section) => keyMatchesPrefixes(item.key, section.translationPrefixes)))
        .flatMap((item) => [
          { key: item.key, language: "fr", value: item.fr },
          { key: item.key, language: "en", value: item.en },
        ]);

      const [translationsRes, sectionsRes] = await Promise.all([
        translationRows.length ? fetch("/api/admin/translations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: translationRows }),
        }) : Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 })),
        fetch("/api/admin/content/sections", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageKey, sections }),
        }),
      ]);
      if (!translationsRes.ok) throw new Error((await translationsRes.json())?.error || "Erreur traductions");
      if (!sectionsRes.ok) throw new Error((await sectionsRes.json())?.error || "Erreur sections");
      toast.success("Contenu enregistré");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  if (!page) {
    return <main className="min-h-screen bg-[#F7F3EB] p-8"><p>Page CMS inconnue.</p><Link href="/admin/contenu" className="mt-4 inline-block text-[#0F5A46]">Retour</Link></main>;
  }

  return (
    <main className="min-h-screen bg-[#F7F3EB] p-5 sm:p-7 lg:p-9">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/admin/contenu" className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F5A46]"><ArrowLeft size={14}/> Contenu du site</Link>
            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">Gestion d’une page</p>
            <h1 className="mt-2 font-serif text-4xl font-medium text-[#2B1C17]">{page.label}</h1>
            <p className="mt-2 text-sm leading-6 text-[#6F625C]">{page.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={page.route} target="_blank" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#B28A47]/20 bg-white px-5 text-sm font-semibold text-[#5D514C]"><ExternalLink size={16}/> Voir la page</Link>
            <button disabled={saving} onClick={() => void saveAll()} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0F5A46] px-5 text-sm font-semibold text-white disabled:opacity-50"><Save size={16}/>{saving ? "Enregistrement…" : "Enregistrer"}</button>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-[22px] border border-[#B28A47]/15 bg-[#FFFDF8] p-3">
            <div className="px-3 pb-3 pt-2"><p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#B28A47]">Sections</p></div>
            <div className="space-y-2">
              {page.sections.map((definition) => {
                const state = sections.find((section) => section.sectionKey === definition.key);
                const active = activeSection === definition.key;
                return (
                  <button key={definition.key} onClick={() => setActiveSection(definition.key)} className={`w-full rounded-[16px] border p-3 text-left transition ${active ? "border-[#0F5A46]/25 bg-[#0F5A46]/5" : "border-[#B28A47]/12 bg-white hover:border-[#B28A47]/30"}`}>
                    <div className="flex items-center gap-3">
                      <GripVertical size={15} className="text-[#B28A47]"/>
                      <div className="min-w-0 flex-1"><p className="font-serif text-[17px] font-medium text-[#2B1C17]">{definition.label}</p><p className="mt-0.5 truncate text-[10px] text-[#6F625C]">{definition.description}</p></div>
                      <span onClick={(e) => { e.stopPropagation(); toggleSection(definition.key); }} className={`relative h-6 w-11 shrink-0 rounded-full transition ${state?.isVisible !== false ? "bg-[#0F5A46]" : "bg-[#D8D1C7]"}`}><span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition ${state?.isVisible !== false ? "left-5" : "left-[3px]"}`}/></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-[22px] border border-[#B28A47]/15 bg-[#FFFDF8] p-5 sm:p-6">
            {activeDefinition ? (
              <>
                <div className="flex flex-col gap-4 border-b border-[#B28A47]/12 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#B28A47]">Édition de section</p><h2 className="mt-1 font-serif text-2xl font-medium text-[#2B1C17]">{activeDefinition.label}</h2></div>
                  <div className="inline-flex rounded-full border border-[#B28A47]/18 bg-[#F7F3EB] p-1"><button onClick={() => setLanguage("fr")} className={`rounded-full px-4 py-2 text-xs font-semibold ${language === "fr" ? "bg-white text-[#0F5A46] shadow-sm" : "text-[#6F625C]"}`}>🇫🇷 Français</button><button onClick={() => setLanguage("en")} className={`rounded-full px-4 py-2 text-xs font-semibold ${language === "en" ? "bg-white text-[#0F5A46] shadow-sm" : "text-[#6F625C]"}`}>🇬🇧 English</button></div>
                </div>

                {activeTranslations.length ? <div className="mt-6 space-y-5">{activeTranslations.map((item) => {
                  const shortLabel = item.key.split(".").slice(-1)[0].replaceAll("_", " ");
                  const value = language === "fr" ? item.fr : item.en;
                  const multiline = value.length > 90 || /(description|subtitle|answer|message)/i.test(item.key);
                  return <label key={item.key} className="block"><span className="mb-2 flex items-center justify-between gap-3"><span className="text-xs font-semibold capitalize text-[#5D514C]">{shortLabel}</span><code className="text-[9px] text-[#B28A47]">{item.key}</code></span>{multiline ? <textarea value={value} onChange={(e) => updateTranslation(item.key, e.target.value)} rows={4} className="w-full rounded-[14px] border border-[#B28A47]/18 bg-white px-4 py-3 text-sm leading-6 text-[#2B1C17] outline-none focus:border-[#0F5A46]/45"/> : <input value={value} onChange={(e) => updateTranslation(item.key, e.target.value)} className="h-12 w-full rounded-[14px] border border-[#B28A47]/18 bg-white px-4 text-sm text-[#2B1C17] outline-none focus:border-[#0F5A46]/45"/>}</label>;
                })}</div> : <div className="mt-8 rounded-[16px] border border-dashed border-[#B28A47]/25 bg-[#F7F3EB]/55 p-6 text-center"><Languages className="mx-auto text-[#B28A47]" size={20}/><p className="mt-2 text-sm font-semibold text-[#2B1C17]">Aucune clé i18n reliée à cette section</p><p className="mt-1 text-xs text-[#6F625C]">La section reste contrôlable en visibilité. Les textes hardcodés pourront être migrés vers i18n progressivement.</p></div>}
              </>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
