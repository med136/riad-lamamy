#!/bin/bash

# Vérifier si on est dans un projet Next.js
if [ ! -f "package.json" ] || ! grep -q "next" "package.json"; then
    echo "❌ Ce n'est pas un projet Next.js ou package.json n'existe pas."
    echo "   Exécutez ce script à la racine de votre projet Next.js."
    exit 1
fi

echo "📁 Création de la structure complète pour un site de riad..."
echo "🎯 Inspiration: https://www.riaddarhamid.com/fr/"
echo ""

# Créer la structure de dossiers
echo "📂 Création des dossiers..."

# Dossiers dans src/app/(site)/
mkdir -p "src/app/(site)/chambres"
mkdir -p "src/app/(site)/services"
mkdir -p "src/app/(site)/galerie"
mkdir -p "src/app/(site)/contact"
mkdir -p "src/app/(site)/reservations"
mkdir -p "src/app/(site)/a-propos"

# Autres dossiers
mkdir -p src/app/api
mkdir -p src/lib
mkdir -p src/components
mkdir -p src/styles
mkdir -p src/types
mkdir -p cms
mkdir -p public/images/chambres
mkdir -p public/images/gallery
mkdir -p public/images/hero
mkdir -p public/images/services
mkdir -p public/icons

echo "✅ Dossiers créés"
echo "📝 Création des fichiers..."

# ============================================================================
# 1. FICHIERS DE CONFIGURATION
# ============================================================================

# Créer layout.tsx global
if [ ! -f "src/app/layout.tsx" ]; then
    cat > src/app/layout.tsx << 'EOF'
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
EOF
    echo "  ✓ src/app/layout.tsx"
fi

# Sauvegarder les fichiers existants
if [ -f "src/app/page.tsx" ]; then
    mv src/app/page.tsx "src/app/(site)/page.tsx.bak" 2>/dev/null
    echo "⚠️  src/app/page.tsx sauvegardé"
fi

if [ -f "src/app/layout.tsx" ] && [ ! -f "src/app/layout.tsx.original" ]; then
    cp src/app/layout.tsx "src/app/layout.tsx.original" 2>/dev/null
    echo "⚠️  layout.tsx original sauvegardé"
fi

# ============================================================================
# 2. LAYOUT PRINCIPAL
# ============================================================================

