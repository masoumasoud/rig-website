import { connection } from "next/server";

/** Serves the IndexNow key file (/<key>.txt is rewritten here in next.config.ts). */
export async function GET(req: Request) {
  await connection();
  const key = process.env.INDEXNOW_KEY;
  const asked = new URL(req.url).searchParams.get("key");
  if (!key || asked !== key) return new Response("Not found", { status: 404 });
  return new Response(key, { headers: { "Content-Type": "text/plain" } });
}
