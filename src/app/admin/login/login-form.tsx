"use client";

import { useActionState } from "react";
import { loginAction } from "../actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="card space-y-4 p-6">
      <div className="field">
        <label htmlFor="email">ایمیل</label>
        <input id="email" name="email" type="email" dir="ltr" required autoComplete="username" className="input" />
      </div>
      <div className="field">
        <label htmlFor="password">رمز عبور</label>
        <input id="password" name="password" type="password" dir="ltr" required autoComplete="current-password" className="input" />
      </div>
      {state?.error ? (
        <p role="alert" className="error">
          {state.error}
        </p>
      ) : null}
      <button className="btn btn-dark w-full" disabled={pending}>
        {pending ? "در حال ورود…" : "ورود"}
      </button>
    </form>
  );
}
