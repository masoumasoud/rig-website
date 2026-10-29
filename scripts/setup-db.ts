/**
 * Applies migrations, seeds initial content when the database is empty
 * and creates the first admin user from ADMIN_EMAIL / ADMIN_PASSWORD.
 *   npm run db:setup
 */
import { migrate } from "drizzle-orm/libsql/migrator";
import { count, eq } from "drizzle-orm";
import { hash } from "@node-rs/argon2";
import { db, schema } from "../src/db";
import { buildSeed } from "../src/content/seed";
import { defaultSettings } from "../src/lib/settings-schema";

async function main() {
  await migrate(db, { migrationsFolder: "./drizzle" });

  const [{ n }] = await db.select({ n: count() }).from(schema.services);
  if (n === 0) {
    const seed = buildSeed();
    await db.insert(schema.services).values(seed.services);
    await db.insert(schema.equipment).values(seed.equipment);
    await db.insert(schema.faqs).values(seed.faqs);
    await db.insert(schema.pages).values(seed.pages);
    console.log("Seeded content.");
  }

  for (const [key, value] of Object.entries(defaultSettings)) {
    await db.insert(schema.settings).values({ key, value }).onConflictDoNothing();
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
    if (existing.length === 0) {
      await db.insert(schema.users).values({
        name: process.env.ADMIN_NAME ?? "مدیر سایت",
        email,
        passwordHash: await hash(password),
      });
      console.log(`Created admin user ${email}.`);
    }
  }
  console.log("Database ready.");
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
