import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { localePath, localeMeta, pick } from "@/i18n/config";
import { getI18n } from "@/i18n/dictionary";
import { getMedia, getProject, getProjects, getServices } from "@/lib/content";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { breadcrumbLd, graph, ids, webPageLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { CtaBand } from "@/components/cta-band";

export async function generateStaticParams() {
  const projects = await getProjects();
  // Cache Components needs at least one entry; unknown slugs render on demand.
  return projects.length ? projects.map((p) => ({ slug: p.slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/portfolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { locale, t } = await getI18n();
  const project = await getProject(slug);
  const text = project && pick(project.text, locale);
  if (!text) return {};
  return pageMetadata({
    locale,
    path: `/portfolio/${slug}`,
    title: text.metaTitle || `${text.title} | ${t.brand}`,
    description: text.metaDescription || text.summary,
    siteName: t.brand,
    ogKey: `p-${slug}`,
    type: "article",
  });
}

export default async function ProjectPage({ params }: PageProps<"/[lang]/portfolio/[slug]">) {
  const { slug } = await params;
  const { locale, t } = await getI18n();
  const project = await getProject(slug);
  const text = project && pick(project.text, locale);
  if (!project || !text) notFound();

  const [images, services] = await Promise.all([getMedia(project.imageIds), getServices()]);
  const ordered = project.imageIds.map((id) => images.find((m) => m.id === id)).filter((m) => m !== undefined);
  const related = services.filter((s) => project.serviceSlugs.includes(s.slug));
  const path = `/portfolio/${slug}`;
  const crumbs = [
    { name: t.common.breadcrumbHome, path: "/" },
    { name: t.nav.portfolio, path: "/portfolio" },
    { name: text.title, path },
  ];

  return (
    <>
      <PageHeader locale={locale} crumbs={crumbs} title={text.title} lead={text.summary} />
      <section className="section">
        <div className="wrap grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            {ordered.map((m, i) => (
              <div key={m.id} className="card overflow-hidden">
                <Image
                  src={`/media/${m.file}`}
                  alt={pick(m.alt, locale) ?? text.title}
                  width={m.width}
                  height={m.height}
                  sizes="(min-width: 1024px) 700px, 100vw"
                  priority={i === 0}
                  className="h-auto w-full"
                />
              </div>
            ))}
            <div className="prose-rig" dangerouslySetInnerHTML={{ __html: text.body }} />
          </div>
          <aside className="space-y-4">
            <dl className="card space-y-3 p-6">
              {text.material ? (
                <div>
                  <dt className="text-ink-2">{t.portfolio.material}</dt>
                  <dd className="text-lg font-bold">{text.material}</dd>
                </div>
              ) : null}
              {text.industry ? (
                <div>
                  <dt className="text-ink-2">{t.portfolio.industry}</dt>
                  <dd className="text-lg font-bold">{text.industry}</dd>
                </div>
              ) : null}
              {related.length > 0 && (
                <div>
                  <dt className="text-ink-2">{t.nav.services}</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {related.map((s) => (
                      <Link key={s.slug} href={localePath(locale, `/services/${s.slug}`)} className="link">
                        {pick(s.text, locale)?.title}
                      </Link>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </aside>
        </div>
      </section>
      <CtaBand />
      <JsonLd
        data={graph(
          webPageLd({ locale, path, name: text.title, description: text.summary }),
          breadcrumbLd(locale, path, crumbs),
          {
            "@type": "CreativeWork",
            name: text.title,
            description: text.summary,
            inLanguage: localeMeta[locale].hreflang,
            creator: { "@id": ids.org },
            image: ordered.map((m) => absoluteUrl(`/media/${m.file}`)),
          },
        )}
      />
    </>
  );
}
