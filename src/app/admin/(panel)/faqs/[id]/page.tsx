import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { locales } from "@/i18n/config";
import { requireUser } from "@/lib/auth";
import { localeStatus } from "@/lib/admin-form";
import { Check, Field, PageTitle, Panel } from "@/components/admin/ui";
import { ConfirmButton, LangTabs, SaveForm } from "@/components/admin/client";
import { deleteFaq, saveFaq } from "../../../actions/content";

export const metadata = { title: "ویرایش پرسش" };

export default async function EditFaq({ params, searchParams }: PageProps<"/admin/faqs/[id]">) {
  await requireUser();
  const { id: idParam } = await params;
  const saved = (await searchParams).saved;
  const id = idParam === "new" ? null : Number(idParam);
  const row = id ? (await db.select().from(schema.faqs).where(eq(schema.faqs.id, id)))[0] : null;
  if (id && !row) notFound();
  const panels = Object.fromEntries(
    locales.map((l) => [
      l,
      <>
        <Field name={`t.${l}.q`} label="پرسش" defaultValue={row?.text[l]?.q} required={l === "fa"} />
        <Field name={`t.${l}.a`} label="پاسخ" defaultValue={row?.text[l]?.a} rows={4} />
      </>,
    ]),
  );
  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle title={row ? "ویرایش پرسش" : "افزودن پرسش"} back="/admin/faqs" />
      {saved ? <p className="mb-4 rounded-lg bg-[#edfaef] p-3 font-bold text-ok">✓ ذخیره شد.</p> : null}
      <SaveForm action={saveFaq.bind(null, id)}>
        {row ? <input type="hidden" name="_existing" value="1" /> : null}
        <Panel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="sort" label="ترتیب" type="number" defaultValue={row?.sort ?? 0} />
            <div className="self-end">
              <Check name="published" label="نمایش در سایت" defaultChecked={row?.published ?? true} />
            </div>
          </div>
        </Panel>
        <LangTabs panels={panels} status={localeStatus(row?.text, ["q", "a"])} />
      </SaveForm>
      {row ? (
        <form action={deleteFaq.bind(null, row.id)} className="-mt-16 mb-24">
          <ConfirmButton label="حذف این پرسش" message="این پرسش حذف شود؟" />
        </form>
      ) : null}
    </div>
  );
}
