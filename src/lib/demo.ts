import type { Locale } from "@/i18n/config";

/** True in the static GitHub Pages build, which has no server for forms, the panel or email. */
export const isDemo = process.env.NEXT_PUBLIC_DEMO === "1";

export const demoNotice: Record<Locale, string> = {
  fa: "این نسخهٔ نمایشی است و ارسال فرم در آن غیرفعال است. برای استعلام قیمت تماس بگیرید.",
  en: "This is a demo version: the form cannot be submitted here. Please call us for a quote.",
  ar: "هذه نسخة تجريبية ولا يمكن إرسال النموذج منها. يرجى الاتصال بنا لطلب عرض سعر.",
  zh: "这是演示版本，无法提交表单。如需报价，请直接来电。",
  de: "Dies ist eine Demoversion: Das Formular kann hier nicht abgesendet werden. Bitte rufen Sie uns für ein Angebot an.",
  nl: "Dit is een demoversie: het formulier kan hier niet worden verzonden. Bel ons voor een offerte.",
};
