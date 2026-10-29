import type { SiteSettings } from "./settings-schema";

export const telHref = (e164: string) => `tel:${e164}`;

export const whatsappHref = (number: string, text?: string) =>
  `https://wa.me/${number.replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/** Messenger links that are configured in settings, in display order. */
export function messengerLinks(s: SiteSettings["social"], whatsappText?: string) {
  const strip = (v: string) => v.replace(/^@/, "");
  return [
    s.whatsapp && { key: "whatsapp", label: "WhatsApp", href: whatsappHref(s.whatsapp, whatsappText) },
    s.telegram && { key: "telegram", label: "Telegram", href: `https://t.me/${strip(s.telegram)}` },
    s.eitaa && { key: "eitaa", label: "Eitaa · ایتا", href: `https://eitaa.com/${strip(s.eitaa)}` },
    s.bale && { key: "bale", label: "Bale · بله", href: `https://ble.ir/${strip(s.bale)}` },
    s.rubika && { key: "rubika", label: "Rubika · روبیکا", href: `https://rubika.ir/${strip(s.rubika)}` },
  ].filter(Boolean) as { key: string; label: string; href: string }[];
}
