import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { ticketCode } from "@/lib/inbox";
import { whatsappHref } from "@/lib/contact-links";
import { PageTitle, Panel, faDate } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/client";
import { FileIcon, PhoneIcon, WhatsappIcon, MailIcon } from "@/components/icons";
import { deleteConversationAction, setStatusAction } from "../../../actions/inbox";
import { statusLabels } from "../status";
import { ReplyForm } from "./reply-form";

export const metadata = { title: "گفتگو" };

/** 0912… -> 98912… for WhatsApp links. */
const intl = (phone: string) => phone.replace(/^\+/, "").replace(/^0098/, "98").replace(/^0(\d{10})$/, "98$1");

export default async function ConversationPage({ params }: PageProps<"/admin/inbox/[id]">) {
  await requireUser();
  const id = Number((await params).id);
  const [conv] = await db.select().from(schema.conversations).where(eq(schema.conversations.id, id));
  if (!conv) notFound();
  if (conv.unread) {
    conv.unread = false;
    if (conv.status === "new") conv.status = "open";
    await db
      .update(schema.conversations)
      .set({ unread: false, status: conv.status })
      .where(eq(schema.conversations.id, id));
  }
  const msgs = await db.select().from(schema.messages).where(eq(schema.messages.conversationId, id)).orderBy(asc(schema.messages.createdAt));
  const d = conv.details;
  const details = [
    ["شرکت", d.company],
    ["خدمت", d.service],
    ["تعداد", d.quantity],
    ["جنس", d.material],
    ["زمان مورد نیاز", d.deadline],
    ["زبان سایت", conv.locale],
  ].filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title={`${conv.name} — ${ticketCode(conv.id)}`} back="/admin/inbox" />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-4">
          {msgs.map((m) => (
            <article
              key={m.id}
              className={`rounded-xl border p-5 shadow-sm ${m.direction === "in" ? "border-[#dcdcde] bg-white" : "ms-8 border-[#c5d9ed] bg-[#f0f6fc]"}`}
            >
              <header className="mb-2 flex flex-wrap items-center gap-2 text-sm text-ink-2">
                <strong className="text-ink">{m.direction === "in" ? conv.name : "پاسخ شما"}</strong>
                <span>·</span>
                <span>{faDate(m.createdAt)}</span>
                {m.direction === "out" && m.messageId ? <span className="text-ok">✓ ایمیل شد</span> : null}
                {m.deliveryError ? <span className="text-danger">⚠ ایمیل نشد</span> : null}
              </header>
              <p className="whitespace-pre-wrap break-words text-[1.02rem]" dir="auto">
                {m.body || "—"}
              </p>
              {m.attachments.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {m.attachments.map((a) => (
                    <li key={a.file}>
                      <a
                        href={`/api/admin/files/${a.file}`}
                        className="flex items-center gap-2 rounded-lg border border-[#dcdcde] bg-white px-3 py-2 text-sm font-bold text-[#2271b1] hover:underline"
                      >
                        <FileIcon className="size-5" />
                        <span className="ltr max-w-56 truncate">{a.name}</span>
                        <span className="text-ink-3">({Math.ceil(a.size / 1024).toLocaleString("fa-IR")} KB)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
          <Panel title={conv.email ? `پاسخ به ${conv.email}` : "پاسخ (این مشتری ایمیل ندارد)"}>
            <ReplyForm conversationId={conv.id} hasEmail={Boolean(conv.email)} />
          </Panel>
        </div>

        <aside className="space-y-4">
          <Panel title="اطلاعات تماس">
            <div className="flex flex-col gap-2">
              {conv.phone ? (
                <>
                  <a href={`tel:${conv.phone}`} className="btn btn-dark justify-start">
                    <PhoneIcon /> <span className="ltr">{conv.phone}</span>
                  </a>
                  <a href={whatsappHref(intl(conv.phone))} target="_blank" rel="noopener" className="btn btn-whatsapp justify-start">
                    <WhatsappIcon /> پاسخ در واتساپ
                  </a>
                </>
              ) : null}
              {conv.email ? (
                <a href={`mailto:${conv.email}`} className="btn btn-outline justify-start">
                  <MailIcon /> <span className="ltr truncate">{conv.email}</span>
                </a>
              ) : null}
            </div>
            {details.length > 0 && (
              <dl className="mt-4 space-y-2 border-t border-[#f0f0f1] pt-4">
                {details.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-ink-2">{k}</dt>
                    <dd className="font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Panel>
          <Panel title="وضعیت">
            <form action={setStatusAction.bind(null, conv.id)} className="flex flex-wrap gap-2">
              {(Object.keys(statusLabels) as (keyof typeof statusLabels)[]).map((s) => (
                <button
                  key={s}
                  name="status"
                  value={s}
                  aria-pressed={conv.status === s}
                  className="min-h-10 rounded-full border border-[#dcdcde] px-3 font-bold aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-white"
                >
                  {statusLabels[s].label}
                </button>
              ))}
            </form>
          </Panel>
          <form action={deleteConversationAction.bind(null, conv.id)}>
            <ConfirmButton label="حذف این گفتگو" message="این گفتگو و همه پیام‌هایش حذف شود؟" />
          </form>
        </aside>
      </div>
    </div>
  );
}
