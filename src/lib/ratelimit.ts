import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

/** Fixed-window limiter stored in SQLite (single-server deployment). */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const [row] = await db.select().from(schema.rateLimits).where(eq(schema.rateLimits.key, key));
  if (!row || row.resetAt < now) {
    await db
      .insert(schema.rateLimits)
      .values({ key, count: 1, resetAt: now + windowMs })
      .onConflictDoUpdate({ target: schema.rateLimits.key, set: { count: 1, resetAt: now + windowMs } });
    return true;
  }
  if (row.count >= limit) return false;
  await db.update(schema.rateLimits).set({ count: row.count + 1 }).where(eq(schema.rateLimits.key, key));
  return true;
}
