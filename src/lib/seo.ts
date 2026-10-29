import type { Metadata } from "next";
import { defaultLocale, localeMeta, localePath, locales, type Locale } from "@/i18n/config";

export const siteUrl = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const absoluteUrl = (path: string) => `${siteUrl}${path === "/" ? "" : path}` || siteUrl;

/** hreflang map for a locale-independent path such as "/services/cnc-milling". */
export function languageAlternates(path: string, available: readonly Locale[] = locales) {
  const languages: Record<string, string> = {};
  for (const l of available) languages[localeMeta[l].hreflang] = absoluteUrl(localePath(l, path));
  languages["x-default"] = absoluteUrl(localePath(defaultLocale, path));
  return languages;
}

export function pageMetadata({
  locale,
  path,
  title,
  description,
  siteName,
  ogKey = "home",
  type = "website",
  available,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  siteName: string;
  /** Key for the generated social image: /og/<locale>/<ogKey> */
  ogKey?: string;
  type?: "website" | "article";
  available?: readonly Locale[];
}): Metadata {
  const url = absoluteUrl(localePath(locale, path));
  const ogImage = absoluteUrl(`/og/${locale}/${ogKey}`);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages: languageAlternates(path, available) },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName,
      locale: localeMeta[locale].og,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeMeta[l].og),
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}
