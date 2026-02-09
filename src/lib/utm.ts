const STORAGE_KEY = "utm_params";

export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

export const readUtmFromSearch = (search: string): UtmParams => {
  const params = new URLSearchParams(search);
  const utm: UtmParams = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(
    (key) => {
      const value = params.get(key);
      if (value) utm[key as keyof UtmParams] = value;
    }
  );
  return utm;
};

export const saveUtmToStorage = (utm: UtmParams) => {
  if (typeof window === "undefined") return;
  const current = getUtmFromStorage();
  const merged = { ...current, ...utm };
  if (Object.keys(merged).length === 0) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
};

export const getUtmFromStorage = (): UtmParams => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : {};
  } catch {
    return {};
  }
};

export const appendUtmToSearchParams = (
  params: URLSearchParams,
  utm: UtmParams
) => {
  Object.entries(utm).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
};
