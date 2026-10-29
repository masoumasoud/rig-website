"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; icon: React.ReactNode; badge?: number };

export function AdminNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-0.5 py-2">
      {items.map((it) => {
        const active = it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
        return (
          <li key={it.href}>
            <Link
              href={it.href}
              aria-current={active ? "page" : undefined}
              className="flex min-h-12 items-center gap-3 px-4 text-[0.98rem] text-white/85 hover:bg-white/10 hover:text-white aria-[current]:bg-accent aria-[current]:font-bold aria-[current]:text-ink"
            >
              <span className="size-5 flex-none [&>svg]:size-5">{it.icon}</span>
              <span className="flex-1">{it.label}</span>
              {it.badge ? (
                <span className="min-w-6 rounded-full bg-danger px-1.5 text-center text-sm font-bold text-white">{it.badge}</span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
