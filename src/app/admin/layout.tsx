import type { Metadata, Viewport } from "next";
import { manrope, vazirmatn } from "@/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "پنل مدیریت", template: "%s | پنل مدیریت" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f0f0f1" };

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${manrope.variable}`}
      style={{ ["--font-main" as string]: "var(--font-vazir), var(--font-latin), Tahoma, sans-serif", fontSize: "100%" }}
      data-motion="none"
    >
      <body className="min-h-dvh bg-[#f0f0f1] !pb-0 text-ink">{children}</body>
    </html>
  );
}
