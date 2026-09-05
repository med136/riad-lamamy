import Link from "next/link";
import { ArrowRight, FileText, Languages, PanelsTopLeft } from "lucide-react";
import { CMS_PAGES } from "@/lib/cms/catalog";

export default function ContentStudioPage() {
  return (
    <main className="min-h-screen bg-[#F7F3EB] p-5 sm:p-7 lg:p-9">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">Content Studio</p>
            <h1 className="mt-2 font-serif text-4xl font-medium text-[#2B1C17]">Contenu du site</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6F625C]">
              Modifiez le contenu éditorial page par page, sans toucher au code. Les traductions FR / EN restent centralisées.
            </p>
          </div>
          <Link href="/admin/traductions" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#B28A47]/25 bg-white px-5 text-sm font-semibold text-[#0F5A46] shadow-sm transition hover:border-[#B28A47]/45">
            <Languages size={17} /> Gérer les traductions
          </Link>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {CMS_PAGES.map((page) => (
            <article key={page.key} className="group rounded-[22px] border border-[#B28A47]/15 bg-[#FFFDF8] p-5 shadow-[0_18px_50px_-38px_rgba(43,28,23,0.35)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#B28A47]/15 bg-[#F7F3EB] text-[#0F5A46]">
                  <PanelsTopLeft size={19} strokeWidth={1.6} />
                </div>
                <span className="rounded-full bg-[#0F5A46]/7 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0F5A46]">
                  {page.sections.length} sections
                </span>
              </div>
              <h2 className="mt-5 font-serif text-2xl font-medium text-[#2B1C17]">{page.label}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-[#6F625C]">{page.description}</p>
              <div className="mt-5 border-t border-[#B28A47]/12 pt-4">
                <Link href={`/admin/contenu/${page.key}`} className="flex items-center justify-between rounded-xl px-1 py-2 text-sm font-semibold text-[#0F5A46]">
                  Gérer la page
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-7 rounded-[22px] border border-[#0F5A46]/12 bg-[#0F5A46] p-6 text-white sm:flex sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10"><FileText size={18} /></div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#D2AA5A]">Principe</p>
              <h2 className="mt-1 font-serif text-xl">Le contenu métier reste séparé</h2>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-white/70">Chambres, prix, réservations, galerie et services continuent d’être gérés dans leurs modules dédiés. Ici, vous gérez le contenu éditorial et les textes.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
