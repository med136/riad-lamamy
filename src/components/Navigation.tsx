"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cormorant_Garamond, Inter } from "next/font/google";
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

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export function Navigation() {
  const pathname = usePathname();

  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  const [isOpen, setIsOpen] =
    useState(false);

  const [scrolled, setScrolled] =
    useState(false);

  const [
    languageOpen,
    setLanguageOpen,
  ] = useState(false);

  const [
    activeSubmenu,
    setActiveSubmenu,
  ] = useState<string | null>(null);

  const [brandName, setBrandName] =
    useState<string>("Dar LaMamy");

  const [
    brandTagline,
    setBrandTagline,
  ] = useState<string>("FÈS · MAROC");

  const [menuRooms, setMenuRooms] =
    useState<MenuRoom[]>([]);

  const languageRef =
    useRef<HTMLDivElement | null>(null);

  /* =========================================================
     HEADER SCROLL STATE
     ========================================================= */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  /* =========================================================
     PUBLIC SETTINGS
     ========================================================= */

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(
          "/api/public/settings",
          {
            cache: "no-store",
          },
        );

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
          typeof nextBrandName ===
            "string" &&
          nextBrandName.trim()
        ) {
          setBrandName(
            nextBrandName.trim(),
          );
        }

        const nextTagline =
          data.site_tagline ||
          data.siteTagline ||
          data.tagline ||
          data.site_tag_line ||
          null;

        if (
          typeof nextTagline ===
            "string" &&
          nextTagline.trim()
        ) {
          setBrandTagline(
            nextTagline.trim(),
          );
        }
      } catch {
        // Public settings are optional.
      }
    };

    void fetchSettings();
  }, []);

  /* =========================================================
     ROOM MENU
     ========================================================= */

  useEffect(() => {
    const fetchMenuRooms = async () => {
      try {
        const response = await fetch(
          "/api/rooms/menu",
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const payload =
          (await response.json()) as {
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

    void fetchMenuRooms();
  }, []);

  /* =========================================================
     NAVIGATION ITEMS
     ========================================================= */

  const navItems =
    useMemo<NavItem[]>(
      () => [
        {
          href: "/",
          labelKey: "nav.home",
        },
        {
          href: "/chambres",
          labelKey: "nav.rooms",
          submenu: menuRooms.length
            ? menuRooms.map(
                (room) => ({
                  href: `/chambres?room=${encodeURIComponent(
                    room.id,
                  )}#nos-chambres`,
                  label: room.name,
                }),
              )
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

    document.body.style.overflow =
      "hidden";

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

    const onMouseDown = (
      event: MouseEvent,
    ) => {
      const target =
        event.target as Node | null;

      if (!target) {
        return;
      }

      if (
        languageRef.current &&
        !languageRef.current.contains(
          target,
        )
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
    const onKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key !== "Escape"
      ) {
        return;
      }

      setIsOpen(false);
      setLanguageOpen(false);
      setActiveSubmenu(null);
    };

    document.addEventListener(
      "keydown",
      onKeyDown,
    );

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

  const normalizeHref = (
    href: string,
  ) =>
    href.split("#")[0] || href;

  const isActive = (
    href: string,
  ) => {
    const normalized =
      normalizeHref(href);

    if (normalized === "/") {
      return pathname === normalized;
    }

    return (
      pathname?.startsWith(
        normalized || "",
      ) || false
    );
  };

  /* =========================================================
     BRAND
     ========================================================= */

  const BrandLogo = ({
    mobile = false,
    onClick,
  }: {
    mobile?: boolean;
    onClick?: () => void;
  }) => (
    <Link
      href="/"
      aria-label={brandName}
      onClick={onClick}
      className="
        group
        inline-flex
        items-center
        rounded-xl
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#B28A47]/60
        focus-visible:ring-offset-2
      "
    >
      <div
        className={`
          flex
          items-center
          ${mobile ? "gap-1" : "gap-1.5"}
        `}
      >
        {/* Fixed logo mark — text remains dynamic */}
        <div
          className={`
            relative
            shrink-0
            ${mobile ? "h-[54px] w-[44px]" : "h-[64px] w-[52px]"}
          `}
        >
          <Image
            src="/logo-mark.png"
            alt=""
            fill
            priority
            sizes={mobile ? "44px" : "52px"}
            className="
              object-contain
              object-center
            "
          />
        </div>

        {/* Dynamic brand text from public settings */}
        <div className="flex min-w-0 flex-col justify-center">
          <span
            className={`
              ${cormorant.className}
              whitespace-nowrap
              text-[#2B1C17]
              font-semibold
              leading-[0.92]
              tracking-[0.025em]
              ${mobile ? "text-[22px]" : "text-[26px]"}
            `}
          >
            {brandName}
          </span>

          {brandTagline ? (
            <span
              className={`
                ${inter.className}
                mt-[6px]
                whitespace-nowrap
                pl-[1px]
                text-[8px]
                font-semibold
                uppercase
                leading-none
                tracking-[0.32em]
                text-[#B28A47]
              `}
            >
              {brandTagline}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );

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
            focus:ring-[#B28A47]
          "
        >
          {t(
            "nav.skip_to_content",
          )}
        </a>

        <nav
          className={`
            relative
            bg-[#F8F5EF]
            transition-shadow
            duration-300
            ease-out
            ${
              scrolled
                ? "shadow-[0_8px_30px_-20px_rgba(35,20,12,0.32)]"
                : "shadow-none"
            }
          `}
          aria-label={t(
            "nav.main_navigation",
          )}
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
              via-[#B28A47]/35
              to-transparent
            "
          />

          <div className="border-b border-[#B28A47]/18">
            <div
              className={`
                site-container
                transition-[padding]
                duration-300
                ${
                  scrolled
                    ? "py-1.5"
                    : "py-2"
                }
              `}
            >
              <div className="flex items-center justify-between gap-4">
                {/* =================================================
                    LOGO
                    ================================================= */}

                <div className="flex shrink-0 items-center">
                  <BrandLogo />
                </div>

                {/* =================================================
                    CENTER NAVIGATION
                    ================================================= */}

                <div className="hidden flex-1 justify-center lg:flex">
                  <ul className={`${inter.className} flex items-center gap-1 px-2 py-1`}>
                    {navItems.map(
                      (item) => {
                        const active =
                          isActive(
                            item.href,
                          );

                        const open =
                          activeSubmenu ===
                          item.href;

                        return (
                          <li
                            key={
                              item.href
                            }
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
                              href={
                                item.href
                              }
                              className={`
                                group
                                relative
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-full
                                px-3
                                py-2
                                text-[15px]
                                font-medium
                                transition-colors
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-[#B28A47]/60
                                focus-visible:ring-offset-2
                                ${
                                  active
                                    ? "text-[#0F5A46]"
                                    : "text-[#2B1C17] hover:text-[#0F5A46]"
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
                                  size={
                                    14
                                  }
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
                                  via-[#B28A47]/70
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
                                      border-[#B28A47]/15
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
                                            hover:bg-[#FFF9EF]
                                            hover:text-[#2B1C17]
                                            focus-visible:outline-none
                                            focus-visible:ring-2
                                            focus-visible:ring-[#B28A47]/60
                                            focus-visible:ring-offset-2
                                          "
                                        >
                                          <span>
                                            {
                                              subItem.label
                                            }
                                          </span>

                                          <span
                                            className="text-[#B28A47]/70"
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
                      },
                    )}
                  </ul>
                </div>

                {/* =================================================
                    RIGHT ACTIONS
                    ================================================= */}

                <div className="flex shrink-0 items-center justify-end gap-2">
                  {/* Language */}

                  <div
                    ref={
                      languageRef
                    }
                    className="relative hidden items-center md:flex"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setLanguageOpen(
                          (
                            value,
                          ) =>
                            !value,
                        )
                      }
                      className="
                        inline-flex
                        h-[45px]
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-[#B28A47]/30
                        bg-white/80
                        px-4
                        text-[15px]
                        font-medium
                        text-[#2B1C17]
                        shadow-sm
                        backdrop-blur
                        transition
                        duration-200
                        hover:border-[#B28A47]/50
                        hover:bg-white
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-[#B28A47]/60
                        focus-visible:ring-offset-2
                      "
                      aria-haspopup="menu"
                      aria-expanded={
                        languageOpen
                      }
                    >
                      <Globe
                        size={17}
                        strokeWidth={
                          1.8
                        }
                        aria-hidden="true"
                      />

                      <span>
                        {language.toUpperCase()}
                      </span>

                      <ChevronDown
                        size={14}
                        strokeWidth={
                          1.8
                        }
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
                          border-[#B28A47]/15
                          bg-white/95
                          p-1
                          shadow-2xl
                          shadow-black/10
                          backdrop-blur
                        "
                        role="menu"
                      >
                        {languages.map(
                          (
                            lang,
                          ) => (
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
                                hover:bg-[#FFF9EF]
                                hover:text-[#2B1C17]
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-[#B28A47]/60
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
                                {
                                  lang.label
                                }
                              </span>

                              <span
                                className={`
                                  text-xs
                                  ${
                                    lang.code ===
                                    language
                                      ? "text-[#B28A47]"
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
                    className={`
                      ${inter.className}
                      btn-zellige-green
                      hidden
                      !h-[45px]
                      !px-6
                      text-[15px]
                      font-medium
                      border
                      border-[#C89D4A]
                      sm:inline-flex
                    `}
                  >
                    <Phone
                      size={18}
                      strokeWidth={
                        1.8
                      }
                      aria-hidden="true"
                    />

                    <span>
                      {t(
                        "nav.book",
                      )}
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
                      border-[#B28A47]/30
                      bg-white/80
                      p-2
                      text-gray-800
                      shadow-sm
                      backdrop-blur
                      transition
                      hover:bg-white
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[#B28A47]/60
                      focus-visible:ring-offset-2
                      lg:hidden
                    "
                    onClick={() =>
                      setIsOpen(
                        (
                          value,
                        ) =>
                          !value,
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
                      <X
                        size={
                          22
                        }
                      />
                    ) : (
                      <Menu
                        size={
                          22
                        }
                      />
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
                border-[#B28A47]/15
                bg-white/95
                px-5
                py-4
                backdrop-blur
              "
            >
              <div className="flex items-center justify-between">
                <BrandLogo
                  mobile
                  onClick={() =>
                    setIsOpen(
                      false,
                    )
                  }
                />

                <button
                  type="button"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#B28A47]/30
                    bg-white
                    p-2
                    text-gray-800
                    shadow-sm
                    transition
                    hover:bg-[#FFF9EF]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#B28A47]/60
                    focus-visible:ring-offset-2
                  "
                  onClick={() =>
                    setIsOpen(
                      false,
                    )
                  }
                  aria-label={t(
                    "nav.close",
                  )}
                >
                  <X
                    size={22}
                  />
                </button>
              </div>
            </div>

            {/* Mobile content */}

            <div className="px-5 py-5">
              {/* Navigation */}

              <div className="space-y-1">
                {navItems.map(
                  (
                    item,
                  ) => (
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
                              ? "bg-[#FFF9EF] text-[#2B1C17]"
                              : "text-gray-800 hover:bg-[#FFF9EF]/70"
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
                            className="text-[#B28A47]/70"
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
                              border-[#B28A47]/25
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
                                    hover:bg-[#FFF9EF]
                                    hover:text-[#2B1C17]
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

                  <p className="text-xs font-medium text-[#B28A47]">
                    {language.toUpperCase()}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {languages.map(
                    (
                      lang,
                    ) => (
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
                                border-[#B28A47]/50
                                bg-[#FFF9EF]
                                text-[#2B1C17]
                              `
                              : `
                                border-gray-200
                                text-gray-700
                                hover:border-[#B28A47]/30
                                hover:bg-[#FFF9EF]/70
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
                        {
                          lang.label
                        }
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Booking mobile */}

              <Link
                href="/reservations"
                className={`
                  ${inter.className}
                  btn-zellige-green
                  mt-5
                  w-full
                  text-center
                `}
                onClick={() =>
                  setIsOpen(
                    false,
                  )
                }
              >
                <Phone
                  size={18}
                  strokeWidth={
                    1.8
                  }
                  aria-hidden="true"
                />

                <span>
                  {t(
                    "nav.book",
                  )}
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}