export const LANGUAGE_COOKIE = "site_lang" as const;

export const supportedLanguages = ["fr", "en"] as const;
export type Language = (typeof supportedLanguages)[number];

export const defaultLanguage: Language = "fr";

export const isSupportedLanguage = (value: unknown): value is Language =>
  supportedLanguages.includes(value as Language);

export const getLocaleForLanguage = (language: Language) =>
  language === "en" ? "en-US" : "fr-FR";

const fr = {
  "nav.skip_to_content": "Aller au contenu",
  "nav.main_navigation": "Navigation principale",
  "nav.home": "Accueil",
  "nav.rooms": "Chambres",
  "nav.room_standard": "Chambre Standard",
  "nav.room_deluxe": "Chambre Deluxe",
  "nav.room_royal_suite": "Suite Royale",
  "nav.services": "Services",
  "nav.gallery": "Galerie",
  "nav.about": "À propos",
  "nav.contact": "Contact",
  "nav.navigation": "Navigation",
  "nav.language": "Langue",
  "nav.current": "Actuel",
  "nav.open_menu": "Ouvrir le menu",
  "nav.close_menu": "Fermer le menu",
  "nav.close": "Fermer",
  "nav.book": "Réserver",
  "nav.book_now": "Réserver maintenant",

  "footer.default_tagline": "Un havre de paix au cœur de Marrakech.",
  "footer.navigation": "Navigation",
  "footer.contact": "Contact",
  "footer.information": "Informations",
  "footer.manage_cookies": "Gérer les cookies",
  "footer.all_rights_reserved": "Tous droits réservés.",
  "footer.made_with": "Conçu avec",
  "footer.in_city": "à Fès",
  "footer.rooms_link": "Nos chambres",
  "footer.legal_notices": "Mentions légales",
  "footer.privacy": "Confidentialité",
  "footer.terms": "CGU",
  "footer.sitemap": "Plan du site",

  "cookies.title": "Nous respectons votre vie privée",
  "cookies.description":
    "Nous utilisons des cookies essentiels pour assurer le bon fonctionnement du site. Vous pouvez accepter, refuser ou personnaliser les cookies.",
  "cookies.customize": "Personnaliser",
  "cookies.refuse": "Refuser",
  "cookies.accept_all": "Accepter tout",
  "cookies.essential": "Cookies essentiels (toujours actifs)",
  "cookies.analytics": "Mesure d'audience",
  "cookies.marketing": "Marketing et personnalisation",
  "cookies.save": "Enregistrer",
  "cookies.privacy_policy": "Politique de confidentialité",

  "whatsapp.tooltip": "Contactez-nous sur WhatsApp",
  "whatsapp.message": "Bonjour, je souhaite avoir des informations sur le riad.",

  "booking_banner.title": "Prêt pour l'expérience ?",
  "booking_banner.subtitle":
    "Réservez maintenant et bénéficiez de nos meilleurs tarifs",
  "booking_banner.free_cancellation": "Annulation gratuite",
  "booking_banner.best_price": "Meilleur prix garanti",
  "booking_banner.five_star_service": "Service 5 étoiles",
  "booking_banner.book_now": "Réserver maintenant",

  "guest.back": "Retour à l’accueil",
  "guest.welcome": "Bienvenue à",
  "guest.tagline": "Un riad, mille histoires",
  "guest.concierge": "Conciergerie",
  "guest.my_stay": "Mon séjour",
  "guest.breakfast": "Petit-déjeuner",
  "guest.transfer": "Transfert",
  "guest.discover_fes": "Découvrir Fès",
  "guest.whatsapp": "WhatsApp",
  "guest.request_service": "Demander un service",
  "guest.riad_guide": "Guide du riad",
  "guest.contact": "Contact",
  "guest.call": "Appeler",
  "guest.stay_guide": "Guide du séjour",
  "guest.request": "Demander",
  "guest.contact_team": "Contacter Dar LaMamy",
  "guest.breakfast_title": "Commencer la journée en douceur",
  "guest.transfer_title": "Votre arrivée, simplement",
  "guest.services_title": "Tout ce qui rend le séjour plus simple",
  "guest.discover_title": "Une ville qui se découvre lentement",
  "guest.guide_title": "Les informations utiles, au même endroit",
  "guest.contact_title": "Nous sommes là pour vous",
  "guest.ask_information": "Demander une information",
  "guest.ask_transfer": "Demander un transfert",
  "guest.ask_recommendation": "Demander une recommandation",
  "guest.ask_question": "Poser une question",
};

