import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { PageTitle, Table } from "@/components/admin/ui";

export const metadata = { title: "پرسش‌های متداول" };

export default async function FaqsAdmin() {
  await requireUser();
  const rows = await db.select().from(schema.faqs).orderBy(asc(schema.faqs.sort));
  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle title="پرسش‌های متداول" action={<Link href="/admin/faqs/new" className="btn btn-primary !min-h-11">+ افزودن پرسش</Link>} />
      <p className="mb-4 text-ink-2">این پرسش‌ها در صفحه اصلی نمایش داده می‌شوند و در نتایج گوگل هم می‌توانند ظاهر شوند.</p>
      <Table head={["پرسش", "ترتیب", "وضعیت"]}>
        {rows.map((f) => (
          <tr key={f.id}>
            <td className="px-4 py-3">
              <Link href={`/admin/faqs/${f.id}`} className="font-bold text-[#2271b1] hover:underline">{f.text.fa?.q}</Link>
            </td>
            <td className="px-4 py-3">{f.sort.toLocaleString("fa-IR")}</td>
            <td className="px-4 py-3">{f.published ? <span className="text-ok">منتشر شده</span> : <span className="text-ink-3">پیش‌نویس</span>}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
