"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const COOKIE_NAME = "site_cookie_consent";
const CONSENT_CHANGED_EVENT = "cookie-consent-changed";

const hasConsent = () => {
  if (typeof document === "undefined") return false;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return false;
  try {
    const value = decodeURIComponent(match.split("=").slice(1).join("="));
    const parsed = JSON.parse(value);
    return !!parsed?.analytics;
  } catch {
    return false;
  }
};

export default function Analytics() {
  const [enabled, setEnabled] = useState(false);
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    setEnabled(hasConsent());

    const handler = () => setEnabled(hasConsent());
    window.addEventListener(CONSENT_CHANGED_EVENT, handler);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handler);
  }, []);

  if (!enabled || !gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);} 
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
