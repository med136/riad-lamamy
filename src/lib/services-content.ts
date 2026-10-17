import { EXPERIENCE_ICON_OPTIONS, type ExperienceIconCode } from "./experience-icons.ts";

export type CmsLang = "fr" | "en";
export type FeatureText = { title: string; description: string; meta: string };
export type Feature = { id: string; icon: ExperienceIconCode; fr: FeatureText; en: FeatureText };
export type CategoryPresentation = { category: string; icon: ExperienceIconCode; fr: { title: string; subtitle: string }; en: { title: string; subtitle: string } };
export type ServicePresentation = { id: string; icon: ExperienceIconCode; fr: { title: string; description: string }; en: { title: string; description: string } };
export type CatalogSettings = { categories: CategoryPresentation[]; services: ServicePresentation[] };
export const ITEM_SETTINGS_KEY = "items";
export const CATALOG_SETTINGS_KEY = "catalogPresentation";
export const MAX_FEATURES = 24;
export const MAX_CATEGORIES = 30;
export const MAX_SERVICES = 120;

const iconCodes = new Set<string>(EXPERIENCE_ICON_OPTIONS.map((icon) => icon.code));
const validId = (value: unknown) => typeof value === "string" && /^[a-z0-9][a-z0-9_-]{0,63}$/.test(value);
const validText = (value: unknown, max = 2000) => typeof value === "string" && value.length <= max;
const validIcon = (value: unknown): value is ExperienceIconCode => typeof value === "string" && iconCodes.has(value);
const isObj = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const validUnique = (items: string[]) => new Set(items).size === items.length;
const validHref = (value: unknown) => typeof value === "string" && value.length <= 200 && /^\/(?!\/)[a-zA-Z0-9/_?&=#.%+~-]*$/.test(value);

const t = (title: string, description: string, meta = ""): FeatureText => ({ title, description, meta });
export const DEFAULT_FEATURES: Record<"spa"|"restaurant"|"activities", Feature[]> = {
  spa: [
    { id:"hammam",icon:"waves",fr:t("Hammam traditionnel","Un rituel de détente inspiré des traditions marocaines, organisé sur demande."),en:t("Traditional hammam","A relaxing ritual inspired by Moroccan traditions, available on request.") },
    { id:"massage",icon:"hand-heart",fr:t("Massage","Un moment de relaxation qui peut être organisé selon les disponibilités de nos partenaires."),en:t("Massage","A relaxing treatment that can be arranged subject to our partners' availability.") },
    { id:"soin",icon:"flower-2",fr:t("Soin bien-être","Des soins peuvent être proposés selon vos envies et les prestations disponibles lors de votre séjour."),en:t("Wellness treatment","Treatments may be arranged according to your preferences and availability.") },
  ],
  restaurant: [
    { id:"breakfast",icon:"coffee",fr:t("Petit-déjeuner marocain","Une sélection inspirée des saveurs locales, proposée selon l’organisation de votre séjour."),en:t("Moroccan breakfast","A selection inspired by local flavours, offered according to your stay arrangements.") },
    { id:"table",icon:"utensils",fr:t("Table marocaine","Des plats traditionnels peuvent être préparés sur demande, selon disponibilité."),en:t("Moroccan table","Traditional dishes can be prepared on request, subject to availability.") },
    { id:"gourmand",icon:"cake-slice",fr:t("Moment gourmand","Thé, douceurs et petites attentions pour profiter du riad à votre rythme."),en:t("A tasty moment","Tea, sweets and small attentions to enjoy the riad at your own pace.") },
  ],
  activities: [
    { id:"medina",icon:"compass",fr:t("Découverte de la médina","Partez à la rencontre des ruelles, monuments et savoir-faire de Fès avec un accompagnement adapté.","Selon programme"),en:t("Explore the medina","Discover the lanes, landmarks and craftsmanship of Fès with guidance tailored to you.","According to programme") },
    { id:"photo",icon:"camera",fr:t("Balade photographique","Une façon différente d’explorer la médina et d’en garder des souvenirs personnels.","Sur demande"),en:t("Photo walk","A different way to explore the medina and capture lasting memories.","On request") },
    { id:"artisan",icon:"shopping-bag",fr:t("Artisanat & bonnes adresses","Nous pouvons vous orienter vers les ateliers, souks et adresses qui correspondent à vos envies.","À votre rythme"),en:t("Crafts and local favourites","We can guide you towards workshops, souks and places suited to your interests.","At your pace") },
    { id:"surmesure",icon:"sparkles",fr:t("Expérience sur mesure","Un moment particulier à organiser pendant votre séjour ? Notre équipe peut vous conseiller.","Personnalisable"),en:t("Tailor-made experience","Planning something special during your stay? Our team can advise you.","Customisable") },
  ],
};

export function parseFeatureItems(value: unknown): Feature[] | null {
  if (!Array.isArray(value) || value.length > MAX_FEATURES) return null;
  const result: Feature[] = [];
  for (const raw of value) {
    if (!isObj(raw) || !validId(raw.id) || !validIcon(raw.icon)) return null;
    const bilingual: Partial<Record<CmsLang, FeatureText>> = {};
    for (const lang of ["fr","en"] as const) {
      if (!isObj(raw[lang])) return null;
      const x = raw[lang];
      if (!validText(x.title, 200) || !validText(x.description) || !validText(x.meta, 120)) return null;
      bilingual[lang] = { title:x.title as string, description:x.description as string, meta:x.meta as string };
    }
    result.push({id:raw.id as string,icon:raw.icon,fr:bilingual.fr!,en:bilingual.en!});
  }
  return validUnique(result.map(x=>x.id)) ? result : null;
}
export function validateFeatureItems(value: unknown): string|null {
  const items = parseFeatureItems(value);
  if (!items) return "Liste d’éléments invalide (codes, nombre ou textes).";
  if (items.some(x=>!x.fr.title.trim()||!x.en.title.trim())) return "Chaque élément doit avoir un titre en français et en anglais.";
  return null;
}

export const DEFAULT_CATEGORIES: CategoryPresentation[] = [
  { category:"La table",icon:"utensils",fr:{title:"La table",subtitle:"Saveurs & moments à partager"},en:{title:"Dining",subtitle:"Flavours and moments to share"} },
  { category:"Déplacements",icon:"car-front",fr:{title:"Déplacements",subtitle:"Arriver et se déplacer en toute sérénité"},en:{title:"Transport",subtitle:"Travel with peace of mind"} },
  { category:"Découvrir Fès",icon:"map",fr:{title:"Découvrir Fès",subtitle:"Explorer Fès autrement"},en:{title:"Discover Fès",subtitle:"Explore Fès differently"} },
  { category:"Sur mesure",icon:"camera",fr:{title:"Sur mesure",subtitle:"Des attentions pensées pour vous"},en:{title:"Tailor-made",subtitle:"Thoughtful personal touches"} },
];
export function parseCatalogSettings(value: unknown): CatalogSettings|null {
  if (!isObj(value)||!Array.isArray(value.categories)||!Array.isArray(value.services)||value.categories.length>MAX_CATEGORIES||value.services.length>MAX_SERVICES) return null;
  const categories: CategoryPresentation[] = [];
  const services: ServicePresentation[] = [];
  for(const raw of value.categories) {
    if(!isObj(raw)||!validText(raw.category,120)||!(raw.category as string).trim()||!validIcon(raw.icon)||!isObj(raw.fr)||!isObj(raw.en))return null;
    for(const lang of ["fr","en"] as const) if(!validText(raw[lang].title,200)||!validText(raw[lang].subtitle,500)) return null;
    categories.push({category:raw.category as string,icon:raw.icon,fr:raw.fr as CategoryPresentation["fr"],en:raw.en as CategoryPresentation["en"]});
  }
  for(const raw of value.services) {
    if(!isObj(raw)||typeof raw.id!=="string"||!/^[-a-zA-Z0-9_]{1,90}$/.test(raw.id)||!validIcon(raw.icon)||!isObj(raw.fr)||!isObj(raw.en))return null;
    for(const lang of ["fr","en"] as const) if(!validText(raw[lang].title,200)||!validText(raw[lang].description,2000))return null;
    services.push({id:raw.id,icon:raw.icon,fr:raw.fr as ServicePresentation["fr"],en:raw.en as ServicePresentation["en"]});
  }
  if(!validUnique(categories.map(x=>x.category))||!validUnique(services.map(x=>x.id)))return null;
  return {categories,services};
}
export function validateCatalogSettings(value:unknown):string|null {
 return parseCatalogSettings(value) ? null : "Présentation des services invalide (icônes, catégories ou traductions).";
}
export function validateServicesSectionSettings(sectionKey:string,settings:Record<string,unknown>):string|null {
  if(["spa","restaurant","activities"].includes(sectionKey) && Object.prototype.hasOwnProperty.call(settings,ITEM_SETTINGS_KEY)) {
    const issue=validateFeatureItems(settings[ITEM_SETTINGS_KEY]);if(issue)return issue;
  }
  if(sectionKey==="catalog" && Object.prototype.hasOwnProperty.call(settings,CATALOG_SETTINGS_KEY)){
    const issue=validateCatalogSettings(settings[CATALOG_SETTINGS_KEY]);if(issue)return issue;
  }
  if(Object.prototype.hasOwnProperty.call(settings,"linkHref")&&!validHref(settings.linkHref))return "Lien invalide : utilisez un chemin interne tel que /contact.";
  if(Object.prototype.hasOwnProperty.call(settings,"headerIcon")&&!validIcon(settings.headerIcon))return "Icône de section invalide.";
  return null;
}
