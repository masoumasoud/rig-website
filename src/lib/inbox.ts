import "server-only";
import path from "node:path";
import { desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Attachment, InquiryDetails } from "@/db/schema";
import { isLocale, localeMeta, type Locale } from "@/i18n/config";
import { fromAddress, mailConfigured, newMessageId, sendMail, textToHtml } from "./mail";
import { notifyOwner } from "./notify";
import { PRIVATE_DIR } from "./uploads";

export const ticketCode = (id: number) => `RIG-${1000 + id}`;
const ticketRe = /\[?RIG-(\d{4,})\]?/i;
export const idFromTicket = (subject: string) => {
  const m = subject.match(ticketRe);
  return m ? Number(m[1]) - 1000 : null;
};

/** Auto-acknowledgement sent to a customer after the quote form. */
const ack: Record<Locale, (code: string, name: string) => { subject: string; text: string }> = {
  fa: (code, name) => ({
    subject: `درخواست شما دریافت شد [${code}]`,
    text: `${name} عزیز، سلام\n\nدرخواست استعلام شما با کد پیگیری ${code} ثبت شد. همکاران ما به‌زودی با شما تماس می‌گیرند.\nبرای ارسال فایل یا توضیح بیشتر کافی است به همین ایمیل پاسخ دهید.\n\nگروه صنعتی رضایی`,
  }),
  en: (code, name) => ({
    subject: `We received your request [${code}]`,
    text: `Dear ${name},\n\nYour quote request has been received with reference ${code}. We will contact you shortly.\nTo send more files or details, simply reply to this email.\n\nRezaei Industrial Group`,
  }),
  ar: (code, name) => ({
    subject: `تم استلام طلبك [${code}]`,
    text: `السيد/السيدة ${name}،\n\nتم تسجيل طلب عرض السعر برمز المتابعة ${code}. سنتواصل معك قريبًا.\nلإرسال ملفات أو تفاصيل إضافية، يكفي الرد على هذا البريد.\n\nمجموعة رضائي الصناعية`,
  }),
  zh: (code, name) => ({
    subject: `我们已收到您的询价 [${code}]`,
    text: `${name}，您好：\n\n您的询价已登记，查询编号为 ${code}。我们会尽快与您联系。\n如需补充文件或说明，请直接回复此邮件。\n\n雷扎伊工业集团`,
  }),
  de: (code, name) => ({
    subject: `Ihre Anfrage ist eingegangen [${code}]`,
    text: `Guten Tag ${name},\n\nIhre Angebotsanfrage wurde unter der Nummer ${code} erfasst. Wir melden uns in Kürze.\nFür weitere Dateien oder Details antworten Sie einfach auf diese E-Mail.\n\nRezaei Industrial Group`,
  }),
  nl: (code, name) => ({
    subject: `Wij hebben uw aanvraag ontvangen [${code}]`,
    text: `Beste ${name},\n\nUw offerteaanvraag is geregistreerd onder referentie ${code}. Wij nemen spoedig contact met u op.\nVoor extra bestanden of details kunt u eenvoudig op deze e-mail antwoorden.\n\nRezaei Industrial Group`,
  }),
};

export async function createFormConversation(input: {
  name: string;
  phone: string;
  email?: string;
  message: string;
  locale: Locale;
  details: InquiryDetails;
  attachments: Attachment[];
}) {
  const subject = input.details.service
    ? `${input.details.service} — ${input.name}`
    : `${input.name}`;
  const [conv] = await db
    .insert(schema.conversations)
    .values({
      subject,
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      locale: input.locale,
      source: "form",
      details: input.details,
    })
    .returning();
  await db.insert(schema.messages).values({
    conversationId: conv.id,
    direction: "in",
    body: input.message,
    attachments: input.attachments,
  });

  const code = ticketCode(conv.id);

  if (input.email && mailConfigured()) {
    try {
      const a = ack[input.locale](code, input.name);
      const messageId = await sendMail({
        to: input.email,
        subject: a.subject,
        text: a.text,
        html: textToHtml(a.text, localeMeta[input.locale].dir === "rtl"),
      });
      await db.insert(schema.messages).values({ conversationId: conv.id, direction: "out", body: a.text, messageId });
    } catch (err) {
      console.error("[inbox] acknowledgement failed", err);
    }
  }

  await notifyOwner({
    code,
    name: input.name,
    phone: input.phone,
    email: input.email,
    details: input.details,
    message: input.message,
    files: input.attachments.length,
  });

  return { id: conv.id, code };
}

