import Link from "next/link";
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionary";
import { getSettings } from "@/lib/content";
import { telHref, whatsappHref } from "@/lib/contact-links";
import { FileIcon, PhoneIcon, WhatsappIcon } from "@/components/icons";

/** Compact dock on phones with the three actions older visitors need most. */
export async function MobileBar() {
  const { locale, t } = await getI18n();
  const s = await getSettings();
  const item = "flex flex-1 items-center justify-center gap-2 px-2 text-[0.95rem] font-bold whitespace-nowrap";
  return (
    <nav
      aria-label={t.common.call}
      // Side and bottom gaps keep the dock clear of the rounded display corners and the home indicator.
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,calc(env(safe-area-inset-bottom)-0.25rem))] pl-[max(1rem,env(safe-area-inset-left))] md:hidden"
    >
      <div className="pointer-events-auto mx-auto flex h-[52px] max-w-md divide-x divide-line overflow-hidden rounded-2xl border border-line bg-card shadow-[0_6px_24px_rgb(17_18_20/0.16)]">
        <a href={telHref(s.company.phone)} className={`${item} text-ink`} data-track="click_call">
          <PhoneIcon className="size-5" />
          {t.common.callShort}
        </a>
        <a
          href={whatsappHref(s.social.whatsapp)}
          className={`${item} text-[#1a7a43]`}
          target="_blank"
          rel="noopener"
          data-track="click_whatsapp"
        >
          <WhatsappIcon className="size-5" />
          {t.common.whatsapp}
        </a>
        <Link href={`${localePath(locale, "/contact")}#quote`} className={`${item} bg-accent font-extrabold text-ink`}>
          <FileIcon className="size-5" />
          {t.common.quoteShort}
        </Link>
      </div>
    </nav>
  );
}
