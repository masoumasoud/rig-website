import type { Metadata } from "next";
import { pick } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionary";
import { currentYear, getEquipment, getFaqs, getPage, getServices, getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbLd, faqLd, graph, serviceListLd, webPageLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";
import { Hero } from "@/components/home/hero";
import { About, Faq, Machines, Precision, Process, Quality, Services, WhyUs } from "@/components/home/sections";
import { CtaBand } from "@/components/cta-band";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const page = pick(await getPage("home"), locale) ?? {};
  return pageMetadata({
    locale,
    path: "/",
    title: page.metaTitle ?? t.brand,
    description: page.metaDescription ?? "",
    siteName: t.brand,
  });
}

export default async function HomePage() {
  const { locale, t } = await getI18n();
  const [pageData, services, equipment, faqRows, settings, year] = await Promise.all([
    getPage("home"),
    getServices(),
    getEquipment(),
    getFaqs(),
    getSettings(),
    currentYear(),
  ]);
  const page = pick(pageData, locale) ?? {};
  const faqs = faqRows.map((f) => pick(f.text, locale)).filter((f) => f !== undefined);

  return (
    <>
      <Hero
        locale={locale}
        t={t}
        title={page.heroTitle}
        lead={page.heroLead}
        phone={settings.company.phone}
        years={year - settings.company.foundingYear}
      />
      <About locale={locale} t={t} title={page.aboutTitle} body={page.aboutBody} />
      <Services locale={locale} t={t} services={services} />
      <Precision locale={locale} t={t} />
      <Machines locale={locale} t={t} items={equipment} />
      <Process locale={locale} t={t} />
      <Quality locale={locale} t={t} />
      <WhyUs locale={locale} t={t} />
      <Faq title={t.home.faqTitle} faqs={faqs} />
      <CtaBand title={page.ctaTitle} lead={page.ctaLead} />
      <JsonLd
        data={graph(
          webPageLd({ locale, path: "/", name: page.metaTitle ?? t.brand, description: page.metaDescription ?? "" }),
          breadcrumbLd(locale, "/", [{ name: t.common.breadcrumbHome, path: "/" }]),
          serviceListLd(services, locale),
          faqLd(faqs),
        )}
      />
    </>
  );
}
