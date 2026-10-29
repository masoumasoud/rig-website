import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { EmptyState, PageTitle, Table } from "@/components/admin/ui";

export const metadata = { title: "نمونه‌کارها" };

export default async function PortfolioAdmin() {
  await requireUser();
  const rows = await db.select().from(schema.projects).orderBy(asc(schema.projects.sort));
  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle title="نمونه‌کارها" action={<Link href="/admin/portfolio/new" className="btn btn-primary !min-h-11">+ افزودن نمونه‌کار</Link>} />
      <p className="mb-4 text-ink-2">ابتدا عکس‌ها را در «رسانه‌ها» بارگذاری کنید، سپس در هر نمونه‌کار انتخابشان کنید. نام مشتری را ننویسید.</p>
      {rows.length === 0 ? (
        <EmptyState>هنوز نمونه‌کاری ثبت نشده است.</EmptyState>
      ) : (
        <Table head={["عنوان", "تعداد عکس", "ترتیب", "وضعیت"]}>
          {rows.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3">
                <Link href={`/admin/portfolio/${p.id}`} className="font-bold text-[#2271b1] hover:underline">{p.text.fa?.title}</Link>
              </td>
              <td className="px-4 py-3">{p.imageIds.length.toLocaleString("fa-IR")}</td>
              <td className="px-4 py-3">{p.sort.toLocaleString("fa-IR")}</td>
              <td className="px-4 py-3">{p.published ? <span className="text-ok">منتشر شده</span> : <span className="text-ink-3">پیش‌نویس</span>}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
