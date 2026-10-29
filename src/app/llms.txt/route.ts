import { pick } from "@/i18n/config";
import { getEquipment, getServices, getSettings } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

/** Plain-text summary for AI assistants and answer engines (llmstxt.org). */
export async function GET() {
  const [s, services, equipment] = await Promise.all([getSettings(), getServices(), getEquipment()]);
  const c = s.company;
  const lines = [
    `# ${pick(c.name, "en")} (${pick(c.name, "fa")})`,
    "",
    `> Custom precision machining and industrial parts manufacturing in Kamalshahr, Karaj, Iran, since ${c.foundingYear}. Parts are made to order from a single piece upward, from drawings, samples, photos or sketches. Shipping across Iran.`,
    "",
    `- Phone: ${c.phone} · Mobile: ${c.mobile} · Email: ${c.email}`,
    `- Address: ${pick(c.address, "en")}`,
    `- Languages: Persian (${siteUrl}/), English (${siteUrl}/en), Arabic (${siteUrl}/ar), Chinese (${siteUrl}/zh), German (${siteUrl}/de), Dutch (${siteUrl}/nl)`,
    "",
    "## Services",
    ...services.map((sv) => `- [${pick(sv.text, "en")?.title}](${siteUrl}/en/services/${sv.slug}): ${pick(sv.text, "en")?.summary}`),
    "",
    "## Equipment",
    ...equipment.map(
      (e) =>
        `- ${pick(e.text, "en")?.name}${e.specs.length ? ": " + e.specs.map((sp) => `${pick(sp.label, "en")} ${pick(sp.value, "en")}`).join(", ") : ""}`,
    ),
    "",
    "## Request a quote",
    `- ${siteUrl}/en/contact`,
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
