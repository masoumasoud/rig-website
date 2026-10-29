import Link from "next/link";
import { localePath, num, pick } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionary";
import { currentYear, getServices, getSettings } from "@/lib/content";
import { messengerLinks, telHref, whatsappHref } from "@/lib/contact-links";
import { LogoMark } from "@/components/logo";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, WhatsappIcon } from "@/components/icons";
import { navItems } from "./header";

export async function Footer() {
  const { locale, t } = await getI18n();
  const [settings, services, items, year] = await Promise.all([getSettings(), getServices(), navItems(), currentYear()]);
  const c = settings.company;
  const name = pick(c.name, locale) ?? t.brand;
  const messengers = messengerLinks(settings.social).filter((m) => m.key !== "whatsapp");

  return (
    <footer className="blueprint mt-auto">
      <div className="wrap grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3 [--logo-bg:var(--blueprint)]">
            <LogoMark className="size-14 text-white" />
            <p className="text-lg font-extrabold">{name}</p>
          </div>
          <p className="mt-4 text-white/85">{t.footer.about}</p>
        </div>

        <nav aria-label={t.footer.quickLinks}>
          <h2 className="mb-3 text-lg font-extrabold">{t.footer.quickLinks}</h2>
          <ul className="space-y-1">
            {items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} className="inline-flex min-h-11 items-center text-white/90 hover:text-white hover:underline">
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t.nav.services}>
          <h2 className="mb-3 text-lg font-extrabold">{t.nav.services}</h2>
          <ul className="space-y-1">
            {services.slice(0, 7).map((s) => (
              <li key={s.slug}>
                <Link
                  href={localePath(locale, `/services/${s.slug}`)}
                  className="inline-flex min-h-11 items-center text-white/90 hover:text-white hover:underline"
                >
                  {pick(s.text, locale)?.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <address className="not-italic">
          <h2 className="mb-3 text-lg font-extrabold">{t.nav.contact}</h2>
          <ul className="space-y-3 text-white/90">
            <li className="flex gap-3">
              <PinIcon className="mt-1 size-5 flex-none" />
              <span>{pick(c.address, locale)}</span>
            </li>
            <li className="flex gap-3">
              <PhoneIcon className="mt-1 size-5 flex-none" />
              <span className="flex flex-col">
                <a href={telHref(c.phone)} className="ltr hover:underline">
                  {c.phoneDisplay}
                </a>
                <a href={telHref(c.mobile)} className="ltr hover:underline">
                  {c.mobileDisplay}
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <MailIcon className="mt-1 size-5 flex-none" />
              <a href={`mailto:${c.email}`} className="ltr break-all hover:underline">
                {c.email}
              </a>
            </li>
            <li className="flex gap-3">
              <ClockIcon className="mt-1 size-5 flex-none" />
              <span>{t.footer.hoursValue}</span>
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={whatsappHref(settings.social.whatsapp)} className="btn btn-whatsapp !min-h-11 !px-4" rel="noopener" target="_blank">
              <WhatsappIcon />
              {t.common.whatsapp}
            </a>
            {messengers.map((m) => (
              <a key={m.key} href={m.href} className="btn btn-light !min-h-11 !px-4" rel="noopener" target="_blank">
                {m.label}
              </a>
            ))}
          </div>
        </address>
      </div>
      <div className="border-t border-white/15">
        <p className="wrap py-5 text-sm text-white/75">
          © {num(year, locale)} {name}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
