import Link from "next/link";
import { localePath, num, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import { telHref } from "@/lib/contact-links";
import { ArrowIcon, PhoneIcon, TruckIcon } from "@/components/icons";

/** Large spindle illustration; the bit plunges into the workpiece on scroll (high tier). */
function SpindleArt() {
  return (
    <div className="relative mx-auto aspect-[400/440] w-full max-w-[420px]" aria-hidden="true">
      <svg viewBox="0 0 400 440" className="absolute inset-0 size-full text-ink">
        <defs>
          <clipPath id="bit-clip">
            <path d="M56.5 47h7v22l-3.5 7-3.5-7z" />
          </clipPath>
          <linearGradient id="steel" x1="0" x2="1">
            <stop offset="0" stopColor="#2a2d31" />
            <stop offset="0.45" stopColor="#5b6168" />
            <stop offset="1" stopColor="#1a1c1f" />
          </linearGradient>
        </defs>
        {/* dimension frame */}
        <g stroke="var(--steel)" strokeWidth="1" fill="none" strokeDasharray="4 6">
          <path d="M40 20v400M360 20v400" />
        </g>
        <g transform="translate(200 4) scale(3.4) translate(-60 0)">
          <path d="M36 3h48v8c-8 0-12 4-14 10l-2 13H52l-2-13c-2-6-6-10-14-10z" fill="url(#steel)" />
          <path d="M40 6h40" stroke="#fff" strokeOpacity=".25" strokeWidth=".8" />
          <rect x="51" y="34" width="18" height="6" fill="currentColor" />
          <path d="M53 40h14l-3 7H56z" fill="currentColor" />
          <g data-fx="hero-bit">
            <path d="M56.5 47h7v22l-3.5 7-3.5-7z" fill="#3b3f45" />
            <g clipPath="url(#bit-clip)">
              <g className="hero-flutes" stroke="#c9ced4" strokeWidth="1.4">
                <path d="M54 50l12-6M54 56l12-6M54 62l12-6M54 68l12-6M54 74l12-6M54 80l12-6M54 86l12-6" />
              </g>
            </g>
          </g>
        </g>
        {/* workpiece */}
        <g>
          <path d="M96 292h208v118H96z" fill="#d9dce0" stroke="currentColor" strokeWidth="3" />
          <path d="M96 292l24-18h208l-24 18M328 274v118l-24 18" fill="#eef0f2" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
          <path d="M120 330h160M120 350h160M120 370h160" stroke="#b5bac0" strokeWidth="1.5" />
        </g>
        {/* readout */}
        <g fontFamily="ui-monospace, monospace" fontSize="13" fill="var(--ink-3)" direction="ltr">
          <text x="44" y="250">S 3200</text>
          <text x="44" y="268">F 0.05</text>
          <text x="300" y="250">Z −12.00</text>
        </g>
      </svg>
      <canvas data-fx="sparks" data-x="0.5" data-y="0.66" className="absolute inset-0 size-full" />
    </div>
  );
}

export function Hero({
  locale,
  t,
  title,
  lead,
  phone,
  years,
}: {
  locale: Locale;
  t: Dictionary;
  title: string;
  lead: string;
  phone: string;
  years: number;
}) {
  const stats = [
    { value: num(years, locale), label: t.home.statsYears, count: years },
    { value: `${num("0.01", locale)}`, unit: t.common.mm, label: t.home.statsPrecision },
    { value: t.home.statsMinOrderValue, label: t.home.statsMinOrder },
    { value: "", label: t.home.statsShipping, icon: true },
  ];

  return (
    <section data-fx="hero" className="grid-paper relative overflow-hidden border-b border-line">
      <div className="wrap grid items-center gap-10 py-10 md:py-16 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1 className="mt-4 text-[clamp(1.9rem,1.3rem+3vw,3.4rem)] leading-tight">
            {title}
            <span
              data-fx="hero-cut"
              aria-hidden="true"
              className="mt-4 block h-2 w-40 origin-[inline-start] rounded-full bg-accent ltr:origin-left rtl:origin-right"
            />
          </h1>
          <p className="lead mt-5 max-w-2xl">{lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`${localePath(locale, "/contact")}#quote`} className="btn btn-primary text-lg">
              {t.common.requestQuote}
              <ArrowIcon />
            </Link>
            <a href={telHref(phone)} className="btn btn-outline text-lg">
              <PhoneIcon />
              {t.common.call}
            </a>
          </div>
        </div>
        <SpindleArt />
      </div>

      <div className="border-t border-line bg-card/70">
        <dl className="wrap grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col-reverse gap-1 py-5 ps-4 ${i % 2 ? "border-s border-line" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-s" : ""}`}
            >
              <dt className="text-[0.95rem] text-ink-2">{s.label}</dt>
              <dd className="text-2xl font-extrabold md:text-3xl">
                {s.icon ? (
                  <TruckIcon className="size-9" />
                ) : (
                  <>
                    <span
                      className="ltr"
                      {...(s.count ? { "data-io": "", "data-count": s.count, "data-digits": locale === "fa" ? "fa" : undefined } : {})}
                    >
                      {s.value}
                    </span>
                    {s.unit ? <span className="ms-1.5 text-base font-bold text-ink-3">{s.unit}</span> : null}
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
