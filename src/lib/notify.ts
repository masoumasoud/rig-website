import "server-only";
import { getSettingsUncached } from "./settings";
import { mailConfigured, sendMail } from "./mail";
import type { InquiryDetails } from "@/db/schema";

/**
 * Tells the owner about a new message: an email copy (e.g. to their Gmail) and,
 * if configured, a Bale bot message (Bale works inside Iran without a VPN).
 */
export async function notifyOwner(n: {
  code: string;
  name: string;
  phone?: string;
  email?: string;
  details?: InquiryDetails;
  message: string;
  files: number;
  viaEmail?: boolean;
}) {
  const s = await getSettingsUncached();
  const d = n.details ?? {};
  const lines = [
    n.viaEmail ? `ایمیل جدید ${n.code}` : `درخواست استعلام جدید ${n.code}`,
    `نام: ${n.name}`,
    n.phone && `تلفن: ${n.phone}`,
    n.email && `ایمیل: ${n.email}`,
    d.service && `خدمت: ${d.service}`,
    d.quantity && `تعداد: ${d.quantity}`,
    d.material && `جنس: ${d.material}`,
    d.deadline && `زمان: ${d.deadline}`,
    n.files ? `فایل‌ها: ${n.files}` : null,
    "",
    n.message,
    "",
    `${process.env.SITE_URL ?? ""}/admin/inbox`,
  ].filter((l): l is string => typeof l === "string");
  const text = lines.join("\n");

  const tasks: Promise<unknown>[] = [];
  const recipients = s.notify.emails
    .split(/[,\s]+/)
    .map((e) => e.trim())
    .filter(Boolean);
  if (recipients.length && mailConfigured()) {
    tasks.push(sendMail({ to: recipients.join(", "), subject: lines[0], text, replyTo: n.email || undefined }));
  }
  if (s.notify.baleBotToken && s.notify.baleChatId) {
    tasks.push(
      fetch(`https://tapi.bale.ai/bot${s.notify.baleBotToken}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: s.notify.baleChatId, text }),
        signal: AbortSignal.timeout(8000),
      }),
    );
  }
  const results = await Promise.allSettled(tasks);
  for (const r of results) if (r.status === "rejected") console.error("[notify]", r.reason);
}
