import type { Metadata, Viewport } from "next";
import { consentLocales, localeMeta, locales, pick } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionary";
import { getServices, getSettings } from "@/lib/content";
import { siteUrl } from "@/lib/seo";
import { isDemo } from "@/lib/demo";
import { graph, organizationLd, websiteLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBar } from "@/components/layout/mobile-bar";
import { Analytics } from "@/components/analytics";
import { FxRuntime } from "@/components/fx/fx-runtime";
import "../globals.css";

import { manrope, vazirmatn } from "@/fonts";

/**
 * Runs before first paint: marks JS as available, restores the text-size choice
 * and picks an animation tier so weak phones never download the heavy effects.
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('rig-text');if(t)d.dataset.text=t}catch(e){}var m='high',q=window.matchMedia,n=navigator,c=n.connection||{},mem=n.deviceMemory||8,cpu=n.hardwareConcurrency||8;if(q&&q('(prefers-reduced-motion: reduce)').matches)m='none';else if(c.saveData||/2g/.test(c.effectiveType||'')||mem<=4||cpu<=4)m='low';d.dataset.motion=m})()`;

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const s = await getSettings();
  const v = s.verification;
  return {
    metadataBase: new URL(siteUrl),
    applicationName: pick(s.company.name, locale) ?? t.brand,
    title: { default: t.brand, template: `%s | ${t.brand}` },
    formatDetection: { telephone: false, address: false, email: false },
    robots: isDemo ? { index: false, follow: false } : undefined,
    verification: {
      google: v.google || undefined,
      yandex: v.yandex || undefined,
      other: v.bing ? { "msvalidate.01": v.bing } : undefined,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f5f1",
};

export default async function SiteLayout({ children }: LayoutProps<"/[lang]">) {
  const { locale, t } = await getI18n();
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const meta = localeMeta[locale];
  const rtl = meta.dir === "rtl";
  const fontStack = rtl
    ? "var(--font-vazir), var(--font-latin), Tahoma, sans-serif"
    : locale === "zh"
      ? 'var(--font-latin), "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif'
      : "var(--font-latin), var(--font-vazir), system-ui, sans-serif";

  return (
    <html
      lang={meta.hreflang}
      dir={meta.dir}
      className={`${vazirmatn.variable} ${manrope.variable}`}
      style={{ ["--font-main" as string]: fontStack }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-3 focus:text-white"
        >
          {t.skip}
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <MobileBar />
        <JsonLd data={graph(organizationLd(settings, locale, services), websiteLd(settings, locale))} />
        <Analytics
          gtmId={settings.analytics.gtmId}
          ga4Id={settings.analytics.ga4Id}
          clarityId={settings.analytics.clarityId}
          needsConsent={consentLocales.includes(locale)}
          labels={t.consent}
        />
        <FxRuntime />
      </body>
    </html>
  );
}
