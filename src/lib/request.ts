import "server-only";

/** Visitor IP behind ArvanCloud (AR-Real-IP) or any reverse proxy. */
export function clientIp(headers: Headers): string {
  return (
    headers.get("ar-real-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
