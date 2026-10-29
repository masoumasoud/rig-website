"use server";

import { randomBytes } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { locales, type L } from "@/i18n/config";
import { requireUser } from "@/lib/auth";
import { refreshSite } from "@/lib/admin-form";
import { PUBLIC_DIR, resolveInside } from "@/lib/uploads";
import type { FormState } from "@/components/admin/client";

/** Resizes to ≤2000px, strips metadata and stores WebP; next/image serves AVIF/WebP variants. */
export async function uploadMedia(_prev: FormState, data: FormData): Promise<FormState> {
  await requireUser();
  const files = data.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { error: "عکسی انتخاب نشده است." };
  const alt = String(data.get("alt") ?? "").trim();
  const d = new Date();
  const dir = path.join(String(d.getFullYear()), String(d.getMonth() + 1).padStart(2, "0"));
  await mkdir(path.join(PUBLIC_DIR, dir), { recursive: true });
  let done = 0;
  for (const f of files) {
    if (!f.type.startsWith("image/") || f.size > 25 * 1024 * 1024) continue;
    try {
      const base = path.basename(f.name, path.extname(f.name)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "image";
      const file = path.join(dir, `${base}-${randomBytes(3).toString("hex")}.webp`).split(path.sep).join("/");
      const info = await sharp(Buffer.from(await f.arrayBuffer()))
        .rotate()
        .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(PUBLIC_DIR, file));
      await db.insert(schema.media).values({ file, width: info.width, height: info.height, alt: alt ? { fa: alt } : {} });
      done++;
    } catch (e) {
      console.error("[media]", e);
    }
  }
  refreshSite("media");
  return done ? { ok: `${done.toLocaleString("fa-IR")} عکس بارگذاری شد.` } : { error: "فایل‌ها عکس معتبر نبودند." };
}

export async function saveMediaAlt(id: number, _prev: FormState, data: FormData): Promise<FormState> {
  await requireUser();
  const alt: L<string> = {};
  for (const l of locales) {
    const v = String(data.get(`alt.${l}`) ?? "").trim();
    if (v) alt[l] = v;
  }
  await db.update(schema.media).set({ alt, updatedAt: new Date() }).where(eq(schema.media.id, id));
  refreshSite("media");
  return { ok: "ذخیره شد." };
}

export async function deleteMedia(id: number) {
  await requireUser();
  const [row] = await db.select().from(schema.media).where(eq(schema.media.id, id));
  if (!row) return;
  const full = resolveInside(PUBLIC_DIR, row.file);
  if (full) await unlink(full).catch(() => {});
  await db.delete(schema.media).where(eq(schema.media.id, id));
  refreshSite("media", "projects");
}
