import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { localePath, pick } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionary";
import { getEquipment, getServices, getService } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbLd, graph, serviceLd, webPageLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { CtaBand } from "@/components/cta-band";
import { Drawing } from "@/components/drawings";
import { ArrowIcon, CheckIcon, ServiceIcon } from "@/components/icons";

/** Which machine drawing illustrates each service. */
const serviceDrawing: Record<string, string> = {
  "cnc-milling": "mill",
  "cnc-turning": "lathe",
  "wire-edm": "wire",
  grinding: "grind",
  "manual-machining": "lathe",
  welding: "weld",
  "drilling-tapping": "drill",
  "special-machines": "cmm",
  "reverse-engineering": "caliper",
  "tooling-prototyping": "mill",
};

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { locale, t } = await getI18n();
  const service = await getService(slug);
  const text = service && pick(service.text, locale);
  if (!text) return {};
  return pageMetadata({
    locale,
    path: `/services/${slug}`,
    title: text.metaTitle || text.title,
    description: text.metaDescription || text.summary,
    siteName: t.brand,
    ogKey: `s-${slug}`,
  });
}

export default async function ServicePage({ params }: PageProps<"/[lang]/services/[slug]">) {
  const { slug } = await params;
  const { locale, t } = await getI18n();
  const [service, services, equipment] = await Promise.all([getService(slug), getServices(), getEquipment()]);
  const text = service && pick(service.text, locale);
  if (!service || !text) notFound();

  const path = `/services/${slug}`;
  const crumbs = [
    { name: t.common.breadcrumbHome, path: "/" },
    { name: t.nav.services, path: "/services" },
    { name: text.title, path },
  ];
  const drawing = serviceDrawing[slug] ?? "mill";
  const relatedMachines = equipment.filter((e) => e.drawing === drawing && e.kind === "machine");
  const others = services.filter((s) => s.slug !== slug).slice(0, 4);

  return (
    <>
      <PageHeader locale={locale} crumbs={crumbs} title={text.title} lead={text.summary} />
      <section className="section">
        <div className="wrap grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <article>
            <div className="prose-rig" dangerouslySetInnerHTML={{ __html: text.body }} />
            {text.bullets?.length ? (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {text.bullets.map((b) => (
                  <li key={b} className="card flex items-center gap-3 p-4 font-bold">
                    <CheckIcon className="size-6 flex-none text-ok" />
                    {b}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`${localePath(locale, "/contact")}?service=${slug}#quote`} className="btn btn-primary text-lg">
                {t.common.requestQuote}
                <ArrowIcon />
              </Link>
              <Link href={localePath(locale, "/equipment")} className="btn btn-outline text-lg">
                {t.common.viewEquipment}
              </Link>
            </div>
          </article>

          <aside className="space-y-6">
            <div data-io className="blueprint rounded-[var(--radius)] p-6 text-white/90">
              <Drawing name={drawing} className="w-full" />
            </div>
            {relatedMachines.map((m) => (
              <div key={m.id} className="card p-5">
                <h2 className="text-lg">{pick(m.text, locale)?.name}</h2>
                <dl className="mt-3 space-y-1.5">
                  {m.specs.map((sp, i) => (
                    <div key={i} className="flex justify-between gap-4 border-b border-dashed border-line pb-1.5 last:border-0">
                      <dt className="text-ink-2">{pick(sp.label, locale)}</dt>
                      <dd className="font-bold">{pick(sp.value, locale)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <section className="section border-t border-line bg-paper-2 !pt-12">
        <div className="wrap">
          <h2 className="h-section">{t.common.relatedServices}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((s) => (
              <li key={s.slug}>
                <Link href={localePath(locale, `/services/${s.slug}`)} className="card flex h-full items-center gap-3 p-5 font-bold hover:border-ink">
                  <ServiceIcon name={s.icon} className="size-7 flex-none" />
                  {pick(s.text, locale)?.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
      <JsonLd
        data={graph(
          webPageLd({ locale, path, name: text.metaTitle || text.title, description: text.metaDescription || text.summary }),
          breadcrumbLd(locale, path, crumbs),
          serviceLd(service, locale),
        )}
      />
    </>
  );
}
