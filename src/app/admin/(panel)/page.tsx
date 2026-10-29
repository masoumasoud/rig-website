import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { mailConfigured } from "@/lib/mail";
import { getSettingsUncached } from "@/lib/settings";
import { siteUrl } from "@/lib/seo";
import { ticketCode } from "@/lib/inbox";
import { Panel, faDate } from "@/components/admin/ui";

export const metadata = { title: "پیشخوان" };

export default async function Dashboard() {
  const user = await requireUser();
  const [[unread], [total], [services], [projects], latest, settings] = await Promise.all([
    db.select({ n: count() }).from(schema.conversations).where(eq(schema.conversations.unread, true)),
    db.select({ n: count() }).from(schema.conversations),
    db.select({ n: count() }).from(schema.services),
    db.select({ n: count() }).from(schema.projects),
    db.select().from(schema.conversations).orderBy(desc(schema.conversations.lastMessageAt)).limit(6),
    getSettingsUncached(),
  ]);

  const stats = [
    { label: "پیام‌های خوانده‌نشده", value: unread.n, href: "/admin/inbox?status=new", hot: unread.n > 0 },
    { label: "کل استعلام‌ها و پیام‌ها", value: total.n, href: "/admin/inbox" },
    { label: "خدمات", value: services.n, href: "/admin/services" },
    { label: "نمونه‌کارها", value: projects.n, href: "/admin/portfolio" },
  ];
  const checklist = [
    { ok: !siteUrl.includes("localhost") && !siteUrl.includes("example.com"), label: "دامنه سایت تنظیم شده (SITE_URL)" },
    { ok: mailConfigured(), label: "ارسال ایمیل با دامنه سایت فعال است (SMTP)" },
    { ok: Boolean(process.env.IMAP_PASS), label: "دریافت ایمیل در پنل فعال است (IMAP)" },
    { ok: Boolean(settings.analytics.gtmId || settings.analytics.ga4Id), label: "گوگل تگ منیجر / آنالیتیکس" },
    { ok: Boolean(settings.analytics.clarityId), label: "مایکروسافت کلریتی" },
    { ok: Boolean(settings.verification.google), label: "تأیید گوگل سرچ کنسول" },
    { ok: Boolean(settings.verification.bing), label: "تأیید بینگ وبمستر" },
    { ok: projects.n > 0, label: "حداقل یک نمونه‌کار با عکس" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl">سلام {user.name}، خوش آمدید</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`rounded-xl border bg-white p-5 shadow-sm hover:border-ink ${s.hot ? "border-danger" : "border-[#dcdcde]"}`}>
            <p className={`text-3xl font-extrabold ${s.hot ? "text-danger" : ""}`}>{s.value.toLocaleString("fa-IR")}</p>
            <p className="mt-1 text-ink-2">{s.label}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="آخرین پیام‌ها">
          {latest.length === 0 ? (
            <p className="text-ink-2">هنوز پیامی نرسیده است.</p>
          ) : (
            <ul className="divide-y divide-[#f0f0f1]">
              {latest.map((c) => (
                <li key={c.id}>
                  <Link href={`/admin/inbox/${c.id}`} className="flex items-center gap-3 py-3 hover:bg-[#f6f7f7]">
                    {c.unread ? <span className="size-2.5 flex-none rounded-full bg-danger" aria-label="جدید" /> : <span className="size-2.5 flex-none" />}
                    <span className={`flex-1 truncate ${c.unread ? "font-bold" : ""}`}>
                      {c.name} — {c.subject}
                    </span>
                    <span className="ltr text-sm text-ink-3">{ticketCode(c.id)}</span>
                    <span className="hidden text-sm text-ink-3 sm:inline">{faDate(c.lastMessageAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="چک‌لیست راه‌اندازی">
          <ul className="space-y-2">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-3">
                <span className={`flex size-6 flex-none items-center justify-center rounded-full text-sm font-bold text-white ${c.ok ? "bg-ok" : "bg-[#c3c4c7]"}`}>
                  {c.ok ? "✓" : "!"}
                </span>
                <span className={c.ok ? "" : "text-ink-2"}>{c.label}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
