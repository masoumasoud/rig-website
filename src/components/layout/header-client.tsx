"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { isLocale, localeMeta, localePath, locales, type Locale } from "@/i18n/config";
import { ChevronIcon, CloseIcon, GlobeIcon, MenuIcon, TextSizeIcon } from "@/components/icons";
import { useLocalStorage } from "@/lib/use-local-storage";

/** Strip a leading locale segment so the path can be re-prefixed. */
function basePath(pathname: string) {
  const [, first, ...rest] = pathname.split("/");
  if (first && isLocale(first)) return `/${rest.join("/")}`;
  return pathname || "/";
}

export function LangSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDetailsElement>(null);
  const path = basePath(pathname);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) ref.current.open = false;
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <details ref={ref} className="relative">
      <summary
        className="flex min-h-12 cursor-pointer list-none items-center gap-1.5 rounded-xl px-3 font-bold hover:bg-paper-2 [&::-webkit-details-marker]:hidden"
        aria-label={label}
      >
        <GlobeIcon className="size-6" />
        <span className="hidden sm:inline">{localeMeta[locale].label}</span>
        <ChevronIcon className="size-4" />
      </summary>
      <ul className="card absolute end-0 top-full z-50 mt-2 min-w-44 p-2">
        {locales.map((l) => (
          <li key={l}>
            <Link
              href={localePath(l, path)}
              hrefLang={localeMeta[l].hreflang}
              lang={l}
              aria-current={l === locale ? "true" : undefined}
              className="flex min-h-12 items-center rounded-lg px-3 font-semibold hover:bg-paper-2 aria-[current]:bg-ink aria-[current]:text-white"
              prefetch={false}
            >
              {localeMeta[l].label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function TextSizeToggle({ label }: { label: string }) {
  const [stored, setStored] = useLocalStorage("rig-text");
  const large = stored === "lg";
  const toggle = () => {
    const next = !large;
    if (next) document.documentElement.dataset.text = "lg";
    else delete document.documentElement.dataset.text;
    setStored(next ? "lg" : null);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={large}
      title={label}
      className="flex min-h-12 min-w-12 items-center justify-center gap-1 rounded-xl px-2 font-bold hover:bg-paper-2 aria-pressed:bg-ink aria-pressed:text-white"
    >
      <TextSizeIcon className="size-6" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

export function MobileMenu({
  items,
  labels,
}: {
  items: { href: string; label: string }[];
  labels: { menu: string; close: string };
}) {
  const pathname = usePathname();
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex min-h-12 items-center gap-2 rounded-xl bg-ink px-4 font-bold text-white"
      >
        <MenuIcon className="size-6" />
        {labels.menu}
      </button>
      {/* Portalled: the header's backdrop-filter would otherwise be the containing block of this fixed overlay. */}
      {open &&
        createPortal(
          <div id="mobile-menu" role="dialog" aria-modal="true" aria-label={labels.menu} className="fixed inset-0 z-[60] flex flex-col bg-paper">
          <div className="wrap flex h-[var(--header-h)] items-center justify-end border-b border-line">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center gap-2 rounded-xl border-2 border-ink px-4 font-bold"
              autoFocus
            >
              <CloseIcon className="size-6" />
              {labels.close}
            </button>
          </div>
          <nav className="wrap flex-1 overflow-y-auto py-4">
            <ul className="flex flex-col gap-2">
              {items.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className="flex min-h-16 items-center rounded-xl border border-line bg-card px-5 text-xl font-bold"
                    aria-current={basePath(pathname) === basePath(it.href) ? "page" : undefined}
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const here = basePath(pathname);
  const target = basePath(href);
  const active = target === "/" ? here === "/" : here === target || here.startsWith(`${target}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="relative flex min-h-12 items-center px-3 font-bold text-ink-2 hover:text-ink aria-[current]:text-ink after:absolute after:inset-x-3 after:bottom-1.5 after:h-[3px] after:rounded after:bg-accent after:opacity-0 aria-[current]:after:opacity-100"
    >
      {children}
    </Link>
  );
}
