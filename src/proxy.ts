import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

export const SESSION_COOKIE = "rig_session";

/** Top-level paths that are not localized pages. */
const passthrough = ["admin", "api", "media", "og", "files"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";

  // Admin: optimistic session check (real verification happens server-side).
  if (first === "admin") {
    const isLogin = pathname === "/admin/login";
    if (!isLogin && !request.cookies.has(SESSION_COOKIE)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  if (passthrough.includes(first)) return NextResponse.next();

  // The default language lives at the root: /fa/x -> /x (permanent, avoids duplicate URLs).
  if (first === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (isLocale(first)) return NextResponse.next();

  // Everything else is Persian, served from the internal /fa tree.
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/|media/|og/|.*\\.[a-zA-Z0-9]+$).*)"],
};
