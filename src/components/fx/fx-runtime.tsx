"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One small runtime for every effect on the site, driven by data attributes in
 * server-rendered markup:
 *   data-io            add `.in-view` once the element scrolls into view
 *   data-count="12.5"  count up to the value when in view (data-from, data-decimals, data-digits="fa")
 *   data-fx / data-physics   heavy effects, loaded only on the `high` motion tier
 * Content is always fully visible without JS; effects only enhance it.
 */

const faDigits = (s: string) => s.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]).replace(".", "٫");

function countUp(el: HTMLElement) {
  const to = Number(el.dataset.count);
  const from = Number(el.dataset.from ?? 0);
  const decimals = Number(el.dataset.decimals ?? 0);
  const fa = el.dataset.digits === "fa";
  const duration = 1400;
  const start = performance.now();
  const fmt = (v: number) => {
    const s = v.toFixed(decimals);
    return fa ? faDigits(s) : s;
  };
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(from + (to - from) * eased);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function FxRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const motion = document.documentElement.dataset.motion ?? "low";
    if (motion === "none") {
      document.querySelectorAll("[data-io]").forEach((el) => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.add("in-view");
          el.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
          if (el.matches("[data-count]")) countUp(el);
          io.unobserve(el);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll("[data-io]").forEach((el) => io.observe(el));

    let cleanupHigh: (() => void) | undefined;
    let cancelled = false;
    if (motion === "high") {
      import("./fx-high").then((m) => {
        if (!cancelled) cleanupHigh = m.initHighFx();
      });
    }

    return () => {
      cancelled = true;
      io.disconnect();
      cleanupHigh?.();
    };
  }, [pathname]);

  return null;
}
