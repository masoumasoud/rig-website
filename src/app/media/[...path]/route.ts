import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { PUBLIC_DIR, resolveInside } from "@/lib/uploads";

const types: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

/**
 * Public images uploaded from the admin panel. In production Caddy serves
 * /media directly from disk; this handler covers development and fallback.
 */
export async function GET(_req: Request, ctx: RouteContext<"/media/[...path]">) {
  const { path: parts } = await ctx.params;
  const file = resolveInside(PUBLIC_DIR, parts.join("/"));
  const type = file && types[path.extname(file).toLowerCase()];
  if (!file || !type) return new Response("Not found", { status: 404 });
  try {
    await stat(file);
    const data = await readFile(file);
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
