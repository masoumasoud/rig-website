"use client";

import { useActionState, useEffect, useRef } from "react";
import { replyAction } from "../../../actions/inbox";
import { SubmitButton } from "@/components/admin/client";

export function ReplyForm({ conversationId, hasEmail }: { conversationId: number; hasEmail: boolean }) {
  const [state, action] = useActionState(replyAction.bind(null, conversationId), undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-4">
      <textarea name="body" rows={6} className="input" dir="auto" placeholder="متن پاسخ را بنویسید…" required />
      <div className="field">
        <label htmlFor="reply-files">پیوست (اختیاری)</label>
        <input id="reply-files" name="files" type="file" multiple className="block w-full text-sm" />
      </div>
      {state?.ok ? <p role="status" className="font-bold text-ok">✓ {state.ok}</p> : null}
      {state?.error ? <p role="alert" className="font-bold text-danger">{state.error}</p> : null}
      <SubmitButton label={hasEmail ? "ارسال پاسخ با ایمیل" : "ذخیره یادداشت پاسخ"} />
    </form>
  );
}
