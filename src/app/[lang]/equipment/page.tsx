import type { Metadata } from "next";
import { num, pick } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionary";
import { getEquipment, getPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbLd, equipmentListLd, graph, webPageLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { CtaBand } from "@/components/cta-band";
import { Drawing } from "@/components/drawings";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const page = pick(await getPage("equipment"), locale) ?? {};
  return pageMetadata({
    locale,
    path: "/equipment",
    title: page.metaTitle ?? t.equipment.title,
    description: page.metaDescription ?? t.equipment.lead,
    siteName: t.brand,
    ogKey: "equipment",
  });
}

export default async function EquipmentPage() {
  const { locale, t } = await getI18n();
  const [items, pageData] = await Promise.all([getEquipment(), getPage("equipment")]);
  const page = pick(pageData, locale) ?? {};
  const machines = items.filter((e) => e.kind === "machine");
  const measures = items.filter((e) => e.kind === "measure");
  const crumbs = [
    { name: t.common.breadcrumbHome, path: "/" },
    { name: t.nav.equipment, path: "/equipment" },
  ];

  return (
    <>
      <PageHeader locale={locale} crumbs={crumbs} title={t.equipment.title} lead={t.equipment.lead} />

      <section className="section">
        <div className="wrap">
          <h2 className="h-section">{t.equipment.machines}</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {machines.map((m, i) => {
              const text = pick(m.text, locale);
              return (
                <li key={m.id} className="card reveal overflow-hidden">
                  <div data-io className="blueprint relative p-5 text-white/90">
                    <span className="ltr absolute top-3 start-4 font-mono text-xs text-blueprint-line">
                      DWG-{String(i + 1).padStart(3, "0")}
                    </span>
                    {m.precision ? (
                      <span className="absolute top-3 end-4 rounded-md bg-accent px-2 py-0.5 text-sm font-extrabold text-ink">
                        ± <span className="ltr">{num(m.precision, locale)}</span> {t.common.mm}
                      </span>
                    ) : null}
                    <Drawing name={m.drawing} className="mx-auto mt-4 w-full max-w-md" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl">{text?.name}</h3>
                    <p className="mt-1 text-ink-2">{text?.description}</p>
                    {m.specs.length > 0 && (
                      <dl className="mt-4 space-y-2">
                        {m.specs.map((sp, j) => (
                          <div key={j} className="flex justify-between gap-4 border-b border-dashed border-line pb-2 last:border-0">
                            <dt className="text-ink-2">{pick(sp.label, locale)}</dt>
                            <dd className="font-bold">{pick(sp.value, locale)}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section border-t border-line bg-paper-2">
        <div className="wrap">
          <h2 className="h-section">{t.equipment.measures}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {measures.map((m) => {
              const text = pick(m.text, locale);
              return (
                <li key={m.id} className="card reveal overflow-hidden">
                  <div data-io className="blueprint p-4 text-white/90">
                    <Drawing name={m.drawing} className="w-full" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg">{text?.name}</h3>
                    <p className="mt-1 text-ink-2">{text?.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <CtaBand />
      <JsonLd
        data={graph(
          webPageLd({
            locale,
            path: "/equipment",
            name: page.metaTitle ?? t.equipment.title,
            description: page.metaDescription ?? t.equipment.lead,
          }),
          breadcrumbLd(locale, "/equipment", crumbs),
          equipmentListLd(items, locale),
        )}
      />
    </>
  );
}
