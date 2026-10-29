import { z } from "zod";
import { isLocale } from "@/i18n/config";
import { verifyAltcha } from "@/lib/altcha";
import { createFormConversation } from "@/lib/inbox";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/request";
import { allowedDrawingExt, extOf, MAX_TOTAL_UPLOAD, savePrivateFile } from "@/lib/uploads";
import type { Attachment } from "@/db/schema";

/** Persian/Arabic digits -> Latin, so validation and storage are uniform. */
const latinDigits = (s: string) =>
  s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

const text = (max: number) => z.string().trim().max(max);
const schema = z.object({
  name: text(120).min(2),
  phone: z
    .string()
    .transform((v) => latinDigits(v).replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^\+?\d{7,15}$/)),
  email: z.union([z.literal(""), z.string().trim().email().max(160)]).optional(),
  company: text(160).optional(),
  service: text(120).optional(),
  quantity: text(60).transform(latinDigits).optional(),
  material: text(120).optional(),
  deadline: text(120).transform(latinDigits).optional(),
  message: text(5000).optional(),
  locale: z.string().refine(isLocale),
});

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!(await rateLimit(`inquiry:${ip}`, 6, 60 * 60 * 1000))) return json({ error: "rate" }, 429);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "invalid" }, 400);
  }

  // Honeypot: real people never fill the hidden "website" field.
  if (String(form.get("website") ?? "")) return json({ ok: true, code: "RIG-0000" });
  if (!(await verifyAltcha(form.get("altcha") as string | null))) return json({ error: "captcha" }, 400);

  const parsed = schema.safeParse(Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")));
  if (!parsed.success) {
    return json({ error: "validation", fields: parsed.error.issues.map((i) => i.path.join(".")) }, 400);
  }
  const data = parsed.data;

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const total = files.reduce((n, f) => n + f.size, 0);
  if (total > MAX_TOTAL_UPLOAD || files.length > 10) return json({ error: "fileSize" }, 400);
  if (files.some((f) => !allowedDrawingExt.has(extOf(f.name)))) return json({ error: "fileType" }, 400);

  const attachments: Attachment[] = [];
  for (const f of files) attachments.push(await savePrivateFile(f.name, Buffer.from(await f.arrayBuffer()), f.type));

  const { code } = await createFormConversation({
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    message: data.message ?? "",
    locale: data.locale as never,
    details: {
      company: data.company || undefined,
      service: data.service || undefined,
      quantity: data.quantity || undefined,
      material: data.material || undefined,
      deadline: data.deadline || undefined,
    },
    attachments,
  });

  return json({ ok: true, code });
}
