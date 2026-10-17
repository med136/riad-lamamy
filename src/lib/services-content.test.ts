import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_FEATURES,DEFAULT_CATEGORIES,ITEM_SETTINGS_KEY,CATALOG_SETTINGS_KEY,
  parseFeatureItems,validateFeatureItems,parseCatalogSettings,validateCatalogSettings,
  validateServicesSectionSettings,defaultCategoryPresentation,MAX_FEATURES,
} from "./services-content.ts";

test("all original French SPA, restaurant and experience cards remain in the same order",()=>{
 assert.deepEqual(DEFAULT_FEATURES.spa.map(x=>x.fr.title),["Hammam traditionnel","Massage","Soin bien-être"]);
 assert.deepEqual(DEFAULT_FEATURES.restaurant.map(x=>x.fr.title),["Petit-déjeuner marocain","Table marocaine","Moment gourmand"]);
 assert.deepEqual(DEFAULT_FEATURES.activities.map(x=>x.fr.title),["Découverte de la médina","Balade photographique","Artisanat & bonnes adresses","Expérience sur mesure"]);
 assert.deepEqual(DEFAULT_FEATURES.activities.map(x=>x.fr.meta),["Selon programme","Sur demande","À votre rythme","Personnalisable"]);
 for(const entries of Object.values(DEFAULT_FEATURES))assert.equal(validateFeatureItems(entries),null);
});

test("supports adding, deleting and reordering translated cards without changing default list",()=>{
 const a=DEFAULT_FEATURES.spa[0];
 const newItem={...a,id:"added_1",icon:"bed-double" as const,en:{...a.en,title:"New stage"}};
 assert.deepEqual(parseFeatureItems([newItem,a]),[newItem,a]);
 assert.deepEqual(parseFeatureItems([]),[]);
 assert.equal(parseFeatureItems(undefined),null);
 assert.equal(DEFAULT_FEATURES.spa.length,3);
});

test("rejects invalid card records, duplicate IDs, bad icons and missing bilingual titles",()=>{
 const first=DEFAULT_FEATURES.spa[0];
 assert.equal(parseFeatureItems([first,first]),null);
 assert.equal(parseFeatureItems([{...first,icon:"not-an-icon"}]),null);
 assert.equal(parseFeatureItems([{...first,id:"../../admin"}]),null);
 assert.match(validateFeatureItems([{...first,en:{...first.en,title:" "}}])??"",/titre/);
 assert.equal(parseFeatureItems(Array.from({length:MAX_FEATURES+1},(_,i)=>({...first,id:`item_${i}`}))),null);
});

test("CMS category titles and per-service icon/text overrides can be stored without price or service data",()=>{
 const payload={categories:[DEFAULT_CATEGORIES[0]],services:[{
   id:"123",icon:"sparkles",fr:{title:"",description:""},en:{title:"Moroccan breakfast",description:"Traditional breakfast"},
 }]};
 assert.deepEqual(parseCatalogSettings(payload),payload);
 assert.equal(validateCatalogSettings(payload),null);
 assert.equal(Object.hasOwn(payload.services[0],"price"),false);
 assert.equal(CATALOG_SETTINGS_KEY,"catalogPresentation");
 assert.equal(ITEM_SETTINGS_KEY,"items");
});

test("rejects malformed overrides, duplicate categories, unsafe links or unknown icons",()=>{
 const cat=DEFAULT_CATEGORIES[0];
 assert.equal(parseCatalogSettings({categories:[cat,cat],services:[]}),null);
 assert.equal(parseCatalogSettings({categories:[],services:[{id:"../../../",icon:"moon",fr:{title:"",description:""},en:{title:"",description:""}}]}),null);
 assert.equal(validateServicesSectionSettings("spa",{items:DEFAULT_FEATURES.spa}),null);
 assert.equal(validateServicesSectionSettings("spa",{linkHref:"/contact",headerIcon:"droplets"}),null);
 assert.ok(validateServicesSectionSettings("spa",{linkHref:"//evil.com"}));
 assert.ok(validateServicesSectionSettings("cta",{linkHref:"javascript:alert(1)"}));
 assert.ok(validateServicesSectionSettings("spa",{headerIcon:"unlisted-icon"}));
});

test("category defaults preserve captions and provide safe fallback for future categories",()=>{
 const existing=defaultCategoryPresentation("La table");
 assert.equal(existing.fr.title,"La table");
 assert.equal(existing.fr.subtitle,"Saveurs & moments à partager");
 assert.equal(defaultCategoryPresentation("restauration").icon,"utensils");
 assert.equal(defaultCategoryPresentation("transport").icon,"car-front");
 assert.equal(defaultCategoryPresentation("inconnue").icon,"sparkles");
});
