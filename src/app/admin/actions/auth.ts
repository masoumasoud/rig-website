"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { hash, verify } from "@node-rs/argon2";
import { db, schema } from "@/db";
import { createSession, destroySession, requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/request";

export type FormState = { error?: string; ok?: string } | undefined;

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ip = clientIp(await headers());
  if (!(await rateLimit(`login:${ip}`, 10, 15 * 60 * 1000))) {
    return { error: "تعداد تلاش‌ها زیاد است. ۱۵ دقیقه دیگر دوباره امتحان کنید." };
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (!user || !(await verify(user.passwordHash, password))) {
    return { error: "ایمیل یا رمز عبور اشتباه است." };
  }
  await createSession(user.id);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const [row] = await db.select().from(schema.users).where(eq(schema.users.id, user.id));
  if (name && name !== row.name) await db.update(schema.users).set({ name }).where(eq(schema.users.id, user.id));
  if (!next) return { ok: "ذخیره شد." };
  if (!(await verify(row.passwordHash, current))) return { error: "رمز فعلی اشتباه است." };
  if (next.length < 8) return { error: "رمز جدید باید حداقل ۸ کاراکتر باشد." };
  await db.update(schema.users).set({ passwordHash: await hash(next) }).where(eq(schema.users.id, user.id));
  return { ok: "رمز عبور تغییر کرد." };
}
