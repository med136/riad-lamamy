"use client";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  EXPERIENCE_ICON_CATEGORIES, EXPERIENCE_ICON_OPTIONS, type ExperienceIconCode,
} from "@/lib/experience-icons";
import {
  MAX_FEATURES, type Feature, type CmsLang,
} from "@/lib/services-content";

export function IconPicker({value,onChange}: {value:string;onChange:(icon:ExperienceIconCode)=>void}) {
  return <select value={value} onChange={e=>onChange(e.target.value as ExperienceIconCode)}
    className="h-10 w-full rounded-xl border border-[#B28A47]/25 bg-white px-3 text-sm text-[#2B1C17]">
    {EXPERIENCE_ICON_CATEGORIES.map(category=><optgroup key={category.id} label={category.label}>
      {EXPERIENCE_ICON_OPTIONS.filter(icon=>icon.category===category.id).map(icon=><option key={icon.code} value={icon.code}>
        {icon.label} ({icon.code})
      </option>)}
    </optgroup>)}
  </select>;
}
function makeItem():Feature {
  const token=typeof crypto!=="undefined"&&"randomUUID" in crypto?crypto.randomUUID().slice(0,16):`${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`;
  return {id:`item_${token}`,icon:"sparkles",fr:{title:"",description:"",meta:""},en:{title:"",description:"",meta:""}};
}
export function ServiceFeatureEditor({items,language,onChange,withMeta}:{
  items:Feature[],language:CmsLang,onChange:(items:Feature[])=>void,withMeta?:boolean
}) {
  const update=(id:string,key:"title"|"description"|"meta",value:string)=>
    onChange(items.map(item=>item.id===id?{...item,[language]:{...item[language],[key]:value}}:item));
  const move=(index:number,direction:number)=>{
    const target=index+direction;if(target<0||target>=items.length)return;
    const next=[...items];[next[index],next[target]]=[next[target],next[index]];onChange(next);
  };
  return <section className="mt-6 rounded-[18px] border border-[#B28A47]/20 bg-[#F7F3EB]/55 p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="font-serif text-xl font-medium text-[#2B1C17]">Éléments de la section</h3>
        <p className="mt-1 text-xs text-[#6F625C]">{items.length} / {MAX_FEATURES} éléments · Choisissez Français / English en haut et enregistrez pour publier.</p>
      </div>
      <button type="button" disabled={items.length>=MAX_FEATURES} onClick={()=>onChange([...items,makeItem()])}
        className="flex h-10 items-center gap-2 rounded-full bg-[#0F5A46] px-4 text-xs font-semibold text-white disabled:opacity-40">
        <Plus size={16}/> Ajouter un élément
      </button>
    </div>
    <div className="mt-4 space-y-3">
      {items.map((item,index)=><article key={item.id} className="rounded-2xl border border-[#B28A47]/20 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-sm font-semibold text-[#2B1C17]">{index+1}. {item[language].title||item.fr.title||"Nouvel élément"}</p>
          <div className="flex gap-1">
            <button type="button" onClick={()=>move(index,-1)} disabled={!index} aria-label={`Monter l’élément ${index+1}`} title="Monter" className="rounded-lg border p-2 text-[#0F5A46] disabled:opacity-30"><ArrowUp size={16}/></button>
            <button type="button" onClick={()=>move(index,1)} disabled={index===items.length-1} aria-label={`Descendre l’élément ${index+1}`} title="Descendre" className="rounded-lg border p-2 text-[#0F5A46] disabled:opacity-30"><ArrowDown size={16}/></button>
            <button type="button" onClick={()=>onChange(items.filter(x=>x.id!==item.id))} aria-label={`Supprimer l’élément ${index+1}`} title="Supprimer" className="rounded-lg border border-red-200 p-2 text-red-700"><Trash2 size={16}/></button>
          </div>
        </div>
        <div className="space-y-3">
          <label className="block space-y-1 text-xs font-semibold text-[#5D514C]">Icône
            <IconPicker value={item.icon} onChange={icon=>onChange(items.map(x=>x.id===item.id?{...x,icon}:x))}/>
          </label>
          <label className="block space-y-1 text-xs font-semibold text-[#5D514C]">Titre ({language.toUpperCase()}) *
            <input type="text" maxLength={200} value={item[language].title} onChange={e=>update(item.id,"title",e.target.value)}
              className="h-10 w-full rounded-xl border border-[#B28A47]/25 px-3 text-sm font-normal"/>
          </label>
          <label className="block space-y-1 text-xs font-semibold text-[#5D514C]">Description ({language.toUpperCase()})
            <textarea rows={3} maxLength={2000} value={item[language].description} onChange={e=>update(item.id,"description",e.target.value)}
              className="w-full rounded-xl border border-[#B28A47]/25 px-3 py-2 text-sm font-normal"/>
          </label>
          {withMeta?<label className="block space-y-1 text-xs font-semibold text-[#5D514C]">Durée / indication ({language.toUpperCase()})
            <input type="text" maxLength={120} value={item[language].meta} onChange={e=>update(item.id,"meta",e.target.value)}
              className="h-10 w-full rounded-xl border border-[#B28A47]/25 px-3 text-sm font-normal"/>
          </label>:null}
        </div>
      </article>)}
    </div>
  </section>;
}