/** Sends a reply from the panel by email and stores it in the thread. */
export async function sendReply(conversationId: number, body: string, authorId: number, attachments: Attachment[] = []) {
  const [conv] = await db.select().from(schema.conversations).where(eq(schema.conversations.id, conversationId));
  if (!conv) throw new Error("Conversation not found");

  const history = await db
    .select({ messageId: schema.messages.messageId })
    .from(schema.messages)
    .where(eq(schema.messages.conversationId, conversationId))
    .orderBy(desc(schema.messages.createdAt));
  const refs = history.map((h) => h.messageId).filter((m): m is string => Boolean(m)).reverse();

  let messageId: string | null = null;
  let deliveryError: string | null = null;
  if (!conv.email) deliveryError = "no-email";
  else if (!mailConfigured()) deliveryError = "smtp-not-configured";
  else {
    try {
      const code = ticketCode(conv.id);
      const subject = conv.subject.includes(code) ? `Re: ${conv.subject}` : `Re: ${conv.subject} [${code}]`;
      const locale = isLocale(conv.locale) ? conv.locale : "fa";
      messageId = await sendMail({
        to: conv.email,
        subject,
        text: body,
        html: textToHtml(body, localeMeta[locale].dir === "rtl"),
        messageId: newMessageId(),
        inReplyTo: refs.at(-1),
        references: refs.slice(-10),
        attachments: attachments.map((a) => ({ filename: a.name, path: path.join(PRIVATE_DIR, a.file) })),
      });
    } catch (err) {
      deliveryError = err instanceof Error ? err.message : String(err);
    }
  }

  await db.insert(schema.messages).values({
    conversationId,
    direction: "out",
    body,
    messageId,
    attachments,
    authorId,
    deliveryError,
  });
  await db
    .update(schema.conversations)
    .set({ status: "answered", unread: false, lastMessageAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.conversations.id, conversationId));
  return { delivered: !deliveryError, deliveryError };
}

/** Incoming email (from the IMAP worker): thread it or open a new conversation. */
export async function ingestEmail(mail: {
  messageId?: string;
  inReplyTo?: string;
  references: string[];
  fromName: string;
  fromAddress: string;
  subject: string;
  text: string;
  attachments: Attachment[];
}) {
  if (mail.fromAddress.toLowerCase() === fromAddress().toLowerCase()) return null;
  if (mail.messageId) {
    const dup = await db.select({ id: schema.messages.id }).from(schema.messages).where(eq(schema.messages.messageId, mail.messageId));
    if (dup.length) return null;
  }

  let conversationId: number | null = null;
  const refIds = [mail.inReplyTo, ...mail.references].filter((r): r is string => Boolean(r));
  if (refIds.length) {
    const [hit] = await db
      .select({ conversationId: schema.messages.conversationId })
      .from(schema.messages)
      .where(inArray(schema.messages.messageId, refIds))
      .limit(1);
    conversationId = hit?.conversationId ?? null;
  }
  if (!conversationId) {
    const fromTicket = idFromTicket(mail.subject);
    if (fromTicket) {
      const [c] = await db.select({ id: schema.conversations.id }).from(schema.conversations).where(eq(schema.conversations.id, fromTicket));
      conversationId = c?.id ?? null;
    }
  }

  if (!conversationId) {
    const [conv] = await db
      .insert(schema.conversations)
      .values({
        subject: mail.subject || "(no subject)",
        name: mail.fromName || mail.fromAddress,
        email: mail.fromAddress,
        source: "email",
        locale: /[؀-ۿ]/.test(mail.text) ? "fa" : "en",
      })
      .returning();
    conversationId = conv.id;
  } else {
    await db
      .update(schema.conversations)
      .set({ status: "open", unread: true, lastMessageAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.conversations.id, conversationId));
  }

  await db.insert(schema.messages).values({
    conversationId,
    direction: "in",
    body: mail.text,
    messageId: mail.messageId ?? null,
    attachments: mail.attachments,
  });
  await notifyOwner({
    code: ticketCode(conversationId),
    name: mail.fromName || mail.fromAddress,
    email: mail.fromAddress,
    message: mail.text.slice(0, 500),
    files: mail.attachments.length,
    viaEmail: true,
  });
  return conversationId;
}
