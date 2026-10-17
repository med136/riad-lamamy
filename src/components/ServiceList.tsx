"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { getExperienceIconOption } from "@/lib/experience-icons";
import { CATALOG_SETTINGS_KEY, DEFAULT_CATEGORIES, defaultCategoryPresentation, parseCatalogSettings } from "@/lib/services-content";
import { usePublicServicesSettings, internalServiceLink } from "./services/useServicesCMS";

type ApiService = {
  id: string | number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  duration_minutes: number | null;
  display_order?: number;
};
type UiService = {
  id: string; name:string; description:string; price?:number; duration?:number;
  icon?:string; included?:boolean;
};
type Category = { category:string; items:UiService[] };

const fallback:Category[]=[
  {category:"La table",items:[
    {id:"fallback-breakfast",name:"Petit-déjeuner marocain",description:"Un moment gourmand inspiré des saveurs locales, selon l’organisation de votre séjour.",icon:"utensils"},
    {id:"fallback-meal",name:"Repas sur demande",description:"Des plats marocains peuvent être organisés sur réservation et selon disponibilité.",icon:"utensils"},
  ]},
  {category:"Déplacements",items:[
    {id:"fallback-transfer",name:"Transfert",description:"Notre équipe peut vous aider à organiser votre arrivée ou votre départ.",icon:"car-front"},
  ]},
  {category:"Découvrir Fès",items:[
    {id:"fallback-medina",name:"Visite de la médina",description:"Nous pouvons vous orienter vers des visites et expériences adaptées à vos envies.",icon:"map"},
  ]},
  {category:"Sur mesure",items:[
    {id:"fallback-custom",name:"Expérience personnalisée",description:"Une occasion particulière ou une demande spécifique ? Parlez-nous de votre projet.",icon:"camera"},
  ]},
];

