import "server-only";
import { ImapFlow } from "imapflow";
import { simpleParser, type AddressObject } from "mailparser";
import type { Attachment } from "@/db/schema";
import { ingestEmail } from "./inbox";
import { savePrivateFile } from "./uploads";

/**
 * Keeps an IMAP IDLE connection to the site's own mailbox (Stalwart on the VPS)
 * and turns every unread email into a panel message. Reconnects with backoff.
 */
let started = false;

export function startImapWorker() {
  if (started || !process.env.IMAP_HOST || !process.env.IMAP_PASS) return;
  started = true;
  void loop(5_000);
}

async function loop(delay: number) {
  try {
    await run();
    delay = 5_000;
  } catch (err) {
    console.error("[imap]", err instanceof Error ? err.message : err);
  }
  setTimeout(() => loop(Math.min(delay * 2, 300_000)), delay);
}

async function run() {
  const client = new ImapFlow({
    host: process.env.IMAP_HOST!,
    port: Number(process.env.IMAP_PORT ?? 993),
    secure: Number(process.env.IMAP_PORT ?? 993) === 993,
    auth: { user: process.env.IMAP_USER!, pass: process.env.IMAP_PASS! },
    tls: { rejectUnauthorized: process.env.IMAP_TLS_INSECURE !== "true" },
    logger: false,
  });
  await client.connect();
  const lock = await client.getMailboxLock("INBOX");
  let busy = false;
  const sync = async () => {
    if (busy) return;
    busy = true;
    try {
      const uids = (await client.search({ seen: false }, { uid: true })) || [];
      for (const uid of uids) {
        const msg = await client.fetchOne(String(uid), { source: true }, { uid: true });
        if (msg && msg.source) await handle(msg.source);
        await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });
      }
    } finally {
      busy = false;
    }
  };
  try {
    await sync();
    client.on("exists", () => void sync().catch((e) => console.error("[imap] sync", e)));
    // Stay connected (IDLE) until the server drops us; the loop reconnects.
    await new Promise<void>((resolve) => client.on("close", () => resolve()));
  } finally {
    lock.release();
    await client.logout().catch(() => {});
  }
}

async function handle(source: Buffer) {
  const mail = await simpleParser(source);
  const from = (mail.from as AddressObject | undefined)?.value?.[0];
  if (!from?.address) return;
  const attachments: Attachment[] = [];
  for (const a of mail.attachments) {
    if (a.contentDisposition === "inline" && a.contentType.startsWith("image/") && a.size < 30_000) continue; // signatures/logos
    attachments.push(await savePrivateFile(a.filename ?? "attachment", a.content, a.contentType));
  }
  const refs = Array.isArray(mail.references) ? mail.references : mail.references ? [mail.references] : [];
  await ingestEmail({
    messageId: mail.messageId,
    inReplyTo: mail.inReplyTo,
    references: refs,
    fromName: from.name ?? "",
    fromAddress: from.address,
    subject: mail.subject ?? "",
    text: stripQuoted(mail.text ?? ""),
    attachments,
  });
}

/** Drops the quoted history below a reply so the thread stays readable. */
function stripQuoted(text: string) {
  const markers = [/^On .+wrote:$/m, /^در تاریخ .+ نوشت:$/m, /^-{2,}\s*Original Message/m, /^From: /m, /^>.*$/m];
  let cut = text.length;
  for (const m of markers) {
    const i = text.search(m);
    if (i > 20 && i < cut) cut = i;
  }
  return text.slice(0, cut).trim();
}
