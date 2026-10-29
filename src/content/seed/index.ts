import { locales, type L, type Locale } from "@/i18n/config";
import type { EquipmentText, FaqText, ServiceText, Spec } from "@/db/schema";
import { equipmentSeed, pageKeys, serviceSeed, type SpecValue } from "./structure";
import type { SeedLocale } from "./types";
import fa from "./fa";
import en from "./en";
import ar from "./ar";
import zh from "./zh";
import de from "./de";
import nl from "./nl";

export const seedTexts: Record<Locale, SeedLocale> = { fa, en, ar, zh, de, nl };

function collect<T>(get: (s: SeedLocale) => T): L<T> {
  return Object.fromEntries(locales.map((l) => [l, get(seedTexts[l])])) as L<T>;
}

function formatSpec(v: SpecValue, s: SeedLocale, locale: Locale): string {
  if ("t" in v) return s.specTexts[v.t];
  let n = v.n;
  if (locale === "de" || locale === "nl") n = n.replace(/(\d)\.(\d)/g, "$1,$2");
  if (locale === "fa") n = n.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]).replace(/(\S)\.(\S)/g, "$1٫$2");
  return v.unit ? `${n} ${s.units[v.unit]}` : n;
}

export function buildSeed() {
  const services = serviceSeed.map((s, i) => ({
    slug: s.slug,
    icon: s.icon,
    sort: i,
    text: collect<ServiceText>((t) => t.services[s.slug]),
  }));

  const equipment = equipmentSeed.map((e, i) => ({
    kind: e.kind,
    drawing: e.drawing,
    precision: e.precision ?? null,
    sort: i,
    specs: e.specs.map(
      ([key, value]): Spec => ({
        label: collect((t) => t.specLabels[key]),
        value: Object.fromEntries(locales.map((l) => [l, formatSpec(value, seedTexts[l], l)])) as L<string>,
      }),
    ),
    text: collect<EquipmentText>((t) => t.equipment[e.key]),
  }));

  const faqCount = seedTexts.fa.faqs.length;
  const faqs = Array.from({ length: faqCount }, (_, i) => ({
    sort: i,
    text: collect<FaqText>((t) => t.faqs[i]),
  }));

  const pages = pageKeys.map((key) => ({ key, data: collect((t) => t.pages[key]) }));

  return { services, equipment, faqs, pages };
}