type Messages = typeof fr;

const en: Messages = {
  "nav.skip_to_content": "Skip to content",
  "nav.main_navigation": "Main navigation",
  "nav.home": "Home",
  "nav.rooms": "Rooms",
  "nav.room_standard": "Standard Room",
  "nav.room_deluxe": "Deluxe Room",
  "nav.room_royal_suite": "Royal Suite",
  "nav.services": "Services",
  "nav.gallery": "Gallery",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.navigation": "Navigation",
  "nav.language": "Language",
  "nav.current": "Current",
  "nav.open_menu": "Open menu",
  "nav.close_menu": "Close menu",
  "nav.close": "Close",
  "nav.book": "Book",
  "nav.book_now": "Book now",

  "footer.default_tagline": "A peaceful haven in the heart of Marrakech.",
  "footer.navigation": "Navigation",
  "footer.contact": "Contact",
  "footer.information": "Information",
  "footer.manage_cookies": "Manage cookies",
  "footer.all_rights_reserved": "All rights reserved.",
  "footer.made_with": "Made with",
  "footer.in_city": "in Marrakech",
  "footer.rooms_link": "Our rooms",
  "footer.legal_notices": "Legal notice",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
  "footer.sitemap": "Sitemap",

  "cookies.title": "We respect your privacy",
  "cookies.description":
    "We use essential cookies to ensure the site works properly. You can accept, refuse, or customize cookies.",
  "cookies.customize": "Customize",
  "cookies.refuse": "Refuse",
  "cookies.accept_all": "Accept all",
  "cookies.essential": "Essential cookies (always on)",
  "cookies.analytics": "Analytics",
  "cookies.marketing": "Marketing & personalization",
  "cookies.save": "Save",
  "cookies.privacy_policy": "Privacy policy",

  "whatsapp.tooltip": "Contact us on WhatsApp",
  "whatsapp.message": "Hello, I would like more information about the riad.",

  "booking_banner.title": "Ready for the experience?",
  "booking_banner.subtitle": "Book now and get our best rates",
  "booking_banner.free_cancellation": "Free cancellation",
  "booking_banner.best_price": "Best price guaranteed",
  "booking_banner.five_star_service": "5‑star service",
  "booking_banner.book_now": "Book now",

  "guest.back": "Back to guest home",
  "guest.welcome": "Welcome to",
  "guest.tagline": "One riad, a thousand stories",
  "guest.concierge": "Concierge",
  "guest.my_stay": "My stay",
  "guest.breakfast": "Breakfast",
  "guest.transfer": "Transfer",
  "guest.discover_fes": "Discover Fès",
  "guest.whatsapp": "WhatsApp",
  "guest.request_service": "Request a service",
  "guest.riad_guide": "Riad guide",
  "guest.contact": "Contact",
  "guest.call": "Call",
  "guest.stay_guide": "Stay guide",
  "guest.request": "Request",
  "guest.contact_team": "Contact Dar LaMamy",
  "guest.breakfast_title": "Start the day gently",
  "guest.transfer_title": "A seamless arrival",
  "guest.services_title": "Everything that makes your stay easier",
  "guest.discover_title": "A city best explored slowly",
  "guest.guide_title": "Useful information in one place",
  "guest.contact_title": "We are here for you",
  "guest.ask_information": "Ask for information",
  "guest.ask_transfer": "Request a transfer",
  "guest.ask_recommendation": "Ask for a recommendation",
  "guest.ask_question": "Ask a question",
};

export type MessageKey = keyof Messages;

export const translate = (language: Language, key: MessageKey) => {
  const dict = language === "en" ? en : fr;
  return dict[key] ?? fr[key];
};
