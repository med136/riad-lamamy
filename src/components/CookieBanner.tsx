"use client";

import { useEffect, useState } from "react";

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
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  try {
    const value = decodeURIComponent(match.split("=").slice(1).join("="));
    return JSON.parse(value) as ConsentState;
  } catch {
    return null;
  }
};

const setConsentCookie = (consent: ConsentState) => {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(consent));
  const maxAge = 60 * 60 * 24 * 180;
  document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
};

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);

  useEffect(() => {
    const existing = getConsentCookie();
    if (!existing) {
      setVisible(true);
      return;
    }
    setConsent(existing);
  }, []);

  useEffect(() => {
    const handler = () => {
      const existing = getConsentCookie();
      if (existing) setConsent(existing);
      setVisible(true);
      setShowSettings(true);
    };
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  const acceptAll = () => {
    const next = { necessary: true, analytics: true, marketing: true };
    setConsent(next);
    setConsentCookie(next);
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT));
    setVisible(false);
  };

  const refuseAll = () => {
    const next = { necessary: true, analytics: false, marketing: false };
    setConsent(next);
    setConsentCookie(next);
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT));
    setVisible(false);
  };

  const saveChoices = () => {
    setConsentCookie(consent);
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-6">
      <div className="mx-auto max-w-4xl lux-panel border border-amber-200/60 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="lux-kicker text-amber-700/80 mb-2">COOKIES</div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
              Nous respectons votre vie privee
            </h3>
            <p className="text-gray-600">
              Nous utilisons des cookies essentiels pour assurer le bon
              fonctionnement du site. Vous pouvez accepter, refuser ou
              personnaliser les cookies.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowSettings((prev) => !prev)}
              className="px-4 py-2 rounded-full border border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Personnaliser
            </button>
            <button
              onClick={refuseAll}
              className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Refuser
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 rounded-full bg-amber-700 text-white hover:bg-amber-800"
            >
              Accepter tout
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mt-6 border-t border-amber-200/40 pt-4">
            <div className="space-y-3 text-sm text-gray-700">
              <label className="flex items-center justify-between">
                <span>Cookies essentiels (toujours actifs)</span>
                <input type="checkbox" checked disabled className="accent-amber-700" />
              </label>
              <label className="flex items-center justify-between">
                <span>Mesure d'audience</span>
                <input
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={(e) =>
                    setConsent((prev) => ({ ...prev, analytics: e.target.checked }))
                  }
                  className="accent-amber-700"
                />
              </label>
              <label className="flex items-center justify-between">
                <span>Marketing et personnalisation</span>
                <input
                  type="checkbox"
                  checked={consent.marketing}
                  onChange={(e) =>
                    setConsent((prev) => ({ ...prev, marketing: e.target.checked }))
                  }
                  className="accent-amber-700"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={saveChoices}
                className="px-4 py-2 rounded-full bg-amber-700 text-white hover:bg-amber-800"
              >
                Enregistrer
              </button>
              <a
                href="/politique-confidentialite"
                className="px-4 py-2 rounded-full border border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                Politique de confidentialite
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const openCookieBanner = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
};
