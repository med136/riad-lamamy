"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Globe,
  Menu,
  Phone,
  X,
} from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";
import type { Language, MessageKey } from "@/lib/i18n";

type NavItem = {
  href: string;
  labelKey: MessageKey;
  submenu?: {
    href: string;
    label: string;
  }[];
};

type MenuRoom = {
  id: string;
  name: string;
};

const languages: {
  code: Language;
  label: string;
}[] = [
  {
    code: "fr",
    label: "FR",
  },
  {
    code: "en",
    label: "EN",
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>("Riad Lamamy");
  const [brandTagline, setBrandTagline] = useState<string>("");

  const [hasWideLogo, setHasWideLogo] = useState(false);
  const [menuRooms, setMenuRooms] = useState<MenuRoom[]>([]);

  const languageRef = useRef<HTMLDivElement | null>(null);

  /* =========================================================
     HEADER SCROLL STATE
     ========================================================= */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================================
     PUBLIC SETTINGS
     ========================================================= */

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/public/settings", {
          cache: "no-store",
        });

        if (!res.ok) {
          return;
        }

        const data = await res.json();

        const nextBrandName =
          data.logo_text ||
          data.logoText ||
          data.site_title ||
          data.siteName ||
          data.site_name ||
          null;

        if (
          typeof nextBrandName === "string" &&
          nextBrandName.trim()
        ) {
          setBrandName(nextBrandName.trim());
        }

        const nextTagline =
          data.site_tagline ||
          data.siteTagline ||
          data.tagline ||
          data.site_tag_line ||
          null;

        if (
          typeof nextTagline === "string" &&
          nextTagline.trim()
        ) {
          setBrandTagline(nextTagline.trim());
        }

        const url =
          data.logo_preview_url ||
          data.site_logo ||
          data.logo ||
          data.logoPreviewUrl ||
          data.admin_logo_url ||
          null;

        if (url) {
          setLogoUrl(url);
        }
      } catch {
        // Public settings are optional.
      }
    };

    fetchSettings();
  }, []);

  /* =========================================================
     ROOM MENU
     ========================================================= */

  useEffect(() => {
    const fetchMenuRooms = async () => {
      try {
        const response = await fetch("/api/rooms/menu", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          rooms?: MenuRoom[];
        };

        setMenuRooms(
          Array.isArray(payload.rooms)
            ? payload.rooms
            : [],
        );
      } catch {
        setMenuRooms([]);
      }
    };

    fetchMenuRooms();
  }, []);

  /* =========================================================
     NAVIGATION ITEMS
     ========================================================= */

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        href: "/",
        labelKey: "nav.home",
      },
      {
        href: "/chambres",
        labelKey: "nav.rooms",
        submenu: menuRooms.length
          ? menuRooms.map((room) => ({
              href: `/chambres?room=${encodeURIComponent(
                room.id,
              )}#nos-chambres`,
              label: room.name,
            }))
          : undefined,
      },
      {
        href: "/services",
        labelKey: "nav.services",
      },
      {
        href: "/galerie",
        labelKey: "nav.gallery",
      },
      {
        href: "/a-propos",
        labelKey: "nav.about",
      },
      {
        href: "/contact",
        labelKey: "nav.contact",
      },
    ],
    [menuRooms],
  );

  /* =========================================================
     MOBILE BODY LOCK
     ========================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  /* =========================================================
     LANGUAGE DROPDOWN — OUTSIDE CLICK
     ========================================================= */

  useEffect(() => {
    if (!languageOpen) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;

      if (!target) {
        return;
      }

      if (
        languageRef.current &&
        !languageRef.current.contains(target)
      ) {
        setLanguageOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      onMouseDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        onMouseDown,
      );
    };
  }, [languageOpen]);

  /* =========================================================
     ESCAPE
     ========================================================= */

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setIsOpen(false);
      setLanguageOpen(false);
      setActiveSubmenu(null);
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        onKeyDown,
      );
    };
  }, []);

  /* =========================================================
     ACTIVE ROUTE
     ========================================================= */

  const normalizeHref = (href: string) =>
    href.split("#")[0] || href;

  const isActive = (href: string) => {
    const normalized = normalizeHref(href);

    if (normalized === "/") {
      return pathname === normalized;
    }

    return (
      pathname?.startsWith(normalized || "") ||
      false
    );
  };

  /* =========================================================
     LOGO
     ========================================================= */

  const logoSrc =
    logoUrl || "/logo-transparent.png";

  const isDefaultLogo =
    logoSrc === "/logo.svg";

  const detectWideLogo = (
    image: HTMLImageElement,
  ) => {
    setHasWideLogo(
      !isDefaultLogo &&
        image.naturalWidth >=
          image.naturalHeight * 2,
    );
  };

  return (
    <>
      {/* =====================================================
          DESKTOP / TABLET HEADER
          ===================================================== */}

      <header className="sticky top-0 z-50">
        {/* Skip link */}

        <a
          href="#main-content"
          className="
            sr-only
            focus:not-sr-only
            focus:fixed
            focus:left-4
            focus:top-4
            focus:z-[70]
            focus:rounded-full
            focus:bg-white
            focus:px-4
            focus:py-2
            focus:text-sm
            focus:font-semibold
            focus:text-gray-900
            focus:shadow-lg
            focus:ring-2
            focus:ring-amber-400
          "
        >
          {t("nav.skip_to_content")}
        </a>

         <nav
    className={`
      relative
      bg-[#FFFDF8]
      transition-shadow
      duration-300
      ease-out
      ${
        scrolled
          ? "shadow-[0_8px_30px_-20px_rgba(35,20,12,0.32)]"
          : "shadow-none"
      }
    `}
    aria-label={t("nav.main_navigation")}
  >
          {/* Top decorative line */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-amber-400/40
              to-transparent
            "
          />

          <div className="border-b border-amber-200/40">
            <div
              className={`
                site-container
                transition-[padding]
                duration-300
                ${
                  scrolled
                    ? "py-2"
                    : "py-3"
                }
              `}
            >
              <div className="flex items-center justify-between gap-4">
                {/* =================================================
                    LOGO
                    ================================================= */}

                <div className="flex shrink-0 items-center">
                  <Link
                    href="/"
                    aria-label={brandName}
                    className="
                      group
                      inline-flex
                      items-center
                      gap-3
                      rounded-2xl
                      px-1
                      py-1
                      transition-colors
                      hover:bg-white/40
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-amber-400/60
                      focus-visible:ring-offset-2
                    "
                  >
                    <div
                      className={`
                        relative
                        overflow-hidden
                        transition-[width,height]
                        duration-300
                        ${
                          hasWideLogo
                            ? "h-14 w-48"
                            : "h-12 w-12"
                        }
                      `}
                    >
                      <Image
                        src={logoSrc}
                        alt=""
                        fill
                        sizes={
                          hasWideLogo
                            ? "192px"
                            : "48px"
                        }
                        onLoad={(event) =>
                          detectWideLogo(
                            event.currentTarget,
                          )
                        }
                        className={`
                          object-contain
                          object-left
                          ${
                            hasWideLogo
                              ? ""
                              : "p-1"
                          }
                          ${
                            isDefaultLogo
                              ? "brightness-0"
                              : ""
                          }
                        `}
                        priority
                      />
                    </div>

                    {!hasWideLogo && (
                      <div className="min-w-0 leading-tight">
                        <p
                          className="
                            truncate
                            font-serif
                            text-sm
                            font-bold
                            tracking-tight
                            text-gray-900
                            sm:text-base
                            md:text-lg
                          "
                        >
                          {brandName}
                        </p>

                        {brandTagline ? (
                          <p
                            className="
                              hidden
                              truncate
                              text-[11px]
                              font-semibold
                              uppercase
                              tracking-[0.28em]
                              text-amber-700/80
                              md:block
                            "
                          >
                            {brandTagline}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </Link>
                </div>

                {/* =================================================
                    CENTER NAVIGATION
                    ================================================= */}

                <div className="hidden flex-1 justify-center lg:flex">
                  <ul className="flex items-center gap-1 px-2 py-1">
                    {navItems.map((item) => {
                      const active =
                        isActive(item.href);

                      const open =
                        activeSubmenu ===
                        item.href;

                      return (
                        <li
                          key={item.href}
                          className="relative"
                          onMouseEnter={() => {
                            if (
                              item.submenu
                            ) {
                              setActiveSubmenu(
                                item.href,
                              );
                            }
                          }}
                          onMouseLeave={() => {
                            if (
                              item.submenu
                            ) {
                              setActiveSubmenu(
                                null,
                              );
                            }
                          }}
                          onFocusCapture={() => {
                            if (
                              item.submenu
                            ) {
                              setActiveSubmenu(
                                item.href,
                              );
                            }
                          }}
                          onBlurCapture={(
                            event,
                          ) => {
                            if (
                              !item.submenu
                            ) {
                              return;
                            }

                            const next =
                              event.relatedTarget as Node | null;

                            if (
                              next &&
                              event.currentTarget.contains(
                                next,
                              )
                            ) {
                              return;
                            }

                            setActiveSubmenu(
                              null,
                            );
                          }}
                        >
                          <Link
                            href={item.href}
                            className={`
                              group
                              relative
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              px-3
                              py-2
                              text-sm
                              font-medium
                              transition-colors
                              focus-visible:outline-none
                              focus-visible:ring-2
                              focus-visible:ring-amber-400/60
                              focus-visible:ring-offset-2
                              ${
                                active
                                  ? "text-amber-900"
                                  : "text-gray-700 hover:text-amber-900"
                              }
                            `}
                            aria-haspopup={
                              item.submenu
                                ? true
                                : undefined
                            }
                            aria-expanded={
                              item.submenu
                                ? open
                                : undefined
                            }
                          >
                            <span>
                              {t(
                                item.labelKey,
                              )}
                            </span>

                            {item.submenu && (
                              <ChevronDown
                                size={14}
                                strokeWidth={
                                  1.8
                                }
                                className={`
                                  transition-transform
                                  duration-200
                                  ${
                                    open
                                      ? "rotate-180"
                                      : ""
                                  }
                                `}
                                aria-hidden="true"
                              />
                            )}

                            <span
                              className={`
                                pointer-events-none
                                absolute
                                inset-x-2
                                -bottom-0.5
                                h-px
                                rounded-full
                                bg-gradient-to-r
                                from-transparent
                                via-amber-700/70
                                to-transparent
                                transition-opacity
                                ${
                                  active
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-70"
                                }
                              `}
                              aria-hidden="true"
                            />
                          </Link>

                          {/* Submenu */}

                          {item.submenu &&
                            open && (
                              <div
                                className="
                                  absolute
                                  left-1/2
                                  top-full
                                  z-50
                                  w-64
                                  -translate-x-1/2
                                  pt-3
                                "
                              >
                                <div
                                  className="
                                    rounded-2xl
                                    border
                                    border-amber-100/70
                                    bg-white/95
                                    p-2
                                    shadow-2xl
                                    shadow-black/10
                                    backdrop-blur
                                  "
                                >
                                  <div className="px-3 pb-2 pt-1">
                                    <p className="lux-kicker">
                                      {t(
                                        item.labelKey,
                                      )}
                                    </p>
                                  </div>

                                  {item.submenu.map(
                                    (
                                      subItem,
                                    ) => (
                                      <Link
                                        key={
                                          subItem.href
                                        }
                                        href={
                                          subItem.href
                                        }
                                        onClick={() =>
                                          setActiveSubmenu(
                                            null,
                                          )
                                        }
                                        className="
                                          flex
                                          items-center
                                          justify-between
                                          rounded-xl
                                          px-3
                                          py-2
                                          text-sm
                                          text-gray-700
                                          transition-colors
                                          hover:bg-amber-50/70
                                          hover:text-amber-900
                                          focus-visible:outline-none
                                          focus-visible:ring-2
                                          focus-visible:ring-amber-400/60
                                          focus-visible:ring-offset-2
                                        "
                                      >
                                        <span>
                                          {
                                            subItem.label
                                          }
                                        </span>

                                        <span
                                          className="text-amber-700/60"
                                          aria-hidden="true"
                                        >
                                          ↗
                                        </span>
                                      </Link>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* =================================================
                    RIGHT ACTIONS
                    ================================================= */}

                <div className="flex shrink-0 items-center justify-end gap-2">
                  {/* Language */}

                  <div
                    ref={languageRef}
                    className="relative hidden items-center md:flex"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setLanguageOpen(
                          (value) => !value,
                        )
                      }
                      className="
                        inline-flex
                        h-[46px]
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-amber-200/60
                        bg-white/80
                        px-4
                        text-sm
                        font-medium
                        text-gray-800
                        shadow-sm
                        backdrop-blur
                        transition
                        duration-200
                        hover:border-amber-300/60
                        hover:bg-white
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-amber-400/60
                        focus-visible:ring-offset-2
                      "
                      aria-haspopup="menu"
                      aria-expanded={
                        languageOpen
                      }
                    >
                      <Globe
                        size={17}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />

                      <span>
                        {language.toUpperCase()}
                      </span>

                      <ChevronDown
                        size={14}
                        strokeWidth={1.8}
                        className={`
                          transition-transform
                          duration-200
                          ${
                            languageOpen
                              ? "rotate-180"
                              : ""
                          }
                        `}
                        aria-hidden="true"
                      />
                    </button>

                    {languageOpen && (
                      <div
                        className="
                          absolute
                          right-0
                          top-full
                          z-50
                          mt-3
                          w-36
                          overflow-hidden
                          rounded-2xl
                          border
                          border-amber-100/70
                          bg-white/95
                          p-1
                          shadow-2xl
                          shadow-black/10
                          backdrop-blur
                        "
                        role="menu"
                      >
                        {languages.map(
                          (lang) => (
                            <button
                              key={
                                lang.code
                              }
                              type="button"
                              role="menuitem"
                              className="
                                flex
                                w-full
                                items-center
                                justify-between
                                rounded-xl
                                px-3
                                py-2
                                text-left
                                text-sm
                                font-medium
                                text-gray-700
                                transition-colors
                                hover:bg-amber-50/70
                                hover:text-amber-900
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-amber-400/60
                                focus-visible:ring-offset-2
                              "
                              onClick={() => {
                                setLanguage(
                                  lang.code,
                                );
                                setLanguageOpen(
                                  false,
                                );
                              }}
                            >
                              <span>
                                {lang.label}
                              </span>

                              <span
                                className={`
                                  text-xs
                                  ${
                                    lang.code ===
                                    language
                                      ? "text-amber-700"
                                      : "text-gray-400"
                                  }
                                `}
                              >
                                {lang.code ===
                                language
                                  ? t(
                                      "nav.current",
                                    )
                                  : ""}
                              </span>
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* Booking CTA */}

                  <Link
                    href="/reservations"
                    className="btn-zellige-green hidden sm:inline-flex border border-[#C89D4A]"
                  >
                    <Phone
                      size={18}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />

                    <span>
                      {t("nav.book")}
                    </span>
                  </Link>

                  {/* Mobile button */}

                  <button
                    type="button"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-amber-200/60
                      bg-white/80
                      p-2
                      text-gray-800
                      shadow-sm
                      backdrop-blur
                      transition
                      hover:bg-white
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-amber-400/60
                      focus-visible:ring-offset-2
                      lg:hidden
                    "
                    onClick={() =>
                      setIsOpen(
                        (value) => !value,
                      )
                    }
                    aria-label={
                      isOpen
                        ? t(
                            "nav.close_menu",
                          )
                        : t(
                            "nav.open_menu",
                          )
                    }
                    aria-expanded={
                      isOpen
                    }
                  >
                    {isOpen ? (
                      <X size={22} />
                    ) : (
                      <Menu size={22} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* =====================================================
          MOBILE MENU
          ===================================================== */}

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Overlay */}

          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() =>
              setIsOpen(false)
            }
          />

          {/* Panel */}

          <div
            className="
              absolute
              right-0
              top-0
              h-full
              w-full
              max-w-sm
              overflow-y-auto
              bg-white
              shadow-2xl
            "
          >
            {/* Mobile header */}

            <div
              className="
                border-b
                border-amber-100/70
                bg-white/95
                px-5
                py-4
                backdrop-blur
              "
            >
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="
                    inline-flex
                    items-center
                    gap-3
                    rounded-2xl
                    px-1
                    py-1
                  "
                  onClick={() =>
                    setIsOpen(false)
                  }
                >
                  <div
                    className={`
                      relative
                      overflow-hidden
                      ${
                        hasWideLogo
                          ? "h-12 w-40"
                          : "h-11 w-11"
                      }
                    `}
                  >
                    <Image
                      src={logoSrc}
                      alt=""
                      fill
                      sizes={
                        hasWideLogo
                          ? "160px"
                          : "44px"
                      }
                      onLoad={(event) =>
                        detectWideLogo(
                          event.currentTarget,
                        )
                      }
                      className={`
                        object-contain
                        object-left
                        ${
                          hasWideLogo
                            ? ""
                            : "p-1"
                        }
                        ${
                          isDefaultLogo
                            ? "brightness-0"
                            : ""
                        }
                      `}
                    />
                  </div>

                  {!hasWideLogo && (
                    <div className="leading-tight">
                      <p
                        className="
                          font-serif
                          text-base
                          font-bold
                          tracking-tight
                          text-gray-900
                        "
                      >
                        {brandName}
                      </p>

                      {brandTagline ? (
                        <p
                          className="
                            text-[11px]
                            font-semibold
                            uppercase
                            tracking-[0.26em]
                            text-amber-700/80
                          "
                        >
                          {brandTagline}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {t(
                            "nav.navigation",
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </Link>

                <button
                  type="button"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-amber-200/60
                    bg-white
                    p-2
                    text-gray-800
                    shadow-sm
                    transition
                    hover:bg-amber-50
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-amber-400/60
                    focus-visible:ring-offset-2
                  "
                  onClick={() =>
                    setIsOpen(false)
                  }
                  aria-label={t(
                    "nav.close",
                  )}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Mobile content */}

            <div className="px-5 py-5">
              {/* Navigation */}

              <div className="space-y-1">
                {navItems.map(
                  (item) => (
                    <div
                      key={
                        item.href
                      }
                      className="
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                      "
                    >
                      <Link
                        href={
                          item.href
                        }
                        className={`
                          flex
                          items-center
                          justify-between
                          rounded-2xl
                          px-4
                          py-3
                          text-sm
                          font-semibold
                          transition-colors
                          ${
                            isActive(
                              item.href,
                            )
                              ? "bg-amber-50/70 text-amber-900"
                              : "text-gray-800 hover:bg-amber-50/50"
                          }
                        `}
                        onClick={() =>
                          setIsOpen(
                            false,
                          )
                        }
                      >
                        <span>
                          {t(
                            item.labelKey,
                          )}
                        </span>

                        {item.submenu && (
                          <ChevronDown
                            size={
                              16
                            }
                            strokeWidth={
                              1.8
                            }
                            className="text-amber-700/60"
                            aria-hidden="true"
                          />
                        )}
                      </Link>

                      {item.submenu && (
                        <div className="px-2 pb-2">
                          <div
                            className="
                              ml-2
                              mt-1
                              space-y-1
                              border-l
                              border-amber-200/50
                              pl-3
                            "
                          >
                            {item.submenu.map(
                              (
                                subItem,
                              ) => (
                                <Link
                                  key={
                                    subItem.href
                                  }
                                  href={
                                    subItem.href
                                  }
                                  className="
                                    block
                                    rounded-xl
                                    px-3
                                    py-2
                                    text-sm
                                    text-gray-700
                                    transition-colors
                                    hover:bg-amber-50/70
                                    hover:text-amber-900
                                  "
                                  onClick={() =>
                                    setIsOpen(
                                      false,
                                    )
                                  }
                                >
                                  {
                                    subItem.label
                                  }
                                </Link>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>

              {/* Language mobile */}

              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  p-4
                "
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">
                    {t(
                      "nav.language",
                    )}
                  </p>

                  <p className="text-xs font-medium text-amber-700">
                    {language.toUpperCase()}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {languages.map(
                    (lang) => (
                      <button
                        key={
                          lang.code
                        }
                        type="button"
                        className={`
                          rounded-xl
                          border
                          px-3
                          py-2
                          text-sm
                          font-semibold
                          transition-colors
                          ${
                            lang.code ===
                            language
                              ? `
                                border-amber-300
                                bg-amber-50/80
                                text-amber-900
                              `
                              : `
                                border-gray-200
                                text-gray-700
                                hover:border-amber-200
                                hover:bg-amber-50/50
                              `
                          }
                        `}
                        onClick={() => {
                          setLanguage(
                            lang.code,
                          );
                          setIsOpen(
                            false,
                          );
                        }}
                      >
                        {lang.label}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Booking mobile */}

              <Link
                href="/reservations"
                className="
                  btn-zellige-green
                  mt-5
                  w-full
                  text-center
                "
                onClick={() =>
                  setIsOpen(false)
                }
              >
                <Phone
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                <span>
                  {t("nav.book")}
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}