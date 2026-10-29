export type PageFieldDef = { key: string; label: string; rows?: number };

const seo: PageFieldDef[] = [];

/** Editable text blocks per page; SEO title/description are added to every page. */
export const pageDefs: Record<string, { label: string; path: string; fields: PageFieldDef[] }> = {
  home: {
    label: "صفحه اصلی",
    path: "/",
    fields: [
      { key: "heroTitle", label: "تیتر اصلی (بالای صفحه)", rows: 2 },
      { key: "heroLead", label: "متن زیر تیتر", rows: 3 },
      { key: "aboutTitle", label: "عنوان بخش درباره ما" },
      { key: "aboutBody", label: "متن درباره ما", rows: 6 },
      { key: "ctaTitle", label: "عنوان بخش دعوت به تماس (پایین صفحه)" },
      { key: "ctaLead", label: "متن بخش دعوت به تماس", rows: 2 },
    ],
  },
  services: { label: "صفحه خدمات", path: "/services", fields: seo },
  equipment: { label: "صفحه تجهیزات", path: "/equipment", fields: seo },
  portfolio: { label: "صفحه نمونه‌کارها", path: "/portfolio", fields: seo },
  contact: { label: "صفحه تماس با ما", path: "/contact", fields: seo },
};
