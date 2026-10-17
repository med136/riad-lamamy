"use client";
import { useEffect, useMemo, useState } from "react";
import {
  CATALOG_SETTINGS_KEY, defaultCategoryPresentation,
  type CatalogSettings, type CategoryPresentation, type ServicePresentation, type CmsLang,
} from "@/lib/services-content";
import type { ExperienceIconCode } from "@/lib/experience-icons";
import { IconPicker } from "./ServiceFeatureEditor";

type AdminService = { id:string|number;name:string;description?:string|null;category:string;price:number;is_active:boolean;display_order?:number };
const empty:CatalogSettings={categories:[],services:[]};
const defaultServiceIcon=(category:string)=>defaultCategoryPresentation(category).icon;
const fallbackAdminServices:AdminService[]=[
  {id:"fallback-breakfast",name:"Petit-déjeuner marocain",description:"Un moment gourmand inspiré des saveurs locales, selon l’organisation de votre séjour.",category:"La table",price:0,is_active:true},
  {id:"fallback-meal",name:"Repas sur demande",description:"Des plats marocains peuvent être organisés sur réservation et selon disponibilité.",category:"La table",price:0,is_active:true},
  {id:"fallback-transfer",name:"Transfert",description:"Notre équipe peut vous aider à organiser votre arrivée ou votre départ.",category:"Déplacements",price:0,is_active:true},
  {id:"fallback-medina",name:"Visite de la médina",description:"Nous pouvons vous orienter vers des visites et expériences adaptées à vos envies.",category:"Découvrir Fès",price:0,is_active:true},
  {id:"fallback-custom",name:"Expérience personnalisée",description:"Une occasion particulière ou une demande spécifique ? Parlez-nous de votre projet.",category:"Sur mesure",price:0,is_active:true},
];

