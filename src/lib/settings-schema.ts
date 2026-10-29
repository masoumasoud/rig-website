import type { L } from "@/i18n/config";

/** Site-wide settings editable from the admin panel. */
export type SiteSettings = {
  company: {
    name: L<string>;
    foundingYear: number;
    /** E.164 numbers used in tel: links and schema; display strings shown to visitors. */
    phone: string;
    phoneDisplay: string;
    mobile: string;
    mobileDisplay: string;
    email: string;
    address: L<string>;
    street: string;
    locality: string;
    region: string;
    postalCode: string;
    geo: { lat: number; lng: number };
    /** Schema.org openingHours, e.g. "Sa-Th 08:00-17:00". */
    openingHours: string;
    mapUrl: string;
  };
  social: {
    whatsapp: string;
    telegram: string;
    eitaa: string;
    bale: string;
    rubika: string;
    instagram: string;
    linkedin: string;
  };
  analytics: { gtmId: string; ga4Id: string; clarityId: string };
  verification: { google: string; bing: string; yandex: string };
  notify: { emails: string; baleBotToken: string; baleChatId: string };
};

export const defaultSettings: SiteSettings = {
  company: {
    name: {
      fa: "گروه صنعتی رضایی",
      en: "Rezaei Industrial Group",
      ar: "مجموعة رضائي الصناعية",
      zh: "雷扎伊工业集团",
      de: "Rezaei Industrial Group",
      nl: "Rezaei Industrial Group",
    },
    foundingYear: 1997,
    phone: "+982634711130",
    phoneDisplay: "026-34711130",
    mobile: "+989124640459",
    mobileDisplay: "0912 464 0459",
    email: "Rezaei.S.Ind@gmail.com",
    address: {
      fa: "کرج، کمالشهر، بعد از میدان شهید بهشتی، مجتمع صنعتکاران",
      en: "Sanatkaran Industrial Complex, after Shahid Beheshti Square, Kamalshahr, Karaj, Alborz, Iran",
      ar: "مجمع صنعتكاران، بعد ميدان الشهيد بهشتي، كمال شهر، كرج، البرز، إيران",
      zh: "伊朗厄尔布尔士省卡拉季市卡迈勒沙赫尔，Shahid Beheshti 广场后，Sanatkaran 工业园区",
      de: "Sanatkaran-Industriekomplex, nach dem Shahid-Beheshti-Platz, Kamalshahr, Karadsch, Alborz, Iran",
      nl: "Sanatkaran-industriecomplex, na het Shahid Beheshti-plein, Kamalshahr, Karaj, Alborz, Iran",
    },
    street: "Sanatkaran Industrial Complex, after Shahid Beheshti Square",
    locality: "Kamalshahr, Karaj",
    region: "Alborz",
    postalCode: "",
    // Approximate centre of Kamalshahr; replace with the exact workshop pin from the admin panel.
    geo: { lat: 35.8617, lng: 50.8733 },
    openingHours: "Sa-Th 08:00-17:00",
    mapUrl: "",
  },
  social: {
    whatsapp: "989124640459",
    telegram: "",
    eitaa: "",
    bale: "",
    rubika: "",
    instagram: "",
    linkedin: "",
  },
  analytics: { gtmId: "", ga4Id: "", clarityId: "" },
  verification: { google: "", bing: "", yandex: "" },
  notify: { emails: "Rezaei.S.Ind@gmail.com", baleBotToken: "", baleChatId: "" },
};
