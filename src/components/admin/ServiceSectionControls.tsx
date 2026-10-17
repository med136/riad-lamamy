"use client";
import { getExperienceIconOption } from "@/lib/experience-icons";
import { IconPicker } from "./ServiceFeatureEditor";
export function ServiceSectionControls({
  sectionKey,settings,onSetting,
}:{
  sectionKey:string,settings:Record<string,unknown>,onSetting:(key:string,value:unknown)=>void,
}) {
  const showIcon=["spa","restaurant","activities"].includes(sectionKey);
  const showLink=["spa","restaurant","activities","cta"].includes(sectionKey);
  if(!showIcon&&!showLink)return null;
  const defaultIcon=sectionKey==="restaurant"?"utensils":sectionKey==="activities"?"compass":"droplets";
  const icon=getExperienceIconOption(typeof settings.headerIcon==="string"?settings.headerIcon:defaultIcon).code;
  return <section className="mt-6 space-y-4 rounded-[18px] border border-[#B28A47]/20 bg-[#F7F3EB]/55 p-4">
    <h3 className="font-serif text-xl font-medium text-[#2B1C17]">Options de la section</h3>
    {showIcon?<label className="block space-y-1 text-xs font-semibold text-[#5D514C]">Icône de section
      <IconPicker value={icon} onChange={code=>onSetting("headerIcon",code)}/>
    </label>:null}
    {showLink?<label className="block space-y-1 text-xs font-semibold text-[#5D514C]">Lien du bouton (chemin interne)
      <input type="text" maxLength={200} value={typeof settings.linkHref==="string"?settings.linkHref:"/contact"}
        onChange={e=>onSetting("linkHref",e.target.value)}
        placeholder="/contact"
        className="h-10 w-full rounded-xl border border-[#B28A47]/25 bg-white px-3 text-sm font-normal text-[#2B1C17]"/>
      <span className="block text-[11px] font-normal text-[#6F625C]">Exemple : /contact. Pas d’URL externe pour préserver la sécurité.</span>
    </label>:null}
  </section>;
}
