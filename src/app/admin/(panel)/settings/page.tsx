import { localeMeta, locales } from "@/i18n/config";
import { requireUser } from "@/lib/auth";
import { getSettingsUncached } from "@/lib/settings";
import { Field, PageTitle, Panel } from "@/components/admin/ui";
import { SaveForm } from "@/components/admin/client";
import { saveSettings } from "../../actions/settings";

export const metadata = { title: "تنظیمات سایت" };

export default async function SettingsPage() {
  await requireUser();
  const s = await getSettingsUncached();
  const c = s.company;
  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle title="تنظیمات سایت" />
      <SaveForm action={saveSettings}>
        <Panel title="اطلاعات تماس">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="phone" label="تلفن ثابت (با کد کشور، برای لینک تماس)" defaultValue={c.phone} dir="ltr" />
            <Field name="phoneDisplay" label="تلفن ثابت (نحوه نمایش)" defaultValue={c.phoneDisplay} dir="ltr" />
            <Field name="mobile" label="موبایل (با کد کشور)" defaultValue={c.mobile} dir="ltr" />
            <Field name="mobileDisplay" label="موبایل (نحوه نمایش)" defaultValue={c.mobileDisplay} dir="ltr" />
            <Field name="email" label="ایمیل نمایش داده‌شده در سایت" defaultValue={c.email} dir="ltr" type="email" />
            <Field name="openingHours" label="ساعات کاری (برای گوگل)" defaultValue={c.openingHours} dir="ltr" hint="قالب: Sa-Th 08:00-17:00" />
          </div>
        </Panel>
        <Panel title="نام و نشانی به هر زبان">
          <div className="space-y-4">
            {locales.map((l) => (
              <div key={l} className="grid gap-3 sm:grid-cols-[8rem_1fr_2fr] sm:items-end">
                <span className="font-bold">{localeMeta[l].label}</span>
                <Field name={`name.${l}`} label="نام مجموعه" defaultValue={c.name[l]} dir={localeMeta[l].dir} />
                <Field name={`address.${l}`} label="نشانی" defaultValue={c.address[l]} dir={localeMeta[l].dir} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="موقعیت روی نقشه و نشانی ساختاریافته (برای گوگل)">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="lat" label="عرض جغرافیایی (lat)" defaultValue={c.geo.lat} dir="ltr" hint="در گوگل‌مپ روی کارگاه کلیک راست کنید و عدد اول را کپی کنید." />
            <Field name="lng" label="طول جغرافیایی (lng)" defaultValue={c.geo.lng} dir="ltr" />
            <Field name="mapUrl" label="لینک کارگاه در گوگل‌مپ (اختیاری)" defaultValue={c.mapUrl} dir="ltr" />
            <Field name="postalCode" label="کد پستی" defaultValue={c.postalCode} dir="ltr" />
            <Field name="street" label="نشانی خیابان (انگلیسی)" defaultValue={c.street} dir="ltr" />
            <Field name="locality" label="شهر (انگلیسی)" defaultValue={c.locality} dir="ltr" />
            <Field name="region" label="استان (انگلیسی)" defaultValue={c.region} dir="ltr" />
          </div>
        </Panel>
        <Panel title="پیام‌رسان‌ها و شبکه‌های اجتماعی">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="whatsapp" label="شماره واتساپ (با کد کشور، بدون +)" defaultValue={s.social.whatsapp} dir="ltr" hint="مثلاً 989124640459" />
            <Field name="telegram" label="آیدی تلگرام" defaultValue={s.social.telegram} dir="ltr" placeholder="@username" />
            <Field name="eitaa" label="آیدی ایتا" defaultValue={s.social.eitaa} dir="ltr" />
            <Field name="bale" label="آیدی بله" defaultValue={s.social.bale} dir="ltr" />
            <Field name="rubika" label="آیدی روبیکا" defaultValue={s.social.rubika} dir="ltr" />
            <Field name="instagram" label="لینک اینستاگرام" defaultValue={s.social.instagram} dir="ltr" />
            <Field name="linkedin" label="لینک لینکدین" defaultValue={s.social.linkedin} dir="ltr" />
          </div>
        </Panel>
        <Panel title="آمارگیر و ابزارهای گوگل و مایکروسافت">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="gtmId" label="Google Tag Manager ID" defaultValue={s.analytics.gtmId} dir="ltr" placeholder="GTM-XXXXXXX" />
            <Field name="ga4Id" label="Google Analytics 4 ID (فقط اگر GTM ندارید)" defaultValue={s.analytics.ga4Id} dir="ltr" placeholder="G-XXXXXXXXXX" />
            <Field name="clarityId" label="Microsoft Clarity Project ID" defaultValue={s.analytics.clarityId} dir="ltr" />
            <Field name="vGoogle" label="کد تأیید Google Search Console" defaultValue={s.verification.google} dir="ltr" hint="فقط مقدار content از تگ meta" />
            <Field name="vBing" label="کد تأیید Bing Webmaster (msvalidate.01)" defaultValue={s.verification.bing} dir="ltr" />
            <Field name="vYandex" label="کد تأیید Yandex (اختیاری)" defaultValue={s.verification.yandex} dir="ltr" />
          </div>
        </Panel>
        <Panel title="اطلاع‌رسانی پیام جدید">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="notifyEmails" label="ایمیل(های) دریافت اطلاع‌رسانی" defaultValue={s.notify.emails} dir="ltr" hint="با کاما جدا کنید" />
            <div />
            <Field name="baleBotToken" label="توکن ربات بله (اختیاری)" defaultValue={s.notify.baleBotToken} dir="ltr" hint="از @botfather در بله بگیرید" />
            <Field name="baleChatId" label="شناسه چت بله" defaultValue={s.notify.baleChatId} dir="ltr" />
          </div>
        </Panel>
      </SaveForm>
    </div>
  );
}
