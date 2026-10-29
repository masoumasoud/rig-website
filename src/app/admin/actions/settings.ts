"use server";

import { db, schema } from "@/db";
import { locales, type L } from "@/i18n/config";
import { requireUser } from "@/lib/auth";
import { refreshSite } from "@/lib/admin-form";
import { getSettingsUncached } from "@/lib/settings";
import type { SiteSettings } from "@/lib/settings-schema";
import type { FormState } from "@/components/admin/client";

const str = (d: FormData, k: string) => String(d.get(k) ?? "").trim();
const digits = (s: string) => s.replace(/[۰-۹]/g, (c) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)));

export async function saveSettings(_prev: FormState, d: FormData): Promise<FormState> {
  await requireUser();
  const current = await getSettingsUncached();
  const name: L<string> = {};
  const address: L<string> = {};
  for (const l of locales) {
    if (str(d, `name.${l}`)) name[l] = str(d, `name.${l}`);
    if (str(d, `address.${l}`)) address[l] = str(d, `address.${l}`);
  }
  const lat = Number(digits(str(d, "lat")));
  const lng = Number(digits(str(d, "lng")));
  const next: SiteSettings = {
    company: {
      ...current.company,
      name,
      address,
      phone: digits(str(d, "phone")),
      phoneDisplay: str(d, "phoneDisplay"),
      mobile: digits(str(d, "mobile")),
      mobileDisplay: str(d, "mobileDisplay"),
      email: str(d, "email"),
      street: str(d, "street"),
      locality: str(d, "locality"),
      region: str(d, "region"),
      postalCode: digits(str(d, "postalCode")),
      geo: { lat: Number.isFinite(lat) ? lat : current.company.geo.lat, lng: Number.isFinite(lng) ? lng : current.company.geo.lng },
      openingHours: str(d, "openingHours"),
      mapUrl: str(d, "mapUrl"),
    },
    social: {
      whatsapp: digits(str(d, "whatsapp")).replace(/\D/g, ""),
      telegram: str(d, "telegram"),
      eitaa: str(d, "eitaa"),
      bale: str(d, "bale"),
      rubika: str(d, "rubika"),
      instagram: str(d, "instagram"),
      linkedin: str(d, "linkedin"),
    },
    analytics: { gtmId: str(d, "gtmId"), ga4Id: str(d, "ga4Id"), clarityId: str(d, "clarityId") },
    verification: { google: str(d, "vGoogle"), bing: str(d, "vBing"), yandex: str(d, "vYandex") },
    notify: { emails: str(d, "notifyEmails"), baleBotToken: str(d, "baleBotToken"), baleChatId: str(d, "baleChatId") },
  };
  if (!/^\+\d{8,15}$/.test(next.company.phone)) return { error: "شماره تلفن را با کد کشور بنویسید، مثل +982634711130" };
  for (const [key, value] of Object.entries(next)) {
    await db.insert(schema.settings).values({ key, value }).onConflictDoUpdate({ target: schema.settings.key, set: { value } });
  }
  refreshSite("settings");
  return { ok: "تنظیمات ذخیره شد و سایت به‌روز شد." };
}
