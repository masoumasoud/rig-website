import Link from "next/link";
import { localePath, pick } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionary";
import { getSettings } from "@/lib/content";
import { telHref } from "@/lib/contact-links";
import { LogoMark } from "@/components/logo";
import { PhoneIcon } from "@/components/icons";
import { LangSwitcher, MobileMenu, NavLink, TextSizeToggle } from "./header-client";

export async function navItems() {
  const { locale, t } = await getI18n();
  return [
    { href: localePath(locale, "/"), label: t.nav.home },
    { href: localePath(locale, "/services"), label: t.nav.services },
    { href: localePath(locale, "/equipment"), label: t.nav.equipment },
    { href: localePath(locale, "/portfolio"), label: t.nav.portfolio },
    { href: localePath(locale, "/contact"), label: t.nav.contact },
  ];
}

export async function Header() {
  const { locale, t } = await getI18n();
  const settings = await getSettings();
  const items = await navItems();
  const name = pick(settings.company.name, locale) ?? t.brand;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="wrap flex h-[var(--header-h)] items-center gap-3">
        <Link href={localePath(locale, "/")} className="flex items-center gap-3 me-auto" aria-label={name}>
          <LogoMark className="size-11 flex-none text-ink" />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-[1.05rem] font-extrabold">{name}</span>
            <span className="ltr text-xs font-semibold tracking-wide text-ink-3">REZAEI INDUSTRIAL GROUP</span>
          </span>
        </Link>

        <nav aria-label={t.nav.menu} className="hidden lg:block">
          <ul className="flex items-center">
            {items.map((it) => (
              <li key={it.href}>
                <NavLink href={it.href}>{it.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <TextSizeToggle label={t.common.textSize} />
          <LangSwitcher locale={locale} label={t.common.language} />
          <a href={telHref(settings.company.phone)} className="btn btn-dark hidden !min-h-12 !px-4 xl:inline-flex">
            <PhoneIcon />
            <span className="ltr">{settings.company.phoneDisplay}</span>
          </a>
          <MobileMenu items={items} labels={{ menu: t.nav.menu, close: t.nav.close }} />
        </div>
      </div>
    </header>
  );
}
