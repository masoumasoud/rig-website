import type { Metadata } from "next";
import Link from "next/link";
import { localePath, pick } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionary";
import { getPage, getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbLd, graph, serviceLd, webPageLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { CtaBand } from "@/components/cta-band";
import { ArrowIcon, CheckIcon, ServiceIcon } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const page = pick(await getPage("services"), locale) ?? {};
  return pageMetadata({
    locale,
    path: "/services",
    title: page.metaTitle ?? t.services.title,
    description: page.metaDescription ?? t.services.lead,
    siteName: t.brand,
    ogKey: "services",
  });
}

export default async function ServicesPage() {
  const { locale, t } = await getI18n();
  const [services, pageData] = await Promise.all([getServices(), getPage("services")]);
  const page = pick(pageData, locale) ?? {};
  const crumbs = [
    { name: t.common.breadcrumbHome, path: "/" },
    { name: t.nav.services, path: "/services" },
  ];

  return (
    <>
      <PageHeader locale={locale} crumbs={crumbs} title={t.services.title} lead={t.services.lead} />
      <section className="section">
        <ul className="wrap grid gap-6 md:grid-cols-2">
          {services.map((s) => {
            const text = pick(s.text, locale);
            if (!text) return null;
            return (
              <li key={s.slug} className="card reveal flex flex-col p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex size-14 flex-none items-center justify-center rounded-xl bg-ink text-white">
                    <ServiceIcon name={s.icon} className="size-8" />
                  </span>
                  <div>
                    <h2 className="text-2xl">
                      <Link href={localePath(locale, `/services/${s.slug}`)} className="hover:underline">
                        {text.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-ink-2">{text.summary}</p>
                  </div>
                </div>
                {text.bullets?.length ? (
                  <ul className="mt-5 space-y-2 border-t border-line pt-5">
                    {text.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5">
                        <CheckIcon className="size-5 flex-none text-ok" />
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <Link href={localePath(locale, `/services/${s.slug}`)} className="btn btn-outline mt-6 self-start">
                  {t.common.learnMore}
                  <span className="sr-only">: {text.title}</span>
                  <ArrowIcon />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <CtaBand />
      <JsonLd
        data={graph(
          webPageLd({
            locale,
            path: "/services",
            name: page.metaTitle ?? t.services.title,
            description: page.metaDescription ?? t.services.lead,
            type: "CollectionPage",
          }),
          breadcrumbLd(locale, "/services", crumbs),
          ...services.map((s) => serviceLd(s, locale)),
        )}
      />
    </>
  );
}