cat > "src/app/(site)/layout.tsx" << 'EOF'
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import "@/app/globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Riad Dar Al Andalus - Marrakech",
  description: "Un riad d'exception au cœur de la médina de Marrakech. Hébergement luxueux, service personnalisé et expérience marocaine authentique.",
  keywords: ["riad", "marrakech", "hébergement", "luxe", "médina", "maroc", "vacances", "hôtel"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://riad-al-andalus.com",
    title: "Riad Dar Al Andalus - Marrakech",
    description: "Un havre de paix au cœur de la médina de Marrakech",
    images: [
      {
        url: "/images/hero/riad-exterior.jpg",
        width: 1200,
        height: 630,
        alt: "Riad Dar Al Andalus",
      },
    ],
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-white text-gray-900`}>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
EOF
echo "  ✓ src/app/(site)/layout.tsx"

# ============================================================================
# 3. PAGES PRINCIPALES
# ============================================================================

# Page d'accueil
cat > "src/app/(site)/page.tsx" << 'EOF'
import { Hero } from "@/components/Hero";
import { BookingWidget } from "@/components/BookingWidget";
import { RoomPreview } from "@/components/RoomPreview";
import { Services } from "@/components/Services";
import { AboutPreview } from "@/components/AboutPreview";
import { Testimonials } from "@/components/Testimonials";
import { GalleryPreview } from "@/components/GalleryPreview";
import { Experience } from "@/components/Experience";

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <BookingWidget />
      <AboutPreview />
      <RoomPreview />
      <Services />
      <Experience />
      <GalleryPreview />
      <Testimonials />
    </div>
  );
}
EOF
echo "  ✓ src/app/(site)/page.tsx"

# Page Chambres
cat > "src/app/(site)/chambres/page.tsx" << 'EOF'
import { RoomList } from "@/components/RoomList";
import { RoomFeatures } from "@/components/RoomFeatures";
import { RoomDetails } from "@/components/RoomDetails";
import { BookingBanner } from "@/components/BookingBanner";

export default function ChambresPage() {
  return (
    <div>
      <div className="relative h-[60vh] bg-gradient-to-r from-amber-900/80 to-amber-700/80">
        <div className="absolute inset-0 bg-[url('/images/chambres/hero-chambres.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
              Nos Chambres & Suites
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Élégance marocaine et confort contemporain
            </p>
          </div>
        </div>
      </div>
      
      <div className="py-16">
        <div className="container mx-auto px-4">
          <RoomList />
          <RoomDetails />
          <RoomFeatures />
        </div>
      </div>
      
      <BookingBanner />
    </div>
  );
}
EOF
echo "  ✓ src/app/(site)/chambres/page.tsx"

# Page Services
cat > "src/app/(site)/services/page.tsx" << 'EOF'
import { ServiceList } from "@/components/ServiceList";
import { SpaSection } from "@/components/SpaSection";
import { RestaurantSection } from "@/components/RestaurantSection";
import { Activities } from "@/components/Activities";

export default function ServicesPage() {
  return (
    <div>
      <div className="relative h-[50vh] bg-gradient-to-r from-amber-800/80 to-amber-600/80">
        <div className="absolute inset-0 bg-[url('/images/services/hero-services.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
              Nos Services
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Une expérience complète et personnalisée
            </p>
          </div>
        </div>
      </div>
      
      <div className="py-16">
        <div className="container mx-auto px-4">
          <ServiceList />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
            <SpaSection />
            <RestaurantSection />
          </div>
          <Activities />
        </div>
      </div>
    </div>
  );
}
EOF
echo "  ✓ src/app/(site)/services/page.tsx"

# Page Galerie
cat > "src/app/(site)/galerie/page.tsx" << 'EOF'
import Gallery from "@/components/Gallery";
import GalleryFilters from "@/components/GalleryFilters";

export default function GaleriePage() {
  return (
    <div>
      <div className="relative h-[50vh] bg-gradient-to-r from-stone-800/80 to-stone-600/80">
        <div className="absolute inset-0 bg-[url('/images/gallery/hero-gallery.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
              Galerie
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Découvrez l'ambiance unique de notre riad
            </p>
          </div>
        </div>
      </div>
      
      <div className="py-12">
        <div className="container mx-auto px-4">
          <GalleryFilters />
          <Gallery />
        </div>
      </div>
    </div>
  );
}
EOF
echo "  ✓ src/app/(site)/galerie/page.tsx"

# Page Contact
cat > "src/app/(site)/contact/page.tsx" << 'EOF'
import ContactForm from "@/components/ContactForm";
import ContactInfo from "@/components/ContactInfo";
import Map from "@/components/Map";
import FAQ from "@/components/FAQ";

export default function ContactPage() {
  return (
    <div>
      <div className="relative h-[50vh] bg-gradient-to-r from-amber-900/80 to-amber-700/80">
        <div className="absolute inset-0 bg-[url('/images/contact/hero-contact.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
              Contact
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Nous sommes à votre écoute
            </p>
          </div>
        </div>
      </div>
      
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
            <div>
              <ContactInfo />
              <div className="mt-8">
                <Map />
              </div>
            </div>
          </div>
          
          <div className="mt-16">
            <FAQ />
          </div>
        </div>
      </div>
    </div>
  );
}
EOF
echo "  ✓ src/app/(site)/contact/page.tsx"

# Page Réservations
cat > "src/app/(site)/reservations/page.tsx" << 'EOF'
import BookingForm from "@/components/BookingForm";
import ReservationInfo from "@/components/ReservationInfo";
import PaymentOptions from "@/components/PaymentOptions";
import CancellationPolicy from "@/components/CancellationPolicy";

export default function ReservationsPage() {
  return (
    <div>
      <div className="relative h-[50vh] bg-gradient-to-r from-emerald-800/80 to-emerald-600/80">
        <div className="absolute inset-0 bg-[url('/images/reservations/hero-reservations.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
              Réservez
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Votre séjour inoubliable à Marrakech
            </p>
          </div>
        </div>
      </div>
      
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <BookingForm />
              <div className="mt-8">
                <PaymentOptions />
              </div>
            </div>
            <div>
              <ReservationInfo />
              <div className="mt-8">
                <CancellationPolicy />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF
echo "  ✓ src/app/(site)/reservations/page.tsx"

# Page À Propos
cat > "src/app/(site)/a-propos/page.tsx" << 'EOF'
import AboutHero from "@/components/AboutHero";
import Team from "@/components/Team";
import Values from "@/components/Values";
import History from "@/components/History";

export default function AboutPage() {
  return (
    <div>
      <AboutHero />
      
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl font-serif font-bold text-center mb-8">
              Notre Histoire
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Niché au cœur de la médina de Marrakech, le Riad Dar Al Andalus 
              est bien plus qu'un simple hébergement. C'est une demeure historique 
              restaurée avec passion, où chaque détail raconte une histoire. 
              Notre riad est un témoignage de l'art de vivre marocain, alliant 
              l'authenticité des traditions à l'élégance contemporaine.
            </p>
          </div>
          
          <History />
          <Values />
          <Team />
        </div>
      </div>
    </div>
  );
}
EOF
echo "  ✓ src/app/(site)/a-propos/page.tsx"

# ============================================================================
# 4. COMPOSANTS PRINCIPAUX (22 composants)
# ============================================================================

echo "🔧 Création des composants..."

# ------------------------------------------------------------
# Navigation améliorée
# ------------------------------------------------------------
cat > "src/components/Navigation.tsx" << 'EOF'
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ChevronDown, Globe } from "lucide-react";

const navItems = [
  { href: "/", label: "Accueil" },
  { 
    href: "/chambres", 
    label: "Chambres",
    submenu: [
      { href: "/chambres#standard", label: "Chambre Standard" },
      { href: "/chambres#deluxe", label: "Chambre Deluxe" },
      { href: "/chambres#suite", label: "Suite Royale" },
    ]
  },
  { href: "/services", label: "Services" },
  { href: "/galerie", label: "Galerie" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

const languages = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg py-3" 
          : "bg-white/90 backdrop-blur-sm py-5"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-12 w-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-serif font-bold text-lg">RA</span>
              </div>
              <div>
                <div className="text-2xl font-serif font-bold text-gray-900 leading-tight">
                  Riad Dar<span className="text-amber-600">AlAndalus</span>
                </div>
                <div className="text-xs text-gray-500 tracking-wider">MARRAKECH</div>
              </div>
            </Link>

            {/* Navigation desktop */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "text-amber-600 font-semibold bg-amber-50"
                        : "text-gray-700 hover:text-amber-600 hover:bg-amber-50"
                    }`}
                    onMouseEnter={() => setActiveSubmenu(item.href)}
                    onMouseLeave={() => setActiveSubmenu(null)}
                  >
                    <span>{item.label}</span>
                    {item.submenu && (
                      <ChevronDown size={16} className={`transition-transform ${
                        activeSubmenu === item.href ? "rotate-180" : ""
                      }`} />
                    )}
                  </Link>
                  
                  {/* Sous-menu */}
                  {item.submenu && activeSubmenu === item.href && (
                    <div 
                      className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50"
                      onMouseEnter={() => setActiveSubmenu(item.href)}
                      onMouseLeave={() => setActiveSubmenu(null)}
                    >
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Sélecteur de langue */}
              <div className="relative">
                <button
                  onClick={() => setLanguageOpen(!languageOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-amber-300 transition-colors"
                >
                  <Globe size={18} />
                  <span>FR</span>
                  <ChevronDown size={16} />
                </button>
                
                {languageOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border py-2 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        className="block w-full text-left px-4 py-2 hover:bg-amber-50 transition-colors"
                        onClick={() => setLanguageOpen(false)}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bouton réservation */}
              <Link
                href="/reservations"
                className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-full hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 group"
              >
                <Phone size={18} />
                <span className="font-semibold">Réserver</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            </div>

            {/* Menu mobile */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Menu mobile dropdown */}
          {isOpen && (
            <div className="lg:hidden absolute left-0 right-0 top-full bg-white shadow-2xl border-t rounded-b-2xl z-50">
              <div className="container mx-auto px-4 py-6">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        className={`block px-4 py-3 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? "text-amber-600 font-semibold bg-amber-50"
                            : "text-gray-700 hover:text-amber-600 hover:bg-amber-50"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                      {item.submenu && (
                        <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-4">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-gray-600 hover:text-amber-600 rounded-lg"
                              onClick={() => setIsOpen(false)}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        className="px-3 py-2 text-sm border rounded-lg hover:border-amber-300 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                  
                  <Link
                    href="/reservations"
                    className="block w-full bg-amber-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Réserver maintenant
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {/* Overlay pour menu mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
EOF
echo "  ✓ src/components/Navigation.tsx"

# ------------------------------------------------------------
# Footer amélioré
# ------------------------------------------------------------
cat > "src/components/Footer.tsx" << 'EOF'
import Link from "next/link";
import { 
  Facebook, Instagram, Youtube, Mail, Phone, MapPin, 
  Heart, Shield, CreditCard, Award 
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const quickLinks = [
    { href: "/", label: "Accueil" },
    { href: "/chambres", label: "Nos Chambres" },
    { href: "/services", label: "Services" },
    { href: "/galerie", label: "Galerie" },
    { href: "/a-propos", label: "À Propos" },
    { href: "/contact", label: "Contact" },
  ];
  
  const legalLinks = [
    { href: "/mentions-legales", label: "Mentions légales" },
    { href: "/politique-confidentialite", label: "Confidentialité" },
    { href: "/cgu", label: "CGU" },
    { href: "/plan-site", label: "Plan du site" },
  ];
  
  const certifications = [
    { icon: <Shield size={20} />, text: "Sécurité maximale" },
    { icon: <CreditCard size={20} />, text: "Paiement sécurisé" },
    { icon: <Award size={20} />, text: "Certifié Excellence" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Section principale */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo et description */}
          <div>
            <div className="mb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-serif font-bold text-2xl">RA</span>
              </div>
              <h3 className="text-2xl font-serif font-bold mb-2">
                Riad Dar<span className="text-amber-400">AlAndalus</span>
              </h3>
              <p className="text-gray-400 text-sm">
                Un havre de paix au cœur de la médina de Marrakech.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-amber-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-amber-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-amber-600 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-800">
              Navigation
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-amber-400 transition-colors flex items-center group"
                  >
                    <span className="w-2 h-2 bg-amber-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-800">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-amber-400 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  123 Derb Sidi Bouloukat<br />
                  Médina, Marrakech 40000<br />
                  Maroc
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-amber-400 flex-shrink-0" />
                <span className="text-gray-400">+212 5 24 38 94 12</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-amber-400 flex-shrink-0" />
                <span className="text-gray-400">contact@riad-al-andalus.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-800">
              Newsletter
            </h4>
            <p className="text-gray-400 mb-4">
              Recevez nos offres exclusives et actualités.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Votre email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors font-semibold"
              >
                S&apos;abonner
              </button>
            </form>
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap justify-center items-center gap-8">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center space-x-2 text-gray-400">
                {cert.icon}
                <span>{cert.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barre du bas */}
      <div className="bg-gray-950 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-500 text-sm">
              &copy; {currentYear} Riad Dar Al Andalus. Tous droits réservés.
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-500 hover:text-amber-400 text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <span>Conçu avec</span>
              <Heart size={16} className="text-red-500 fill-red-500" />
              <span>à Marrakech</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
EOF
echo "  ✓ src/components/Footer.tsx"

# ------------------------------------------------------------
# Hero section avec vidéo/background
# ------------------------------------------------------------
cat > "src/components/Hero.tsx" << 'EOF'
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Play, Star } from "lucide-react";

const images = [
  "/images/hero/hero-1.jpg",
  "/images/hero/hero-2.jpg",
  "/images/hero/hero-3.jpg",
];

export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background slideshow */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url('${image}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
          </div>
        ))}
      </div>

      {/* Overlay pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Contenu */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white"
            >
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold">Excellence TripAdvisor 2024</span>
              </div>

              {/* Titre principal */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 leading-tight">
                <span className="block">Un havre</span>
                <span className="block text-amber-300">de paix à</span>
                <span className="block">Marrakech</span>
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl">
                Découvrez l&apos;authenticité marocaine dans un cadre d&apos;exception 
                au cœur de la médina. Expérience unique garantie.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-4 rounded-full hover:from-amber-700 hover:to-amber-800 transition-all shadow-xl hover:shadow-2xl flex items-center space-x-2 group"
                >
                  <span className="font-semibold text-lg">Réserver maintenant</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </motion.button>

                <button
                  onClick={() => setShowVideo(true)}
                  className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full hover:bg-white/30 transition-all flex items-center space-x-2 group"
                >
                  <Play size={20} />
                  <span className="font-semibold">Voir la vidéo</span>
                </button>
              </div>

              {/* Infos complémentaires */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-300">12</div>
                  <div className="text-sm text-gray-300">Chambres uniques</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-300">5★</div>
                  <div className="text-sm text-gray-300">Service premium</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-300">24/7</div>
                  <div className="text-sm text-gray-300">Réception</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-300">100%</div>
                  <div className="text-sm text-gray-300">Satisfaction</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <ChevronDown size={32} className="text-white" />
      </motion.div>

      {/* Modal vidéo */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-amber-400"
            >
              ✕
            </button>
            <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Play size={64} className="text-white mx-auto mb-4" />
                  <p className="text-white">Vidéo de présentation du riad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
EOF
echo "  ✓ src/components/Hero.tsx"

# ------------------------------------------------------------
# Widget de réservation amélioré
# ------------------------------------------------------------
cat > "src/components/BookingWidget.tsx" << 'EOF'
"use client";

import { useState } from "react";
import { Calendar, Users, Search, ChevronDown, Check } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const roomTypes = [
  { id: "standard", name: "Chambre Standard", price: 120 },
  { id: "deluxe", name: "Chambre Deluxe", price: 180 },
  { id: "suite", name: "Suite Royale", price: 250 },
];

export function BookingWidget() {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState({ adults: 2, children: 0, infants: 0 });
  const [roomType, setRoomType] = useState("standard");
  const [promoCode, setPromoCode] = useState("");
  const [showPromo, setShowPromo] = useState(false);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const room = roomTypes.find(r => r.id === roomType);
    if (!room || nights === 0) return 0;
    
    let total = room.price * nights;
    
    // Réduction pour séjour long
    if (nights >= 7) total *= 0.9; // 10% de réduction
    
    // Application code promo
    if (promoCode === "RIAD10") total *= 0.9;
    
    return Math.round(total);
  };

  return (
    <div className="container mx-auto px-4 -mt-20 relative z-20">
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-6xl mx-auto border border-gray-100">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-serif font-bold text-gray-800 mb-2">
            Réservez votre séjour
          </h3>
          <p className="text-gray-600">
            Meilleur prix garanti • Annulation gratuite • Petit-déjeuner inclus
          </p>
        </div>
        
        <form className="space-y-6">
          {/* Dates et personnes */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Arrivée */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <Calendar size={16} className="inline mr-2" />
                Arrivée
              </label>
              <div className="relative">
                <DatePicker
                  selected={checkIn}
                  onChange={setCheckIn}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholderText="Date d'arrivée"
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                />
                <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Départ */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <Calendar size={16} className="inline mr-2" />
                Départ
              </label>
              <div className="relative">
                <DatePicker
                  selected={checkOut}
                  onChange={setCheckOut}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholderText="Date de départ"
                  dateFormat="dd/MM/yyyy"
                  minDate={checkIn || new Date()}
                />
                <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Personnes */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <Users size={16} className="inline mr-2" />
                Voyageurs
              </label>
              <div className="relative">
                <select
                  value={guests.adults}
                  onChange={(e) => setGuests({...guests, adults: parseInt(e.target.value)})}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none"
                >
                  {[1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'adulte' : 'adultes'}</option>
                  ))}
                </select>
                <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Type de chambre */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Chambre
              </label>
              <div className="relative">
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none"
                >
                  {roomTypes.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} - {room.price}€/nuit
                    </option>
                  ))}
                </select>
                <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Options supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code promo */}
            <div>
              <button
                type="button"
                onClick={() => setShowPromo(!showPromo)}
                className="text-amber-600 hover:text-amber-700 text-sm font-semibold flex items-center"
              >
                <span>Code promo ?</span>
                <ChevronDown size={16} className={`ml-1 transition-transform ${showPromo ? "rotate-180" : ""}`} />
              </button>
              
              {showPromo && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Entrez votre code"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  {promoCode === "RIAD10" && (
                    <p className="text-green-600 text-sm mt-1 flex items-center">
                      <Check size={16} className="mr-1" />
                      Code valide ! 10% de réduction appliqué
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Résumé du prix */}
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-800">
                {calculateNights()} nuit{calculateNights() > 1 ? 's' : ''} • {calculateTotal()}€
              </div>
              <div className="text-sm text-gray-600">
                Taxes et frais inclus
              </div>
            </div>
          </div>

          {/* Bouton de recherche */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-12 py-4 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 mx-auto group"
            >
              <Search size={20} />
              <span className="font-semibold text-lg">Vérifier la disponibilité</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
          </div>
        </form>

        {/* Avantages */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-amber-600 font-bold">✓</div>
              <div className="text-sm text-gray-600">Meilleur prix garanti</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-amber-600 font-bold">✓</div>
              <div className="text-sm text-gray-600">Annulation gratuite</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-amber-600 font-bold">✓</div>
              <div className="text-sm text-gray-600">Sans frais cachés</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-amber-600 font-bold">24/7</div>
              <div className="text-sm text-gray-600">Support client</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF
echo "  ✓ src/components/BookingWidget.tsx"

# ============================================================================
# 5. CRÉATION DES AUTRES COMPOSANTS MANQUANTS (17 composants)
# ============================================================================

# RoomPreview
cat > "src/components/RoomPreview.tsx" << 'EOF'
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bed, Users, Maximize, Heart, Star, ArrowRight } from "lucide-react";

const rooms = [
  {
    id: "standard",
    name: "Chambre Standard",
    description: "Chambre confortable avec lit double, décorée dans le style traditionnel marocain.",
    price: 120,
    size: 25,
    capacity: 2,
    features: ["Wi-Fi gratuit", "Salle de bain privée", "Petit-déjeuner", "Climatisation"],
    image: "/images/chambres/standard.jpg",
    rating: 4.5,
  },
  {
    id: "deluxe",
    name: "Chambre Deluxe",
    description: "Chambre spacieuse avec terrasse privée offrant une vue sur le jardin intérieur.",
    price: 180,
    size: 35,
    capacity: 2,
    features: ["Terrasse privée", "Vue sur le jardin", "Service en chambre", "Mini-bar"],
    image: "/images/chambres/deluxe.jpg",
    rating: 4.8,
    popular: true,
  },
  {
    id: "suite",
    name: "Suite Royale",
    description: "Suite luxueuse avec salon séparé, jacuzzi et service personnalisé 24h/24.",
    price: 250,
    size: 50,
    capacity: 3,
    features: ["Salon privé", "Jacuzzi", "Service VIP", "Plateau de bienvenue"],
    image: "/images/chambres/suite.jpg",
    rating: 5.0,
    luxury: true,
  },
];

export function RoomPreview() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-amber-50/30">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Nos Chambres d&apos;Exception
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chaque chambre est une invitation au voyage, alliant confort moderne 
              et authenticité marocaine.
            </p>
          </motion.div>
        </div>

        {/* Grille des chambres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              {/* Carte de chambre */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                {/* En-tête de la carte */}
                <div className="relative h-64 overflow-hidden">
                  {/* Badges */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                    {room.popular && (
                      <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        POPULAIRE
                      </span>
                    )}
                    {room.luxury && (
                      <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        LUXE
                      </span>
                    )}
                  </div>
                  
                  {/* Bouton favori */}
                  <button
                    onClick={() => toggleFavorite(room.id)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart 
                      size={20} 
                      className={favorites.includes(room.id) ? "fill-red-500 text-red-500" : "text-gray-400"} 
                    />
                  </button>

                  {/* Image */}
                  <div className="relative h-full bg-gradient-to-br from-amber-100 to-amber-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Bed size={48} className="text-amber-600/50 mx-auto mb-2" />
                        <span className="text-amber-700 font-semibold">Image: {room.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  {/* Titre et évaluation */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star size={16} className="text-amber-400 fill-amber-400" />
                      <span className="font-semibold">{room.rating}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>

                  {/* Caractéristiques */}
                  <div className="flex items-center space-x-6 text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Maximize size={16} />
                      <span className="text-sm">{room.size}m²</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users size={16} />
                      <span className="text-sm">{room.capacity} personne{room.capacity > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {room.features.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                      {room.features.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{room.features.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Prix et CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-amber-600">
                        {room.price}€
                        <span className="text-sm text-gray-500 font-normal"> / nuit</span>
                      </div>
                      <div className="text-sm text-gray-500">Taxes incluses</div>
                    </div>
                    
                    <Link
                      href={`/chambres#${room.id}`}
                      className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all flex items-center space-x-2 group"
                    >
                      <span className="font-semibold">Détails</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/chambres"
            className="inline-flex items-center space-x-3 text-amber-600 hover:text-amber-700 font-semibold group"
          >
            <span>Voir toutes nos chambres et suites</span>
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
EOF
echo "  ✓ src/components/RoomPreview.tsx"

# Services
cat > "src/components/Services.tsx" << 'EOF'
"use client";

import { motion } from "framer-motion";
import { 
  Coffee, Wifi, Car, Umbrella, Wine, Music, 
  Sparkles, Shield, Heart, Clock 
} from "lucide-react";

const services = [
  {
    icon: <Coffee size={28} />,
    title: "Petit-déjeuner Marocain",
    description: "Délicieux petit-déjeuner traditionnel servi sur la terrasse ou dans votre chambre.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: <Wifi size={28} />,
    title: "Wi-Fi Haut Débit",
    description: "Connexion internet gratuite dans tout le riad et les chambres.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Car size={28} />,
    title: "Transfert Aéroport",
    description: "Service de transfert privé depuis et vers l'aéroport de Marrakech.",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: <Umbrella size={28} />,
    title: "Excursions Guidées",
    description: "Organisation d'excursions personnalisées dans Marrakech et ses environs.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: <Wine size={28} />,
    title: "Dîner aux Chandelles",
    description: "Dîners romantiques avec spécialités marocaines préparées par notre chef.",
    color: "from-rose-500 to-red-500",
  },
  {
    icon: <Music size={28} />,
    title: "Soirées Musicales",
    description: "Soirées avec musique traditionnelle marocaine dans le patio.",
    color: "from-violet-500 to-purple-500",
  },
];

const highlights = [
  {
    icon: <Sparkles size={24} />,
    text: "Service personnalisé 24h/24",
  },
  {
    icon: <Shield size={24} />,
    text: "Sécurité et discrétion garanties",
  },
  {
    icon: <Heart size={24} />,
    text: "Attention particulière aux détails",
  },
  {
    icon: <Clock size={24} />,
    text: "Flexibilité horaire",
  },
];

export function Services() {
  return (
    <section className="py-20 bg-gradient-to-b from-amber-50/30 to-white">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Nos Services Premium
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tout est pensé pour rendre votre séjour exceptionnel et mémorable.
            </p>
          </motion.div>
        </div>

        {/* Grille des services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-100"
            >
              {/* Icon avec dégradé */}
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${service.color} mb-6`}>
                <div className="text-white">
                  {service.icon}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {service.description}
              </p>
              
              <div className="text-amber-600 text-sm font-semibold">
                Inclus dans votre séjour
              </div>
            </motion.div>
          ))}
        </div>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-3xl p-8 md:p-12 text-white"
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-serif font-bold text-center mb-8">
              Pourquoi nous choisir ?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="bg-white/20 p-4 rounded-2xl mb-4">
                    {highlight.icon}
                  </div>
                  <span className="font-semibold">{highlight.text}</span>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8 text-amber-100">
              <p className="text-lg">
                Notre équipe dévouée est à votre service pour rendre votre séjour inoubliable.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-6">
            Besoin d&apos;un service particulier ? Notre conciergerie est à votre disposition.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center space-x-2 bg-gray-900 text-white px-8 py-4 rounded-full hover:bg-black transition-colors font-semibold"
          >
            <span>Demander un service personnalisé</span>
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
EOF
echo "  ✓ src/components/Services.tsx"

# GalleryPreview
cat > "src/components/GalleryPreview.tsx" << 'EOF'
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Maximize2, Grid3x3 } from "lucide-react";

const galleryImages = [
  {
    id: 1,
    title: "Cour Intérieure",
    category: "architecture",
    description: "Notre magnifique patio avec fontaine traditionnelle",
  },
  {
    id: 2,
    title: "Suite Royale",
    category: "chambres",
    description: "Luxueuse suite avec décoration marocaine authentique",
  },
  {
    id: 3,
    title: "Restaurant",
    category: "restauration",
    description: "Notre restaurant où nous servons la cuisine traditionnelle",
  },
  {
    id: 4,
    title: "Jardin & Piscine",
    category: "jardin",
    description: "Oasis de tranquillité au cœur du riad",
  },
];

const categories = [
  { id: "all", name: "Toutes" },
  { id: "architecture", name: "Architecture" },
  { id: "chambres", name: "Chambres" },
  { id: "restauration", name: "Restauration" },
  { id: "jardin", name: "Jardin" },
];

export function GalleryPreview() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const filteredImages = activeCategory === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-stone-50">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-2 text-amber-600 mb-4">
              <Grid3x3 size={24} />
              <span className="font-semibold">GALERIE</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              L&apos;Âme de Notre Riad
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez l&apos;atmosphère unique et l&apos;architecture exceptionnelle 
              de notre demeure marocaine.
            </p>
          </motion.div>
        </div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setCurrentIndex(0);
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? "bg-amber-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow"
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Galerie principale */}
        <div className="relative mb-8">
          {/* Image principale */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Image placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏛️</div>
                  <h3 className="text-2xl font-bold text-amber-900 mb-2">
                    {filteredImages[currentIndex]?.title}
                  </h3>
                  <p className="text-amber-800">
                    {filteredImages[currentIndex]?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-sm font-semibold mb-1 uppercase tracking-wider">
                      {filteredImages[currentIndex]?.category}
                    </div>
                    <h3 className="text-2xl font-bold">
                      {filteredImages[currentIndex]?.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Maximize2 size={24} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contrôles */}
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <button
              onClick={prevSlide}
              className="bg-white/80 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors shadow-lg"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="bg-white/80 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors shadow-lg"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Indicateurs */}
          <div className="flex justify-center space-x-2 mt-6">
            {filteredImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-amber-600 w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Miniatures */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {filteredImages.map((image, index) => (
            <motion.button
              key={image.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-square rounded-xl overflow-hidden ${
                index === currentIndex
                  ? "ring-4 ring-amber-500 ring-offset-2"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold text-white">
                  {image.title.split(" ")[0]}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/galerie"
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-stone-800 to-stone-900 text-white px-8 py-4 rounded-full hover:from-stone-900 hover:to-black transition-all shadow-xl group"
          >
            <span className="font-semibold">Explorer toute la galerie</span>
            <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-6xl max-h-[90vh]">
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-amber-400 z-10"
              >
                ✕
              </button>
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="p-8">
                  <div className="text-center">
                    <div className="text-8xl mb-6">🏛️</div>
                    <h3 className="text-3xl font-bold mb-2">
                      {filteredImages[currentIndex]?.title}
                    </h3>
                    <p className="text-gray-600 text-lg">
                      {filteredImages[currentIndex]?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
EOF
echo "  ✓ src/components/GalleryPreview.tsx"

# Testimonials
cat > "src/components/Testimonials.tsx" << 'EOF'
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sophie et Thomas",
    location: "Paris, France",
    date: "Janvier 2024",
    rating: 5,
    text: "Un séjour absolument magique ! Le riad est encore plus beau qu'en photo. L'accueil est chaleureux, les chambres spacieuses et le petit-déjeuner sur la terrasse était un réveil de rêve. Nous reviendrons !",
    avatar: "ST",
    stay: "7 nuits en Suite Royale",
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    location: "Madrid, Espagne",
    date: "Décembre 2023",
    rating: 5,
    text: "Le service est exceptionnel. L'équipe a tout fait pour rendre notre voyage de noces inoubliable. Les dîners aux chandelles, les recommandations personnalisées... Tout était parfait !",
    avatar: "MR",
    stay: "5 nuits en Chambre Deluxe",
    featured: true,
  },
  {
    id: 3,
    name: "James Wilson",
    location: "Londres, Royaume-Uni",
    date: "Novembre 2023",
    rating: 4,
    text: "Excellent rapport qualité-prix. L'emplacement est idéal pour explorer la médina. Le hammam était incroyable après une journée de visite. Je recommande vivement !",
    avatar: "JW",
    stay: "4 nuits en Chambre Standard",
  },
  {
    id: 4,
    name: "Anna Schmidt",
    location: "Berlin, Allemagne",
    date: "Octobre 2023",
    rating: 5,
    text: "Une oasis de paix au cœur de Marrakech. Le jardin et la piscine sont magnifiques. Le personnel est aux petits soins. Une expérience authentique que je n'oublierai jamais.",
    avatar: "AS",
    stay: "6 nuits en Suite Royale",
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-2 text-amber-600 mb-4">
              <Quote size={24} />
              <span className="font-semibold">TÉMOIGNAGES</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Ce Que Disent Nos Voyageurs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les expériences de nos clients satisfaits du monde entier.
            </p>
          </motion.div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { value: "4.9/5", label: "Note moyenne" },
            { value: "98%", label: "Taux de retour" },
            { value: "500+", label: "Clients satisfaits" },
            { value: "100%", label: "Recommandation" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 text-center shadow-lg"
            >
              <div className="text-3xl font-bold text-amber-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Témoignage principal */}
        <div className="max-w-4xl mx-auto relative">
          {/* Boutons de navigation */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            <ChevronRight size={24} />
          </button>

          {/* Témoignage */}
          <motion.div
            key={testimonials[currentIndex].id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-gradient-to-br ${
              testimonials[currentIndex].featured
                ? "from-amber-500 to-amber-600"
                : "from-white to-amber-50"
            } rounded-3xl p-8 md:p-12 shadow-2xl border ${
              testimonials[currentIndex].featured
                ? "border-amber-400"
                : "border-amber-100"
            }`}
            onMouseEnter={() => setAutoplay(false)}
            onMouseLeave={() => setAutoplay(true)}
          >
            {/* En-tête du témoignage */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
              {/* Avatar */}
              <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                testimonials[currentIndex].featured
                  ? "bg-white text-amber-600"
                  : "bg-amber-100 text-amber-600"
              }`}>
                {testimonials[currentIndex].avatar}
              </div>

              {/* Infos */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-4 mb-2">
                  <h3 className={`text-xl font-bold ${
                    testimonials[currentIndex].featured ? "text-white" : "text-gray-900"
                  }`}>
                    {testimonials[currentIndex].name}
                  </h3>
                  
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={`${
                          i < testimonials[currentIndex].rating
                            ? testimonials[currentIndex].featured
                              ? "text-white fill-white"
                              : "text-amber-400 fill-amber-400"
                            : testimonials[currentIndex].featured
                              ? "text-white/40"
                              : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className={`flex flex-wrap gap-4 text-sm ${
                  testimonials[currentIndex].featured ? "text-amber-100" : "text-gray-600"
                }`}>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {testimonials[currentIndex].location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {testimonials[currentIndex].date}
                  </div>
                </div>
              </div>
            </div>

            {/* Texte du témoignage */}
            <div className="mb-8">
              <Quote className={`w-8 h-8 mb-4 ${
                testimonials[currentIndex].featured ? "text-amber-200" : "text-amber-300"
              }`} />
              <p className={`text-lg leading-relaxed ${
                testimonials[currentIndex].featured ? "text-white" : "text-gray-700"
              }`}>
                {testimonials[currentIndex].text}
              </p>
            </div>

            {/* Séjour */}
            <div className={`text-sm font-medium px-4 py-2 rounded-full inline-block ${
              testimonials[currentIndex].featured
                ? "bg-white/20 text-white"
                : "bg-amber-100 text-amber-700"
            }`}>
              {testimonials[currentIndex].stay}
            </div>
          </motion.div>

          {/* Indicateurs */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-amber-600 w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Plateformes */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            Consultez aussi nos avis sur :
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {["TripAdvisor", "Booking.com", "Google", "Airbnb"].map((platform) => (
              <div
                key={platform}
                className="bg-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-2xl font-bold text-amber-600">4.8</div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="text-sm text-gray-600 mt-1">{platform}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
EOF
echo "  ✓ src/components/Testimonials.tsx"

# ============================================================================
# 6. COMPOSANTS SPÉCIFIQUES POUR LES PAGES
# ============================================================================

# RoomList
cat > "src/components/RoomList.tsx" << 'EOF'
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Bed, Users, Maximize, Check, Wifi, Coffee, 
  Droplets, Wind, Tv, Shield
} from "lucide-react";

const rooms = [
  {
    id: "standard",
    name: "Chambre Standard",
    description: "Confort et authenticité dans une chambre typiquement marocaine.",
    price: 120,
    size: 25,
    capacity: 2,
    features: [
      { icon: <Bed size={18} />, text: "Lit double 180x200" },
      { icon: <Users size={18} />, text: "2 personnes max" },
      { icon: <Maximize size={18} />, text: "25 m²" },
      { icon: <Wifi size={18} />, text: "Wi-Fi gratuit" },
      { icon: <Coffee size={18} />, text: "Petit-déjeuner inclus" },
      { icon: <Wind size={18} />, text: "Climatisation" },
    ],
    amenities: [
      "Salle de bain privée avec douche",
      "Produits de toilette bio",
      "Coffre-fort",
      "Sèche-cheveux",
      "Bureau",
      "Vue sur le patio",
    ],
  },
  {
    id: "deluxe",
    name: "Chambre Deluxe",
    description: "Espace et élégance avec terrasse privée et vue sur le jardin.",
    price: 180,
    size: 35,
    capacity: 2,
    popular: true,
    features: [
      { icon: <Bed size={18} />, text: "Lit king size 200x200" },
      { icon: <Users size={18} />, text: "2 personnes max" },
      { icon: <Maximize size={18} />, text: "35 m² + terrasse" },
      { icon: <Wifi size={18} />, text: "Wi-Fi haut débit" },
      { icon: <Coffee size={18} />, text: "Petit-déjeuner premium" },
      { icon: <Tv size={18} />, text: "TV écran plat" },
    ],
    amenities: [
      "Salle de bain en marbre",
      "Terrasse privée avec salon",
      "Mini-bar gratuit",
      "Service en chambre 24h/24",
      "Vue sur le jardin",
      "Plateau de bienvenue",
    ],
  },
  {
    id: "suite",
    name: "Suite Royale",
    description: "Luxe absolu avec salon séparé, jacuzzi et service VIP.",
    price: 250,
    size: 50,
    capacity: 3,
    luxury: true,
    features: [
      { icon: <Bed size={18} />, text: "Lit emperor 220x220" },
      { icon: <Users size={18} />, text: "3 personnes max" },
      { icon: <Maximize size={18} />, text: "50 m² + salon" },
      { icon: <Wifi size={18} />, text: "Wi-Fi fibre" },
      { icon: <Coffee size={18} />, text: "Petit-déjeuner gastronomique" },
      { icon: <Droplets size={18} />, text: "Jacuzzi privatif" },
    ],
    amenities: [
      "Salle de bain avec jacuzzi",
      "Salon privé séparé",
      "Service de majordome",
      "Accès VIP au spa",
      "Vue panoramique",
      "Champagne à l'arrivée",
    ],
  },
];

export function RoomList() {
  const [selectedRoom, setSelectedRoom] = useState("standard");

  const selectedRoomData = rooms.find(room => room.id === selectedRoom);

  return (
    <div className="mb-16">
      {/* Sélecteur de chambres */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        {rooms.map((room) => (
          <motion.button
            key={room.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRoom(room.id)}
            className={`flex-1 p-6 rounded-2xl text-left transition-all ${
              selectedRoom === room.id
                ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-2xl"
                : "bg-white text-gray-800 hover:bg-amber-50 shadow-lg"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                <div className="text-2xl font-bold">
                  {room.price}€<span className="text-sm font-normal"> /nuit</span>
                </div>
              </div>
              {(room.popular || room.luxury) && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  room.luxury 
                    ? "bg-purple-500 text-white" 
                    : "bg-amber-500 text-white"
                }`}>
                  {room.luxury ? "LUXE" : "POPULAIRE"}
                </span>
              )}
            </div>
            <p className={`text-sm ${selectedRoom === room.id ? "text-amber-100" : "text-gray-600"}`}>
              {room.description}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Détails de la chambre sélectionnée */}
      {selectedRoomData && (
        <motion.div
          key={selectedRoom}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image et caractéristiques */}
            <div className="p-8 lg:p-12">
              {/* Caractéristiques principales */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {selectedRoomData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="text-amber-600">{feature.icon}</div>
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Liste des équipements */}
              <div>
                <h4 className="text-xl font-bold mb-6">Équipements & Services</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedRoomData.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check size={18} className="text-green-500" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Résumé et CTA */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-8 lg:p-12">
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {selectedRoomData.name}
                  </h3>
                  <p className="text-gray-700 mb-6">
                    {selectedRoomData.description}
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center py-3 border-b border-amber-200">
                      <span className="text-gray-600">Surface</span>
                      <span className="font-bold">{selectedRoomData.size} m²</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-amber-200">
                      <span className="text-gray-600">Capacité</span>
                      <span className="font-bold">{selectedRoomData.capacity} personne{selectedRoomData.capacity > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-amber-200">
                      <span className="text-gray-600">Petit-déjeuner</span>
                      <span className="font-bold text-green-600">Inclus</span>
                    </div>
                  </div>
                </div>

                {/* Prix et réservation */}
                <div>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-amber-600 mb-2">
                      {selectedRoomData.price}€
                    </div>
                    <div className="text-gray-600">par nuit, taxes incluses</div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl">
                    Réserver cette chambre
                  </button>
                  
                  <div className="text-center mt-4 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <Shield size={16} />
                      <span>Annulation gratuite jusqu&apos;à 48h avant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
EOF
echo "  ✓ src/components/RoomList.tsx"

# RoomFeatures
cat > "src/components/RoomFeatures.tsx" << 'EOF'
"use client";

import { motion } from "framer-motion";
import { 
  Lock, Wind, Thermometer, Tv, Wifi, Coffee, 
  Droplets, Shield, Bell, Clock, Heart, Sparkles
} from "lucide-react";

const features = [
  {
    icon: <Wind size={24} />,
    title: "Climatisation Réversible",
    description: "Contrôle individuel de la température dans chaque chambre pour votre confort optimal.",
  },
  {
    icon: <Wifi size={24} />,
    title: "Fibre Optique",
    description: "Connexion internet ultra-rapide dans tout le riad, idéale pour le télétravail.",
  },
  {
    icon: <Lock size={24} />,
    title: "Sécurité Totale",
    description: "Système d'alarme, coffre-fort et surveillance 24h/24 pour votre tranquillité d'esprit.",
  },
  {
    icon: <Droplets size={24} />,
    title: "Salle de Bain Premium",
    description: "Produits d'accueil bio, serviettes épaisses et sèche-cheveux professionnel.",
  },
  {
    icon: <Coffee size={24} />,
    title: "Service en Chambre",
    description: "Petit-déjeuner, déjeuner et dîner servis dans le confort de votre chambre.",
  },
  {
    icon: <Tv size={24} />,
    title: "Divertissement",
    description: "TV écran plat avec chaînes internationales et Netflix inclus.",
  },
];

const services = [
  {
    icon: <Bell size={20} />,
    text: "Réveil personnalisé avec thé à la menthe",
  },
  {
    icon: <Clock size={20} />,
    text: "Check-in/out flexible selon vos besoins",
  },
  {
    icon: <Sparkles size={20} />,
    text: "Service de repassage express",
  },
  {
    icon: <Heart size={20} />,
    text: "Attention particulière pour occasions spéciales",
  },
];

export function RoomFeatures() {
  return (
    <div className="py-16">
      {/* Titre */}
      <div className="text-center mb-12">
        <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">
          Confort & Équipements
        </h3>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Tout le confort moderne dans le respect des traditions marocaines
        </p>
      </div>

      {/* Grille des features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-gray-100"
          >
            <div className="text-amber-600 mb-4">{feature.icon}</div>
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              {feature.title}
            </h4>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Services supplémentaires */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-3xl p-8 md:p-12 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              <Sparkles size={28} />
            </div>
            <h4 className="text-2xl font-serif font-bold mb-2">
              Services Additionnels
            </h4>
            <p className="text-amber-100">
              Des petites attentions qui font la différence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  {service.icon}
                </div>
                <span>{service.text}</span>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="text-center mt-8 text-amber-100 text-sm">
            <p>
              Tous nos services sont inclus dans le prix de la chambre.
              Pas de frais cachés.
            </p>
          </div>
        </div>
      </div>

      {/* Garantie */}
      <div className="text-center mt-12">
        <div className="inline-flex items-center space-x-4 bg-amber-50 px-8 py-4 rounded-full">
          <Shield size={24} className="text-amber-600" />
          <div>
            <div className="font-bold text-gray-900">
              Garantie Satisfaction 100%
            </div>
            <div className="text-gray-600 text-sm">
              Si vous n&apos;êtes pas satisfait, nous remboursons votre première nuit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF
echo "  ✓ src/components/RoomFeatures.tsx"

# ServiceList
cat > "src/components/ServiceList.tsx" << 'EOF'
"use client";

import { motion } from "framer-motion";
import { 
  Utensils, Car, Map, Umbrella, Music, Camera,
  Gift, Sparkles, CheckCircle, Clock, Users, Heart
} from "lucide-react";

const services = [
  {
    category: "Restauration",
    items: [
      {
        icon: <Utensils size={24} />,
        title: "Petit-déjeuner Marocain",
        description: "Servi sur la terrasse ou en chambre, avec produits frais locaux.",
        included: true,
      },
      {
        icon: <Utensils size={24} />,
        title: "Dîner aux Chandelles",
        description: "Cuisine traditionnelle préparée par notre chef dans une ambiance romantique.",
        included: false,
        price: "35€/pers",
      },
      {
        icon: <Utensils size={24} />,
        title: "Cours de Cuisine",
        description: "Apprenez les secrets de la cuisine marocaine avec notre chef.",
        included: false,
        price: "60€/pers",
      },
    ],
  },
  {
    category: "Transport",
    items: [
      {
        icon: <Car size={24} />,
        title: "Transfert Aéroport",
        description: "Service privé avec chauffeur francophone.",
        included: false,
        price: "25€/trajet",
      },
      {
        icon: <Car size={24} />,
        title: "Location de Véhicule",
        description: "Voiture avec chauffeur pour vos déplacements dans Marrakech.",
        included: false,
        price: "Sur demande",
      },
    ],
  },
  {
    category: "Activités",
    items: [
      {
        icon: <Map size={24} />,
        title: "Visites Guidées",
        description: "Découverte de la médina et des sites historiques avec guide certifié.",
        included: false,
        price: "45€/pers",
      },
      {
        icon: <Umbrella size={24} />,
        title: "Excursion Atlas",
        description: "Journée complète dans les montagnes de l'Atlas avec déjeuner berbère.",
        included: false,
        price: "85€/pers",
      },
      {
        icon: <Music size={24} />,
        title: "Soirée Gnawa",
        description: "Spectacle de musique traditionnelle marocaine dans le patio.",
        included: true,
      },
    ],
  },
  {
    category: "Sur Mesure",
    items: [
      {
        icon: <Camera size={24} />,
        title: "Séance Photo",
        description: "Photographe professionnel pour immortaliser votre séjour.",
        included: false,
        price: "150€",
      },
      {
        icon: <Gift size={24} />,
        title: "Organisation Événements",
        description: "Mariages, anniversaires, séminaires dans un cadre exceptionnel.",
        included: false,
        price: "Sur devis",
      },
      {
        icon: <Sparkles size={24} />,
        title: "Surprise Romantique",
        description: "Chambre décorée, pétales de rose, champagne...",
        included: false,
        price: "À partir de 75€",
      },
    ],
  },
];

export function ServiceList() {
  return (
    <div className="mb-16">
      {/* Introduction */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Nos Services Détaillés
          </h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une palette complète de services pour personnaliser votre expérience marocaine
          </p>
        </motion.div>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        <div className="flex items-center space-x-2">
          <CheckCircle size={20} className="text-green-500" />
          <span className="text-gray-700">Inclus dans votre séjour</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-full border-2 border-amber-600 flex items-center justify-center">
            <span className="text-amber-600 text-xs font-bold">€</span>
          </div>
          <span className="text-gray-700">Service supplémentaire</span>
        </div>
      </div>

      {/* Grille des services */}
      <div className="space-y-12">
        {services.map((category, categoryIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: categoryIndex * 0.2 }}
          >
            <h4 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              {category.category}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((service, serviceIndex) => (
                <motion.div
                  key={serviceIndex}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (categoryIndex * 0.2) + (serviceIndex * 0.1) }}
                  whileHover={{ y: -5 }}
                  className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all ${
                    service.included ? 'border-l-4 border-green-500' : 'border-l-4 border-amber-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      service.included ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {service.icon}
                    </div>
                    
                    {service.included ? (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle size={18} />
                        <span className="text-sm font-semibold">INCLUS</span>
                      </div>
                    ) : (
                      <div className="text-amber-600 font-bold">
                        {service.price}
                      </div>
                    )}
                  </div>
                  
                  <h5 className="text-lg font-bold text-gray-900 mb-2">
                    {service.title}
                  </h5>
                  <p className="text-gray-600 text-sm">
                    {service.description}
                  </p>
                  
                  {!service.included && (
                    <button className="mt-4 w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-semibold">
                      Réserver ce service
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Informations complémentaires */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                <Clock size={24} />
              </div>
              <h5 className="font-bold mb-2">Disponibilité</h5>
              <p className="text-gray-300 text-sm">
                Tous nos services sont disponibles 24h/24 sur réservation
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                <Users size={24} />
              </div>
              <h5 className="font-bold mb-2">Personnalisation</h5>
              <p className="text-gray-300 text-sm">
                Nous adaptons chaque service à vos besoins spécifiques
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                <Heart size={24} />
              </div>
              <h5 className="font-bold mb-2">Qualité</h5>
              <p className="text-gray-300 text-sm">
                Partenaires triés sur le volet pour une expérience premium
              </p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-amber-200">
              Pour toute demande spéciale ou service sur mesure, contactez notre conciergerie.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
EOF
echo "  ✓ src/components/ServiceList.tsx"

# Gallery
cat > "src/components/Gallery.tsx" << 'EOF'
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Grid3x3, X, ChevronLeft, ChevronRight, 
  Download, Share2, Heart, Filter
} from "lucide-react";

const galleryImages = [
  { id: 1, category: "architecture", title: "Façade Traditionnelle", featured: true },
  { id: 2, category: "chambres", title: "Suite Royale - Salon" },
  { id: 3, category: "jardin", title: "Piscine & Jardin", featured: true },
  { id: 4, category: "restauration", title: "Restaurant aux Chandelles" },
  { id: 5, category: "architecture", title: "Patio avec Fontaine" },
  { id: 6, category: "chambres", title: "Chambre Deluxe" },
  { id: 7, category: "spa", title: "Hammam Traditionnel" },
  { id: 8, category: "jardin", title: "Terrasse Panoramique", featured: true },
  { id: 9, category: "architecture", title: "Détails Zellige" },
  { id: 10, category: "restauration", title: "Petit-déjeuner Marocain" },
  { id: 11, category: "spa", title: "Salle de Massage" },
  { id: 12, category: "chambres", title: "Chambre Standard" },
];

const categories = [
  { id: "all", name: "Toutes les photos" },
  { id: "architecture", name: "Architecture" },
  { id: "chambres", name: "Chambres" },
  { id: "jardin", name: "Jardin & Piscine" },
  { id: "restauration", name: "Restauration" },
  { id: "spa", name: "Spa & Bien-être" },
];

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  const filteredImages = selectedCategory === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  const selectedImageIndex = selectedImage !== null 
    ? filteredImages.findIndex(img => img.id === selectedImage)
    : -1;

  const nextImage = () => {
    if (selectedImageIndex < filteredImages.length - 1) {
      setSelectedImage(filteredImages[selectedImageIndex + 1].id);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImage(filteredImages[selectedImageIndex - 1].id);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  return (
    <div>
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Galerie Complète</h2>
          <p className="text-gray-600">
            {filteredImages.length} photo{filteredImages.length > 1 ? 's' : ''} disponible{filteredImages.length > 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <button className="flex items-center space-x-2 text-amber-600 hover:text-amber-700">
            <Download size={20} />
            <span className="font-semibold">Télécharger tout</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={20} className="text-gray-500" />
          <span className="text-gray-700 font-medium">Filtrer par :</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? "bg-amber-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grille de photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredImages.map((image) => (
          <motion.div
            key={image.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer group ${
              image.featured ? "md:col-span-2 md:row-span-2" : ""
            }`}
            onClick={() => setSelectedImage(image.id)}
          >
            {/* Image placeholder */}
            <div className={`absolute inset-0 ${
              image.category === "architecture" ? "bg-gradient-to-br from-amber-100 to-amber-200" :
              image.category === "chambres" ? "bg-gradient-to-br from-blue-100 to-blue-200" :
              image.category === "jardin" ? "bg-gradient-to-br from-green-100 to-green-200" :
              image.category === "restauration" ? "bg-gradient-to-br from-red-100 to-red-200" :
              "bg-gradient-to-br from-purple-100 to-purple-200"
            }`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {image.category === "architecture" && "🏛️"}
                    {image.category === "chambres" && "🛏️"}
                    {image.category === "jardin" && "🌴"}
                    {image.category === "restauration" && "🍽️"}
                    {image.category === "spa" && "🧖"}
                  </div>
                  <h3 className="font-bold text-gray-800">{image.title}</h3>
                </div>
              </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-wider">
                      {image.category}
                    </div>
                    <h3 className="text-lg font-bold">{image.title}</h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(image.id);
                    }}
                    className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Heart 
                      size={20} 
                      className={favorites.includes(image.id) ? "fill-red-500 text-red-500" : ""}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Badge featured */}
            {image.featured && (
              <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                COUP DE CŒUR
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-4 mt-12">
        <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Précédent
        </button>
        <div className="flex space-x-2">
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`w-10 h-10 rounded-lg ${
                page === 1
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Suivant
        </button>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            {/* Contenu lightbox */}
            <div 
              className="relative max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bouton fermer */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-amber-400 z-10"
              >
                <X size={32} />
              </button>

              {/* Navigation */}
              {selectedImageIndex > 0 && (
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors text-white"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              
              {selectedImageIndex < filteredImages.length - 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors text-white"
                >
                  <ChevronRight size={24} />
                </button>
              )}

              {/* Image */}
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="p-8">
                  <div className="text-center">
                    <div className="text-8xl mb-6">
                      {filteredImages[selectedImageIndex]?.category === "architecture" && "🏛️"}
                      {filteredImages[selectedImageIndex]?.category === "chambres" && "🛏️"}
                      {filteredImages[selectedImageIndex]?.category === "jardin" && "🌴"}
                      {filteredImages[selectedImageIndex]?.category === "restauration" && "🍽️"}
                      {filteredImages[selectedImageIndex]?.category === "spa" && "🧖"}
                    </div>
                    <h3 className="text-3xl font-bold mb-2">
                      {filteredImages[selectedImageIndex]?.title}
                    </h3>
                    <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full mb-6">
                      <Grid3x3 size={18} />
                      <span className="font-semibold">
                        {filteredImages[selectedImageIndex]?.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                      Cette photo montre un aspect caractéristique de notre riad. 
                      La qualité réelle des images est bien supérieure.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 p-6">
                  <div className="flex justify-center space-x-4">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-amber-600">
                      <Download size={20} />
                      <span>Télécharger</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-amber-600">
                      <Share2 size={20} />
                      <span>Partager</span>
                    </button>
                    <button 
                      onClick={() => toggleFavorite(selectedImage)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-amber-600"
                    >
                      <Heart 
                        size={20} 
                        className={favorites.includes(selectedImage) ? "fill-red-500 text-red-500" : ""}
                      />
                      <span>Favori</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Compteur */}
              <div className="text-center text-white mt-4">
                {selectedImageIndex + 1} / {filteredImages.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
EOF
echo "  ✓ src/components/Gallery.tsx"

# ContactForm
cat > "src/components/ContactForm.tsx" << 'EOF'
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Send, Mail, Phone, User, MessageSquare, 
  Calendar, Users, CheckCircle
} from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
    newsletter: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const subjects = [
    { value: "general", label: "Demande générale" },
    { value: "reservation", label: "Réservation" },
    { value: "service", label: "Service particulier" },
    { value: "group", label: "Groupe/Événement" },
    { value: "other", label: "Autre" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Réinitialiser après 5 secondes
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-8 text-white">
        <h3 className="text-2xl font-serif font-bold mb-2">Envoyez-nous un message</h3>
        <p>Notre équipe vous répond dans les 24 heures</p>
      </div>

      {/* Formulaire */}
      <div className="p-8">
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              Message envoyé avec succès !
            </h4>
            <p className="text-gray-600 mb-6">
              Nous vous répondrons dans les plus brefs délais.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-amber-600 hover:text-amber-700 font-semibold"
            >
              Envoyer un nouveau message
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sujet */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sujet de votre message
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {subjects.map((subject) => (
                  <label
                    key={subject.value}
                    className={`cursor-pointer p-3 rounded-lg text-center transition-all ${
                      formData.subject === subject.value
                        ? "bg-amber-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="subject"
                      value={subject.value}
                      checked={formData.subject === subject.value}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className="text-sm font-medium">{subject.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Nom et Prénom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Prénom
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Nom
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="+212 6 XX XX XX XX"
                />
              </div>
            </div>

            {/* Si réservation */}
            {formData.subject === "reservation" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-6 p-6 bg-amber-50 rounded-2xl"
              >
                <h4 className="font-bold text-gray-900">Informations de séjour</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-2" />
                      Arrivée
                    </label>
                    <input
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-2" />
                      Départ
                    </label>
                    <input
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Users size={16} className="inline mr-2" />
                      Voyageurs
                    </label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'personne' : 'personnes'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare size={16} className="inline mr-2" />
                Votre message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Décrivez-nous votre demande..."
              />
            </div>

            {/* Newsletter */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">
                  Recevoir notre newsletter
                </div>
                <p className="text-sm text-gray-600">
                  Offres exclusives, actualités du riad et conseils de voyage.
                </p>
              </div>
            </div>

            {/* Bouton d'envoi */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span className="font-bold text-lg">Envoyer le message</span>
                  </>
                )}
              </button>
            </div>

            {/* Confidentialité */}
            <p className="text-center text-sm text-gray-500">
              Vos informations sont confidentielles et ne seront jamais partagées.
              <br />
              Consultez notre <a href="/politique-confidentialite" className="text-amber-600 hover:underline">politique de confidentialité</a>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
EOF
echo "  ✓ src/components/ContactForm.tsx"

# ContactInfo
cat > "src/components/ContactInfo.tsx" << 'EOF'
import { 
  Phone, Mail, MapPin, Clock, MessageSquare, 
  Globe, CreditCard, Shield
} from "lucide-react";

const contactMethods = [
  {
    icon: <Phone size={24} />,
    title: "Téléphone",
    details: ["+212 5 24 38 94 12", "+212 6 61 23 45 67 (WhatsApp)"],
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: <Mail size={24} />,
    title: "Email",
    details: [
      "reservations@riad-al-andalus.com",
      "contact@riad-al-andalus.com",
      "groups@riad-al-andalus.com",
    ],
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: <MapPin size={24} />,
    title: "Adresse",
    details: [
      "Derb Sidi Bouloukat, nº 123",
      "Médina de Marrakech",
      "40000 Marrakech, Maroc",
    ],
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    icon: <Clock size={24} />,
    title: "Horaires",
    details: [
      "Réception : 24h/24 et 7j/7",
      "Check-in : À partir de 14h",
      "Check-out : Jusqu'à 12h",
    ],
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
];

const emergencyContacts = [
  { label: "Police", number: "19" },
  { label: "Pompiers", number: "15" },
  { label: "Ambulance", number: "15" },
  { label: "Taxi", number: "05 24 44 44 44" },
];

export default function ContactInfo() {
  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-serif font-bold mb-2">Comment nous contacter</h3>
        <p className="text-gray-600">
          Plusieurs moyens pour échanger avec notre équipe
        </p>
      </div>

      {/* Méthodes de contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contactMethods.map((method, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-xl ${method.bgColor} ${method.color}`}>
                {method.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">{method.title}</h4>
                <ul className="space-y-1">
                  {method.details.map((detail, idx) => (
                    <li key={idx} className="text-gray-600">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Urgences */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <MessageSquare size={20} className="text-red-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">Contacts d&apos;urgence</h4>
            <p className="text-sm text-gray-600">À retenir pendant votre séjour</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {emergencyContacts.map((contact, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl text-center hover:shadow-md transition-shadow"
            >
              <div className="text-lg font-bold text-gray-900">{contact.number}</div>
              <div className="text-sm text-gray-600">{contact.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Informations pratiques */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Globe size={20} className="text-amber-600" />
          <div>
            <div className="font-medium">Langues parlées</div>
            <div className="text-sm text-gray-600">
              Français, Anglais, Arabe, Espagnol
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <CreditCard size={20} className="text-amber-600" />
          <div>
            <div className="font-medium">Moyens de paiement</div>
            <div className="text-sm text-gray-600">
              CB, Visa, Mastercard, espèces (€/$/MAD), virement
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Shield size={20} className="text-amber-600" />
          <div>
            <div className="font-medium">Garantie</div>
            <div className="text-sm text-gray-600">
              Réservation sécurisée SSL • Confidentialité garantée
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
        <p className="text-sm text-amber-800">
          <span className="font-bold">Conseil :</span> Pour les réservations urgentes, 
          privilégiez l&apos;appel téléphonique ou WhatsApp. Notre équipe est joignable 
          24h/24 pour répondre à vos questions.
        </p>
      </div>
    </div>
  );
}
EOF
echo "  ✓ src/components/ContactInfo.tsx"

# Création des 8 autres composants manquants rapidement
cat > "src/components/WhatsAppFloat.tsx" << 'EOF'
"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";

export function WhatsAppFloat() {
  const [isHovered, setIsHovered] = useState(false);

  const phoneNumber = "+212661234567";
  const message = "Bonjour, je souhaite avoir des informations sur le riad.";

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group"
      >
        {/* Bouton principal */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-105">
          <MessageCircle size={28} />
        </div>

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 bg-gray-900 text-white px-4 py-2 rounded-lg whitespace-nowrap text-sm font-semibold shadow-xl">
            Contactez-nous sur WhatsApp
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
              <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
}
EOF

cat > "src/components/AboutPreview.tsx" << 'EOF'
"use client";

import { motion } from "framer-motion";
import { Heart, Star, Award, Users } from "lucide-react";
import Link from "next/link";

export function AboutPreview() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-stone-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texte */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-2 text-amber-600 mb-4">
              <Heart size={24} />
              <span className="font-semibold">NOTRE HISTOIRE</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Plus qu&apos;un riad,<br />
              <span className="text-amber-600">une passion familiale</span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Depuis trois générations, notre famille s&apos;attache à préserver 
              l&apos;âme de cette demeure historique tout en y apportant 
              le confort moderne. Chaque détail raconte une histoire, 
              chaque pièce respire l&apos;authenticité marocaine.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { icon: <Star />, value: "15 ans", label: "d&apos;expérience" },
                { icon: <Award />, value: "12", label: "chambres uniques" },
                { icon: <Users />, value: "5000+", label: "clients heureux" },
                { icon: <Heart />, value: "98%", label: "satisfaction" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-amber-600 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <Link
              href="/a-propos"
              className="inline-flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-semibold group"
            >
              <span>Découvrir notre histoire</span>
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </motion.div>

          {/* Image/Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl aspect-[4/3] overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏡</div>
                  <h3 className="text-2xl font-bold text-amber-900">
                    Notre Maison
                  </h3>
                  <p className="text-amber-800">
                    Une histoire de famille depuis 1908
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
EOF

cat > "src/components/Experience.tsx" << 'EOF'
"use client";

import { motion } from "framer-motion";
import { Compass, Moon, Sunrise, Coffee } from "lucide-react";

const experiences = [
  {
    time: "MATIN",
    icon: <Sunrise size={28} />,
    title: "Réveil Marrakchi",
    description: "Petit-déjeuner sur la terrasse avec vue sur les toits de la médina.",
    color: "from-amber-400 to-orange-400",
  },
  {
    time: "APRÈS-MIDI",
    icon: <Compass size={28} />,
    title: "Exploration",
    description: "Visite guidée des souks et monuments historiques avec notre guide.",
    color: "from-blue-400 to-cyan-400",
  },
  {
    time: "SOIRÉE",
    icon: <Coffee size={28} />,
    title: "Détente",
    description: "Thé à la menthe au bord de la piscine avant le dîner aux chandelles.",
    color: "from-purple-400 to-pink-400",
  },
  {
    time: "NUIT",
    icon: <Moon size={28} />,
    title: "Magie Nocturne",
    description: "Nuit paisible dans le silence de la médina endormie.",
    color: "from-indigo-400 to-purple-400",
  },
];

export function Experience() {
  return (
    <section className="py-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Une Journée Typique
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez le rythme enchanteur d&apos;une journée dans notre riad
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {/* Ligne de temps */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-amber-400 via-purple-400 to-indigo-400 hidden md:block"></div>

          {/* Expériences */}
          <div className="space-y-12 md:space-y-0">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.time}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`flex flex-col md:flex-row items-center ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Cercle sur la timeline */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-6 rounded-full bg-white border-4 border-amber-500"></div>
                </div>

                {/* Contenu */}
                <div className={`md:w-5/12 ${
                  index % 2 === 0 ? "md:pr-12" : "md:pl-12"
                }`}>
                  <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${exp.color} text-white`}>
                        {exp.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-500">{exp.time}</div>
                        <h3 className="text-xl font-bold">{exp.title}</h3>
                      </div>
                    </div>
                    <p className="text-gray-600">{exp.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
EOF

cat > "src/components/BookingBanner.tsx" << 'EOF'
"use client";

import { Calendar, Shield, Star } from "lucide-react";
import Link from "next/link";

export function BookingBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Texte */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2">
              Prêt pour l&apos;expérience ?
            </h3>
            <p className="text-amber-100">
              Réservez maintenant et bénéficiez de nos meilleurs tarifs
            </p>
          </div>

          {/* Avantages */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center space-x-2">
              <Calendar size={20} className="text-amber-200" />
              <span className="font-semibold">Annulation gratuite</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield size={20} className="text-amber-200" />
              <span className="font-semibold">Meilleur prix garanti</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star size={20} className="text-amber-200" />
              <span className="font-semibold">Service 5 étoiles</span>
            </div>
          </div>

          {/* Bouton */}
          <Link
            href="/reservations"
            className="bg-white text-amber-600 px-8 py-4 rounded-full font-bold hover:bg-amber-50 transition-colors shadow-lg hover:shadow-xl"
          >
            Réserver maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}
EOF

cat > "src/components/GalleryFilters.tsx" << 'EOF'
"use client";

import { Filter } from "lucide-react";

const categories = [
  { id: "all", name: "Tout voir", count: 48 },
  { id: "architecture", name: "Architecture", count: 12 },
  { id: "chambres", name: "Chambres", count: 15 },
  { id: "jardin", name: "Jardin & Piscine", count: 10 },
  { id: "restauration", name: "Restauration", count: 8 },
  { id: "spa", name: "Spa & Bien-être", count: 3 },
];

export default function GalleryFilters() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-500" />
          <span className="font-semibold">Filtres</span>
        </div>
        <button className="text-amber-600 hover:text-amber-700 text-sm font-semibold">
          Réinitialiser
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors group"
          >
            <span className="font-medium">{category.name}</span>
            <span className="text-gray-500 text-sm bg-white px-2 py-0.5 rounded-full group-hover:bg-gray-50">
              {category.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
EOF

cat > "src/components/FAQ.tsx" << 'EOF'
"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Quels sont les horaires de check-in et check-out ?",
    answer: "Le check-in est possible à partir de 14h et le check-out jusqu'à 12h. Nous pouvons adapter ces horaires sur demande en fonction des disponibilités.",
  },
  {
    question: "Le petit-déjeuner est-il inclus ?",
    answer: "Oui, un délicieux petit-déjeuner marocain traditionnel est inclus pour tous nos clients. Il est servi sur la terrasse ou en chambre selon votre préférence.",
  },
  {
    question: "Proposez-vous le service de navette aéroport ?",
    answer: "Oui, nous proposons un service de transfert privé depuis et vers l'aéroport de Marrakech. Le tarif est de 25€ par trajet. Réservez-le à l'avance pour garantir sa disponibilité.",
  },
  {
    question: "Le riad est-il adapté aux enfants ?",
    answer: "Absolument ! Nous sommes family-friendly et pouvons fournir des lits bébés, chaises hautes, et organiser des activités adaptées aux enfants. La piscine est surveillée.",
  },
  {
    question: "Acceptez-vous les animaux de compagnie ?",
    answer: "Nous acceptons les petits animaux (moins de 10kg) sur demande préalable. Des frais supplémentaires de 15€ par nuit s'appliquent.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="flex items-center space-x-3 mb-8">
        <HelpCircle size={28} className="text-amber-600" />
        <h3 className="text-2xl font-serif font-bold">Questions Fréquentes</h3>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900">{faq.question}</span>
              <ChevronDown
                size={20}
                className={`text-gray-500 transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            
            {openIndex === index && (
              <div className="p-6 pt-0">
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Vous n&apos;avez pas trouvé la réponse à votre question ? 
          <a href="/contact" className="text-amber-600 hover:underline font-semibold ml-1">
            Contactez-nous directement
          </a>
        </p>
      </div>
    </div>
  );
}
EOF

echo "  ✓ Tous les composants créés (22 au total)"

# ============================================================================
# 7. FICHIERS UTILITAIRES ET CONFIGURATION
# ============================================================================

# Types
cat > "src/types/index.ts" << 'EOF'
export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  size: number;
  capacity: number;
  features: string[];
  images: string[];
  amenities: string[];
  category: 'standard' | 'deluxe' | 'suite';
  rating?: number;
  popular?: boolean;
  luxury?: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  included: boolean;
  price?: string;
  category: 'restauration' | 'transport' | 'activités' | 'sur-mesure';
}

export interface GalleryImage {
  id: number;
  title: string;
  category: 'architecture' | 'chambres' | 'jardin' | 'restauration' | 'spa';
  description: string;
  featured?: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  date: string;
  rating: number;
  text: string;
  avatar: string;
  stay: string;
  featured?: boolean;
}

export interface ReservationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  newsletter: boolean;
}

export interface ContactInfo {
  phone: string[];
  email: string[];
  address: string[];
  hours: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface BookingData {
  checkIn: Date;
  checkOut: Date;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  roomType: string;
  promoCode?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  preferences?: {
    newsletter: boolean;
    language: string;
  };
}
EOF
echo "  ✓ src/types/index.ts"

# Utils amélioré
cat > "src/lib/utils.ts" << 'EOF'
/**
 * Formate un prix selon la devise et la locale
 */
export function formatPrice(
  price: number, 
  currency: string = 'EUR', 
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formate une date selon les options
 */
export function formatDate(
  date: Date | string, 
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Intl.DateTimeFormat('fr-FR', { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Calcule le nombre de nuits entre deux dates
 */
export function calculateStayNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calcule le prix total d'un séjour
 */
export function calculateTotalPrice(
  pricePerNight: number, 
  nights: number, 
  guests: number = 1,
  promoCode?: string
): number {
  let total = pricePerNight * nights;
  
  // Supplément pour personne supplémentaire (à partir de la 3ème)
  if (guests > 2) {
    total += (guests - 2) * 20 * nights;
  }
  
  // Réduction pour long séjour
  if (nights >= 7) {
    total *= 0.9; // 10% de réduction
  } else if (nights >= 3) {
    total *= 0.95; // 5% de réduction
  }
  
  // Application code promo
  if (promoCode === "RIAD10") {
    total *= 0.9; // 10% supplémentaire
  } else if (promoCode === "RIAD5") {
    total *= 0.95; // 5% supplémentaire
  }
  
  return Math.round(total);
}

/**
 * Génère un slug URL-friendly
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Validation d'email
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validation de téléphone (international)
 */
export function validatePhone(phone: string): boolean {
  const re = /^[\+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Formate un numéro de téléphone pour l'affichage
 */
export function formatPhone(phone: string, countryCode: string = '+212'): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  if (cleaned.startsWith('0')) {
    return `${countryCode} ${cleaned.substring(1).replace(/(\d{2})(?=\d)/g, '$1 ')}`;
  }
  
  return cleaned.replace(/(\d{2})(?=\d)/g, '$1 ');
}

/**
 * Extrait l'année en cours
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Génère un identifiant unique
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Limite un texte avec ellipse
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Fonction utilitaire pour les classes CSS conditionnelles
 */
export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Convertit une chaîne en camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Débounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Retarde l'exécution d'une fonction
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
EOF
echo "  ✓ src/lib/utils.ts"

# Middleware pour Next.js 15
cat > "src/middleware.ts" << 'EOF'
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirections
  const url = request.nextUrl.clone();
  
  // Redirection du trafic de http vers https en production
  if (process.env.NODE_ENV === 'production') {
    if (request.headers.get('x-forwarded-proto') !== 'https') {
      url.protocol = 'https:';
      return NextResponse.redirect(url);
    }
  }

  // Gestion de la langue (exemple basique)
  const acceptLanguage = request.headers.get('accept-language');
  const pathname = request.nextUrl.pathname;
  
  // Si aucune langue n'est spécifiée dans l'URL et qu'on a une préférence de langue
  if (!pathname.startsWith('/fr') && !pathname.startsWith('/en') && !pathname.startsWith('/es')) {
    if (acceptLanguage?.includes('fr')) {
      url.pathname = `/fr${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  // Headers de sécurité
  const response = NextResponse.next();
  
  // Headers CSP (Content Security Policy)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  
  // Headers CORS
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Headers de cache
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
EOF
echo "  ✓ src/middleware.ts"

# API Contact
cat > "src/app/api/contact/route.ts" << 'EOF'
import { NextResponse } from 'next/server';
import { validateEmail, validatePhone } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validation des champs requis
    const requiredFields = ['firstName', 'email', 'message'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Champs manquants',
          fields: missingFields,
          message: 'Veuillez remplir tous les champs obligatoires'
        },
        { status: 400 }
      );
    }
    
    // Validation de l'email
    if (!validateEmail(body.email)) {
      return NextResponse.json(
        { 
          error: 'Email invalide',
          message: 'Veuillez fournir une adresse email valide'
        },
        { status: 400 }
      );
    }
    
    // Validation du téléphone (si fourni)
    if (body.phone && !validatePhone(body.phone)) {
      return NextResponse.json(
        { 
          error: 'Téléphone invalide',
          message: 'Veuillez fournir un numéro de téléphone valide'
        },
        { status: 400 }
      );
    }
    
    // Ici, vous intégreriez votre service d'email
    // Exemple avec Resend (décommentez et configurez) :
    /*
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'contact@riad-al-andalus.com',
      to: process.env.EMAIL_TO || 'admin@riad-al-andalus.com',
      subject: `Nouveau message de ${body.firstName} ${body.lastName}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${body.firstName} ${body.lastName}</p>
        <p><strong>Email :</strong> ${body.email}</p>
        <p><strong>Téléphone :</strong> ${body.phone || 'Non fourni'}</p>
        <p><strong>Sujet :</strong> ${body.subject || 'Général'}</p>
        <p><strong>Message :</strong></p>
        <p>${body.message}</p>
      `,
    });
    
    // Copie au client
    await resend.emails.send({
      from: 'contact@riad-al-andalus.com',
      to: body.email,
      subject: 'Confirmation de réception - Riad Dar Al Andalus',
      html: `
        <h2>Merci pour votre message !</h2>
        <p>Nous avons bien reçu votre demande et vous répondrons dans les plus brefs délais.</p>
        <p>À très bientôt,</p>
        <p><strong>L'équipe du Riad Dar Al Andalus</strong></p>
      `,
    });
    */
    
    // Simulation de délai pour l'API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Réponse de succès
    return NextResponse.json(
      { 
        success: true,
        message: 'Message envoyé avec succès',
        data: {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          subject: body.subject || 'general'
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Contact API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        message: 'Une erreur est survenue lors de l\'envoi du message'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
EOF
echo "  ✓ src/app/api/contact/route.ts"

# ============================================================================
# 8. FICHIERS DE CONFIGURATION ET ENVIRONNEMENT
# ============================================================================

# .env.example
cat > .env.example << 'EOF'
# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Riad Dar Al Andalus"
NEXT_PUBLIC_APP_DESCRIPTION="Un riad d'exception au cœur de Marrakech"

# API Keys
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id_here

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=contact@riad-al-andalus.com
EMAIL_TO=admin@riad-al-andalus.com
EMAIL_BCC=backup@riad-al-andalus.com

# Database (optionnel - pour futures fonctionnalités)
DATABASE_URL=postgresql://user:password@localhost:5432/riad_db
DIRECT_URL=postgresql://user:password@localhost:5432/riad_db

# Payment (Stripe)
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Analytics
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your_umami_id

# Feature Flags
ENABLE_BOOKING=true
ENABLE_PAYMENTS=false
ENABLE_REVIEWS=true

# Cache
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_jwt_secret_key_here
ENCRYPTION_KEY=your_encryption_key_here

# Services
WEATHER_API_KEY=your_weather_api_key
CURRENCY_API_KEY=your_currency_api_key

# Social Media
FACEBOOK_PAGE_ID=your_facebook_page_id
INSTAGRAM_USERNAME=your_instagram_username
TRIPADVISOR_URL=your_tripadvisor_url
EOF
echo "  ✓ .env.example"

# Fichier globals.css de base
cat > "src/app/globals.css" << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 20 14.3% 4.1%;
    --primary: 24.6 95% 53.1%;
    --primary-foreground: 60 9.1% 97.8%;
    --secondary: 60 4.8% 95.9%;
    --secondary-foreground: 24 9.8% 10%;
    --muted: 60 4.8% 95.9%;
    --muted-foreground: 25 5.3% 44.7%;
    --accent: 60 4.8% 95.9%;
    --accent-foreground: 24 9.8% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 60 9.1% 97.8%;
    --border: 20 5.9% 90%;
    --input: 20 5.9% 90%;
    --ring: 24.6 95% 53.1%;
    --radius: 0.75rem;
  }

  * {
    @apply border-border;
  }

  html {
    @apply scroll-smooth;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    @apply bg-gray-100;
  }

  ::-webkit-scrollbar-thumb {
    @apply bg-amber-500 rounded-full;
  }

  ::-webkit-scrollbar-thumb:hover {
    @apply bg-amber-600;
  }
}

@layer components {
  .container {
    @apply mx-auto px-4 sm:px-6 lg:px-8;
  }

  .btn-primary {
    @apply bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold py-3 px-6 rounded-full 
           hover:from-amber-700 hover:to-amber-800 transition-all duration-300 
           focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply bg-white text-gray-900 font-semibold py-3 px-6 rounded-full 
           hover:bg-gray-50 transition-all duration-300 border border-gray-300
           focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2;
  }

  .card {
    @apply bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 
           border border-gray-100 overflow-hidden;
  }

  .section-padding {
    @apply py-12 md:py-20 lg:py-24;
  }

  .heading-1 {
    @apply text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight;
  }

  .heading-2 {
    @apply text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-tight;
  }

  .heading-3 {
    @apply text-2xl md:text-3xl font-serif font-bold;
  }

  .text-gradient {
    @apply bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent;
  }

  .glass-effect {
    @apply backdrop-blur-md bg-white/80 border border-white/20;
  }

  .gradient-bg {
    @apply bg-gradient-to-br from-amber-50 via-white to-amber-50/30;
  }

  /* Animations */
  .fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }

  .slide-up {
    animation: slideUp 0.5s ease-out;
  }

  .pulse-subtle {
    animation: pulseSubtle 2s infinite;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .line-clamp-3 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulseSubtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    font-size: 12pt;
  }
}
EOF
echo "  ✓ src/app/globals.css"

# ============================================================================
# 9. INSTALLATION DES DÉPENDANCES ET FINALISATION
# ============================================================================

echo ""
echo "📦 Installation des dépendances..."

# Installer les dépendances principales
npm install framer-motion react-hook-form zod react-datepicker swiper lucide-react
npm install -D @types/react-datepicker @tailwindcss/forms

# Mettre à jour package.json pour Next.js 15
npm pkg set scripts.dev="next dev --turbopack"
npm pkg set scripts.build="next build"
npm pkg set scripts.start="next start"
npm pkg set scripts.lint="next lint"
npm pkg set scripts.format="prettier --write ."

# Créer un fichier README.md
cat > README.md << 'EOF'
# Riad Dar Al Andalus - Site Web

Site web moderne pour un riad de luxe à Marrakech, inspiré de riaddarhamid.com.

## 🚀 Fonctionnalités

- 🌐 Site multilingue (prêt pour FR/EN/ES)
- 🏨 Système de réservation en ligne
- 📱 Design responsive
- 🎨 Animations fluides avec Framer Motion
- 📸 Galerie photos interactive
- 📞 Intégration WhatsApp
- 🗺️ Carte interactive
- 📧 Formulaire de contact avec validation
- ⭐ Système d'avis clients
- 🔍 SEO optimisé

## 🏗️ Structure
src/
├── app/(site)/ # Pages principales
│ ├── page.tsx # Accueil
│ ├── chambres/ # Chambres
│ ├── services/ # Services
│ ├── galerie/ # Galerie
│ ├── contact/ # Contact
│ ├── reservations/ # Réservations
│ └── a-propos/ # À propos
├── components/ # Composants React
├── lib/ # Utilitaires
├── types/ # Types TypeScript
└── middleware.ts # Middleware
## 📦 Installation

1. **Cloner le projet**
   ```bash
   git clone [url-du-projet]
   cd riad-dar-al-andalus

🛠️ Technologies
    Framework: Next.js 15 (App Router)

    Langage: TypeScript

    Styling: Tailwind CSS

    Animations: Framer Motion

    Formulaires: React Hook Form + Zod

    Calendrier: React Datepicker

    Carrousel: Swiper

    Icônes: Lucide React

    Validation: Zod