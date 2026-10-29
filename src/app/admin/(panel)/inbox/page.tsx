import Link from "next/link";
import { and, desc, eq, like, or, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { ticketCode, idFromTicket } from "@/lib/inbox";
import { EmptyState, PageTitle, Table, faDate } from "@/components/admin/ui";
import { statusLabels } from "./status";

export const metadata = { title: "پیام‌ها" };


const filters = [
  { key: "", label: "همه" },
  { key: "new", label: "جدید" },
  { key: "open", label: "در حال پیگیری" },
  { key: "answered", label: "پاسخ داده شده" },
  { key: "closed", label: "بسته شده" },
];

export default async function InboxPage({ searchParams }: PageProps<"/admin/inbox">) {
  await requireUser();
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const where: SQL[] = [];
  if (status in statusLabels) where.push(eq(schema.conversations.status, status as keyof typeof statusLabels));
  if (q) {
    const id = idFromTicket(q);
    const pat = `%${q}%`;
    where.push(
      or(
        like(schema.conversations.name, pat),
        like(schema.conversations.subject, pat),
        like(schema.conversations.phone, pat),
        like(schema.conversations.email, pat),
        ...(id ? [eq(schema.conversations.id, id)] : []),
      )!,
    );
  }
  const rows = await db
    .select()
    .from(schema.conversations)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(schema.conversations.lastMessageAt))
    .limit(200);

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="پیام‌ها و استعلام‌ها" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/admin/inbox?status=${f.key}` : "/admin/inbox"}
            aria-current={status === f.key ? "page" : undefined}
            className="min-h-10 rounded-full border border-[#dcdcde] bg-white px-4 py-1.5 font-bold aria-[current]:border-ink aria-[current]:bg-ink aria-[current]:text-white"
          >
            {f.label}
          </Link>
        ))}
        <form className="ms-auto flex gap-2">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <input name="q" defaultValue={q} placeholder="جستجو: نام، تلفن، کد…" className="input !min-h-10 !py-1.5" />
          <button className="rounded-lg bg-ink px-4 font-bold text-white">جستجو</button>
        </form>
      </div>
      {rows.length === 0 ? (
        <EmptyState>پیامی پیدا نشد.</EmptyState>
      ) : (
        <Table head={["کد", "نام", "موضوع", "از طریق", "وضعیت", "آخرین پیام"]}>
          {rows.map((c) => (
            <tr key={c.id} className={c.unread ? "bg-[#fff8f3] font-bold" : ""}>
              <td className="ltr px-4 py-3 text-sm">{ticketCode(c.id)}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/inbox/${c.id}`} className="text-[#2271b1] hover:underline">
                  {c.name}
                </Link>
              </td>
              <td className="max-w-72 truncate px-4 py-3">{c.subject}</td>
              <td className="px-4 py-3 text-sm">{c.source === "form" ? "فرم سایت" : "ایمیل"}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-0.5 text-sm ${statusLabels[c.status].cls}`}>{statusLabels[c.status].label}</span>
              </td>
              <td className="px-4 py-3 text-sm text-ink-2">{faDate(c.lastMessageAt)}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
