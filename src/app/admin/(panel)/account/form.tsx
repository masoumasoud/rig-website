"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/admin/client";
import { changePasswordAction } from "../../actions/auth";

export function AccountForm({ name, email }: { name: string; email: string }) {
  const [state, action] = useActionState(changePasswordAction, undefined);
  return (
    <form action={action} className="space-y-4 rounded-xl border border-[#dcdcde] bg-white p-6">
      <p className="text-ink-2">
        ایمیل ورود: <span className="ltr font-bold text-ink">{email}</span>
      </p>
      <div className="field">
        <label htmlFor="name">نام نمایشی</label>
        <input id="name" name="name" defaultValue={name} className="input" />
      </div>
      <div className="field">
        <label htmlFor="current">رمز فعلی</label>
        <input id="current" name="current" type="password" dir="ltr" autoComplete="current-password" className="input" />
      </div>
      <div className="field">
        <label htmlFor="next">رمز جدید (حداقل ۸ کاراکتر)</label>
        <input id="next" name="next" type="password" dir="ltr" autoComplete="new-password" className="input" />
      </div>
      {state?.ok ? <p role="status" className="font-bold text-ok">✓ {state.ok}</p> : null}
      {state?.error ? <p role="alert" className="font-bold text-danger">{state.error}</p> : null}
      <SubmitButton label="ذخیره" />
    </form>
  );
}
