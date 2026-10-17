"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock3, Heart, Coffee } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { getExperienceIconOption } from "@/lib/experience-icons";
import {
  DEFAULT_FEATURES, ITEM_SETTINGS_KEY, parseFeatureItems,
  type CmsLang,
} from "@/lib/services-content";
import { internalServiceLink, usePublicServicesSettings } from "./useServicesCMS";

type Section = "spa" | "restaurant" | "activities";

const fallbackHeaderIcons = { spa:"droplets", restaurant:"utensils", activities:"compass" } as const;

export function ServiceCmsFeatures({section}: {section:Section}) {
  const { t,language }=useLanguage();
  const settings=usePublicServicesSettings(section);
  const items=parseFeatureItems(settings[ITEM_SETTINGS_KEY]) ?? DEFAULT_FEATURES[section];
  const href=internalServiceLink(settings.linkHref);
  const iconCode=typeof settings.headerIcon==="string"?settings.headerIcon:fallbackHeaderIcons[section];
  const HeaderIcon=getExperienceIconOption(iconCode,fallbackHeaderIcons[section]).icon;

  if(section==="activities") {
    return (
      <section className="py-14 sm:py-16">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A47]">{t("services.activities.kicker")}</p>
          <h3 className="mt-3 font-serif text-[32px] font-medium leading-tight text-[#2B1C17] sm:text-[38px]">
            {t("services.activities.title")}
          </h3>
          <p className="mt-3 text-[14px] leading-6 text-[#6F625C] sm:text-[15px]">
            {t("services.activities.description")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item,index)=>{
            const Icon=getExperienceIconOption(item.icon).icon;
            const copy=item[language as CmsLang];
            return (
              <motion.article key={item.id} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:0.2}}
                transition={{duration:0.35,delay:index*0.05}} className="group border-t border-[#B28A47]/20 bg-[#FFFDF8] px-1 py-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#F8F5EF]">
                  <Icon className="h-4 w-4 text-[#0F5A46]" strokeWidth={1.6}/>
                </div>
                <h4 className="mt-4 font-serif text-[22px] font-medium text-[#2B1C17]">{copy.title}</h4>
                <p className="mt-2 text-[13px] leading-6 text-[#6F625C]">{copy.description}</p>
                {copy.meta ? <div className="mt-4 flex items-center gap-2 border-t border-[#B28A47]/10 pt-3 text-[11px] text-[#6F625C]/80">
                  <Clock3 className="h-3.5 w-3.5 text-[#B28A47]" strokeWidth={1.6}/>{copy.meta}
                </div> : null}
              </motion.article>
            );
          })}
        </div>
        <div className="mt-9 text-center">
          <Link href={href} className="inline-flex h-11 items-center justify-center rounded-full border border-[#B28A47]/35 px-5 text-[13px] font-semibold text-[#0F5A46] transition hover:bg-[#F8F5EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B28A47]/60">
            {t("services.activities.button")}
          </Link>
        </div>
      </section>
    );
  }

  const spa=section==="spa";
  return (
    <section className="h-full rounded-[24px] border border-[#B28A47]/15 bg-[#FFFDF8] p-6 sm:p-7 lg:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B28A47]/20 bg-[#F8F5EF]">
          <HeaderIcon className="h-4 w-4 text-[#0F5A46]" strokeWidth={1.6}/>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B28A47]">
            {spa?t("services.spa.kicker"):t("services.restaurant.kicker")}
          </p>
          <h3 className="mt-1 font-serif text-[27px] font-medium leading-tight text-[#2B1C17]">
            {spa?t("services.spa.title"):t("services.restaurant.title")}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#6F625C]">
            {spa?t("services.spa.description"):t("services.restaurant.description")}
          </p>
        </div>
      </div>
      <div className="mt-6 divide-y divide-[#B28A47]/15 border-y border-[#B28A47]/15">
        {items.map((item,index)=>{
          const Icon=getExperienceIconOption(item.icon).icon;
          return (
            <motion.div key={item.id} initial={{opacity:0,x:spa?-10:10}} whileInView={{opacity:1,x:0}} viewport={{once:true}}
              transition={{duration:0.3,delay:index*0.05}} className="flex items-start gap-3 py-4">
              <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#0F5A46]" strokeWidth={1.6}/>
              <div>
                <h4 className="text-[14px] font-semibold text-[#2B1C17]">{item[language as CmsLang].title}</h4>
                <p className="mt-1 text-[13px] leading-5 text-[#6F625C]">{item[language as CmsLang].description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className={spa
        ?"mt-5 flex items-start gap-3 rounded-[16px] border border-[#B28A47]/15 bg-[#F8F5EF]/65 p-4"
        :"mt-5 flex items-center justify-between gap-4 rounded-[16px] border border-[#B28A47]/15 bg-[#F8F5EF]/65 p-4"}>
        {spa ? <Heart className="mt-0.5 h-4 w-4 shrink-0 text-[#0F5A46]" strokeWidth={1.6}/> : <Coffee className="h-4 w-4 shrink-0 text-[#0F5A46]" strokeWidth={1.6}/>}
        <div className={spa?"flex-1":"flex-1"}>
          <p className="text-[13px] leading-5 text-[#5D514C]">
            {spa?t("services.spa.note"):t("services.restaurant.note")}
          </p>
          <Link href={href} className="mt-2 inline-flex text-[12px] font-semibold text-[#0F5A46] hover:text-[#063F33]">
            {spa?t("services.spa.button"):t("services.restaurant.button")}
          </Link>
        </div>
      </div>
    </section>
  );
}
