import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { EmptyState, PageTitle, Table } from "@/components/admin/ui";
import { ServiceIcon } from "@/components/icons";

export const metadata = { title: "خدمات" };

export default async function ServicesAdmin() {
  await requireUser();
  const rows = await db.select().from(schema.services).orderBy(asc(schema.services.sort));
  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle
        title="خدمات"
        action={
          <Link href="/admin/services/new" className="btn btn-primary !min-h-11">
            + افزودن خدمت
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState>هنوز خدمتی ثبت نشده است.</EmptyState>
      ) : (
        <Table head={["", "عنوان", "نامک (آدرس)", "ترتیب", "وضعیت"]}>
          {rows.map((s) => (
            <tr key={s.id}>
              <td className="w-12 px-4 py-3">
                <ServiceIcon name={s.icon} className="size-6" />
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/services/${s.id}`} className="font-bold text-[#2271b1] hover:underline">
                  {s.text.fa?.title ?? s.slug}
                </Link>
              </td>
              <td className="ltr px-4 py-3 text-sm text-ink-2">/services/{s.slug}</td>
              <td className="px-4 py-3">{s.sort.toLocaleString("fa-IR")}</td>
              <td className="px-4 py-3">{s.published ? <span className="text-ok">منتشر شده</span> : <span className="text-ink-3">پیش‌نویس</span>}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
