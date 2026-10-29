"use client";

import { demoNotice, isDemo } from "@/lib/demo";
import { useRef, useState, useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/dictionaries/fa";
import type { Locale } from "@/i18n/config";
import { track } from "@/components/analytics";
import { ArrowIcon, CheckIcon, CloseIcon, FileIcon, UploadIcon } from "@/components/icons";

type Props = {
  locale: Locale;
  t: Dictionary["form"];
  services: { slug: string; title: string }[];
};

const MAX = 25 * 1024 * 1024;
const ACCEPT = ".pdf,.dwg,.dxf,.step,.stp,.igs,.iges,.stl,.sldprt,.x_t,.jpg,.jpeg,.png,.webp,.heic,.zip,.rar,.7z";

const fmtSize = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`);

/** Solves the self-hosted ALTCHA proof-of-work in the background; no UI for the visitor. */
async function solveCaptcha(): Promise<string> {
  const [{ solveChallenge, pbkdf2 }, res] = await Promise.all([import("altcha/lib"), fetch("/api/altcha", { cache: "no-store" })]);
  const data = await res.json();
  const challenge = { parameters: data.parameters, signature: data.signature };
  const solution = await solveChallenge({ challenge, deriveKey: pbkdf2.deriveKey });
  if (!solution) throw new Error("captcha");
  return btoa(JSON.stringify({ challenge, solution }));
}

export function QuoteForm({ locale, t, services }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [dragging, setDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const captcha = useRef<Promise<string> | null>(null);
  const step2Heading = useRef<HTMLHeadingElement>(null);
  const fromUrl = useSyncExternalStore(
    () => () => {},
    () => {
      const s = new URLSearchParams(window.location.search).get("service");
      return services.find((x) => x.slug === s)?.title ?? "";
    },
    () => "",
  );
  const [chosen, setService] = useState<string | null>(null);
  const service = chosen ?? fromUrl;

  const startCaptcha = () => {
    if (isDemo) return;
    captcha.current ??= solveCaptcha().catch((e) => {
      captcha.current = null;
      throw e;
    });
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, 10);
    const total = next.reduce((n, f) => n + f.size, 0);
    if (total > MAX) {
      setFileError(t.errorFileSize);
      return;
    }
    setFileError(null);
    setFiles(next);
    track("file_upload", { count: next.length });
  };

  const field = (name: string) => formRef.current?.elements.namedItem(name) as HTMLInputElement | null;

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    const name = field("name")?.value.trim() ?? "";
    const phone = (field("phone")?.value ?? "").replace(/[\s()-]/g, "");
    const email = field("email")?.value.trim() ?? "";
    if (name.length < 2) e.name = t.errorRequired;
    if (!phone) e.phone = t.errorRequired;
    else if (!/^\+?[\d۰-۹٠-٩]{7,15}$/.test(phone)) e.phone = t.errorPhone;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t.errorEmail;
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) field(first)?.focus();
    return !first;
  };

  const goStep2 = () => {
    setStep(2);
    startCaptcha();
    requestAnimationFrame(() => step2Heading.current?.focus());
  };

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (step === 1) return goStep2();
    if (!validateStep2()) return;
    if (isDemo) {
      setStatus("error");
      setMessage(demoNotice[locale]);
      return;
    }
    setStatus("sending");
    setMessage("");
    try {
      startCaptcha();
      const payload = await captcha.current!;
      const fd = new FormData(ev.currentTarget);
      fd.delete("files");
      files.forEach((f) => fd.append("files", f));
      fd.set("altcha", payload);
      fd.set("locale", locale);
      const res = await fetch("/api/inquiry", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        captcha.current = null;
        const map: Record<string, string> = {
          rate: t.errorRate,
          fileSize: t.errorFileSize,
          fileType: t.errorFileType,
        };
        setStatus("error");
        setMessage(map[data.error] ?? t.errorGeneric);
        return;
      }
      setCode(data.code);
      setStatus("done");
      track("quote_submit", { service: fd.get("service") || "unknown", files: files.length });
    } catch {
      captcha.current = null;
      setStatus("error");
      setMessage(t.errorGeneric);
    }
  };

  if (status === "done") {
    return (
      <div role="status" className="card p-8 text-center">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-ok text-white">
          <CheckIcon className="size-11" />
        </span>
        <h3 className="mt-5 text-2xl">{t.successTitle}</h3>
        <p className="mt-3 text-lg text-ink-2">
          {t.successBody.split("{code}")[0]}
          <strong className="ltr text-ink">{code}</strong>
          {t.successBody.split("{code}")[1]}
        </p>
      </div>
    );
  }

  const err = (name: string) =>
    errors[name] ? (
      <p id={`${name}-err`} className="error">
        {errors[name]}
      </p>
    ) : null;
  const aria = (name: string) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-err` : undefined,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} onFocus={step === 2 ? startCaptcha : undefined} noValidate className="card p-5 md:p-8">
      <ol className="mb-6 flex gap-2" aria-label={t.title}>
        {[t.step1, t.step2].map((label, i) => (
          <li
            key={label}
            aria-current={step === i + 1 ? "step" : undefined}
            className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl border-2 px-3 py-2 font-bold ${step === i + 1 ? "border-ink bg-ink text-white" : step > i + 1 ? "border-ok text-ok" : "border-line text-ink-3"}`}
          >
            <span className="flex size-7 flex-none items-center justify-center rounded-full border-2 border-current text-sm">
              {step > i + 1 ? <CheckIcon className="size-4" /> : i + 1}
            </span>
            <span className="truncate">{label}</span>
          </li>
        ))}
      </ol>

      {/* Honeypot (hidden from people and screen readers). */}
      <div aria-hidden="true" className="sr-only">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div hidden={step !== 1} className="space-y-5">
        <div className="field">
          <label htmlFor="q-service">{t.service}</label>
          <select id="q-service" name="service" className="input" value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">{t.serviceAny}</option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="q-quantity">{t.quantity}</label>
            <input id="q-quantity" name="quantity" className="input" inputMode="numeric" autoComplete="off" />
          </div>
          <div className="field">
            <label htmlFor="q-deadline">{t.deadline}</label>
            <input id="q-deadline" name="deadline" className="input" placeholder={t.deadlineHint} autoComplete="off" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="q-material">{t.material}</label>
          <input id="q-material" name="material" className="input" placeholder={t.materialHint} autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="q-message">{t.message}</label>
          <textarea id="q-message" name="message" className="input" placeholder={t.messageHint} rows={4} />
        </div>

        <div className="field">
          <span className="label" id="q-files-label">
            {t.files}
          </span>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${dragging ? "border-accent bg-accent/10" : "border-steel bg-paper hover:border-ink"}`}
          >
            <UploadIcon className="size-10 text-ink-2" />
            <span className="text-lg font-bold">{t.filesDrop}</span>
            <span className="hint">{t.filesHint}</span>
            <input
              type="file"
              multiple
              accept={ACCEPT}
              className="sr-only"
              aria-labelledby="q-files-label"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          {fileError ? <p className="error">{fileError}</p> : null}
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-lg border border-line bg-paper px-3 py-2">
                  <FileIcon className="size-6 flex-none text-ink-2" />
                  <span className="ltr min-w-0 flex-1 truncate">{f.name}</span>
                  <span className="ltr text-sm text-ink-3">{fmtSize(f.size)}</span>
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-paper-2"
                    aria-label={`${t.remove} ${f.name}`}
                  >
                    <CloseIcon className="size-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="btn btn-dark w-full text-lg">
          {t.next}
          <ArrowIcon />
        </button>
      </div>

      <div hidden={step !== 2} className="space-y-5">
        <h3 ref={step2Heading} tabIndex={-1} className="text-xl outline-none">
          {t.step2}
        </h3>
        <div className="field">
          <label htmlFor="q-name">{t.name} *</label>
          <input id="q-name" name="name" className="input" autoComplete="name" required {...aria("name")} />
          {err("name")}
        </div>
        <div className="field">
          <label htmlFor="q-phone">{t.phone} *</label>
          <input
            id="q-phone"
            name="phone"
            type="tel"
            dir="ltr"
            className="input text-start"
            inputMode="tel"
            autoComplete="tel"
            required
            {...aria("phone")}
          />
          {err("phone")}
        </div>
        <div className="field">
          <label htmlFor="q-email">{t.email}</label>
          <input id="q-email" name="email" type="email" dir="ltr" className="input text-start" autoComplete="email" {...aria("email")} />
          {err("email")}
        </div>
        <div className="field">
          <label htmlFor="q-company">{t.company}</label>
          <input id="q-company" name="company" className="input" autoComplete="organization" />
        </div>

        {status === "error" && (
          <p role="alert" className="rounded-lg border-2 border-danger bg-danger/5 p-4 font-bold text-danger">
            {message}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button type="button" className="btn btn-outline sm:w-1/3" onClick={() => setStep(1)}>
            {t.back}
          </button>
          <button type="submit" className="btn btn-primary flex-1 text-lg" disabled={status === "sending"} aria-busy={status === "sending"}>
            {status === "sending" ? t.sending : t.submit}
          </button>
        </div>
        <p className="hint text-center">{t.privacy}</p>
      </div>
    </form>
  );
}
