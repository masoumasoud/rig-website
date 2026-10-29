import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { locales, localePath } from "@/i18n/config";
import { requireUser } from "@/lib/auth";
import { htmlToText, localeStatus } from "@/lib/admin-form";
import { absoluteUrl } from "@/lib/seo";
import { Check, Field, PageTitle, Panel } from "@/components/admin/ui";
import { ConfirmButton, LangTabs, SaveForm, SeoFields } from "@/components/admin/client";
import { deleteProject, saveProject } from "../../../actions/content";

export const metadata = { title: "ویرایش نمونه‌کار" };

export default async function EditProject({ params, searchParams }: PageProps<"/admin/portfolio/[id]">) {
  await requireUser();
  const { id: idParam } = await params;
  const saved = (await searchParams).saved;
  const id = idParam === "new" ? null : Number(idParam);
  const [row] = id ? await db.select().from(schema.projects).where(eq(schema.projects.id, id)) : [null];
  if (id && !row) notFound();
  const [media, services] = await Promise.all([
    db.select().from(schema.media).orderBy(desc(schema.media.createdAt)),
    db.select().from(schema.services).orderBy(asc(schema.services.sort)),
  ]);

  const panels = Object.fromEntries(
    locales.map((l) => {
      const t = row?.text[l];
      const p = `t.${l}`;
      return [
        l,
        <>
          <Field name={`${p}.title`} label="عنوان" defaultValue={t?.title} required={l === "fa"} />
          <Field name={`${p}.summary`} label="خلاصه" defaultValue={t?.summary} rows={2} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name={`${p}.material`} label="جنس قطعه" defaultValue={t?.material} />
            <Field name={`${p}.industry`} label="صنعت / کاربرد" defaultValue={t?.industry} />
          </div>
          <Field name={`${p}.body`} label="توضیحات کامل" defaultValue={htmlToText(t?.body)} rows={6} hint="برای پاراگراف جدید یک خط خالی بگذارید." />
          <SeoFields prefix={p} title={t?.metaTitle} description={t?.metaDescription} url={absoluteUrl(localePath(l, `/portfolio/${row?.slug ?? "…"}`))} />
        </>,
      ];
    }),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle title={row ? `ویرایش: ${row.text.fa?.title}` : "افزودن نمونه‌کار"} back="/admin/portfolio" />
      {saved ? <p className="mb-4 rounded-lg bg-[#edfaef] p-3 font-bold text-ok">✓ ذخیره شد.</p> : null}
      <SaveForm action={saveProject.bind(null, id)}>
        {row ? <input type="hidden" name="_existing" value="1" /> : null}
        <Panel title="تنظیمات">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="slug" label="نامک انگلیسی (آدرس صفحه)" defaultValue={row?.slug} dir="ltr" hint="مثلاً gearbox-shaft" />
            <Field name="sort" label="ترتیب" type="number" defaultValue={row?.sort ?? 0} />
          </div>
          <div className="mt-3">
            <Check name="published" label="نمایش در سایت" defaultChecked={row?.published ?? true} />
          </div>
        </Panel>
        <Panel title="عکس‌ها (اولین عکس انتخاب‌شده، عکس اصلی است)">
          {media.length === 0 ? (
            <p className="text-ink-2">
              هنوز عکسی ندارید. <Link href="/admin/media" className="link">بارگذاری عکس در رسانه‌ها</Link>
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {media.map((m) => (
                <li key={m.id}>
                  <label className="block cursor-pointer overflow-hidden rounded-lg border-2 border-[#dcdcde] has-[:checked]:border-accent">
                    <div className="relative aspect-square bg-[#f6f7f7]">
                      <Image src={`/media/${m.file}`} alt="" fill sizes="160px" className="object-cover" />
                    </div>
                    <span className="flex items-center gap-2 p-2 text-sm">
                      <input type="checkbox" name="imageIds" value={m.id} defaultChecked={row?.imageIds.includes(m.id)} className="size-5" />
                      انتخاب
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="خدمات مرتبط">
          <div className="grid gap-1 sm:grid-cols-2">
            {services.map((s) => (
              <Check key={s.slug} name="serviceSlugs" value={s.slug} label={s.text.fa?.title ?? s.slug} defaultChecked={row?.serviceSlugs.includes(s.slug)} />
            ))}
          </div>
        </Panel>
        <LangTabs panels={panels} status={localeStatus(row?.text, ["title", "summary"])} />
      </SaveForm>
      {row ? (
        <form action={deleteProject.bind(null, row.id)} className="-mt-16 mb-24">
          <ConfirmButton label="حذف این نمونه‌کار" message="این نمونه‌کار حذف شود؟" />
        </form>
      ) : null}
    </div>
  );
}
