"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { sendReply } from "@/lib/inbox";
import { allowedDrawingExt, extOf, MAX_TOTAL_UPLOAD, savePrivateFile } from "@/lib/uploads";
import type { Attachment } from "@/db/schema";
import type { FormState } from "@/components/admin/client";

export async function replyAction(conversationId: number, _prev: FormState, data: FormData): Promise<FormState> {
  const user = await requireUser();
  const body = String(data.get("body") ?? "").trim();
  if (!body) return { error: "متن پاسخ را بنویسید." };
  const files = data.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.reduce((n, f) => n + f.size, 0) > MAX_TOTAL_UPLOAD) return { error: "حجم فایل‌ها بیشتر از ۲۵ مگابایت است." };
  if (files.some((f) => !allowedDrawingExt.has(extOf(f.name)))) return { error: "نوع فایل پشتیبانی نمی‌شود." };
  const attachments: Attachment[] = [];
  for (const f of files) attachments.push(await savePrivateFile(f.name, Buffer.from(await f.arrayBuffer()), f.type));

  const result = await sendReply(conversationId, body, user.id, attachments);
  revalidatePath(`/admin/inbox/${conversationId}`);
  if (!result.delivered) {
    const reason =
      result.deliveryError === "no-email"
        ? "این مشتری ایمیل ندارد؛ پاسخ ذخیره شد. لطفاً تلفنی یا با واتساپ پاسخ دهید."
        : result.deliveryError === "smtp-not-configured"
          ? "ارسال ایمیل هنوز تنظیم نشده (SMTP). پاسخ فقط ذخیره شد."
          : `ارسال ایمیل ناموفق بود: ${result.deliveryError}`;
    return { error: reason };
  }
  return { ok: "پاسخ با ایمیل ارسال شد." };
}

export async function setStatusAction(conversationId: number, data: FormData) {
  await requireUser();
  const status = String(data.get("status")) as "new" | "open" | "answered" | "closed";
  if (!["new", "open", "answered", "closed"].includes(status)) return;
  await db
    .update(schema.conversations)
    .set({ status, unread: status === "new" })
    .where(eq(schema.conversations.id, conversationId));
  revalidatePath(`/admin/inbox/${conversationId}`);
}

export async function deleteConversationAction(conversationId: number) {
  await requireUser();
  await db.delete(schema.conversations).where(eq(schema.conversations.id, conversationId));
  redirect("/admin/inbox");
}
