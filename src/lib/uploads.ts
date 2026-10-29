import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Attachment } from "@/db/schema";

export const UPLOAD_ROOT = path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "./uploads");
/** Public images shown on the site, served at /media/*. */
export const PUBLIC_DIR = path.join(UPLOAD_ROOT, "public");
/** Customer drawings and email attachments; only reachable through the admin panel. */
export const PRIVATE_DIR = path.join(UPLOAD_ROOT, "private");

export const MAX_TOTAL_UPLOAD = 25 * 1024 * 1024;

export const allowedDrawingExt = new Set([
  "pdf", "dwg", "dxf", "step", "stp", "igs", "iges", "stl", "sldprt", "x_t",
  "jpg", "jpeg", "png", "webp", "heic", "zip", "rar", "7z",
]);

export const extOf = (name: string) => name.toLowerCase().split(".").pop() ?? "";

/** Keep a readable, filesystem-safe version of the original name. */
function safeName(name: string) {
  const base = path.basename(name).replace(/[^\p{L}\p{N}._-]+/gu, "-").replace(/-+/g, "-");
  return base.slice(-80) || "file";
}

/** Writes a private file and returns its relative path. */
export async function savePrivateFile(name: string, data: Buffer, type: string): Promise<Attachment> {
  const d = new Date();
  const dir = path.join(String(d.getFullYear()), String(d.getMonth() + 1).padStart(2, "0"));
  const file = path.join(dir, `${randomBytes(8).toString("hex")}-${safeName(name)}`);
  await mkdir(path.join(PRIVATE_DIR, dir), { recursive: true });
  await writeFile(path.join(PRIVATE_DIR, file), data);
  return { file, name: path.basename(name), size: data.length, type: type || "application/octet-stream" };
}

/** Resolve a stored relative path inside a root, refusing traversal. */
export function resolveInside(root: string, rel: string): string | null {
  const full = path.resolve(root, rel);
  return full.startsWith(root + path.sep) ? full : null;
}
