import type { EquipmentText, FaqText, ServiceText } from "@/db/schema";
import type { PageKey, ServiceSlug, SpecKey } from "./structure";

export type SeedLocale = {
  pages: Record<PageKey, Record<string, string>>;
  services: Record<ServiceSlug, ServiceText>;
  equipment: Record<string, EquipmentText>;
  specLabels: Record<SpecKey, string>;
  specTexts: Record<string, string>;
  units: { mm: string; cm: string };
  faqs: FaqText[];
};
