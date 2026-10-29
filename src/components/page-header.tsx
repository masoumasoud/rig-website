import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";

export type Crumb = { name: string; path: string };

export function PageHeader({
  locale,
  crumbs,
  title,
  lead,
  children,
}: {
  locale: Locale;
  crumbs: Crumb[];
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="grid-paper border-b border-line">
      <div className="wrap py-10 md:py-14">
        <nav aria-label="breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 text-[0.95rem] text-ink-2">
            {crumbs.map((c, i) => (
              <li key={c.path} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {i < crumbs.length - 1 ? (
                  <Link href={localePath(locale, c.path)} className="underline-offset-4 hover:underline">
                    {c.name}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-bold text-ink">
                    {c.name}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="mt-4 max-w-4xl text-[clamp(1.8rem,1.3rem+2.4vw,3rem)]">{title}</h1>
        {lead ? <p className="lead mt-4 max-w-3xl">{lead}</p> : null}
        {children}
      </div>
    </section>
  );
}
