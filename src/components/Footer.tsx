"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Facebook,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";

import { openCookieBanner } from "@/components/CookieBanner";
import { useLanguage } from "@/components/LanguageProvider";

type SocialLinks = {
  instagram?: string;
  facebook?: string;
  youtube?: string;
};

export function Footer() {
  const currentYear =
    new Date().getFullYear();

  const { t } = useLanguage();

  const [brandName, setBrandName] =
    useState("Dar LaMamy");

  const [
    brandTagline,
    setBrandTagline,
  ] = useState<string | null>(
    "Un havre de paix au cœur de Fès",
  );

  const [
    contactEmail,
    setContactEmail,
  ] = useState(
    "contact@darlamamy.com",
  );

  const [
    contactPhone,
    setContactPhone,
  ] = useState(
    "+212 5 00 00 00 00",
  );

  const [
    addressLines,
    setAddressLines,
  ] = useState<string[]>([
    "Médina de Fès",
    "Fès, Maroc",
  ]);

  const [social, setSocial] =
    useState<SocialLinks>({});

  /* =========================================================
     LINKS
     ========================================================= */

  const quickLinks = useMemo(
    () => [
      {
        href: "/",
        label: t("nav.home"),
      },
      {
        href: "/chambres",
        label: t(
          "footer.rooms_link",
        ),
      },
      {
        href: "/services",
        label: t(
          "nav.services",
        ),
      },
      {
        href: "/galerie",
        label: t(
          "nav.gallery",
        ),
      },
      {
        href: "/a-propos",
        label: t(
          "nav.about",
        ),
      },
      {
        href: "/contact",
        label: t(
          "nav.contact",
        ),
      },
    ],
    [t],
  );

  const legalLinks = useMemo(
    () => [
      {
        href:
          "/mentions-legales",
        label: t(
          "footer.legal_notices",
        ),
      },
      {
        href:
          "/politique-confidentialite",
        label: t(
          "footer.privacy",
        ),
      },
      {
        href: "/cgu",
        label: t(
          "footer.terms",
        ),
      },
      {
        href: "/plan-site",
        label: t(
          "footer.sitemap",
        ),
      },
    ],
    [t],
  );

  /* =========================================================
     SETTINGS
     ========================================================= */

  useEffect(() => {
    const controller =
      new AbortController();

    const fetchSettings =
      async () => {
        try {
          const res = await fetch(
            "/api/public/settings",
            {
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

          if (!res.ok) {
            return;
          }

          const data =
            await res.json();

          /* Brand */

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

          /* Tagline */

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

          /* Email */

          const nextEmail =
            data.contact_email ||
            data.support_email ||
            null;

          if (
            typeof nextEmail ===
              "string" &&
            nextEmail.trim()
          ) {
            setContactEmail(
              nextEmail.trim(),
            );
          }

          /* Phone */

          const nextPhone =
            data.contact_phone ||
            data.whatsapp_phone ||
            null;

          if (
            typeof nextPhone ===
              "string" &&
            nextPhone.trim()
          ) {
            setContactPhone(
              nextPhone.trim(),
            );
          }

          /* Address */

          const parts: string[] =
            [];

          const line1 =
            data.address_line_1;

          const line2 =
            data.address_line_2;

          const city =
            data.address_city;

          const postal =
            data.address_postal_code;

          const country =
            data.address_country;

          if (
            typeof line1 ===
              "string" &&
            line1.trim()
          ) {
            parts.push(
              line1.trim(),
            );
          }

          if (
            typeof line2 ===
              "string" &&
            line2.trim()
          ) {
            parts.push(
              line2.trim(),
            );
          }

          const locality = [
            postal,
            city,
          ]
            .filter(
              (
                value: unknown,
              ) =>
                typeof value ===
                  "string" &&
                value.trim(),
            )
            .map((value) =>
              String(
                value,
              ).trim(),
            )
            .join(" ");

          if (locality) {
            parts.push(
              locality,
            );
          }

          if (
            typeof country ===
              "string" &&
            country.trim()
          ) {
            parts.push(
              country.trim(),
            );
          }

          if (parts.length) {
            setAddressLines(
              parts,
            );
          }

          /* Social */

          const instagram =
            data.social_instagram;

          const facebook =
            data.social_facebook;

          const youtube =
            data.social_youtube;

          setSocial({
            instagram:
              typeof instagram ===
                "string" &&
              instagram.trim()
                ? instagram.trim()
                : undefined,

            facebook:
              typeof facebook ===
                "string" &&
              facebook.trim()
                ? facebook.trim()
                : undefined,

            youtube:
              typeof youtube ===
                "string" &&
              youtube.trim()
                ? youtube.trim()
                : undefined,
          });
        } catch (error) {
          if (
            (error as Error)
              .name !==
            "AbortError"
          ) {
            console.error(
              "Footer settings error:",
              error,
            );
          }
        }
      };

    void fetchSettings();

    return () =>
      controller.abort();
  }, []);

  /* =========================================================
     COMPUTED VALUES
     ========================================================= */

  const socialLinks =
    useMemo(
      () =>
        [
          {
            href:
              social.instagram,
            label:
              "Instagram",
            Icon:
              Instagram,
          },
          {
            href:
              social.facebook,
            label:
              "Facebook",
            Icon:
              Facebook,
          },
          {
            href:
              social.youtube,
            label:
              "YouTube",
            Icon:
              Youtube,
          },
        ].filter(
          (
            item,
          ): item is {
            href: string;
            label: string;
            Icon: typeof Instagram;
          } =>
            Boolean(
              item.href,
            ),
        ),
      [
        social.facebook,
        social.instagram,
        social.youtube,
      ],
    );

  const phoneHref =
    contactPhone.replace(
      /[^\d+]/g,
      "",
    );

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <footer
      className="
        relative
        overflow-hidden
        border-t
        border-[#B28A47]/20
        bg-[#083D31]
        text-[#FFFDF8]
      "
    >
      {/* =====================================================
          BACKGROUND
          ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-52
          -top-64
          h-[34rem]
          w-[34rem]
          rounded-full
          bg-[#D2AA5A]/[0.045]
          blur-3xl
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-48
          right-0
          h-[30rem]
          w-[30rem]
          rounded-full
          bg-[#12604B]/20
          blur-3xl
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-[#D2AA5A]/65
          to-transparent
        "
        aria-hidden="true"
      />

      {/* =====================================================
          MAIN FOOTER
          ===================================================== */}

      <div
        className="
          site-container
          relative
          py-10
          lg:py-12
        "
      >
        <div
          className="
            grid
            grid-cols-1
            gap-9
            md:grid-cols-2
            lg:grid-cols-12
            lg:gap-x-10
          "
        >
          {/* =================================================
              BRAND
              ================================================= */}

          <div
            className="
              flex
    h-full
    flex-col
    lg:col-span-5
    lg:pr-8
            "
          >
            <Link
              href="/"
              aria-label="Dar LaMamy - Accueil"
              className="
                group
                inline-flex
                items-center
                gap-3.5
              "
            >
              {/* LOGO MARK */}

              <div
                className="
                  relative
                  h-[62px]
                  w-[62px]
                  shrink-0
                  transition-transform
                  duration-300
                  group-hover:-translate-y-0.5
                  sm:h-[68px]
                  sm:w-[68px]
                "
              >
                <Image
                  src="/logo-mark.png"
                  alt=""
                  fill
                  sizes="68px"
                  className="
                    object-contain
                  "
                  aria-hidden="true"
                />
              </div>

              {/* BRAND TEXT */}

              <div
                className="
                  flex
                  flex-col
                  items-start
                "
              >
                <span
                  className="
                    font-serif
                    text-[28px]
                    font-medium
                    leading-none
                    tracking-[0.025em]
                    text-[#FFFDF8]
                    sm:text-[31px]
                  "
                >
                  {brandName}
                </span>

                <span
                  className="
                    mt-2
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.34em]
                    text-[#D2AA5A]
                    sm:text-[9px]
                  "
                >
                  Fès · Maroc
                </span>
              </div>
            </Link>

            
            {/* SMALL DIVIDER */}



            {/* SOCIAL */}

            {socialLinks.length >
              0 && (
              <div
                className="
                  mt-auto
    flex
    items-center
    gap-2.5
    pt-6
                "
              >
                {socialLinks.map(
                  ({
                    href,
                    label,
                    Icon,
                  }) => (
                    <a
                      key={
                        label
                      }
                      href={
                        href
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={
                        label
                      }
                      className="
                        inline-flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/10
                        bg-white/[0.035]
                        text-white/60
                        transition-all
                        duration-200

                        hover:-translate-y-0.5
                        hover:border-[#D2AA5A]/45
                        hover:bg-[#D2AA5A]
                        hover:text-[#083D31]

                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-[#D2AA5A]
                        focus-visible:ring-offset-2
                        focus-visible:ring-offset-[#083D31]
                      "
                    >
                      <Icon
                        size={16}
                        strokeWidth={
                          1.6
                        }
                        aria-hidden="true"
                      />
                    </a>
                  ),
                )}
              </div>
            )}
          </div>

          {/* =================================================
              NAVIGATION
              ================================================= */}

          <div className="lg:col-span-2">
            <FooterTitle>
              {t(
                "footer.navigation",
              )}
            </FooterTitle>

            <ul className="space-y-2.5">
              {quickLinks.map(
                (link) => (
                  <li
                    key={
                      link.href
                    }
                  >
                    <Link
                      href={
                        link.href
                      }
                      className="
                        group
                        inline-flex
                        items-center
                        gap-2.5
                        text-[13px]
                        text-white/55
                        transition-colors
                        duration-200
                        hover:text-white
                      "
                    >
                      <span
                        className="
                          h-px
                          w-2.5
                          bg-[#D2AA5A]/35
                          transition-all
                          duration-200
                          group-hover:w-4
                          group-hover:bg-[#D2AA5A]
                        "
                      />

                      {
                        link.label
                      }
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* =================================================
              CONTACT
              ================================================= */}

          <div className="lg:col-span-3">
            <FooterTitle>
              {t(
                "footer.contact",
              )}
            </FooterTitle>

            <ul className="space-y-4">
              <li
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <MapPin
                  size={16}
                  strokeWidth={
                    1.6
                  }
                  className="
                    mt-0.5
                    shrink-0
                    text-[#D2AA5A]
                  "
                />

                <span
                  className="
                    text-[13px]
                    leading-[1.7]
                    text-white/55
                  "
                >
                  {addressLines.map(
                    (
                      line,
                      index,
                    ) => (
                      <span
                        key={
                          index
                        }
                        className="block"
                      >
                        {
                          line
                        }
                      </span>
                    ),
                  )}
                </span>
              </li>

              <li>
                <a
                  href={`tel:${phoneHref}`}
                  className="
                    group
                    flex
                    items-center
                    gap-3
                    text-[13px]
                    text-white/55
                    transition-colors
                    hover:text-white
                  "
                >
                  <Phone
                    size={16}
                    strokeWidth={
                      1.6
                    }
                    className="
                      shrink-0
                      text-[#D2AA5A]
                    "
                  />

                  {
                    contactPhone
                  }
                </a>
              </li>

              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="
                    group
                    flex
                    items-center
                    gap-3
                    text-[13px]
                    text-white/55
                    transition-colors
                    hover:text-white
                  "
                >
                  <Mail
                    size={16}
                    strokeWidth={
                      1.6
                    }
                    className="
                      shrink-0
                      text-[#D2AA5A]
                    "
                  />

                  <span className="break-all">
                    {
                      contactEmail
                    }
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* =================================================
              LEGAL
              ================================================= */}

          <div className="lg:col-span-2">
            <FooterTitle>
              {t(
                "footer.information",
              )}
            </FooterTitle>

            <ul className="space-y-2.5">
              {legalLinks.map(
                (link) => (
                  <li
                    key={
                      link.href
                    }
                  >
                    <Link
                      href={
                        link.href
                      }
                      className="
                        text-[13px]
                        text-white/50
                        transition-colors
                        duration-200
                        hover:text-white
                      "
                    >
                      {
                        link.label
                      }
                    </Link>
                  </li>
                ),
              )}

              <li>
                <button
                  type="button"
                  onClick={
                    openCookieBanner
                  }
                  className="
                    text-left
                    text-[13px]
                    text-white/50
                    transition-colors
                    hover:text-white
                  "
                >
                  {t(
                    "footer.manage_cookies",
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* =====================================================
          BOTTOM BAR
          ===================================================== */}

      <div
        className="
          relative
          border-t
          border-white/[0.07]
          bg-black/[0.08]
        "
      >
        <div
          className="
            site-container
            flex
            flex-col
            items-center
            justify-between
            gap-3
            py-4
            text-center
            text-[11px]
            text-white/40
            sm:flex-row
            sm:text-left
          "
        >
          <p>
            © {currentYear}{" "}
            {brandName}.{" "}
            {t(
              "footer.all_rights_reserved",
            )}
          </p>

          <div
            className="
              flex
              items-center
              gap-1.5
            "
          >
            <span>
              {t(
                "footer.made_with",
              )}
            </span>

            <Heart
              size={13}
              strokeWidth={1.5}
              className="
                fill-[#D2AA5A]
                text-[#D2AA5A]
              "
              aria-hidden="true"
            />

            <span>
              {t(
                "footer.in_city",
              )}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ===========================================================
   FOOTER TITLE
   =========================================================== */

function FooterTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.26em]
          text-[#D2AA5A]
        "
      >
        {children}
      </p>

      <div
        className="
          mt-2
          flex
          items-center
          gap-1.5
        "
        aria-hidden="true"
      >
        <span className="h-px w-6 bg-[#D2AA5A]/50" />

        <span
          className="
            h-1
            w-1
            rotate-45
            bg-[#D2AA5A]/60
          "
        />
      </div>
    </div>
  );
}