import { Suspense } from "react";
import Link from "next/link";
import { and, count, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { LogoMark } from "@/components/logo";
import { AdminNav, type NavItem } from "@/components/admin/nav";
import { GlobeIcon, MessageIcon, ServiceIcon, FileIcon, MenuIcon, CheckIcon, UploadIcon, TextSizeIcon } from "@/components/icons";
import { logoutAction } from "../actions/auth";

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
  </svg>
);

async function Shell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [{ n: unread }] = await db
    .select({ n: count() })
    .from(schema.conversations)
    .where(and(eq(schema.conversations.unread, true)));

  const items: NavItem[] = [
    { href: "/admin", label: "پیشخوان", icon: <HomeIcon /> },
    { href: "/admin/inbox", label: "پیام‌ها و استعلام‌ها", icon: <MessageIcon />, badge: unread },
    { href: "/admin/services", label: "خدمات", icon: <ServiceIcon name="mill" /> },
    { href: "/admin/equipment", label: "تجهیزات", icon: <ServiceIcon name="machine" /> },
    { href: "/admin/portfolio", label: "نمونه‌کارها", icon: <FileIcon /> },
    { href: "/admin/faqs", label: "پرسش‌های متداول", icon: <CheckIcon /> },
    { href: "/admin/pages", label: "متن صفحات", icon: <TextSizeIcon /> },
    { href: "/admin/media", label: "رسانه‌ها (عکس‌ها)", icon: <UploadIcon /> },
    { href: "/admin/settings", label: "تنظیمات سایت", icon: <GearIcon /> },
    { href: "/admin/account", label: "حساب کاربری", icon: <UserIcon /> },
  ];

  const sidebar = (
    <nav aria-label="منوی مدیریت">
      <AdminNav items={items} />
    </nav>
  );

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 flex-none overflow-y-auto bg-[#1d2327] lg:block">
        <Link href="/admin" className="flex items-center gap-3 border-b border-white/10 px-4 py-4 text-white [--logo-bg:#1d2327]">
          <LogoMark className="size-10" />
          <span className="font-bold">گروه صنعتی رضایی</span>
        </Link>
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#dcdcde] bg-white px-4">
          <details className="relative lg:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg bg-[#1d2327] px-3 font-bold text-white [&::-webkit-details-marker]:hidden">
              <MenuIcon className="size-5" /> منو
            </summary>
            <div className="fixed inset-x-0 top-14 z-40 max-h-[calc(100dvh-3.5rem)] overflow-y-auto bg-[#1d2327] shadow-xl">{sidebar}</div>
          </details>
          <a href="/" target="_blank" className="flex items-center gap-2 font-bold text-[#2271b1] hover:underline">
            <GlobeIcon className="size-5" />
            مشاهده سایت
          </a>
          <span className="ms-auto hidden text-ink-2 sm:inline">{user.name}</span>
          <form action={logoutAction}>
            <button className="min-h-10 rounded-lg border border-[#dcdcde] px-3 font-bold hover:bg-[#f6f7f7]">خروج</button>
          </form>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div className="p-8 text-ink-3">در حال بارگذاری…</div>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
