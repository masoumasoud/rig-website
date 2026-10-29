import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCurrentUser } from "@/lib/auth";
import { PRIVATE_DIR, resolveInside } from "@/lib/uploads";

/** Customer drawings and attachments: only for signed-in admins. */
export async function GET(_req: Request, ctx: RouteContext<"/api/admin/files/[...path]">) {
  if (!(await getCurrentUser())) return new Response("Unauthorized", { status: 401 });
  const { path: parts } = await ctx.params;
  const file = resolveInside(PRIVATE_DIR, parts.map(decodeURIComponent).join("/"));
  if (!file) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(file);
    const name = path.basename(file).replace(/^[0-9a-f]{16}-/, "");
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
