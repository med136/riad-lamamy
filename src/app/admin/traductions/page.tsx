"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Languages, RotateCcw, Save, Search } from "lucide-react";
import toast from "react-hot-toast";

type TranslationItem = {
  key: string;
  namespace: string;
  pageKey: string | null;
  sectionKey: string | null;
  fr: string;
  en: string;
  baseFr: string;
  baseEn: string;
  overriddenFr: boolean;
  overriddenEn: boolean;
};

export default function TranslationsAdminPage() {
  const [items, setItems] = useState<TranslationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [namespace, setNamespace] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/translations", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Chargement impossible");
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const namespaces = useMemo(() => ["all", ...Array.from(new Set(items.map((item) => item.namespace))).sort()], [items]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (namespace !== "all" && item.namespace !== namespace) return false;
      if (!needle) return true;
      return [item.key, item.fr, item.en, item.pageKey, item.sectionKey].some((value) => String(value ?? "").toLowerCase().includes(needle));
    });
  }, [items, namespace, query]);

  const patchLocal = (key: string, language: "fr" | "en", value: string) => {
    setItems((current) => current.map((item) => item.key === key ? { ...item, [language]: value } : item));
  };

  const saveRow = async (item: TranslationItem) => {
    setSaving(item.key);
    try {
      const res = await fetch("/api/admin/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [
          { key: item.key, language: "fr", value: item.fr },
          { key: item.key, language: "en", value: item.en },
        ] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Enregistrement impossible");
      toast.success("Traduction enregistrée");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setSaving(null);
    }
  };

  const resetRow = async (item: TranslationItem) => {
    try {
      const res = await fetch(`/api/admin/translations?key=${encodeURIComponent(item.key)}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Réinitialisation impossible");
      toast.success("Valeurs d’origine restaurées");
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erreur"); }
  };

  return (
    <main className="min-h-screen bg-[#F7F3EB] p-5 sm:p-7 lg:p-9">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">Content Studio</p>
            <h1 className="mt-2 font-serif text-4xl font-medium text-[#2B1C17]">Traductions</h1>
            <p className="mt-2 text-sm text-[#6F625C]">Modifiez les textes français et anglais utilisés par le site. Le code reste le fallback de sécurité.</p>
          </div>
          <div className="rounded-full border border-[#0F5A46]/15 bg-[#0F5A46]/5 px-4 py-2 text-xs font-semibold text-[#0F5A46]">
            {items.length} clés · FR / EN
          </div>
        </div>

        <div className="mt-7 rounded-[22px] border border-[#B28A47]/15 bg-[#FFFDF8] shadow-[0_18px_55px_-42px_rgba(43,28,23,0.35)]">
          <div className="flex flex-col gap-3 border-b border-[#B28A47]/12 p-4 md:flex-row">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B28A47]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une clé ou un texte…" className="h-11 w-full rounded-xl border border-[#B28A47]/18 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#0F5A46]/45" />
            </label>
            <select value={namespace} onChange={(e) => setNamespace(e.target.value)} className="h-11 rounded-xl border border-[#B28A47]/18 bg-white px-4 text-sm text-[#5D514C] outline-none">
              {namespaces.map((value) => <option key={value} value={value}>{value === "all" ? "Toutes les catégories" : value}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-[#6F625C]">Chargement des traductions…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead><tr className="bg-[#F7F3EB]/65 text-[10px] uppercase tracking-[0.12em] text-[#6F625C]">
                  <th className="px-4 py-3 font-semibold">Clé</th><th className="px-4 py-3 font-semibold">Français</th><th className="px-4 py-3 font-semibold">Anglais</th><th className="px-4 py-3 font-semibold">Page / section</th><th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-[#B28A47]/10">
                  {filtered.map((item) => (
                    <tr key={item.key} className="align-top hover:bg-[#F7F3EB]/30">
                      <td className="w-[230px] px-4 py-4"><code className="text-xs font-semibold text-[#0F5A46]">{item.key}</code><div className="mt-1 text-[10px] text-[#B28A47]">{item.namespace}</div></td>
                      <td className="px-4 py-3"><textarea value={item.fr} onChange={(e) => patchLocal(item.key, "fr", e.target.value)} rows={2} className="min-h-[58px] w-full resize-y rounded-xl border border-[#B28A47]/15 bg-white px-3 py-2 text-sm leading-5 text-[#2B1C17] outline-none focus:border-[#0F5A46]/40" /></td>
                      <td className="px-4 py-3"><textarea value={item.en} onChange={(e) => patchLocal(item.key, "en", e.target.value)} rows={2} className="min-h-[58px] w-full resize-y rounded-xl border border-[#B28A47]/15 bg-white px-3 py-2 text-sm leading-5 text-[#2B1C17] outline-none focus:border-[#0F5A46]/40" /></td>
                      <td className="w-[150px] px-4 py-4 text-xs text-[#6F625C]">{item.pageKey ?? "Global"}<br/><span className="text-[#B28A47]">{item.sectionKey ?? "—"}</span></td>
                      <td className="w-[135px] px-4 py-4"><div className="flex justify-end gap-2"><button onClick={() => void resetRow(item)} title="Restaurer" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B28A47]/18 text-[#6F625C] hover:text-[#B28A47]"><RotateCcw size={15}/></button><button disabled={saving === item.key} onClick={() => void saveRow(item)} className="flex h-9 items-center gap-1.5 rounded-full bg-[#0F5A46] px-3 text-xs font-semibold text-white disabled:opacity-50">{saving === item.key ? <Check size={14}/> : <Save size={14}/>} Enregistrer</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
