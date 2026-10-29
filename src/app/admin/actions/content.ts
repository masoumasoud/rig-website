"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { EquipmentText, FaqText, ProjectText, ServiceText, Spec } from "@/db/schema";
import { locales, type L } from "@/i18n/config";
import { requireUser } from "@/lib/auth";
import { lines, readLocalized, refreshSite, slugify, textToHtml } from "@/lib/admin-form";
import { pingIndexNow } from "@/lib/indexnow";
import type { FormState } from "@/components/admin/client";

const num = (v: FormDataEntryValue | null, fallback = 0) => {
  const n = Number(String(v ?? "").replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))));
  return Number.isFinite(n) ? n : fallback;
};
const bool = (v: FormDataEntryValue | null) => v === "on";
const isUnique = (e: unknown) => String(e).includes("UNIQUE");

/* --------------------------------------------------------------- services -- */
export async function saveService(id: number | null, _prev: FormState, data: FormData): Promise<FormState> {
  await requireUser();
  const raw = readLocalized(data, "t", ["title", "summary", "body", "bullets", "metaTitle", "metaDescription"] as const);
  if (!raw.fa?.title) return { error: "عنوان فارسی الزامی است." };
  const text: L<ServiceText> = {};
  for (const [l, v] of Object.entries(raw)) {
    text[l as keyof typeof raw] = {
      title: v.title,
      summary: v.summary,
      body: textToHtml(v.body),
      bullets: lines(v.bullets),
      metaTitle: v.metaTitle,
      metaDescription: v.metaDescription,
    };
  }
  const slug = slugify(String(data.get("slug") ?? "")) || slugify(raw.en?.title ?? "") || `service-${Date.now()}`;
  const values = {
    slug,
    icon: String(data.get("icon") ?? "mill"),
    sort: num(data.get("sort")),
    published: bool(data.get("published")),
    text,
    updatedAt: new Date(),
  };
  try {
    if (id) await db.update(schema.services).set(values).where(eq(schema.services.id, id));
    else id = (await db.insert(schema.services).values(values).returning())[0].id;
  } catch (e) {
    return { error: isUnique(e) ? "این نامک (slug) قبلاً استفاده شده است." : "ذخیره انجام نشد." };
  }
  refreshSite("services");
  pingIndexNow(locales.map((l) => ({ locale: l, path: `/services/${slug}` })));
  if (!data.get("_existing")) redirect(`/admin/services/${id}?saved=1`);
  return { ok: "ذخیره شد و سایت به‌روز شد." };
}

export async function deleteService(id: number) {
  await requireUser();
  await db.delete(schema.services).where(eq(schema.services.id, id));
  refreshSite("services");
  redirect("/admin/services");
}

/* -------------------------------------------------------------- equipment -- */
export async function saveEquipment(id: number | null, _prev: FormState, data: FormData): Promise<FormState> {
  await requireUser();
  const raw = readLocalized(data, "t", ["name", "description", "specs"] as const);
  if (!raw.fa?.name) return { error: "نام فارسی الزامی است." };
  const text: L<EquipmentText> = {};
  const specs: Spec[] = [];
  for (const [l, v] of Object.entries(raw)) {
    const loc = l as keyof typeof raw;
    text[loc] = { name: v.name, description: v.description };
    lines(v.specs).forEach((line, i) => {
      const [label, ...rest] = line.split(/[:：]/);
      specs[i] ??= { label: {}, value: {} };
      specs[i].label[loc] = label.trim();
      specs[i].value[loc] = rest.join(":").trim();
    });
  }
  const values = {
    kind: (data.get("kind") === "measure" ? "measure" : "machine") as "machine" | "measure",
    drawing: String(data.get("drawing") ?? "mill"),
    precision: String(data.get("precision") ?? "").trim() || null,
    sort: num(data.get("sort")),
    published: bool(data.get("published")),
    specs: specs.filter(Boolean),
    text,
    updatedAt: new Date(),
  };
  if (id) await db.update(schema.equipment).set(values).where(eq(schema.equipment.id, id));
  else id = (await db.insert(schema.equipment).values(values).returning())[0].id;
  refreshSite("equipment");
  if (!data.get("_existing")) redirect(`/admin/equipment/${id}?saved=1`);
  return { ok: "ذخیره شد و سایت به‌روز شد." };
}

