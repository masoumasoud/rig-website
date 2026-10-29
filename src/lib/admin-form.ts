import "server-only";
import { updateTag } from "next/cache";
import { locales, type L, type Locale } from "@/i18n/config";

/** Reads fields named `<prefix>.<locale>.<field>` into a localized object; empty locales are dropped. */
export function readLocalized<F extends string>(data: FormData, prefix: string, fields: readonly F[]) {
  const out: L<Record<F, string>> = {};
  for (const l of locales) {
    const entry = {} as Record<F, string>;
    let any = false;
    for (const f of fields) {
      const v = String(data.get(`${prefix}.${l}.${f}`) ?? "").trim();
      entry[f] = v;
      if (v) any = true;
    }
    if (any) out[l] = entry;
  }
  return out;
}

/** Completion status of each locale for the language tabs. */
export function localeStatus(value: L<Record<string, unknown>> | undefined, required: string[]) {
  const status: Partial<Record<Locale, "full" | "partial" | "empty">> = {};
  for (const l of locales) {
    const v = value?.[l];
    if (!v) status[l] = "empty";
    else status[l] = required.every((f) => String(v[f] ?? "").trim()) ? "full" : "partial";
  }
  return status;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Plain text -> safe HTML for non-technical editors:
 * blank line = new paragraph, lines starting with "-" = bullet list.
 */
export function textToHtml(text: string): string {
  return text
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n");
      if (lines.every((l) => /^\s*[-•]/.test(l))) {
        return `<ul>${lines.map((l) => `<li>${esc(l.replace(/^\s*[-•]\s*/, ""))}</li>`).join("")}</ul>`;
      }
      return `<p>${lines.map(esc).join("<br>")}</p>`;
    })
    .join("");
}

export function htmlToText(html: string | undefined): string {
  if (!html) return "";
  return html
    .replace(/<li>/g, "- ")
    .replace(/<\/li>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/p>|<\/ul>/g, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const lines = (s: string) =>
  s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/** Expire cached public content immediately after an admin edit. */
export function refreshSite(...tags: string[]) {
  for (const tag of tags) updateTag(tag);
}
