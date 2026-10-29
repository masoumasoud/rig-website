"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { localeMeta, locales, type Locale } from "@/i18n/config";

export type FormState = { error?: string; ok?: string } | undefined;
type Action = (prev: FormState, data: FormData) => Promise<FormState>;

/** Form with a sticky save bar and a clear success/error message. */
export function SaveForm({
  action,
  children,
  submitLabel = "ذخیره تغییرات",
  encType,
}: {
  action: Action;
  children: React.ReactNode;
  submitLabel?: string;
  encType?: "multipart/form-data";
}) {
  const [shown, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} encType={encType} className="space-y-6 pb-24">
      {children}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#dcdcde] bg-white/95 px-4 py-3 backdrop-blur lg:start-64">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <SubmitButton label={submitLabel} />
          {shown?.ok ? (
            <p role="status" className="font-bold text-ok">
              ✓ {shown.ok}
            </p>
          ) : null}
          {shown?.error ? (
            <p role="alert" className="font-bold text-danger">
              {shown.error}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}

export function SubmitButton({ label, className = "btn btn-primary" }: { label: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending} aria-busy={pending}>
      {pending ? "در حال ذخیره…" : label}
    </button>
  );
}

/** One tab per language; all panels stay in the DOM so every language is submitted. */
export function LangTabs({
  panels,
  status,
}: {
  panels: Partial<Record<Locale, React.ReactNode>>;
  status: Partial<Record<Locale, "full" | "partial" | "empty">>;
}) {
  const [active, setActive] = useState<Locale>("fa");
  const dot = { full: "bg-ok", partial: "bg-accent", empty: "bg-[#c3c4c7]" };
  return (
    <div>
      <div role="tablist" aria-label="زبان" className="flex flex-wrap gap-1 border-b-2 border-[#dcdcde]">
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={active === l}
            onClick={() => setActive(l)}
            className="-mb-0.5 flex min-h-11 items-center gap-2 rounded-t-lg border-2 border-b-0 border-transparent px-4 font-bold text-ink-2 aria-selected:border-[#dcdcde] aria-selected:bg-white aria-selected:text-ink"
          >
            <span className={`size-2.5 rounded-full ${dot[status[l] ?? "empty"]}`} aria-hidden="true" />
            {localeMeta[l].label}
          </button>
        ))}
      </div>
      {locales.map((l) => (
        <div
          key={l}
          role="tabpanel"
          hidden={active !== l}
          dir={localeMeta[l].dir}
          lang={l}
          className="space-y-5 rounded-b-xl border-2 border-t-0 border-[#dcdcde] bg-white p-5"
        >
          {panels[l]}
        </div>
      ))}
      <p className="mt-2 text-sm text-ink-3">
        <span className="me-1 inline-block size-2.5 rounded-full bg-ok" /> کامل
        <span className="ms-4 me-1 inline-block size-2.5 rounded-full bg-accent" /> ناقص
        <span className="ms-4 me-1 inline-block size-2.5 rounded-full bg-[#c3c4c7]" /> خالی (نسخه انگلیسی نمایش داده می‌شود)
      </p>
    </div>
  );
}

/** Meta title/description with live length counters and a Google result preview. */
export function SeoFields({
  prefix,
  title,
  description,
  url,
}: {
  prefix: string;
  title?: string;
  description?: string;
  url: string;
}) {
  const [t, setT] = useState(title ?? "");
  const [d, setD] = useState(description ?? "");
  const color = (n: number, min: number, max: number) => (n === 0 ? "text-ink-3" : n < min || n > max ? "text-accent-ink" : "text-ok");
  return (
    <fieldset className="space-y-4 rounded-xl border border-dashed border-[#c3c4c7] p-4">
      <legend className="px-2 font-bold">سئو (نمایش در گوگل)</legend>
      <div className="field">
        <label htmlFor={`${prefix}.metaTitle`}>عنوان سئو</label>
        <input id={`${prefix}.metaTitle`} name={`${prefix}.metaTitle`} className="input" value={t} onChange={(e) => setT(e.target.value)} />
        <p className={`hint ${color(t.length, 30, 65)}`}>{t.length} کاراکتر — بهتر است بین ۳۰ تا ۶۵ باشد</p>
      </div>
      <div className="field">
        <label htmlFor={`${prefix}.metaDescription`}>توضیحات سئو</label>
        <textarea
          id={`${prefix}.metaDescription`}
          name={`${prefix}.metaDescription`}
          className="input !min-h-24"
          value={d}
          onChange={(e) => setD(e.target.value)}
        />
        <p className={`hint ${color(d.length, 70, 165)}`}>{d.length} کاراکتر — بهتر است بین ۷۰ تا ۱۶۵ باشد</p>
      </div>
      <div className="rounded-lg bg-[#f6f7f7] p-4" aria-label="پیش‌نمایش گوگل">
        <p className="ltr truncate text-sm text-[#4d5156]">{url}</p>
        <p className="truncate text-lg text-[#1a0dab]">{t || "—"}</p>
        <p className="line-clamp-2 text-sm text-[#4d5156]">{d || "—"}</p>
      </div>
    </fieldset>
  );
}

/** Submit button that asks for confirmation (used for delete). */
export function ConfirmButton({ label, message, className }: { label: string; message: string; className?: string }) {
  return (
    <button
      className={className ?? "min-h-11 rounded-lg border-2 border-danger px-4 font-bold text-danger hover:bg-danger hover:text-white"}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
