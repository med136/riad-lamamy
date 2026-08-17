"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Heart } from "lucide-react";
import { openCookieBanner } from "@/components/CookieBanner";
import { useLanguage } from "@/components/LanguageProvider";

type SocialLinks = {
  instagram?: string;
  facebook?: string;
  youtube?: string;
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>("Riad Lamamy");
  const [brandTagline, setBrandTagline] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState<string>("contact@riadlamamy.com");
  const [contactPhone, setContactPhone] = useState<string>("+212 5 24 00 00 00");
  const [addressLines, setAddressLines] = useState<string[]>([
    "M\u00E9dina",
    "Marrakech, Maroc",
  ]);
  const [social, setSocial] = useState<SocialLinks>({});

  const quickLinks = useMemo(
    () => [
      { href: "/", label: t("nav.home") },
      { href: "/chambres", label: t("footer.rooms_link") },
      { href: "/services", label: t("nav.services") },
      { href: "/galerie", label: t("nav.gallery") },
      { href: "/a-propos", label: t("nav.about") },
      { href: "/contact", label: t("nav.contact") },
    ],
    [t]
  );

  const legalLinks = useMemo(
    () => [
      { href: "/mentions-legales", label: t("footer.legal_notices") },
      { href: "/politique-confidentialite", label: t("footer.privacy") },
      { href: "/cgu", label: t("footer.terms") },
      { href: "/plan-site", label: t("footer.sitemap") },
    ],
    [t]
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
          data.footer_logo_url ||
          data.footerLogoUrl ||
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
  const hasCustomLogo = Boolean(logoUrl);
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
    <footer className="relative overflow-hidden border-t border-[#c6a15b]/20 bg-[#171713] text-stone-200">
      <div className="pointer-events-none absolute -left-48 -top-64 h-[32rem] w-[32rem] rounded-full bg-[#c6a15b]/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 bg-[radial-gradient(circle,rgba(198,161,91,0.06),transparent_68%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8b66d]/70 to-transparent" />

      <div className="relative container mx-auto px-5 py-10 sm:px-6 lg:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-8">
          <div className="space-y-5 lg:col-span-5 lg:pr-6">
            <Link href="/" className="group inline-flex max-w-full flex-col items-start gap-3">
              <div className="relative h-20 w-44 overflow-hidden rounded-xl border border-white/10 bg-white p-2 shadow-[0_14px_40px_rgba(0,0,0,0.24)] transition-transform duration-300 group-hover:-translate-y-1 sm:h-24 sm:w-52">
                <Image
                  src={logoSrc}
                  alt={brandName}
                  fill
                  sizes="(max-width: 640px) 176px, 208px"
                  className="object-contain p-2"
                />
              </div>
              {!hasCustomLogo && (
                <div className="leading-tight">
                  <p className="font-serif text-xl font-semibold tracking-tight text-white">
                    {brandName}
                  </p>
                  <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.34em] text-[#d8b66d]">
                    Fes
                  </p>
                </div>
              )}
            </Link>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href as string}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-stone-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d8b66d]/50 hover:bg-[#d8b66d] hover:text-[#171713] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8b66d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171713]"
                  >
                    <Icon size={18} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d8b66d]">
              {t("footer.navigation")}
            </p>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-3 text-stone-400 transition-colors hover:text-white"
                  >
                    <span className="h-px w-3 bg-[#d8b66d]/40 transition-all group-hover:w-5 group-hover:bg-[#d8b66d]" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d8b66d]">
              {t("footer.contact")}
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                <MapPin size={17} className="mt-0.5 flex-shrink-0 text-[#d8b66d]" />
                <span className="leading-6 text-stone-400">
                  {addressLines.map((line, idx) => (
                    <span key={idx} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </li>
              <li>
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 text-stone-400 transition-colors hover:border-[#d8b66d]/30 hover:text-white"
                >
                  <Phone size={17} className="flex-shrink-0 text-[#d8b66d]" />
                  {contactPhone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 text-stone-400 transition-colors hover:border-[#d8b66d]/30 hover:text-white"
                >
                  <Mail size={17} className="flex-shrink-0 text-[#d8b66d]" />
                  {contactEmail}
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d8b66d]">
              {t("footer.information")}
            </p>
            <ul className="space-y-2.5 text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={openCookieBanner}
                  className="text-left text-stone-400 transition-colors hover:text-white"
                >
                  {t("footer.manage_cookies")}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/[0.07] bg-black/10 py-4">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center text-xs text-stone-500 sm:text-sm md:flex-row md:text-left">
            <div>
              &copy; {currentYear} {brandName}. {t("footer.all_rights_reserved")}
            </div>

            <div className="flex items-center space-x-2">
              <span>{t("footer.made_with")}</span>
              <Heart size={15} className="fill-[#d8b66d] text-[#d8b66d]" />
              <span>{t("footer.in_city")}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
