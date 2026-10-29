import { localeMeta, localePath, pick, type Locale } from "@/i18n/config";
import type { EquipmentRow, ServiceRow } from "./content";
import type { FaqText } from "@/db/schema";
import { absoluteUrl, siteUrl } from "./seo";
import type { SiteSettings } from "./settings-schema";

/** Stable @id anchors so every page references the same entities. */
export const ids = {
  org: `${siteUrl}/#organization`,
  site: `${siteUrl}/#website`,
  logo: `${siteUrl}/#logo`,
};

const dayMap: Record<string, string> = {
  Sa: "Saturday",
  Su: "Sunday",
  Mo: "Monday",
  Tu: "Tuesday",
  We: "Wednesday",
  Th: "Thursday",
  Fr: "Friday",
};
const week = ["Sa", "Su", "Mo", "Tu", "We", "Th", "Fr"];

/** "Sa-Th 08:00-17:00" -> OpeningHoursSpecification */
function openingHours(spec: string) {
  const m = spec.match(/^(\w\w)-(\w\w)\s+(\d\d:\d\d)-(\d\d:\d\d)$/);
  if (!m) return undefined;
  const [, from, to, opens, closes] = m;
  const days = week.slice(week.indexOf(from), week.indexOf(to) + 1).map((d) => dayMap[d]);
  return [{ "@type": "OpeningHoursSpecification", dayOfWeek: days, opens, closes }];
}

export function organizationLd(s: SiteSettings, locale: Locale, services: ServiceRow[]) {
  const c = s.company;
  const sameAs = [
    s.social.instagram,
    s.social.linkedin,
    s.social.telegram && `https://t.me/${s.social.telegram}`,
  ].filter(Boolean);
  return {
    "@type": ["Organization", "LocalBusiness"],
    "@id": ids.org,
    name: pick(c.name, locale),
    alternateName: ["R.I.G", "Rezaei Industrial Group", "گروه صنعتی رضایی"],
    url: absoluteUrl(localePath(locale, "/")),
    logo: { "@type": "ImageObject", "@id": ids.logo, url: `${siteUrl}/logo.png`, width: 512, height: 512 },
    image: `${siteUrl}/logo.png`,
    foundingDate: String(c.foundingYear),
    telephone: c.phone,
    email: c.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: c.street,
      addressLocality: c.locality,
      addressRegion: c.region,
      postalCode: c.postalCode || undefined,
      addressCountry: "IR",
    },
    geo: { "@type": "GeoCoordinates", latitude: c.geo.lat, longitude: c.geo.lng },
    hasMap: c.mapUrl || `https://www.google.com/maps?q=${c.geo.lat},${c.geo.lng}`,
    openingHoursSpecification: openingHours(c.openingHours),
    areaServed: { "@type": "Country", name: "Iran" },
    priceRange: "$$",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: c.phone,
        contactType: "sales",
        areaServed: "IR",
        availableLanguage: ["Persian", "English"],
      },
      { "@type": "ContactPoint", telephone: c.mobile, contactType: "customer service", areaServed: "IR" },
    ],
    knowsAbout: [
      "CNC milling",
      "CNC turning",
      "Wire EDM",
      "Surface grinding",
      "Cylindrical grinding",
      "Laser welding",
      "TIG welding",
      "Special-purpose machine design",
      "Reverse engineering",
      "Precision machining",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Machining services",
      itemListElement: services.map((sv) => ({
        "@type": "Offer",
        itemOffered: { "@id": serviceId(sv.slug, locale) },
      })),
    },
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function websiteLd(s: SiteSettings, locale: Locale) {
  return {
    "@type": "WebSite",
    "@id": ids.site,
    url: siteUrl,
    name: pick(s.company.name, locale),
    inLanguage: localeMeta[locale].hreflang,
    publisher: { "@id": ids.org },
  };
}

export function webPageLd({
  locale,
  path,
  name,
  description,
  type = "WebPage",
}: {
  locale: Locale;
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "ContactPage" | "CollectionPage" | "AboutPage";
}) {
  const url = absoluteUrl(localePath(locale, path));
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: localeMeta[locale].hreflang,
    isPartOf: { "@id": ids.site },
    about: { "@id": ids.org },
    breadcrumb: { "@id": `${url}#breadcrumb` },
  };
}

export function breadcrumbLd(locale: Locale, path: string, items: { name: string; path: string }[]) {
  const url = absoluteUrl(localePath(locale, path));
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(localePath(locale, it.path)),
    })),
  };
}

const serviceId = (slug: string, locale: Locale) =>
  `${absoluteUrl(localePath(locale, `/services/${slug}`))}#service`;

export function serviceLd(sv: ServiceRow, locale: Locale) {
  const t = pick(sv.text, locale);
  return {
    "@type": "Service",
    "@id": serviceId(sv.slug, locale),
    name: t?.title,
    description: t?.summary,
    serviceType: pick(sv.text, "en")?.title,
    url: absoluteUrl(localePath(locale, `/services/${sv.slug}`)),
    provider: { "@id": ids.org },
    areaServed: { "@type": "Country", name: "Iran" },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: absoluteUrl(localePath(locale, "/contact")),
    },
  };
}

export function serviceListLd(services: ServiceRow[], locale: Locale) {
  return {
    "@type": "ItemList",
    itemListElement: services.map((sv, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(localePath(locale, `/services/${sv.slug}`)),
      name: pick(sv.text, locale)?.title,
    })),
  };
}

export function equipmentListLd(items: EquipmentRow[], locale: Locale) {
  return {
    "@type": "ItemList",
    name: "Equipment",
    itemListElement: items.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Thing",
        name: pick(e.text, locale)?.name,
        description: pick(e.text, locale)?.description,
        additionalProperty: e.specs.map((sp) => ({
          "@type": "PropertyValue",
          name: pick(sp.label, locale),
          value: pick(sp.value, locale),
        })),
      },
    })),
  };
}

export function faqLd(faqs: FaqText[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Wraps nodes in a single @graph document. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