export async function deleteEquipment(id: number) {
  await requireUser();
  await db.delete(schema.equipment).where(eq(schema.equipment.id, id));
  refreshSite("equipment");
  redirect("/admin/equipment");
}

/* -------------------------------------------------------------- portfolio -- */
export async function saveProject(id: number | null, _prev: FormState, data: FormData): Promise<FormState> {
  await requireUser();
  const raw = readLocalized(data, "t", ["title", "summary", "body", "material", "industry", "metaTitle", "metaDescription"] as const);
  if (!raw.fa?.title) return { error: "عنوان فارسی الزامی است." };
  const text: L<ProjectText> = {};
  for (const [l, v] of Object.entries(raw)) text[l as keyof typeof raw] = { ...v, body: textToHtml(v.body) };
  const slug = slugify(String(data.get("slug") ?? "")) || slugify(raw.en?.title ?? "") || `project-${Date.now()}`;
  const values = {
    slug,
    sort: num(data.get("sort")),
    published: bool(data.get("published")),
    imageIds: data.getAll("imageIds").map((v) => Number(v)).filter(Boolean),
    serviceSlugs: data.getAll("serviceSlugs").map(String),
    text,
    updatedAt: new Date(),
  };
  try {
    if (id) await db.update(schema.projects).set(values).where(eq(schema.projects.id, id));
    else id = (await db.insert(schema.projects).values(values).returning())[0].id;
  } catch (e) {
    return { error: isUnique(e) ? "این نامک (slug) قبلاً استفاده شده است." : "ذخیره انجام نشد." };
  }
  refreshSite("projects");
  pingIndexNow(locales.map((l) => ({ locale: l, path: `/portfolio/${slug}` })));
  if (!data.get("_existing")) redirect(`/admin/portfolio/${id}?saved=1`);
  return { ok: "ذخیره شد و سایت به‌روز شد." };
}

export async function deleteProject(id: number) {
  await requireUser();
  await db.delete(schema.projects).where(eq(schema.projects.id, id));
  refreshSite("projects");
  redirect("/admin/portfolio");
}

/* ------------------------------------------------------------------- faqs -- */
export async function saveFaq(id: number | null, _prev: FormState, data: FormData): Promise<FormState> {
  await requireUser();
  const text = readLocalized(data, "t", ["q", "a"] as const) as L<FaqText>;
  if (!text.fa?.q) return { error: "پرسش فارسی الزامی است." };
  const values = { sort: num(data.get("sort")), published: bool(data.get("published")), text, updatedAt: new Date() };
  if (id) await db.update(schema.faqs).set(values).where(eq(schema.faqs.id, id));
  else id = (await db.insert(schema.faqs).values(values).returning())[0].id;
  refreshSite("faqs");
  if (!data.get("_existing")) redirect(`/admin/faqs/${id}?saved=1`);
  return { ok: "ذخیره شد و سایت به‌روز شد." };
}

export async function deleteFaq(id: number) {
  await requireUser();
  await db.delete(schema.faqs).where(eq(schema.faqs.id, id));
  refreshSite("faqs");
  redirect("/admin/faqs");
}

/* ------------------------------------------------------------------ pages -- */
export async function savePage(key: string, fields: string[], _prev: FormState, data: FormData): Promise<FormState> {
  await requireUser();
  const value = readLocalized(data, "t", fields);
  await db
    .insert(schema.pages)
    .values({ key, data: value })
    .onConflictDoUpdate({ target: schema.pages.key, set: { data: value, updatedAt: new Date() } });
  refreshSite("pages");
  return { ok: "ذخیره شد و سایت به‌روز شد." };
}
