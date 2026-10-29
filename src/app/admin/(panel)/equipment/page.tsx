import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { PageTitle, Table } from "@/components/admin/ui";

export const metadata = { title: "تجهیزات" };

export default async function EquipmentAdmin() {
  await requireUser();
  const rows = await db.select().from(schema.equipment).orderBy(asc(schema.equipment.sort));
  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle title="تجهیزات و ابزار اندازه‌گیری" action={<Link href="/admin/equipment/new" className="btn btn-primary !min-h-11">+ افزودن دستگاه</Link>} />
      <Table head={["نام", "نوع", "دقت", "ترتیب", "وضعیت"]}>
        {rows.map((e) => (
          <tr key={e.id}>
            <td className="px-4 py-3">
              <Link href={`/admin/equipment/${e.id}`} className="font-bold text-[#2271b1] hover:underline">{e.text.fa?.name}</Link>
            </td>
            <td className="px-4 py-3">{e.kind === "machine" ? "ماشین‌آلات" : "ابزار کنترل کیفیت"}</td>
            <td className="ltr px-4 py-3">{e.precision ? `± ${e.precision} mm` : "—"}</td>
            <td className="px-4 py-3">{e.sort.toLocaleString("fa-IR")}</td>
            <td className="px-4 py-3">{e.published ? <span className="text-ok">منتشر شده</span> : <span className="text-ink-3">پیش‌نویس</span>}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