export function ServicesCatalogEditor({settings,language,onSetting}:{
  settings:Record<string,unknown>,language:CmsLang,onSetting:(key:string,value:unknown)=>void,
}) {
  const [services,setServices]=useState<AdminService[]>([]);
  const [loaded,setLoaded]=useState(false);
  const [error,setError]=useState("");
  const saved=(settings[CATALOG_SETTINGS_KEY] as CatalogSettings|undefined)??empty;
  useEffect(()=>{
    const controller=new AbortController();
    void (async()=>{
      try {
        const response=await fetch("/api/admin/services",{cache:"no-store",signal:controller.signal});
        const body=await response.json();
        if(!response.ok)throw new Error(body?.error||"Impossible de charger les services.");
        if(!controller.signal.aborted)setServices(Array.isArray(body.services)?body.services:[]);
      }catch(e) {if(!controller.signal.aborted)setError(e instanceof Error?e.message:"Erreur de chargement");}
      finally{if(!controller.signal.aborted)setLoaded(true);}
    })();
    return()=>controller.abort();
  },[]);
  const liveServices=services.filter(x=>x.is_active);
  const displayServices=liveServices.length?liveServices:fallbackAdminServices;
  const categories=useMemo(()=>[...new Set(displayServices.map(x=>x.category||"Autres"))], [displayServices]);
  const getCategory=(name:string)=>saved.categories.find(x=>x.category===name)??defaultCategoryPresentation(name);
  const getService=(item:AdminService):ServicePresentation=>saved.services.find(x=>x.id===String(item.id))??{
    id:String(item.id),icon:defaultServiceIcon(item.category||"Autres"),
    fr:{title:"",description:""},en:{title:"",description:""},
  };
  const updateCategory=(name:string,cb:(p:CategoryPresentation)=>CategoryPresentation)=>{
    const existing=getCategory(name);
    const next=cb(existing);
    onSetting(CATALOG_SETTINGS_KEY,{...saved,categories:[...saved.categories.filter(x=>x.category!==name),next]});
  };
  const updateService=(item:AdminService,cb:(p:ServicePresentation)=>ServicePresentation)=>{
    const next=cb(getService(item));
    onSetting(CATALOG_SETTINGS_KEY,{...saved,services:[...saved.services.filter(x=>x.id!==String(item.id)),next]});
  };

  return <section className="mt-6 rounded-[18px] border border-[#B28A47]/20 bg-[#F7F3EB]/55 p-4 sm:p-5">
    <h3 className="font-serif text-xl font-medium text-[#2B1C17]">Présentation des services du catalogue</h3>
    <p className="mt-2 text-xs leading-5 text-[#6F625C]">
      Les services, prix, durées, états et catégories restent gérés dans « Module Services ».
      Ici vous personnalisez uniquement les libellés affichés, traductions, sous-titres et icônes.
      Laissez un titre ou une description de service vide pour utiliser le texte de la base de données.
    </p>
    {!loaded?<p className="mt-4 text-sm">Chargement des services…</p>:null}
    {error?<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>:null}
    {loaded&&!error?<>
    {!liveServices.length?<p className="mt-3 text-xs text-[#8A6B3D]">Aucun service actif dans la base : personnalisation des cartes de secours, sans modifier les services enregistrés.</p>:null}
    <div className="mt-5 space-y-3">
      <h4 className="text-sm font-semibold text-[#2B1C17]">Catégories · {categories.length}</h4>
      {categories.length===0?<p className="text-xs text-[#6F625C]">Aucune catégorie active. Ajoutez des services depuis Module Services.</p>:null}
      {categories.map(name=>{
        const value=getCategory(name);
        return <details key={name} className="rounded-xl border border-[#B28A47]/20 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[#2B1C17]">{name}</summary>
          <div className="mt-4 space-y-3">
            <label className="block space-y-1 text-xs font-semibold">Icône de catégorie
              <IconPicker value={value.icon} onChange={icon=>updateCategory(name,x=>({...x,icon}))}/>
            </label>
            <label className="block space-y-1 text-xs font-semibold">Titre ({language.toUpperCase()})
              <input maxLength={200} value={value[language].title} onChange={e=>updateCategory(name,x=>({...x,[language]:{...x[language],title:e.target.value}}))}
                className="h-10 w-full rounded-xl border border-[#B28A47]/25 px-3 font-normal"/>
            </label>
            <label className="block space-y-1 text-xs font-semibold">Sous-titre ({language.toUpperCase()})
              <input maxLength={500} value={value[language].subtitle} onChange={e=>updateCategory(name,x=>({...x,[language]:{...x[language],subtitle:e.target.value}}))}
                className="h-10 w-full rounded-xl border border-[#B28A47]/25 px-3 font-normal"/>
            </label>
          </div>
        </details>;
      })}
    </div>
    <div className="mt-6 space-y-3">
      <h4 className="text-sm font-semibold text-[#2B1C17]">Icônes et textes des services · {displayServices.length} éléments</h4>
      {displayServices.map(item=>{
        const value=getService(item);
        return <details key={String(item.id)} className="rounded-xl border border-[#B28A47]/20 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[#2B1C17]">{item.name} <span className="text-xs font-normal text-[#6F625C]">· {item.category}</span></summary>
          <div className="mt-4 space-y-3">
            <label className="block space-y-1 text-xs font-semibold">Icône
              <IconPicker value={value.icon} onChange={icon=>updateService(item,x=>({...x,icon}))}/>
            </label>
            <label className="block space-y-1 text-xs font-semibold">Titre affiché ({language.toUpperCase()})
              <input maxLength={200} value={value[language].title} placeholder={item.name}
                onChange={e=>updateService(item,x=>({...x,[language]:{...x[language],title:e.target.value}}))}
                className="h-10 w-full rounded-xl border border-[#B28A47]/25 px-3 font-normal"/>
            </label>
            <label className="block space-y-1 text-xs font-semibold">Description affichée ({language.toUpperCase()})
              <textarea rows={3} maxLength={2000} value={value[language].description} placeholder={item.description||""}
                onChange={e=>updateService(item,x=>({...x,[language]:{...x[language],description:e.target.value}}))}
                className="w-full rounded-xl border border-[#B28A47]/25 px-3 py-2 font-normal"/>
            </label>
          </div>
        </details>;
      })}
    </div></>:null}
  </section>;
}
