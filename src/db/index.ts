import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:./data/rig.db";

const globalForDb = globalThis as unknown as { __rigDb?: ReturnType<typeof drizzle<typeof schema>> };

export const db =
  globalForDb.__rigDb ??
  drizzle(createClient({ url }), { schema });

if (process.env.NODE_ENV !== "production") globalForDb.__rigDb = db;

export { schema };
