import "server-only";
import { localePath, type Locale } from "@/i18n/config";
import { absoluteUrl, siteUrl } from "./seo";

/**
 * Tells Bing (and Yandex, Seznam…) about changed URLs right away.
 * The key file is served at /<INDEXNOW_KEY>.txt (rewritten to src/app/api/indexnow/route.ts).
 */
export function pingIndexNow(pages: { locale: Locale; path: string }[]) {
  const key = process.env.INDEXNOW_KEY;
  if (!key || siteUrl.includes("localhost")) return;
  const host = new URL(siteUrl).host;
  fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation: `${siteUrl}/${key}.txt`,
      urlList: pages.map((p) => absoluteUrl(localePath(p.locale, p.path))),
    }),
    signal: AbortSignal.timeout(8000),
  }).catch((e) => console.error("[indexnow]", e));
}
