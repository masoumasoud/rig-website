import type { MetadataRoute } from "next";
import { localePath, locales } from "@/i18n/config";
import { getProjects, getServices } from "@/lib/content";
import { absoluteUrl, languageAlternates } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects] = await Promise.all([getServices(), getProjects()]);
  const pages: { path: string; priority: number; lastModified?: Date }[] = [
    { path: "/", priority: 1 },
    { path: "/services", priority: 0.9 },
    { path: "/contact", priority: 0.9 },
    { path: "/equipment", priority: 0.8 },
    { path: "/portfolio", priority: 0.7 },
    ...services.map((s) => ({ path: `/services/${s.slug}`, priority: 0.8, lastModified: s.updatedAt })),
    ...projects.map((p) => ({ path: `/portfolio/${p.slug}`, priority: 0.6, lastModified: p.updatedAt })),
  ];
  return pages.flatMap((p) =>
    locales.map((l) => ({
      url: absoluteUrl(localePath(l, p.path)),
      lastModified: p.lastModified,
      priority: l === "fa" ? p.priority : Math.round(p.priority * 80) / 100,
      alternates: { languages: languageAlternates(p.path) },
    })),
  );
}
