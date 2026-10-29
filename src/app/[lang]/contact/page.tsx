import type { Metadata } from "next";
import { pick } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionary";
import { getPage, getServices, getSettings } from "@/lib/content";
import { messengerLinks, telHref, whatsappHref } from "@/lib/contact-links";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbLd, graph, webPageLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { QuoteForm } from "@/components/quote-form";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, WhatsappIcon } from "@/components/icons";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const page = pick(await getPage("contact"), locale) ?? {};
  return pageMetadata({
    locale,
    path: "/contact",
    title: page.metaTitle ?? t.contact.title,
    description: page.metaDescription ?? t.contact.lead,
    siteName: t.brand,
    ogKey: "contact",
  });
}

export default async function ContactPage() {
  const { locale, t } = await getI18n();
  const [settings, services, pageData] = await Promise.all([getSettings(), getServices(), getPage("contact")]);
  const page = pick(pageData, locale) ?? {};
  const c = settings.company;
  const { lat, lng } = c.geo;
  const messengers = messengerLinks(settings.social).filter((m) => m.key !== "whatsapp");
  const crumbs = [
    { name: t.common.breadcrumbHome, path: "/" },
    { name: t.nav.contact, path: "/contact" },
  ];
  const maps = [
    { label: "Google Maps", href: c.mapUrl || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` },
    { label: "نشان · Neshan", href: `https://neshan.org/maps/@${lat},${lng},16z` },
    { label: "بلد · Balad", href: `https://balad.ir/location?latitude=${lat}&longitude=${lng}&zoom=16` },
  ];

  return (
    <>
      <PageHeader locale={locale} crumbs={crumbs} title={t.contact.title} lead={t.contact.lead} />
      <section className="section !pt-10">
        <div className="wrap grid gap-8 lg:grid-cols-[1.35fr_1fr] [&>*]:min-w-0">
          <div id="quote" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl">{t.form.title}</h2>
            <QuoteForm
              locale={locale}
              t={t.form}
              services={services.map((s) => ({ slug: s.slug, title: pick(s.text, locale)?.title ?? s.slug }))}
            />
          </div>

          <aside className="space-y-6">
            <div className="card p-6">
              <h2 className="text-2xl">{t.contact.directTitle}</h2>
              <div className="mt-5 flex flex-col gap-3">
                <a href={telHref(c.phone)} className="btn btn-dark justify-start text-lg">
                  <PhoneIcon />
                  <span>{t.common.phone}:</span>
                  <span className="ltr">{c.phoneDisplay}</span>
                </a>
                <a href={telHref(c.mobile)} className="btn btn-outline justify-start text-lg">
                  <PhoneIcon />
                  <span>{t.common.mobile}:</span>
                  <span className="ltr">{c.mobileDisplay}</span>
                </a>
                <a href={whatsappHref(settings.social.whatsapp)} target="_blank" rel="noopener" className="btn btn-whatsapp justify-start text-lg">
                  <WhatsappIcon />
                  {t.common.whatsapp}
                </a>
                {messengers.map((m) => (
                  <a key={m.key} href={m.href} target="_blank" rel="noopener" className="btn btn-outline justify-start">
                    {m.label}
                  </a>
                ))}
              </div>
              <ul className="mt-6 space-y-4 border-t border-line pt-5">
                <li className="flex gap-3">
                  <MailIcon className="mt-1 size-6 flex-none" />
                  <div>
                    <p className="font-bold">{t.common.email}</p>
                    <a href={`mailto:${c.email}`} className="link ltr break-all">
                      {c.email}
                    </a>
                  </div>
                </li>
                <li className="flex gap-3">
                  <PinIcon className="mt-1 size-6 flex-none" />
                  <div>
                    <p className="font-bold">{t.common.address}</p>
                    <p className="text-ink-2">{pick(c.address, locale)}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <ClockIcon className="mt-1 size-6 flex-none" />
                  <div>
                    <p className="font-bold">{t.common.hours}</p>
                    <p className="text-ink-2">{t.footer.hoursValue}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="card overflow-hidden">
              <div className="blueprint relative flex h-48 items-center justify-center">
                <svg viewBox="0 0 200 120" className="h-full w-full text-blueprint-line" aria-hidden="true" fill="none" stroke="currentColor">
                  <path d="M0 80h200M0 40h200M60 0v120M140 0v120" strokeWidth="6" opacity=".35" />
                  <path d="M0 100L200 20" strokeWidth="3" opacity=".3" />
                  <circle cx="100" cy="60" r="18" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 4" className="spin-slow" />
                </svg>
                <PinIcon className="absolute size-12 -translate-y-3 text-accent" />
              </div>
              <div className="p-5">
                <h2 className="text-lg">{t.contact.mapTitle}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {maps.map((m) => (
                    <a key={m.label} href={m.href} target="_blank" rel="noopener" className="btn btn-outline !min-h-12 !px-4">
                      {m.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <JsonLd
        data={graph(
          webPageLd({
            locale,
            path: "/contact",
            name: page.metaTitle ?? t.contact.title,
            description: page.metaDescription ?? t.contact.lead,
            type: "ContactPage",
          }),
          breadcrumbLd(locale, "/contact", crumbs),
        )}
      />
    </>
  );
}
