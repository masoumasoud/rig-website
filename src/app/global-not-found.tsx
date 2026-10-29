import type { Metadata } from "next";
import Link from "next/link";
import { vazirmatn } from "@/fonts";
import "./globals.css";

export const metadata: Metadata = { title: "404", robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} style={{ ["--font-main" as string]: "var(--font-vazir), sans-serif" }}>
      <body className="flex min-h-dvh items-center justify-center p-6 text-center">
        <main>
          <p className="ltr font-mono text-6xl font-extrabold text-accent-ink">404</p>
          <h1 className="mt-4 text-3xl">صفحه پیدا نشد</h1>
          <p className="mt-2 text-lg text-ink-2" lang="en" dir="ltr">
            Page not found
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/" className="btn btn-dark">
              بازگشت به خانه
            </Link>
            <Link href="/en" className="btn btn-outline" lang="en">
              English
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
