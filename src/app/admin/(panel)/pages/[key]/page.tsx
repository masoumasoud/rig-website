import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { locales, localePath } from "@/i18n/config";
import { requireUser } from "@/lib/auth";
import { localeStatus } from "@/lib/admin-form";
import { absoluteUrl } from "@/lib/seo";
import { Field, PageTitle } from "@/components/admin/ui";
import { LangTabs, SaveForm, SeoFields } from "@/components/admin/client";
import { savePage } from "../../../actions/content";
import { pageDefs } from "../defs";

export const metadata = { title: "ویرایش صفحه" };

export default async function EditPage({ params }: PageProps<"/admin/pages/[key]">) {
  await requireUser();
  const { key } = await params;
  const def = pageDefs[key];
  if (!def) notFound();
  const [row] = await db.select().from(schema.pages).where(eq(schema.pages.key, key));
  const data = row?.data ?? {};
  const fields = [...def.fields.map((f) => f.key), "metaTitle", "metaDescription"];

  const panels = Object.fromEntries(
    locales.map((l) => [
      l,
      <>
        {def.fields.map((f) => (
          <Field key={f.key} name={`t.${l}.${f.key}`} label={f.label} defaultValue={data[l]?.[f.key]} rows={f.rows} />
        ))}
        <SeoFields prefix={`t.${l}`} title={data[l]?.metaTitle} description={data[l]?.metaDescription} url={absoluteUrl(localePath(l, def.path))} />
      </>,
    ]),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle title={def.label} back="/admin/pages" />
      <SaveForm action={savePage.bind(null, key, fields)}>
        <LangTabs panels={panels} status={localeStatus(data, ["metaTitle", "metaDescription"])} />
      </SaveForm>
    </div>
  );
}
