import { asc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db, schema } from "@/db";
import type { SiteSettings } from "./settings-schema";
import { getSettingsUncached } from "./settings";
import type { PageKey } from "@/content/seed/structure";

/**
 * Cached content readers. Each returns all locales at once so one cache entry
 * serves every language; components pick their locale with `pick()`.
 * Admin mutations call `revalidateTag(<tag>)` (see src/lib/revalidate.ts).
 */

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("max");
  cacheTag("settings");
  return getSettingsUncached();
}

export async function getServices() {
  "use cache";
  cacheLife("max");
  cacheTag("services");
  return db
    .select()
    .from(schema.services)
    .where(eq(schema.services.published, true))
    .orderBy(asc(schema.services.sort));
}

export async function getService(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag("services");
  const [row] = await db.select().from(schema.services).where(eq(schema.services.slug, slug));
  return row && row.published ? row : null;
}

export async function getEquipment() {
  "use cache";
  cacheLife("max");
  cacheTag("equipment");
  return db
    .select()
    .from(schema.equipment)
    .where(eq(schema.equipment.published, true))
    .orderBy(asc(schema.equipment.sort));
}

export async function getFaqs() {
  "use cache";
  cacheLife("max");
  cacheTag("faqs");
  return db.select().from(schema.faqs).where(eq(schema.faqs.published, true)).orderBy(asc(schema.faqs.sort));
}

export async function getPage(key: PageKey) {
  "use cache";
  cacheLife("max");
  cacheTag("pages");
  const [row] = await db.select().from(schema.pages).where(eq(schema.pages.key, key));
  return row?.data ?? {};
}

export async function getProjects() {
  "use cache";
  cacheLife("max");
  cacheTag("projects");
  return db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.published, true))
    .orderBy(asc(schema.projects.sort));
}

export async function getProject(slug: string) {
  "use cache";
  cacheLife("max");
  cacheTag("projects");
  const [row] = await db.select().from(schema.projects).where(eq(schema.projects.slug, slug));
  return row && row.published ? row : null;
}

export async function getMedia(ids: number[]) {
  "use cache";
  cacheLife("max");
  cacheTag("media");
  if (ids.length === 0) return [];
  return db.select().from(schema.media).where(inArray(schema.media.id, ids));
}

export type ServiceRow = Awaited<ReturnType<typeof getServices>>[number];
export type EquipmentRow = Awaited<ReturnType<typeof getEquipment>>[number];
export type ProjectRow = Awaited<ReturnType<typeof getProjects>>[number];
export type MediaRow = Awaited<ReturnType<typeof getMedia>>[number];

/** Current year for footers; cached so prerendering stays deterministic. */
export async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
