"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Heart } from "lucide-react";
import { openCookieBanner } from "@/components/CookieBanner";

type SocialLinks = {
  instagram?: string;
  facebook?: string;
  youtube?: string;
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>("Riad Lamamy");
  const [brandTagline, setBrandTagline] = useState<string>(
    "Un havre de paix au c\u0153ur de Marrakech."
  );
  const [contactEmail, setContactEmail] = useState<string>("contact@riadlamamy.com");
  const [contactPhone, setContactPhone] = useState<string>("+212 5 24 00 00 00");
  const [addressLines, setAddressLines] = useState<string[]>([
    "M\u00E9dina",
    "Marrakech, Maroc",
  ]);
  const [social, setSocial] = useState<SocialLinks>({});

  const quickLinks = useMemo(
    () => [
      { href: "/", label: "Accueil" },
      { href: "/chambres", label: "Nos chambres" },
      { href: "/services", label: "Services" },
      { href: "/galerie", label: "Galerie" },
      { href: "/a-propos", label: "A propos" },
      { href: "/contact", label: "Contact" },
    ],
    []
  );

  const legalLinks = useMemo(
    () => [
      { href: "/mentions-legales", label: "Mentions l\u00E9gales" },
      { href: "/politique-confidentialite", label: "Confidentialit\u00E9" },
      { href: "/cgu", label: "CGU" },
      { href: "/plan-site", label: "Plan du site" },
    ],
    []
  );

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/public/settings", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();

        const nextBrandName =
          data.logo_text ||
          data.logoText ||
          data.site_title ||
          data.siteName ||
          data.site_name ||
          null;
        if (typeof nextBrandName === "string" && nextBrandName.trim()) {
          setBrandName(nextBrandName.trim());
        }

        const nextTagline =
          data.site_tagline ||
          data.siteTagline ||
          data.tagline ||
          data.site_tag_line ||
          null;
        if (typeof nextTagline === "string" && nextTagline.trim()) {
          setBrandTagline(nextTagline.trim());
        }

        const nextLogo =
          data.logo_preview_url ||
          data.site_logo ||
          data.logo ||
          data.logoPreviewUrl ||
          null;
        if (typeof nextLogo === "string" && nextLogo.trim()) {
          setLogoUrl(nextLogo.trim());
        }

        const nextEmail = data.contact_email || data.support_email || null;
        if (typeof nextEmail === "string" && nextEmail.trim()) {
          setContactEmail(nextEmail.trim());
        }

        const nextPhone = data.contact_phone || data.whatsapp_phone || null;
        if (typeof nextPhone === "string" && nextPhone.trim()) {
          setContactPhone(nextPhone.trim());
        }

        const parts: string[] = [];
        const line1 = data.address_line_1;
        const line2 = data.address_line_2;
        const city = data.address_city;
        const postal = data.address_postal_code;
        const country = data.address_country;

        if (typeof line1 === "string" && line1.trim()) parts.push(line1.trim());
        if (typeof line2 === "string" && line2.trim()) parts.push(line2.trim());

        const locality = [postal, city]
          .filter((v: unknown) => typeof v === "string" && v.trim())
          .map((v: unknown) => String(v).trim())
          .join(" ");
        if (locality) parts.push(locality);

        if (typeof country === "string" && country.trim()) parts.push(country.trim());
        if (parts.length) setAddressLines(parts);

        const instagram = data.social_instagram;
        const facebook = data.social_facebook;
        const youtube = data.social_youtube;
        setSocial({
          instagram: typeof instagram === "string" ? instagram.trim() : undefined,
          facebook: typeof facebook === "string" ? facebook.trim() : undefined,
          youtube: typeof youtube === "string" ? youtube.trim() : undefined,
        });
      } catch {
        // ignore
      }
    };

    fetchSettings();
  }, []);

  const logoSrc = logoUrl || "/logo.svg";
  const isDefaultLogo = logoSrc === "/logo.svg";

  const socialLinks = useMemo(
    () =>
      [
        { href: social.instagram, label: "Instagram", Icon: Instagram },
        { href: social.facebook, label: "Facebook", Icon: Facebook },
        { href: social.youtube, label: "YouTube", Icon: Youtube },
      ].filter((item) => Boolean(item.href)),
    [social.facebook, social.instagram, social.youtube]
  );

  return (
    <footer className="relative border-t border-amber-200/40 bg-white/40 text-gray-900 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(217,119,6,0.10),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/35 to-transparent" />

      <div className="relative container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-amber-200/60 bg-white/70 shadow-sm">
                <Image
                  src={logoSrc}
                  alt={brandName}
                  fill
                  sizes="48px"
                  className={`object-contain p-2 ${isDefaultLogo ? "brightness-0" : ""}`}
                />
              </div>
              <div className="leading-tight">
                <p className="font-serif text-xl font-semibold tracking-tight text-gray-900">
                  {brandName}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-700/80">
                  Marrakech
                </p>
              </div>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-gray-700">
              {brandTagline}
            </p>

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href as string}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/60 bg-white/70 text-amber-900 shadow-sm transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2"
                  >
                    <Icon size={18} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="lux-kicker mb-6 pb-2 border-b border-amber-200/50">
              Navigation
            </p>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-3 text-gray-700 transition-colors hover:text-amber-900"
                  >
                    <span className="h-[2px] w-2 rounded-full bg-amber-700/25" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="lux-kicker mb-6 pb-2 border-b border-amber-200/50">
              Contact
            </p>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-amber-700/70" />
                <span className="text-gray-700">
                  {addressLines.map((line, idx) => (
                    <span key={idx} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="flex-shrink-0 text-amber-700/70" />
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                  className="text-gray-700 transition-colors hover:text-amber-900"
                >
                  {contactPhone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="flex-shrink-0 text-amber-700/70" />
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-gray-700 transition-colors hover:text-amber-900"
                >
                  {contactEmail}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="lux-kicker mb-6 pb-2 border-b border-amber-200/50">
              Informations
            </p>
            <ul className="space-y-3 text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-700 transition-colors hover:text-amber-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={openCookieBanner}
                  className="text-gray-700 transition-colors hover:text-amber-900"
                >
                  G\u00E9rer les cookies
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-amber-200/40 bg-white/30 py-7">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-600 md:flex-row">
            <div>
              &copy; {currentYear} {brandName}. {"Tous droits r\u00E9serv\u00E9s."}
            </div>

            <div className="flex items-center space-x-2">
              <span>{"Con\u00E7u avec"}</span>
              <Heart size={16} className="fill-rose-400 text-rose-400" />
              <span>{"\u00E0 Marrakech"}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
