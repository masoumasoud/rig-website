import { ImageResponse } from "next/og";
import { isLocale, localeMeta, pick } from "@/i18n/config";
import { getPage, getProject, getService } from "@/lib/content";
import type { PageKey } from "@/content/seed/structure";

/**
 * Social share image (1200×630). Satori can't shape Persian/Arabic script, so
 * RTL and Chinese pages get the English title; LTR pages get their own.
 */
async function titleFor(key: string, locale: string): Promise<string> {
  const l = isLocale(locale) && localeMeta[locale].dir === "ltr" && locale !== "zh" ? locale : "en";
  if (key.startsWith("s-")) {
    const s = await getService(key.slice(2));
    return (s && pick(s.text, l)?.title) ?? "";
  }
  if (key.startsWith("p-")) {
    const p = await getProject(key.slice(2));
    return (p && pick(p.text, l)?.title) ?? "";
  }
  const pages: PageKey[] = ["home", "services", "equipment", "portfolio", "contact"];
  if (!pages.includes(key as PageKey)) return "";
  const data = pick(await getPage(key as PageKey), l);
  if (key === "home") return data?.heroTitle ?? "";
  return (data?.metaTitle ?? "").split("|")[0].trim();
}

export async function GET(_req: Request, ctx: RouteContext<"/og/[locale]/[key]">) {
  const { locale, key } = await ctx.params;
  const title = await titleFor(key, locale);
  const grid = "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#13304a",
          backgroundImage: grid,
          backgroundSize: "60px 60px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <rect width="120" height="120" rx="18" fill="#f6f5f1" />
            <path d="M45 24H13v86h94V24H75" fill="none" stroke="#111214" strokeWidth="9" />
            <path d="M36 3h48v8c-8 0-12 4-14 10l-2 13H52l-2-13c-2-6-6-10-14-10z" fill="#111214" />
            <rect x="51" y="34" width="18" height="6" fill="#111214" />
            <path d="M53 40h14l-3 7H56z" fill="#111214" />
            <path d="M56.5 47h7v22l-3.5 7-3.5-7z" fill="#f26a1b" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: 2 }}>R.I.G</div>
            <div style={{ fontSize: 30, opacity: 0.85 }}>Rezaei Industrial Group</div>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: title.length > 60 ? 52 : 64, fontWeight: 800, lineHeight: 1.15, maxWidth: 1050 }}>
          {title || "Precision machining & custom industrial parts"}
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 28 }}>
          {["CNC", "Wire EDM", "± 0.01 mm", "Since 1997", "Karaj · Iran"].map((x) => (
            <div key={x} style={{ display: "flex", padding: "8px 18px", borderRadius: 10, background: x.includes("0.01") ? "#f26a1b" : "rgba(255,255,255,.12)", color: x.includes("0.01") ? "#111214" : "white" }}>
              {x}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800" },
    },
  );
}
