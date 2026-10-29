import Image from "next/image";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { localeMeta, locales } from "@/i18n/config";
import { requireUser } from "@/lib/auth";
import { EmptyState, PageTitle, Panel } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/client";
import { deleteMedia, saveMediaAlt } from "../../actions/media";
import { UploadForm, AltForm } from "./forms";

export const metadata = { title: "رسانه‌ها" };

export default async function MediaAdmin() {
  await requireUser();
  const rows = await db.select().from(schema.media).orderBy(desc(schema.media.createdAt));
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageTitle title="رسانه‌ها (عکس‌ها)" />
      <Panel title="بارگذاری عکس جدید">
        <UploadForm />
      </Panel>
      {rows.length === 0 ? (
        <EmptyState>هنوز عکسی بارگذاری نشده است.</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-xl border border-[#dcdcde] bg-white">
              <div className="relative aspect-[4/3] bg-[#f6f7f7]">
                <Image src={`/media/${m.file}`} alt={m.alt.fa ?? ""} fill sizes="400px" className="object-contain" />
              </div>
              <details className="p-4">
                <summary className="cursor-pointer font-bold">
                  متن جایگزین (alt) — مهم برای سئو {m.alt.fa ? "✓" : "⚠"}
                </summary>
                <AltForm action={saveMediaAlt.bind(null, m.id)}>
                  {locales.map((l) => (
                    <div key={l} className="field">
                      <label htmlFor={`alt-${m.id}-${l}`} className="!text-sm">{localeMeta[l].label}</label>
                      <input id={`alt-${m.id}-${l}`} name={`alt.${l}`} defaultValue={m.alt[l] ?? ""} dir={localeMeta[l].dir} className="input !min-h-10 !py-1.5" />
                    </div>
                  ))}
                </AltForm>
              </details>
              <div className="flex items-center justify-between border-t border-[#f0f0f1] px-4 py-2 text-sm text-ink-3">
                <span className="ltr">{m.width}×{m.height}</span>
                <form action={deleteMedia.bind(null, m.id)}>
                  <ConfirmButton label="حذف" message="این عکس حذف شود؟" className="min-h-10 px-3 font-bold text-danger hover:underline" />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