export function ServiceList({ mode = "all" }: { mode?: "intro"|"catalog"|"cta"|"all" }) {
  const { t, language } = useLanguage();
  const settings=usePublicServicesSettings(mode==="cta"?"cta":"catalog");
  const displayConfig=parseCatalogSettings(settings[CATALOG_SETTINGS_KEY]);
  const [remote,setRemote]=useState<ApiService[]>([]);
  const [loading,setLoading]=useState(mode==="catalog"||mode==="all");
  useEffect(()=>{
    if(mode==="intro"||mode==="cta")return;
    const controller=new AbortController();
    void (async()=>{
      try{
        const response=await fetch("/api/services",{cache:"no-store",signal:controller.signal});
        if(!response.ok)return;
        const body=await response.json();
        if(Array.isArray(body.services) && !controller.signal.aborted) setRemote(body.services as ApiService[]);
      }catch(error){if(!controller.signal.aborted)console.error("Services indisponibles",error)}
      finally{if(!controller.signal.aborted)setLoading(false)}
    })();
    return()=>controller.abort();
  },[mode]);

  const categories=useMemo<Category[]>(()=>{
    if(!remote.length)return fallback;
    const groups=new Map<string,UiService[]>();
    for(const row of remote){
      const category=row.category||"Autres";
      const list=groups.get(category)||[];
      list.push({
        id:String(row.id),name:row.name,description:row.description?.trim()||"Informations disponibles sur demande.",
        price:row.price,duration:row.duration_minutes??undefined,
        included:Number(row.price||0)===0,
      });
      groups.set(category,list);
    }
    return [...groups].map(([category,items])=>({category,items}));
  },[remote]);
  const showIntro=mode==="all"||mode==="intro";
  const showCatalog=mode==="all"||mode==="catalog";
  const showCta=mode==="all"||mode==="cta";
  const href=internalServiceLink(settings.linkHref);

  return (
    <>
      {showIntro ? <section className="mb-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.30em] text-[#B28A47]">{t("services.intro.kicker")}</p>
          <div className="mx-auto mt-3 flex w-[120px] items-center" aria-hidden="true">
            <span className="h-px flex-1 bg-[#B28A47]/45"/>
            <span className="mx-3 h-[6px] w-[6px] rotate-45 border border-[#B28A47]"/>
            <span className="h-px flex-1 bg-[#B28A47]/45"/>
          </div>
          <h2 className="mt-5 font-serif text-[32px] font-medium leading-tight text-[#2B1C17] sm:text-[38px]">
            {t("services.intro.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-[#6F625C] sm:text-[15px]">
            {t("services.intro.description")}
          </p>
        </div>
      </section> : null}

      {showCatalog ? <section className="mb-14" aria-label={t("services.intro.title")}>
        {loading && remote.length===0 ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0,1,2].map(x=><div key={x} className="h-36 animate-pulse rounded-[20px] bg-[#F8F5EF]"/>)}
        </div> :
        <div className="space-y-14">
          {categories.map((category,categoryIndex)=>{
            const configured=displayConfig?.categories.find(x=>x.category===category.category)
              ?? DEFAULT_CATEGORIES.find(x=>x.category===category.category)
              ?? defaultCategoryPresentation(category.category);
            const translated=configured[language];
            const CategoryIcon=getExperienceIconOption(configured.icon).icon;
            return <motion.section key={category.category} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.15}} transition={{duration:0.35,delay:categoryIndex*0.04}}>
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B28A47]/30 bg-[#F8F5EF] text-[11px] font-semibold text-[#0F5A46]">
                    {String(categoryIndex+1).padStart(2,"0")}
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#B28A47]">
                      <CategoryIcon size={13} aria-hidden="true"/>{t("services.catalog.eyebrow")}
                    </p>
                    <h3 className="mt-1 font-serif text-[27px] font-medium leading-[1.05] text-[#2B1C17] sm:text-[30px]">
                      {translated.title||category.category}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-5 text-[#6F625C]">{translated.subtitle}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3" aria-hidden="true"><span className="h-px w-12 bg-[#B28A47]/40"/><span className="h-1.5 w-1.5 rotate-45 bg-[#B28A47]/70"/><span className="h-px flex-1 bg-[#B28A47]/15"/></div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item,index)=>{
                  const saved=displayConfig?.services.find(x=>x.id===item.id);
                  const local=saved?.[language];
                  const Icon=getExperienceIconOption(saved?.icon||item.icon||configured.icon).icon;
                  const price=typeof item.price==="number"&&item.price>0? `${item.price.toLocaleString("fr-FR")} DH` : null;
                  return <motion.article key={item.id} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.3,delay:index*0.04}}
                    className="rounded-[20px] border border-[#B28A47]/15 bg-[#FFFDF8] p-5 transition-all duration-200 hover:-translate-y-px hover:border-[#B28A47]/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#F8F5EF]">
                        <Icon className="h-4 w-4 text-[#0F5A46]" strokeWidth={1.6}/>
                      </div>
                      {item.included ? <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0F5A46]/15 bg-[#0F5A46]/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0F5A46]"><Check className="h-3 w-3"/>{t("services.catalog.included")}</span> : price ? <span className="text-[12px] font-semibold text-[#0F5A46]">{price}</span> : null}
                    </div>
                    <h4 className="mt-4 text-[15px] font-semibold text-[#2B1C17]">{local?.title?.trim()||item.name}</h4>
                    <p className="mt-2 text-[13px] leading-5 text-[#6F625C]">{local?.description?.trim()||item.description}</p>
                    {item.duration ? <p className="mt-3 text-[11px] text-[#6F625C]/75">{t("services.catalog.duration")} : {item.duration} min</p> : null}
                  </motion.article>;
                })}
              </div>
            </motion.section>;
          })}
        </div>}
      </section> : null}

      {showCta ? <section className="mt-12 rounded-[22px] bg-[#0F5A46] px-6 py-7 text-[#FFFDF8] sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-8">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#D2AA5A]">{t("services.cta.kicker")}</p>
          <p className="mt-2 font-serif text-[25px] font-medium">{t("services.cta.title")}</p>
        </div>
        <Link href={href} className="mt-5 inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-[#D2AA5A]/50 px-5 text-[13px] font-semibold transition hover:bg-[#FFFDF8] hover:text-[#0F5A46] sm:mt-0">
          {t("services.cta.button")}
        </Link>
      </section> : null}
    </>
  );
}
