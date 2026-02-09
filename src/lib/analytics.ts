type GtagEventParams = Record<string, string | number | boolean | undefined>;

const COOKIE_NAME = "site_cookie_consent";

const hasAnalyticsConsent = () => {
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

export const trackEvent = (event: string, params?: GtagEventParams) => {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;
  if (typeof (window as any).gtag !== "function") return;
  (window as any).gtag("event", event, params || {});
};
