import Link from "next/link";
import { localePath } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionary";
import { Drawing } from "@/components/drawings";

export default async function NotFound() {
  const { locale, t } = await getI18n();
  return (
    <section className="section">
      <div className="wrap max-w-2xl text-center">
        <div data-io className="blueprint mx-auto max-w-sm rounded-[var(--radius)] p-6 text-white/90">
          <Drawing name="caliper" className="w-full" />
        </div>
        <p className="ltr mt-8 font-mono text-5xl font-extrabold text-accent-ink">404</p>
        <h1 className="mt-3 text-3xl">{t.notFound.title}</h1>
        <p className="lead mt-3">{t.notFound.body}</p>
        <Link href={localePath(locale, "/")} className="btn btn-dark mt-8">
          {t.common.backHome}
        </Link>
      </div>
    </section>
  );
}
