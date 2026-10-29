import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { locales } from "@/i18n/config";
import { requireUser } from "@/lib/auth";
import { localeStatus } from "@/lib/admin-form";
import { Check, Field, PageTitle, Panel } from "@/components/admin/ui";
import { ConfirmButton, LangTabs, SaveForm } from "@/components/admin/client";
import { deleteEquipment, saveEquipment } from "../../../actions/content";

export const metadata = { title: "ویرایش دستگاه" };

const drawings = { mill: "فرز", lathe: "تراش", wire: "وایرکات", grind: "سنگ", drill: "دریل", weld: "جوش", caliper: "کولیس", micrometer: "میکرومتر", bore: "گیج داخل", cmm: "CMM" };

export default async function EditEquipment({ params, searchParams }: PageProps<"/admin/equipment/[id]">) {
  await requireUser();
  const { id: idParam } = await params;
  const saved = (await searchParams).saved;
  const id = idParam === "new" ? null : Number(idParam);
  const row = id ? (await db.select().from(schema.equipment).where(eq(schema.equipment.id, id)))[0] : null;
  if (id && !row) notFound();

  const panels = Object.fromEntries(
    locales.map((l) => {
      const t = row?.text[l];
      const specs = (row?.specs ?? [])
        .map((s) => (s.label[l] ? `${s.label[l]}: ${s.value[l] ?? ""}` : ""))
        .filter(Boolean)
        .join("\n");
      return [
        l,
        <>
          <Field name={`t.${l}.name`} label="نام دستگاه" defaultValue={t?.name} required={l === "fa"} />
          <Field name={`t.${l}.description`} label="توضیح کوتاه" defaultValue={t?.description} rows={2} />
          <Field
            name={`t.${l}.specs`}
            label="مشخصات فنی (هر خط: عنوان: مقدار)"
            defaultValue={specs}
            rows={5}
            hint="مثال — ابعاد کاری: ۱۰۰۰ × ۵۰۰ × ۵۰۰ میلی‌متر. ترتیب خطوط در همه زبان‌ها یکسان باشد."
          />
        </>,
      ];
    }),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle title={row ? `ویرایش: ${row.text.fa?.name}` : "افزودن دستگاه"} back="/admin/equipment" />
      {saved ? <p className="mb-4 rounded-lg bg-[#edfaef] p-3 font-bold text-ok">✓ ذخیره شد.</p> : null}
      <SaveForm action={saveEquipment.bind(null, id)}>
        {row ? <input type="hidden" name="_existing" value="1" /> : null}
        <Panel title="تنظیمات">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="field">
              <label htmlFor="kind">نوع</label>
              <select id="kind" name="kind" defaultValue={row?.kind ?? "machine"} className="input">
                <option value="machine">ماشین‌آلات</option>
                <option value="measure">ابزار کنترل کیفیت</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="drawing">نقشه گرافیکی</label>
              <select id="drawing" name="drawing" defaultValue={row?.drawing ?? "mill"} className="input">
                {Object.entries(drawings).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <Field name="precision" label="دقت (میلی‌متر)" defaultValue={row?.precision} dir="ltr" hint="مثلاً 0.01" />
            <Field name="sort" label="ترتیب" type="number" defaultValue={row?.sort ?? 0} />
          </div>
          <div className="mt-3">
            <Check name="published" label="نمایش در سایت" defaultChecked={row?.published ?? true} />
          </div>
        </Panel>
        <LangTabs panels={panels} status={localeStatus(row?.text, ["name", "description"])} />
      </SaveForm>
      {row ? (
        <form action={deleteEquipment.bind(null, row.id)} className="-mt-16 mb-24">
          <ConfirmButton label="حذف این دستگاه" message="این دستگاه از سایت حذف شود؟" />
        </form>
      ) : null}
    </div>
  );
}
