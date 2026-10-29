export const locales = ["fa", "en", "ar", "zh", "de", "nl"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fa";
/** Fallback used when a translation is missing in the admin data. */
export const fallbackLocale: Locale = "en";

export const localeMeta: Record<
  Locale,
  { label: string; hreflang: string; og: string; dir: "rtl" | "ltr" }
> = {
  fa: { label: "فارسی", hreflang: "fa-IR", og: "fa_IR", dir: "rtl" },
  en: { label: "English", hreflang: "en", og: "en_US", dir: "ltr" },
  ar: { label: "العربية", hreflang: "ar", og: "ar_AR", dir: "rtl" },
  zh: { label: "中文", hreflang: "zh-Hans", og: "zh_CN", dir: "ltr" },
  de: { label: "Deutsch", hreflang: "de", og: "de_DE", dir: "ltr" },
  nl: { label: "Nederlands", hreflang: "nl", og: "nl_NL", dir: "ltr" },
};

/** Locales where GDPR consent is required before loading analytics. */
export const consentLocales: Locale[] = ["de", "nl"];

export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

/** Public URL path for a locale. The default locale has no prefix. */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Localized value type stored in the database: one entry per locale. */
export type L<T> = Partial<Record<Locale, T>>;

/** Pick a localized value, falling back to English and then Persian. */
export function pick<T>(value: L<T> | null | undefined, locale: Locale): T | undefined {
  if (!value) return undefined;
  return value[locale] ?? value[fallbackLocale] ?? value[defaultLocale];
}

/** Format numbers with native digits for Persian; Western digits elsewhere. */
export function num(value: number | string, locale: Locale): string {
  const s = String(value);
  if (locale !== "fa") return s;
  return s.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]).replace(/\./g, "٫");
}
