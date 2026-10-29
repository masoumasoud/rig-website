import "server-only";
import { db, schema } from "@/db";
import { defaultSettings, type SiteSettings } from "./settings-schema";

/** Fresh read of settings, for server actions and background jobs (no cache). */
export async function getSettingsUncached(): Promise<SiteSettings> {
  const rows = await db.select().from(schema.settings);
  const merged = structuredClone(defaultSettings) as Record<string, unknown>;
  for (const row of rows) {
    const base = merged[row.key];
    merged[row.key] =
      base && typeof base === "object" && row.value && typeof row.value === "object"
        ? { ...base, ...(row.value as object) }
        : row.value;
  }
  return merged as SiteSettings;
}
