import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { locales, localePath } from "@/i18n/config";
import { requireUser } from "@/lib/auth";
import { htmlToText, localeStatus } from "@/lib/admin-form";
import { absoluteUrl } from "@/lib/seo";
import { Check, Field, PageTitle, Panel } from "@/components/admin/ui";
import { ConfirmButton, LangTabs, SaveForm, SeoFields } from "@/components/admin/client";
import { deleteService, saveService } from "../../../actions/content";

export const metadata = { title: "ویرایش خدمت" };

const icons = { mill: "فرز", lathe: "تراش", wire: "وایرکات", grind: "سنگ", manual: "دستی", weld: "جوش", drill: "دریل", machine: "دستگاه", reverse: "مهندسی معکوس", mold: "قالب" };

export default async function EditService({ params, searchParams }: PageProps<"/admin/services/[id]">) {
  await requireUser();
  const { id: idParam } = await params;
  const saved = (await searchParams).saved;
  const id = idParam === "new" ? null : Number(idParam);
  const row = id ? (await db.select().from(schema.services).where(eq(schema.services.id, id)))[0] : null;
  if (id && !row) notFound();

  const panels = Object.fromEntries(
    locales.map((l) => {
      const t = row?.text[l];
      const p = `t.${l}`;
      return [
        l,
        <>
          <Field name={`${p}.title`} label="عنوان" defaultValue={t?.title} required={l === "fa"} />
          <Field name={`${p}.summary`} label="خلاصه (در کارت‌ها نمایش داده می‌شود)" defaultValue={t?.summary} rows={2} />
          <Field
            name={`${p}.body`}
            label="متن کامل"
            defaultValue={htmlToText(t?.body)}
            rows={8}
            hint="برای پاراگراف جدید یک خط خالی بگذارید. برای فهرست، اول هر خط «-» بنویسید."
          />
          <Field name={`${p}.bullets`} label="ویژگی‌های کلیدی (هر خط یک مورد)" defaultValue={t?.bullets?.join("\n")} rows={3} />
          <SeoFields
            prefix={p}
            title={t?.metaTitle}
            description={t?.metaDescription}
            url={absoluteUrl(localePath(l, `/services/${row?.slug ?? "…"}`))}
          />
        </>,
      ];
    }),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle title={row ? `ویرایش: ${row.text.fa?.title}` : "افزودن خدمت"} back="/admin/services" />
      {saved ? <p className="mb-4 rounded-lg bg-[#edfaef] p-3 font-bold text-ok">✓ ذخیره شد.</p> : null}
      <SaveForm action={saveService.bind(null, id)}>
        {row ? <input type="hidden" name="_existing" value="1" /> : null}
        <Panel title="تنظیمات">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="slug" label="نامک انگلیسی (آدرس صفحه)" defaultValue={row?.slug} dir="ltr" hint="مثلاً cnc-milling" />
            <div className="field">
              <label htmlFor="icon">آیکون</label>
              <select id="icon" name="icon" defaultValue={row?.icon ?? "mill"} className="input">
                {Object.entries(icons).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <Field name="sort" label="ترتیب نمایش" type="number" defaultValue={row?.sort ?? 0} />
          </div>
          <div className="mt-3">
            <Check name="published" label="نمایش در سایت" defaultChecked={row?.published ?? true} />
          </div>
        </Panel>
        <LangTabs panels={panels} status={localeStatus(row?.text, ["title", "summary", "body"])} />
      </SaveForm>
      {row ? (
        <form action={deleteService.bind(null, row.id)} className="-mt-16 mb-24">
          <ConfirmButton label="حذف این خدمت" message="این خدمت از سایت حذف شود؟" />
        </form>
      ) : null}
    </div>
  );
}
