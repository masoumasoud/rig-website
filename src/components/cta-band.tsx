import Link from "next/link";
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionary";
import { getSettings } from "@/lib/content";
import { messengerLinks, telHref } from "@/lib/contact-links";
import { ArrowIcon, PhoneIcon, WhatsappIcon } from "@/components/icons";

export async function CtaBand({ title, lead }: { title?: string; lead?: string }) {
  const { locale, t } = await getI18n();
  const s = await getSettings();
  const messengers = messengerLinks(s.social);
  return (
    <section className="bg-ink text-white">
      <div className="wrap grid items-center gap-8 py-14 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="h-section">{title ?? t.services.ctaTitle}</h2>
          <p className="mt-3 text-lg text-white/85">{lead ?? t.services.ctaLead}</p>
          {messengers.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 font-bold text-white/85">{t.common.sendFilesVia}:</p>
              <div className="flex flex-wrap gap-2">
                {messengers.map((m) => (
                  <a
                    key={m.key}
                    href={m.href}
                    target="_blank"
                    rel="noopener"
                    className={`btn !min-h-12 !px-4 ${m.key === "whatsapp" ? "btn-whatsapp" : "btn-light"}`}
                  >
                    {m.key === "whatsapp" ? <WhatsappIcon /> : null}
                    {m.label}
                  </a>
                ))}
                <a href={`mailto:${s.company.email}`} className="btn btn-light !min-h-12 !px-4">
                  {t.common.email}
                </a>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <Link href={`${localePath(locale, "/contact")}#quote`} className="btn btn-primary text-lg">
            {t.common.requestQuote}
            <ArrowIcon />
          </Link>
          <a href={telHref(s.company.phone)} className="btn btn-light text-lg">
            <PhoneIcon />
            <span>{t.common.call}</span>
            <span className="ltr">{s.company.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
