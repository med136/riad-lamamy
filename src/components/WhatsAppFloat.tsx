"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  MessageCircle,
} from "lucide-react";

import {
  trackEvent,
} from "@/lib/analytics";

import {
  useLanguage,
} from "@/components/LanguageProvider";

export function WhatsAppFloat() {
  const { t } = useLanguage();

  const [
    isHovered,
    setIsHovered,
  ] = useState(false);

  const [
    phoneNumber,
    setPhoneNumber,
  ] = useState<string | null>(
    null,
  );

  const message = t(
    "whatsapp.message",
  );

  /* =========================================================
     LOAD WHATSAPP NUMBER
     ========================================================= */

  useEffect(() => {
    const controller =
      new AbortController();

    const loadSettings =
      async () => {
        try {
          const response =
            await fetch(
              "/api/public/settings",
              {
                cache:
                  "no-store",
                signal:
                  controller.signal,
              },
            );

          if (!response.ok) {
            return;
          }

          const data =
            await response.json();

          const whatsapp =
            data.whatsapp_phone ||
            data.contact_phone ||
            null;

          if (
            typeof whatsapp ===
              "string" &&
            whatsapp.trim()
          ) {
            setPhoneNumber(
              whatsapp.trim(),
            );
          }
        } catch (error) {
          if (
            (error as Error)
              .name !==
            "AbortError"
          ) {
            console.error(
              "WhatsApp settings error:",
              error,
            );
          }
        }
      };

    void loadSettings();

    return () =>
      controller.abort();
  }, []);

  /* =========================================================
     CLICK
     ========================================================= */

  const handleClick = () => {
    if (!phoneNumber) {
      return;
    }

    trackEvent(
      "click_whatsapp",
      {
        source: "float",
      },
    );

    const cleanedNumber =
      phoneNumber.replace(
        /\D/g,
        "",
      );

    const url =
      `https://wa.me/${cleanedNumber}` +
      `?text=${encodeURIComponent(
        message,
      )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer",
    );
  };

  /* =========================================================
     DON'T DISPLAY IF NO NUMBER
     ========================================================= */

  if (!phoneNumber) {
    return null;
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div
      className="
        fixed
        bottom-5
        right-5
        z-40
        sm:bottom-6
        sm:right-6
      "
    >
      <div className="relative">
        {/* ===================================================
            TOOLTIP
            =================================================== */}

        <div
          className={`
            pointer-events-none
            absolute
            right-full
            top-1/2
            mr-3
            -translate-y-1/2
            whitespace-nowrap

            rounded-full

            border
            border-[#B28A47]/20

            bg-[#FFFDF8]

            px-4
            py-2

            text-[11px]
            font-semibold
            text-[#2B1C17]

            shadow-[0_10px_30px_-18px_rgba(35,20,12,0.35)]

            transition-all
            duration-200

            ${
              isHovered
                ? `
                  visible
                  translate-x-0
                  opacity-100
                `
                : `
                  invisible
                  translate-x-2
                  opacity-0
                `
            }
          `}
          role="tooltip"
        >
          {t(
            "whatsapp.tooltip",
          )}

          {/* Arrow */}

          <span
            className="
              absolute
              right-[-4px]
              top-1/2
              h-2
              w-2
              -translate-y-1/2
              rotate-45

              border-r
              border-t
              border-[#B28A47]/20

              bg-[#FFFDF8]
            "
            aria-hidden="true"
          />
        </div>

        {/* ===================================================
            BUTTON
            =================================================== */}

        <button
          type="button"
          onClick={
            handleClick
          }
          onMouseEnter={() =>
            setIsHovered(
              true,
            )
          }
          onMouseLeave={() =>
            setIsHovered(
              false,
            )
          }
          onFocus={() =>
            setIsHovered(
              true,
            )
          }
          onBlur={() =>
            setIsHovered(
              false,
            )
          }
          aria-label={t(
            "whatsapp.tooltip",
          )}
          className="
            group
            relative
            flex
            h-[54px]
            w-[54px]
            items-center
            justify-center

            rounded-full

            border
            border-[#D2AA5A]/35

            bg-[#0F5A46]

            text-[#FFFDF8]

            shadow-[0_14px_34px_-16px_rgba(15,90,70,0.65)]

            transition-all
            duration-300

            hover:-translate-y-0.5
            hover:border-[#D2AA5A]/65
            hover:bg-[#083D31]

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#D2AA5A]/60
            focus-visible:ring-offset-2
            focus-visible:ring-offset-[#F8F5EF]

            sm:h-[58px]
            sm:w-[58px]
          "
        >
          {/* subtle gold ring */}

          <span
            className="
              pointer-events-none
              absolute
              inset-[4px]
              rounded-full
              border
              border-[#D2AA5A]/10
            "
            aria-hidden="true"
          />

          <MessageCircle
            className="
              relative
              z-10
              h-[23px]
              w-[23px]
            "
            strokeWidth={1.7}
            aria-hidden="true"
          />

          {/* notification detail */}

          <span
            className="
              absolute
              right-[5px]
              top-[5px]
              h-[7px]
              w-[7px]
              rounded-full

              border
              border-[#0F5A46]

              bg-[#D2AA5A]
            "
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
}