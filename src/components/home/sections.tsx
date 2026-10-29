import Link from "next/link";
import { localePath, num, pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import type { EquipmentRow, ServiceRow } from "@/lib/content";
import type { FaqText } from "@/db/schema";
import { ArrowIcon, CheckIcon, ServiceIcon } from "@/components/icons";
import { Drawing } from "@/components/drawings";

type Base = { locale: Locale; t: Dictionary };

/* --------------------------------------------------------------- odometer -- */
function Odometer({ value, className }: { value: string; className?: string }) {
  return (
    <span className={`odo ${className ?? ""}`} data-io aria-label={value}>
      {[...value].map((ch, i) => {
        const latin = "0123456789".indexOf(ch);
        const persian = "۰۱۲۳۴۵۶۷۸۹".indexOf(ch);
        const d = latin >= 0 ? latin : persian;
        if (d < 0) return <span key={i}>{ch}</span>;
        const digits = persian >= 0 ? "۰۱۲۳۴۵۶۷۸۹" : "0123456789";
        return (
          <span key={i} className="odo-col" aria-hidden="true" style={{ ["--d" as string]: d, ["--i" as string]: i }}>
            {[...digits].map((g) => (
              <span key={g}>{g}</span>
            ))}
          </span>
        );
      })}
    </span>
  );
}

/* ------------------------------------------------------------------ about -- */
export function About({ locale, t, title, body }: Base & { title: string; body: string }) {
  const since = locale === "fa" ? num(1376, locale) : "1997";
  return (
    <section className="section">
      <div className="wrap grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="card relative overflow-hidden p-8 text-center">
          <p className="text-lg font-bold text-ink-2">{t.common.since}</p>
          <Odometer value={since} className="mt-2 text-[clamp(4rem,3rem+5vw,7rem)] font-extrabold tracking-tight" />
          <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-accent" />
          <svg viewBox="0 0 200 20" className="mt-6 w-full text-steel" aria-hidden="true">
            {Array.from({ length: 41 }, (_, i) => (
              <path key={i} d={`M${i * 5} 0v${i % 10 === 0 ? 16 : i % 5 === 0 ? 11 : 6}`} stroke="currentColor" strokeWidth="1" />
            ))}
          </svg>
        </div>
        <div className="reveal">
          <h2 className="h-section">{title}</h2>
          <p className="lead mt-5">{body}</p>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- services -- */
function Turret() {
  return (
    <svg viewBox="0 0 200 200" className="hidden size-40 flex-none text-ink lg:block" aria-hidden="true">
      <g data-fx="turret" style={{ transformOrigin: "100px 100px" }}>
        <circle cx="100" cy="100" r="82" fill="var(--card)" stroke="currentColor" strokeWidth="3" />
        <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const x = 100 + Math.cos(a) * 60;
          const y = 100 + Math.sin(a) * 60;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="12" fill={i === 0 ? "var(--accent)" : "var(--paper-2)"} stroke="currentColor" strokeWidth="2" />
              <circle cx={x} cy={y} r="4" fill="currentColor" />
            </g>
          );
        })}
      </g>
      <path d="M100 4v24" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Services({ locale, t, services }: Base & { services: ServiceRow[] }) {
  return (
    <section className="section border-y border-line bg-paper-2">
      <div className="wrap">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="h-section">{t.home.servicesTitle}</h2>
            <p className="lead mt-3">{t.home.servicesLead}</p>
          </div>
          <Turret />
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const text = pick(s.text, locale);
            return (
              <li key={s.slug} className="reveal">
                <Link
                  href={localePath(locale, `/services/${s.slug}`)}
                  className="card group flex h-full flex-col p-6 transition-colors hover:border-ink"
                >
                  <span className="flex size-14 items-center justify-center rounded-xl bg-ink text-white transition-colors group-hover:bg-accent group-hover:text-ink">
                    <ServiceIcon name={s.icon} className="size-8" />
                  </span>
                  <h3 className="mt-4 text-xl">{text?.title}</h3>
                  <p className="mt-2 flex-1 text-ink-2">{text?.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-2 font-bold text-accent-ink">
                    {t.common.learnMore}
                    <ArrowIcon className="size-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- precision -- */
function Caliper({ locale }: { locale: Locale }) {
  return (
    <div data-io className="relative mx-auto w-full max-w-[520px]">
      <svg viewBox="0 0 520 260" className="w-full" aria-hidden="true">
        {/* part being measured */}
        <rect x="70" y="150" width="120" height="70" rx="6" fill="#c9ced4" stroke="#fff" strokeWidth="2" />
        <path d="M70 165h120M70 205h120" stroke="#9aa1a9" />
        {/* fixed jaw + beam */}
        <g fill="#e9ecef" stroke="#0d2236" strokeWidth="2">
          <path d="M40 60h460v34H40z" />
          <path d="M40 94h30v130H40z" />
        </g>
        <g stroke="#0d2236" strokeWidth="1.5">
          {Array.from({ length: 42 }, (_, i) => (
            <path key={i} d={`M${200 + i * 7} 60v${i % 5 === 0 ? 14 : 8}`} />
          ))}
        </g>
        {/* sliding jaw */}
        <g className="caliper-jaw">
          <g fill="#f8f9fa" stroke="#0d2236" strokeWidth="2">
            <path d="M190 40h130v74H190z" />
            <path d="M190 114h30v110h-30z" />
          </g>
          <rect x="204" y="52" width="100" height="40" rx="4" fill="#bfe3c6" stroke="#0d2236" strokeWidth="2" />
          <text
            x="296"
            y="81"
            textAnchor="end"
            fontFamily="ui-monospace, monospace"
            fontWeight="700"
            fontSize="22"
            fill="#0d2236"
            direction="ltr"
          >
            <tspan data-count="25.00" data-from="0" data-decimals="2" data-digits={locale === "fa" ? "fa" : undefined}>
              {locale === "fa" ? "۲۵٫۰۰" : "25.00"}
            </tspan>
          </text>
        </g>
      </svg>
    </div>
  );
}

export function Precision({ locale, t }: Base) {
  return (
    <section className="blueprint section">
      <div className="wrap grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="h-section">{t.home.precisionTitle}</h2>
          <p className="mt-5 text-lg text-white/85">{t.home.precisionLead}</p>
          <p className="mt-8 flex items-baseline gap-3" data-io>
            <span
              className="ltr text-[clamp(3.5rem,2.5rem+5vw,6rem)] font-extrabold leading-none text-accent"
              data-count="0.01"
              data-from="1"
              data-decimals="2"
              data-digits={locale === "fa" ? "fa" : undefined}
            >
              {num("0.01", locale)}
            </span>
            <span className="text-2xl font-bold">{t.common.mm}</span>
          </p>
        </div>
        <Caliper locale={locale} />
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- machines -- */
export function Machines({ locale, t, items }: Base & { items: EquipmentRow[] }) {
  const machines = items.filter((e) => e.kind === "machine").slice(0, 4);
  return (
    <section className="section">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="h-section">{t.home.machinesTitle}</h2>
          <Link href={localePath(locale, "/equipment")} className="btn btn-outline">
            {t.common.viewEquipment}
            <ArrowIcon />
          </Link>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {machines.map((m) => {
            const text = pick(m.text, locale);
            const firstSpec = m.specs[0];
            return (
              <li key={m.id} className="card overflow-hidden">
                <div data-io className="blueprint p-4 text-white/90">
                  <Drawing name={m.drawing} className="h-auto w-full" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg">{text?.name}</h3>
                  {firstSpec ? (
                    <p className="mt-1 text-ink-2">
                      {pick(firstSpec.label, locale)}: <strong className="text-ink">{pick(firstSpec.value, locale)}</strong>
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- process -- */
export function Process({ locale, t }: Base) {
  const steps = t.home.process;
  return (
    <section className="section grid-paper border-y border-line">
      <div className="wrap">
        <h2 className="h-section max-w-2xl">{t.home.processTitle}</h2>
        <div className="relative mt-12">
          <svg
            data-fx="toolpath"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
            className="draw pointer-events-none absolute inset-0 hidden size-full rtl:-scale-x-100 lg:block"
            aria-hidden="true"
            data-io
          >
            <path
              data-path
              d="M0 200H150l15-16 20 32 15-16H550l15-16 20 32 15-16H950l15-16 20 32 15-16H1200"
              pathLength={1}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeDasharray="1"
            />
            <g data-tool transform="translate(0 200)">
              <circle r="9" fill="var(--ink)" />
              <circle r="3.5" fill="var(--accent)" />
            </g>
          </svg>
          <ol className="relative grid gap-4 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16">
            {steps.map((s, i) => (
              <li key={s.t} className="card reveal p-6">
                <span className="flex size-12 items-center justify-center rounded-full bg-ink text-xl font-extrabold text-white">
                  {num(i + 1, locale)}
                </span>
                <h3 className="mt-4 text-xl">{s.t}</h3>
                <p className="mt-2 text-ink-2">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- QC --- */
export function Quality({ t }: Base) {
  return (
    <section className="section">
      <div data-io className="wrap grid items-center gap-12 lg:grid-cols-2">
        <div className="blueprint order-2 rounded-[var(--radius)] p-6 text-white/90 lg:order-1">
          <svg viewBox="0 0 240 160" className="w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M40 40h20v60a30 30 0 0 0 30 30h40a30 30 0 0 0 30-30V40" />
            <path d="M60 64h34" />
            <rect x="94" y="56" width="18" height="16" fill="#c9ced4" stroke="#fff" />
            <g className="thimble">
              <path d="M112 64h48" />
              <path d="M160 56h20v16h-20zM180 50h44v28h-44z" />
              <path d="M188 50v28M196 50v28M204 50v28M212 50v28" strokeWidth="1" />
            </g>
            <text x="120" y="150" fill="var(--accent)" stroke="none" fontSize="12" fontFamily="ui-monospace, monospace" textAnchor="middle" direction="ltr">
              ± 0.01 mm
            </text>
          </svg>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="h-section">{t.home.qcTitle}</h2>
          <p className="lead mt-4">{t.home.qcLead}</p>
          <ul className="mt-6 space-y-3">
            {t.home.qcTools.map((tool, i) => (
              <li key={tool} className="flex items-center gap-3 text-lg">
                <span className="tick flex size-9 flex-none items-center justify-center rounded-full bg-ok text-white" style={{ ["--i" as string]: i }}>
                  <CheckIcon className="size-5" />
                </span>
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- why us -- */
export function WhyUs({ locale, t }: Base) {
  return (
    <section className="section border-t border-line bg-paper-2">
      <div className="wrap">
        <h2 className="h-section">{t.home.whyTitle}</h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.why.map((w, i) => (
            <li key={w.t} className="card reveal p-6">
              <span className="font-mono text-sm font-bold text-accent-ink" dir="ltr">
                {num(String(i + 1).padStart(2, "0"), locale)}
              </span>
              <h3 className="mt-2 text-xl">{w.t}</h3>
              <p className="mt-2 text-ink-2">{w.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- FAQ -- */
export function Faq({ title, faqs }: { title: string; faqs: FaqText[] }) {
  return (
    <section className="section">
      <div className="wrap max-w-3xl">
        <h2 className="h-section">{title}</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="card group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 p-5 text-lg font-bold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="flex size-9 flex-none items-center justify-center rounded-full border-2 border-ink text-xl leading-none transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 text-lg text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
