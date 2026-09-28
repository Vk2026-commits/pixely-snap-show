export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referral_url: string | null;
  landing_page_url: string | null;
  comment_keyword: string | null;
}

const STORAGE_KEY = "aipf_attribution";

const empty: Attribution = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
  referral_url: null,
  landing_page_url: null,
  comment_keyword: null,
};

export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return empty;

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) return { ...empty, ...(JSON.parse(stored) as Attribution) };
  } catch {
    /* ignore */
  }

  const params = new URLSearchParams(window.location.search);
  const get = (k: string) => params.get(k) || null;

  const data: Attribution = {
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign"),
    utm_content: get("utm_content"),
    utm_term: get("utm_term"),
    referral_url: document.referrer || null,
    landing_page_url: window.location.href,
    comment_keyword: get("keyword") || get("comment_keyword"),
  };

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }

  return data;
}
