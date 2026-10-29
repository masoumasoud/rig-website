import Link from "next/link";
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionary";
import { getSettings } from "@/lib/content";
import { telHref, whatsappHref } from "@/lib/contact-links";
import { FileIcon, PhoneIcon, WhatsappIcon } from "@/components/icons";

/** Fixed bottom bar on phones: the three actions older visitors need most. */
export async function MobileBar() {
  const { locale, t } = await getI18n();
  const s = await getSettings();
  const item =
    "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[0.95rem] font-extrabold min-h-[60px]";
  return (
    <nav
      aria-label={t.common.call}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-2 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] backdrop-blur md:hidden"
    >
      <div className="flex gap-2">
        <a href={telHref(s.company.phone)} className={`${item} bg-ink text-white`} data-track="click_call">
          <PhoneIcon className="size-6" />
          {t.common.callShort}
        </a>
        <a
          href={whatsappHref(s.social.whatsapp)}
          className={`${item} bg-[#1f8f4e] text-white`}
          target="_blank"
          rel="noopener"
          data-track="click_whatsapp"
        >
          <WhatsappIcon className="size-6" />
          {t.common.whatsapp}
        </a>
        <Link href={`${localePath(locale, "/contact")}#quote`} className={`${item} bg-accent text-ink`}>
          <FileIcon className="size-6" />
          {t.common.quoteShort}
        </Link>
      </div>
    </nav>
  );
}
