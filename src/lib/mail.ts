import "server-only";
import { randomBytes } from "node:crypto";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Outgoing mail goes through an SMTP relay (Brevo's free tier by default) so it
 * leaves with proper SPF/DKIM for the site's own domain and lands in inboxes.
 */
let transporter: Transporter | undefined;

export const mailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

function getTransport() {
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

export const fromAddress = () => process.env.MAIL_FROM ?? "info@example.com";
const fromDomain = () => fromAddress().split("@")[1] ?? "localhost";

export const newMessageId = () => `<${Date.now().toString(36)}.${randomBytes(6).toString("hex")}@${fromDomain()}>`;

export type OutgoingMail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
  replyTo?: string;
  attachments?: { filename: string; path: string }[];
};

export async function sendMail(mail: OutgoingMail) {
  if (!mailConfigured()) throw new Error("SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS).");
  const messageId = mail.messageId ?? newMessageId();
  await getTransport().sendMail({
    from: { name: process.env.MAIL_FROM_NAME ?? "Rezaei Industrial Group", address: fromAddress() },
    to: mail.to,
    replyTo: mail.replyTo ?? fromAddress(),
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    messageId,
    inReplyTo: mail.inReplyTo,
    references: mail.references,
    attachments: mail.attachments,
  });
  return messageId;
}

/** Minimal, readable HTML wrapper for plain-text bodies (RTL aware). */
export function textToHtml(text: string, rtl: boolean) {
  const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<div dir="${rtl ? "rtl" : "ltr"}" style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.9;color:#111">${esc.replace(/\n/g, "<br>")}</div>`;
}
