"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, Settings2, ShieldCheck, X } from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";

type ConsentState = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_NAME = "site_cookie_consent";
const CONSENT_EVENT = "cookie-consent-open";
const CONSENT_CHANGED_EVENT = "cookie-consent-changed";

const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
};

const getConsentCookie = () => {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));

  if (!match) return null;

  try {
    const value = decodeURIComponent(
      match.split("=").slice(1).join("="),
    );

    return JSON.parse(value) as ConsentState;
  } catch {
    return null;
  }
};

const setConsentCookie = (
  consent: ConsentState,
) => {
  if (typeof document === "undefined") {
    return;
  }

  const value = encodeURIComponent(
    JSON.stringify(consent),
  );

  const maxAge =
    60 * 60 * 24 * 180;

  document.cookie =
    `${COOKIE_NAME}=${value}; ` +
    `Path=/; ` +
    `Max-Age=${maxAge}; ` +
    `SameSite=Lax`;
};

export default function CookieBanner() {
  const { t } = useLanguage();

  const [visible, setVisible] =
    useState(false);

  const [
    showSettings,
    setShowSettings,
  ] = useState(false);

  const [consent, setConsent] =
    useState<ConsentState>(
      DEFAULT_CONSENT,
    );

  /* =========================================================
     INITIAL STATE
     ========================================================= */

  useEffect(() => {
    const existing =
      getConsentCookie();

    if (!existing) {
      setVisible(true);
      return;
    }

    setConsent(existing);
  }, []);

  /* =========================================================
     OPEN FROM FOOTER / PRIVACY PAGE
     ========================================================= */

  useEffect(() => {
    const handler = () => {
      const existing =
        getConsentCookie();

      if (existing) {
        setConsent(existing);
      }

      setVisible(true);
      setShowSettings(true);
    };

    window.addEventListener(
      CONSENT_EVENT,
      handler,
    );

    return () =>
      window.removeEventListener(
        CONSENT_EVENT,
        handler,
      );
  }, []);

  /* =========================================================
     ACTIONS
     ========================================================= */

  const persistConsent = (
    next: ConsentState,
  ) => {
    setConsent(next);
    setConsentCookie(next);

    window.dispatchEvent(
      new CustomEvent(
        CONSENT_CHANGED_EVENT,
      ),
    );

    setVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    persistConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const refuseAll = () => {
    persistConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const saveChoices = () => {
    persistConsent({
      ...consent,
      necessary: true,
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      {/* =====================================================
          MOBILE / PAGE OVERLAY
          ===================================================== */}

      <div
        className="
          fixed
          inset-0
          z-[90]
          bg-[#171411]/20
          backdrop-blur-[2px]
          md:bg-transparent
          md:backdrop-blur-none
        "
        aria-hidden="true"
      />

      {/* =====================================================
          COOKIE PANEL
          ===================================================== */}

      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-[100]
          px-3
          pb-3
          sm:px-4
          sm:pb-4
          lg:px-6
          lg:pb-6
        "
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-label={t(
            "cookies.title",
          )}
          className="
            relative
            mx-auto
            max-w-5xl
            overflow-hidden
            rounded-[22px]
            border
            border-[#B28A47]/20
            bg-[#FFFDF8]
            shadow-[0_24px_80px_-34px_rgba(35,20,12,0.38)]
          "
        >
          {/* GOLD LINE */}

          <div
            className="
              absolute
              inset-x-0
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-[#B28A47]/60
              to-transparent
            "
            aria-hidden="true"
          />

          {/* =================================================
              MAIN CONTENT
              ================================================= */}

          <div className="px-5 py-5 sm:px-6 sm:py-6 lg:px-7">
            <div
              className="
                flex
                flex-col
                gap-5
                lg:flex-row
                lg:items-center
                lg:justify-between
                lg:gap-8
              "
            >
              {/* TEXT */}

              <div
                className="
                  flex
                  max-w-2xl
                  items-start
                  gap-4
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#B28A47]/20
                    bg-[#F8F5EF]
                  "
                >
                  <Cookie
                    className="
                      h-4.5
                      w-4.5
                      text-[#0F5A46]
                    "
                    strokeWidth={1.6}
                  />
                </div>

                <div>
                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.25em]
                      text-[#B28A47]
                    "
                  >
                    Dar LaMamy
                  </p>

                  <h2
                    className="
                      mt-1
                      font-serif
                      text-[23px]
                      font-medium
                      leading-tight
                      text-[#2B1C17]
                      sm:text-[25px]
                    "
                  >
                    {t(
                      "cookies.title",
                    )}
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-xl
                      text-[13px]
                      leading-6
                      text-[#6F625C]
                    "
                  >
                    {t(
                      "cookies.description",
                    )}
                  </p>

                  <Link
                    href="/politique-confidentialite"
                    className="
                      mt-2
                      inline-block
                      text-[11px]
                      font-medium
                      text-[#0F5A46]
                      underline
                      decoration-[#B28A47]/40
                      underline-offset-4
                      transition
                      hover:decoration-[#B28A47]
                    "
                  >
                    {t(
                      "cookies.privacy_policy",
                    )}
                  </Link>
                </div>
              </div>

              {/* ACTIONS */}

              <div
                className="
                  flex
                  shrink-0
                  flex-wrap
                  gap-2.5
                  lg:justify-end
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowSettings(
                      (prev) =>
                        !prev,
                    )
                  }
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    border
                    border-[#B28A47]/25
                    bg-[#FFFDF8]
                    px-4
                    text-[12px]
                    font-semibold
                    text-[#5D514C]
                    transition-colors
                    hover:border-[#B28A47]/45
                    hover:bg-[#F8F5EF]
                    hover:text-[#2B1C17]
                  "
                >
                  <Settings2
                    className="h-3.5 w-3.5"
                    strokeWidth={1.6}
                  />

                  {t(
                    "cookies.customize",
                  )}
                </button>

                <button
                  type="button"
                  onClick={
                    refuseAll
                  }
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#0F5A46]/18
                    px-4
                    text-[12px]
                    font-semibold
                    text-[#0F5A46]
                    transition-colors
                    hover:bg-[#0F5A46]/5
                  "
                >
                  {t(
                    "cookies.refuse",
                  )}
                </button>

                <button
                  type="button"
                  onClick={
                    acceptAll
                  }
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    rounded-full
                    bg-[#0F5A46]
                    px-5
                    text-[12px]
                    font-semibold
                    text-[#FFFDF8]
                    transition-colors
                    hover:bg-[#083D31]
                  "
                >
                  {t(
                    "cookies.accept_all",
                  )}
                </button>
              </div>
            </div>

            {/* =================================================
                SETTINGS
                ================================================= */}

            {showSettings && (
              <div
                className="
                  mt-5
                  border-t
                  border-[#B28A47]/15
                  pt-5
                "
              >
                <div
                  className="
                    mb-4
                    flex
                    items-start
                    gap-3
                  "
                >
                  <ShieldCheck
                    className="
                      mt-0.5
                      h-4
                      w-4
                      shrink-0
                      text-[#0F5A46]
                    "
                    strokeWidth={1.6}
                  />

                  <div>
                    <p
                      className="
                        text-[12px]
                        font-semibold
                        text-[#2B1C17]
                      "
                    >
                      Vos préférences
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[11px]
                        leading-5
                        text-[#6F625C]
                      "
                    >
                      Les cookies essentiels
                      sont nécessaires au
                      fonctionnement du site.
                      Les autres catégories
                      restent facultatives.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    grid
                    gap-3
                    md:grid-cols-3
                  "
                >
                  {/* ESSENTIAL */}

                  <CookieChoice
                    title={t(
                      "cookies.essential",
                    )}
                    description="Nécessaires au fonctionnement du site."
                    checked
                    disabled
                    onChange={() => {}}
                  />

                  {/* ANALYTICS */}

                  <CookieChoice
                    title={t(
                      "cookies.analytics",
                    )}
                    description="Nous aident à comprendre l’utilisation du site."
                    checked={
                      consent.analytics
                    }
                    onChange={(
                      checked,
                    ) =>
                      setConsent(
                        (prev) => ({
                          ...prev,
                          analytics:
                            checked,
                        }),
                      )
                    }
                  />

                  {/* MARKETING */}

                  <CookieChoice
                    title={t(
                      "cookies.marketing",
                    )}
                    description="Utilisés uniquement si des fonctionnalités marketing sont activées."
                    checked={
                      consent.marketing
                    }
                    onChange={(
                      checked,
                    ) =>
                      setConsent(
                        (prev) => ({
                          ...prev,
                          marketing:
                            checked,
                        }),
                      )
                    }
                  />
                </div>

                <div
                  className="
                    mt-5
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <Link
                    href="/politique-confidentialite"
                    className="
                      text-[11px]
                      font-medium
                      text-[#6F625C]
                      transition-colors
                      hover:text-[#0F5A46]
                    "
                  >
                    {t(
                      "cookies.privacy_policy",
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={
                      saveChoices
                    }
                    className="
                      inline-flex
                      h-10
                      items-center
                      justify-center
                      rounded-full
                      bg-[#0F5A46]
                      px-5
                      text-[12px]
                      font-semibold
                      text-[#FFFDF8]
                      transition
                      hover:bg-[#083D31]
                    "
                  >
                    {t(
                      "cookies.save",
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

/* ===========================================================
   COOKIE CHOICE
   =========================================================== */

function CookieChoice({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (
    checked: boolean,
  ) => void;
}) {
  return (
    <label
      className={`
        flex
        cursor-pointer
        items-start
        justify-between
        gap-4
        rounded-[16px]
        border
        px-4
        py-4
        transition-colors

        ${
          checked
            ? `
              border-[#0F5A46]/18
              bg-[#0F5A46]/[0.04]
            `
            : `
              border-[#B28A47]/15
              bg-[#F8F5EF]/55
            `
        }

        ${
          disabled
            ? "cursor-default"
            : "hover:border-[#B28A47]/35"
        }
      `}
    >
      <div>
        <p
          className="
            text-[12px]
            font-semibold
            text-[#2B1C17]
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-[11px]
            leading-5
            text-[#6F625C]
          "
        >
          {description}
        </p>
      </div>

      {/* SWITCH */}

      <span
        className="
          relative
          mt-0.5
          inline-flex
          shrink-0
        "
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              event.target.checked,
            )
          }
          className="peer sr-only"
        />

        <span
          className="
            h-6
            w-11
            rounded-full
            bg-[#D9D2C8]
            transition-colors

            peer-checked:bg-[#0F5A46]

            peer-focus-visible:ring-2
            peer-focus-visible:ring-[#B28A47]/60
            peer-focus-visible:ring-offset-2

            peer-disabled:opacity-70
          "
        />

        <span
          className="
            pointer-events-none
            absolute
            left-[3px]
            top-[3px]
            h-[18px]
            w-[18px]
            rounded-full
            bg-white
            shadow-sm
            transition-transform

            peer-checked:translate-x-5
          "
        />
      </span>
    </label>
  );
}

/* ===========================================================
   EXTERNAL OPEN FUNCTION
   =========================================================== */

export const openCookieBanner =
  () => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(
        CONSENT_EVENT,
      ),
    );
  };