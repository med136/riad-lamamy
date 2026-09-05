import type { MessageKey } from "@/lib/i18n";

export type CmsSectionDefinition = {
  key: string;
  label: string;
  description: string;
  translationPrefixes: string[];
};

export type CmsDedicatedModule = {
  label: string;
  href: string;
  description: string;
};

export type CmsPageDefinition = {
  key: string;
  label: string;
  description: string;
  route: string;
  dedicatedModule?: CmsDedicatedModule;
  sections: CmsSectionDefinition[];
};

export const CMS_PAGES: CmsPageDefinition[] = [
  {
    key: "home",
    label: "Accueil",
    description: "Hero, présentation, chambres, services, expérience, galerie et témoignages.",
    route: "/",
    sections: [
      { key: "hero", label: "Hero", description: "Titre, sous-titre, boutons et médias principaux.", translationPrefixes: ["home.hero."] },
      { key: "booking", label: "Réservation rapide", description: "Textes du module de réservation rapide affiché sur l’accueil.", translationPrefixes: ["booking_", "booking."] },
      { key: "about", label: "Présentation", description: "Introduction à Dar LaMamy.", translationPrefixes: ["home.about."] },
      { key: "rooms", label: "Chambres mises en avant", description: "Textes éditoriaux de présentation des chambres sur l’accueil.", translationPrefixes: ["home.rooms."] },
      { key: "services", label: "Services", description: "Textes éditoriaux de présentation des services sur l’accueil.", translationPrefixes: ["home.services."] },
      { key: "experience", label: "Expérience / Fès", description: "Contenu éditorial autour de l’expérience à Fès.", translationPrefixes: ["home.experience."] },
      { key: "gallery", label: "Galerie", description: "Textes de l’aperçu galerie sur l’accueil.", translationPrefixes: ["home.gallery."] },
      { key: "testimonials", label: "Témoignages", description: "Titres et labels de la zone avis.", translationPrefixes: ["home.testimonials."] },
    ],
  },
  {
    key: "rooms",
    label: "Chambres",
    description: "Contenu éditorial de la page Chambres non géré par le module Chambres.",
    route: "/chambres",
    dedicatedModule: {
      label: "Module Chambres",
      href: "/admin/chambres",
      description: "Les chambres, prix, équipements, photos et autres données métier restent gérés dans le module Chambres.",
    },
    sections: [
      { key: "hero", label: "Hero", description: "Image, titre, sous-titre et accroches du Hero de la page.", translationPrefixes: ["rooms.hero."] },
    ],
  },
  {
    key: "services",
    label: "Services",
    description: "Contenu éditorial de la page Services non géré par le module Services.",
    route: "/services",
    dedicatedModule: {
      label: "Module Services",
      href: "/admin/services",
      description: "Les services, catégories, tarifs et descriptions métier restent gérés dans le module Services.",
    },
    sections: [
      { key: "hero", label: "Hero", description: "Image, titre, sous-titre et accroches du Hero de la page.", translationPrefixes: ["services.hero."] },
    ],
  },
  {
    key: "gallery",
    label: "Galerie",
    description: "Contenu éditorial de la page Galerie non géré par le module Galerie.",
    route: "/galerie",
    dedicatedModule: {
      label: "Module Galerie",
      href: "/admin/galerie",
      description: "Les photos, catégories et médias de la galerie restent gérés dans le module Galerie.",
    },
    sections: [
      { key: "hero", label: "Hero", description: "Image, titre, sous-titre et accroches du Hero de la page.", translationPrefixes: ["gallery.hero."] },
    ],
  },
  {
    key: "reservations",
    label: "Réservations",
    description: "Contenu éditorial de la page Réservations non géré par le module Réservations.",
    route: "/reservations",
    dedicatedModule: {
      label: "Module Réservations",
      href: "/admin/reservations",
      description: "Les demandes, statuts, disponibilités et données de réservation restent gérés dans le module Réservations.",
    },
    sections: [
      { key: "hero", label: "Hero", description: "Image, titre, sous-titre et éléments de réassurance du Hero.", translationPrefixes: ["reservations.hero."] },
    ],
  },
  {
    key: "about",
    label: "À propos",
    description: "Histoire, valeurs et esprit de la maison.",
    route: "/a-propos",
    sections: [
      { key: "hero", label: "Hero", description: "Introduction de la page À propos.", translationPrefixes: ["about.hero.", "about.kicker"] },
      { key: "values", label: "Valeurs", description: "Valeurs et promesse d’accueil.", translationPrefixes: ["about.values."] },
      { key: "team", label: "Esprit de la maison", description: "Accueil, conseils et attentions.", translationPrefixes: ["about.team."] },
    ],
  },
  {
    key: "contact",
    label: "Contact",
    description: "Hero, formulaire, coordonnées et questions fréquentes.",
    route: "/contact",
    sections: [
      { key: "hero", label: "Hero", description: "Image et textes d’introduction de la page Contact.", translationPrefixes: ["contact.hero."] },
      { key: "form", label: "Formulaire", description: "Libellés, erreurs et confirmations.", translationPrefixes: ["contact.form."] },
      { key: "info", label: "Coordonnées", description: "Textes autour des coordonnées.", translationPrefixes: ["contact.info."] },
      { key: "faq", label: "FAQ", description: "Questions et réponses fréquentes.", translationPrefixes: ["contact.faq."] },
    ],
  },
  {
    key: "guest",
    label: "Guest App",
    description: "Conciergerie digitale et sous-pages du séjour.",
    route: "/guest",
    sections: [
      { key: "home", label: "Accueil Guest App", description: "Accueil et navigation du séjour.", translationPrefixes: ["guest.welcome", "guest.tagline", "guest.concierge", "guest.my_stay"] },
      { key: "breakfast", label: "Petit-déjeuner", description: "Informations petit-déjeuner.", translationPrefixes: ["guest.breakfast"] },
      { key: "transfer", label: "Transfert", description: "Textes de la page transfert.", translationPrefixes: ["guest.transfer", "guest.ask_transfer"] },
      { key: "services", label: "Services", description: "Services de la conciergerie.", translationPrefixes: ["guest.services", "guest.request"] },
      { key: "discover", label: "Découvrir Fès", description: "Découverte et recommandations.", translationPrefixes: ["guest.discover", "guest.ask_recommendation"] },
      { key: "guide", label: "Guide du riad", description: "Informations utiles du séjour.", translationPrefixes: ["guest.guide", "guest.riad_guide", "guest.ask_question"] },
      { key: "contact", label: "Contact", description: "Textes de contact Guest App.", translationPrefixes: ["guest.contact"] },
    ],
  },
  {
    key: "global",
    label: "Éléments globaux",
    description: "Navigation, footer, cookies et WhatsApp.",
    route: "/",
    sections: [
      { key: "navigation", label: "Navigation", description: "Menu principal et sélecteur de langue.", translationPrefixes: ["nav."] },
      { key: "footer", label: "Footer", description: "Liens et textes du pied de page.", translationPrefixes: ["footer."] },
      { key: "cookies", label: "Cookies", description: "Bannière de consentement.", translationPrefixes: ["cookies."] },
      { key: "whatsapp", label: "WhatsApp", description: "Tooltip et message prérempli.", translationPrefixes: ["whatsapp."] },
    ],
  },
];

export function findCmsPage(pageKey: string) {
  return CMS_PAGES.find((page) => page.key === pageKey) ?? null;
}

export function findCmsSection(pageKey: string, sectionKey: string) {
  return findCmsPage(pageKey)?.sections.find((section) => section.key === sectionKey) ?? null;
}

export function keyMatchesPrefixes(key: MessageKey | string, prefixes: string[]) {
  return prefixes.some((prefix) => key === prefix || key.startsWith(prefix));
}
