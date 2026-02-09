"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Globe, Menu, Phone, X } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  submenu?: { href: string; label: string }[];
};

const navItems: NavItem[] = [
  { href: "/", label: "Accueil" },
  {
    href: "/chambres",
    label: "Chambres",
    submenu: [
      { href: "/chambres#standard", label: "Chambre Standard" },
      { href: "/chambres#deluxe", label: "Chambre Deluxe" },
      { href: "/chambres#suite", label: "Suite Royale" },
    ],
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
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>("Riad Lamamy");
  const [brandTagline, setBrandTagline] = useState<string>("");

  const languageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

        const url =
          data.logo_preview_url ||
          data.site_logo ||
          data.logo ||
          data.logoPreviewUrl ||
          data.admin_logo_url ||
          null;
        if (url) setLogoUrl(url);
      } catch {
        // ignore
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setLanguageOpen(false);
    setActiveSubmenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!languageOpen) return;

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (languageRef.current && !languageRef.current.contains(target)) {
        setLanguageOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [languageOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      setLanguageOpen(false);
      setActiveSubmenu(null);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const normalizeHref = (href: string) => href.split("#")[0] || href;

  const isActive = (href: string) => {
    const normalized = normalizeHref(href);
    if (normalized === "/") return pathname === normalized;
    return pathname?.startsWith(normalized || "") || false;
  };

  const logoSrc = logoUrl || "/logo.svg";
  const isDefaultLogo = logoSrc === "/logo.svg";

  return (
    <>
      <header className="sticky top-0 z-50">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-lg focus:ring-2 focus:ring-amber-400"
        >
          Aller au contenu
        </a>

        <nav
          className={`relative transition-all duration-300 ${
            scrolled
              ? "bg-white/75 backdrop-blur-xl shadow-[0_12px_40px_-28px_rgba(120,87,71,0.9)]"
              : "bg-white/55 backdrop-blur-md"
          }`}
          aria-label="Navigation principale"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
          <div className="border-b border-amber-200/40">
            <div className={`container ${scrolled ? "py-3" : "py-4"}`}>
              <div className="flex items-center justify-between gap-4">
                {/* Left: Logo */}
                <div className="flex items-center">
                  <Link
                    href="/"
                    aria-label={brandName}
                    className="group inline-flex items-center gap-3 rounded-2xl px-1 py-1 transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2"
                  >
                    <div className="relative h-11 w-11 overflow-hidden">
                      <Image
                        src={logoSrc}
                        alt=""
                        fill
                        sizes="44px"
                        className={`object-contain object-left p-2 ${
                          isDefaultLogo ? "brightness-0" : ""
                        }`}
                        priority
                      />
                    </div>
                    <div className="min-w-0 leading-tight">
                      <p className="truncate font-serif text-sm font-bold tracking-tight text-gray-900 sm:text-base md:text-lg">
                        {brandName}
                      </p>
                      {brandTagline ? (
                        <p className="hidden md:block truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-700/80">
                          {brandTagline}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </div>

                {/* Center: Navigation links */}
                <div className="hidden lg:flex flex-1 justify-center">
                  <ul className="flex items-center gap-1 rounded-full border border-amber-200/50 bg-white/70 px-2 py-1 shadow-sm backdrop-blur">
                    {navItems.map((item) => {
                      const active = isActive(item.href);
                      const open = activeSubmenu === item.href;
                      return (
                        <li
                          key={item.href}
                          className="relative"
                          onMouseEnter={() =>
                            item.submenu && setActiveSubmenu(item.href)
                          }
                          onMouseLeave={() => item.submenu && setActiveSubmenu(null)}
                          onFocusCapture={() =>
                            item.submenu && setActiveSubmenu(item.href)
                          }
                          onBlurCapture={(event) => {
                            if (!item.submenu) return;
                            const next = event.relatedTarget as Node | null;
                            if (next && event.currentTarget.contains(next)) return;
                            setActiveSubmenu(null);
                          }}
                        >
                          <Link
                            href={item.href}
                            className={`group relative inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 ${
                              active
                                ? "text-amber-900"
                                : "text-gray-700 hover:text-amber-900"
                            }`}
                            aria-haspopup={item.submenu ? true : undefined}
                            aria-expanded={item.submenu ? open : undefined}
                          >
                            <span>{item.label}</span>
                            {item.submenu && (
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${
                                  open ? "rotate-180" : ""
                                }`}
                                aria-hidden="true"
                              />
                            )}
                            <span
                              className={`pointer-events-none absolute inset-x-2 -bottom-0.5 h-px rounded-full bg-gradient-to-r from-transparent via-amber-700/70 to-transparent transition-opacity ${
                                active
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-70"
                              }`}
                              aria-hidden="true"
                            />
                          </Link>

                          {item.submenu && open && (
                            <div
                              className="absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2 rounded-2xl border border-amber-100/70 bg-white/90 p-2 shadow-2xl shadow-black/10 backdrop-blur"
                            >
                              <div className="px-3 pb-2 pt-1">
                                <p className="lux-kicker">{item.label}</p>
                              </div>
                              {item.submenu.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-amber-50/70 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2"
                                >
                                  <span>{subItem.label}</span>
                                  <span className="text-amber-700/60" aria-hidden="true">
                                    ↗
                                  </span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2">
                  {/* Language switcher */}
                  <div ref={languageRef} className="relative hidden md:flex items-center">
                    <button
                      type="button"
                      onClick={() => setLanguageOpen((v) => !v)}
                      className="inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-white/80 px-3 py-2 text-sm font-medium text-gray-800 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2"
                      aria-haspopup={true}
                      aria-expanded={languageOpen}
                    >
                      <Globe size={16} aria-hidden="true" />
                      <span>FR</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          languageOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {languageOpen && (
                      <div
                        className="absolute right-0 top-full z-50 mt-3 w-36 overflow-hidden rounded-2xl border border-amber-100/70 bg-white/90 p-1 shadow-2xl shadow-black/10 backdrop-blur"
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-amber-50/70 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2"
                            onClick={() => setLanguageOpen(false)}
                          >
                            <span>{lang.label}</span>
                            <span
                              className={`text-xs ${
                                lang.code === "fr" ? "text-amber-700" : "text-gray-400"
                              }`}
                            >
                              {lang.code === "fr" ? "Actuel" : ""}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Primary CTA */}
                  <Link
                    href="/reservations"
                    className="btn-primary hidden gap-2 px-5 py-2.5 text-sm shadow-sm sm:inline-flex"
                  >
                    <Phone size={16} aria-hidden="true" />
                    <span>Réserver</span>
                  </Link>

                  {/* Mobile menu button */}
                  <button
                    type="button"
                    className="lg:hidden inline-flex items-center justify-center rounded-full border border-amber-200/60 bg-white/80 p-2 text-gray-800 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2"
                    onClick={() => setIsOpen((v) => !v)}
                    aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
                    aria-expanded={isOpen}
                  >
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-white shadow-2xl">
            <div className="border-b border-amber-100/70 bg-white/90 px-5 py-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 rounded-2xl px-1 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-amber-200/60 bg-white shadow-sm">
                    <Image
                      src={logoSrc}
                      alt=""
                      fill
                      sizes="40px"
                      className={`object-contain object-left p-2 ${
                        isDefaultLogo ? "brightness-0" : ""
                      }`}
                    />
                  </div>
                  <div className="leading-tight">
                    <p className="font-serif text-base font-bold tracking-tight text-gray-900">
                      {brandName}
                    </p>
                    {brandTagline ? (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-700/80">
                        {brandTagline}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">Navigation</p>
                    )}
                  </div>
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-amber-200/60 bg-white p-2 text-gray-800 shadow-sm transition hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fermer"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="px-5 py-5">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <div
                    key={item.href}
                    className="rounded-2xl border border-gray-100 bg-white"
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive(item.href)
                          ? "bg-amber-50/70 text-amber-900"
                          : "text-gray-800 hover:bg-amber-50/50"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{item.label}</span>
                      {item.submenu && (
                        <ChevronDown
                          size={16}
                          className="text-amber-700/60"
                          aria-hidden="true"
                        />
                      )}
                    </Link>

                    {item.submenu && (
                      <div className="px-2 pb-2">
                        <div className="ml-2 mt-1 space-y-1 border-l border-amber-200/50 pl-3">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className="block rounded-xl px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-amber-50/70 hover:text-amber-900"
                              onClick={() => setIsOpen(false)}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Langue</p>
                  <p className="text-xs font-medium text-amber-700">FR</p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                        lang.code === "fr"
                          ? "border-amber-300 bg-amber-50/80 text-amber-900"
                          : "border-gray-200 text-gray-700 hover:border-amber-200 hover:bg-amber-50/50"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                href="/reservations"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition hover:bg-primary/95"
                onClick={() => setIsOpen(false)}
              >
                <Phone size={16} aria-hidden="true" />
                Réserver maintenant
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
