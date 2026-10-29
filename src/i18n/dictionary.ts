import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/fa";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  fa: () => import("./dictionaries/fa").then((m) => m.default),
  en: () => import("./dictionaries/en").then((m) => m.default),
  ar: () => import("./dictionaries/ar").then((m) => m.default),
  zh: () => import("./dictionaries/zh").then((m) => m.default),
  de: () => import("./dictionaries/de").then((m) => m.default),
  nl: () => import("./dictionaries/nl").then((m) => m.default),
};

export const getDictionaryFor = (locale: Locale) => dictionaries[locale]();

/** Current locale from the `[lang]` root segment. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!value) return defaultLocale;
  if (!isLocale(value)) notFound();
  return value;
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: await getDictionaryFor(locale) };
}

export type { Dictionary };
