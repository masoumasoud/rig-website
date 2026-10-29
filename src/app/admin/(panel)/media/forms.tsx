"use client";

import { useActionState } from "react";
import { SubmitButton, type FormState } from "@/components/admin/client";
import { uploadMedia } from "../../actions/media";

export function UploadForm() {
  const [state, action] = useActionState(uploadMedia, undefined);
  return (
    <form action={action} className="space-y-4">
      <div className="field">
        <label htmlFor="files">انتخاب عکس‌ها (می‌توانید چند عکس را با هم انتخاب کنید)</label>
        <input id="files" name="files" type="file" accept="image/*" multiple required className="block w-full rounded-lg border-2 border-dashed border-[#c3c4c7] p-4" />
        <p className="hint">عکس‌ها خودکار کوچک و بهینه می‌شوند؛ نگران حجم نباشید.</p>
      </div>
      <div className="field">
        <label htmlFor="alt">توضیح کوتاه عکس به فارسی (برای گوگل)</label>
        <input id="alt" name="alt" className="input" placeholder="مثلاً: شفت فولادی تراشکاری‌شده با CNC" />
      </div>
      {state?.ok ? <p role="status" className="font-bold text-ok">✓ {state.ok}</p> : null}
      {state?.error ? <p role="alert" className="font-bold text-danger">{state.error}</p> : null}
      <SubmitButton label="بارگذاری" />
    </form>
  );
}

export function AltForm({ action, children }: { action: (p: FormState, d: FormData) => Promise<FormState>; children: React.ReactNode }) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="mt-3 space-y-2">
      {children}
      <div className="flex items-center gap-3">
        <SubmitButton label="ذخیره" className="btn btn-dark !min-h-10" />
        {state?.ok ? <span className="font-bold text-ok">✓</span> : null}
      </div>
    </form>
  );
}
