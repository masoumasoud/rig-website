import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { localePath, pick } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionary";
import { getMedia, getPage, getProjects } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbLd, graph, webPageLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { CtaBand } from "@/components/cta-band";
import { Drawing } from "@/components/drawings";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const page = pick(await getPage("portfolio"), locale) ?? {};
  return pageMetadata({
    locale,
    path: "/portfolio",
    title: page.metaTitle ?? t.portfolio.title,
    description: page.metaDescription ?? t.portfolio.lead,
    siteName: t.brand,
    ogKey: "portfolio",
  });
}

export default async function PortfolioPage() {
  const { locale, t } = await getI18n();
  const [projects, pageData] = await Promise.all([getProjects(), getPage("portfolio")]);
  const page = pick(pageData, locale) ?? {};
  const covers = await getMedia(projects.map((p) => p.imageIds[0]).filter((id): id is number => id != null));
  const coverOf = (id?: number) => covers.find((m) => m.id === id);
  const crumbs = [
    { name: t.common.breadcrumbHome, path: "/" },
    { name: t.nav.portfolio, path: "/portfolio" },
  ];

  return (
    <>
      <PageHeader locale={locale} crumbs={crumbs} title={t.portfolio.title} lead={t.portfolio.lead} />

      {/* Parts tray: machined parts drop in with physics on capable devices. */}
      <div data-physics className="relative h-56 overflow-hidden border-b border-line bg-paper-2 md:h-72" aria-hidden="true">
        <div className="grid-paper absolute inset-0 opacity-70" />
      </div>

      <section className="section">
        <div className="wrap">
          {projects.length === 0 ? (
            <div className="card mx-auto max-w-2xl p-8 text-center">
              <div data-io className="blueprint mx-auto mb-6 max-w-sm rounded-xl p-4 text-white/90">
                <Drawing name="caliper" className="w-full" />
              </div>
              <p className="text-lg text-ink-2">{t.common.comingSoon}</p>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => {
                const text = pick(p.text, locale);
                const cover = coverOf(p.imageIds[0]);
                return (
                  <li key={p.slug} className="card reveal overflow-hidden">
                    <Link href={localePath(locale, `/portfolio/${p.slug}`)} className="group block">
                      <div className="relative aspect-[4/3] bg-paper-2">
                        {cover ? (
                          <Image
                            src={`/media/${cover.file}`}
                            alt={pick(cover.alt, locale) ?? text?.title ?? ""}
                            fill
                            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div data-io className="blueprint flex size-full items-center p-6 text-white/90">
                            <Drawing name="mill" className="w-full" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h2 className="text-xl group-hover:underline">{text?.title}</h2>
                        <p className="mt-1 text-ink-2">{text?.summary}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
      <CtaBand />
      <JsonLd
        data={graph(
          webPageLd({
            locale,
            path: "/portfolio",
            name: page.metaTitle ?? t.portfolio.title,
            description: page.metaDescription ?? t.portfolio.lead,
            type: "CollectionPage",
          }),
          breadcrumbLd(locale, "/portfolio", crumbs),
        )}
      />
    </>
  );
}
