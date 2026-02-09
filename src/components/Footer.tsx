import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart,
  Shield,
  CreditCard,
  Award,
} from "lucide-react";
import { openCookieBanner } from "@/components/CookieBanner";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/", label: "Accueil" },
    { href: "/chambres", label: "Nos chambres" },
    { href: "/services", label: "Services" },
    { href: "/galerie", label: "Galerie" },
    { href: "/a-propos", label: "A propos" },
    { href: "/contact", label: "Contact" },
  ];

  const legalLinks = [
    { href: "/mentions-legales", label: "Mentions legales" },
    { href: "/politique-confidentialite", label: "Confidentialite" },
    { href: "/cgu", label: "CGU" },
    { href: "/plan-site", label: "Plan du site" },
  ];

  const certifications = [
    { icon: <Shield size={20} />, text: "Securite maximale" },
    { icon: <CreditCard size={20} />, text: "Paiement securise" },
    { icon: <Award size={20} />, text: "Certifie excellence" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="mb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-white font-serif font-bold text-2xl">RA</span>
              </div>
              <h3 className="text-2xl font-serif font-bold mb-2">
                Riad Dar<span className="text-amber-400">AlAndalus</span>
              </h3>
              <p className="text-gray-400 text-sm">
                Un havre de paix au coeur de la medina de Marrakech.
              </p>
            </div>

            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-full hover:bg-amber-600 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-full hover:bg-amber-600 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-full hover:bg-amber-600 transition-colors"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

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

          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-800">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-amber-400 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  123 Derb Sidi Bouloukat<br />
                  Medina, Marrakech 40000<br />
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

          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-800">
              Newsletter
            </h4>
            <p className="text-gray-400 mb-4">
              Recevez nos offres exclusives et actualites.
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
                S'abonner
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap justify-center items-center gap-8">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-gray-400"
              >
                {cert.icon}
                <span>{cert.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-950 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-500 text-sm">
              &copy; {currentYear} Riad Dar Al Andalus. Tous droits reserves.
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
              <button
                type="button"
                onClick={openCookieBanner}
                className="text-gray-500 hover:text-amber-400 text-sm transition-colors"
              >
                Gerer les cookies
              </button>
            </div>

            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <span>Concu avec</span>
              <Heart size={16} className="text-red-500 fill-red-500" />
              <span>a Marrakech</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
