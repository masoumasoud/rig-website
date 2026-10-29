"use client";

import { useEffect } from "react";
import { useHydrated, useLocalStorage } from "@/lib/use-local-storage";

type Props = {
  gtmId: string;
  ga4Id: string;
  clarityId: string;
  /** EU locales: analytics stay off until the visitor accepts. */
  needsConsent: boolean;
  labels: { text: string; accept: string; reject: string };
};

type W = Window & { dataLayer?: unknown[]; clarity?: (...a: unknown[]) => void };

const CONSENT_KEY = "rig-consent";

function gtag(...args: unknown[]) {
  const w = window as W;
  w.dataLayer = w.dataLayer || [];
  // gtag requires the arguments object, not an array.
  // eslint-disable-next-line prefer-rest-params
  w.dataLayer.push(arguments);
  void args;
}

export function track(event: string, params: Record<string, unknown> = {}) {
  const w = window as W;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
}

function addScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function loadClarity(id: string) {
  const w = window as W;
  if (w.clarity) return;
  w.clarity = function (...a: unknown[]) {
    ((w.clarity as unknown as { q?: unknown[] }).q ||= []).push(a);
  };
  addScript(`https://www.clarity.ms/tag/${id}`);
}

/** Run after the page is idle so analytics never compete with first paint on slow phones. */
function whenIdle(fn: () => void) {
  const run = () =>
    "requestIdleCallback" in window ? window.requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 1500);
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}

export function Analytics({ gtmId, ga4Id, clarityId, needsConsent, labels }: Props) {
  const [stored, setStored] = useLocalStorage(CONSENT_KEY);
  const hydrated = useHydrated();

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(CONSENT_KEY);
    } catch {}
    const initial = !needsConsent ? "granted" : saved === "granted" || saved === "denied" ? saved : "unset";

    const analytics = initial === "granted" ? "granted" : "denied";
    gtag("consent", "default", {
      analytics_storage: analytics,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });

    whenIdle(() => {
      if (gtmId) {
        track("gtm.js", { "gtm.start": Date.now() });
        addScript(`https://www.googletagmanager.com/gtm.js?id=${gtmId}`);
      } else if (ga4Id) {
        gtag("js", new Date());
        gtag("config", ga4Id);
        addScript(`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`);
      }
      if (clarityId && initial === "granted") loadClarity(clarityId);
    });

    // Conversion clicks: phone, WhatsApp, Telegram, email.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const event = href.startsWith("tel:")
        ? "click_call"
        : href.includes("wa.me")
          ? "click_whatsapp"
          : href.includes("t.me")
            ? "click_telegram"
            : href.startsWith("mailto:")
              ? "click_email"
              : /eitaa|ble\.ir|rubika/.test(href)
                ? "click_messenger"
                : null;
      if (event) track(event, { link_url: href });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [gtmId, ga4Id, clarityId, needsConsent]);

  const choose = (value: "granted" | "denied") => {
    setStored(value);
    gtag("consent", "update", { analytics_storage: value });
    if (value === "granted" && clarityId) loadClarity(clarityId);
  };

  if (!needsConsent || !hydrated || stored === "granted" || stored === "denied") return null;
  return (
    <div
      role="dialog"
      aria-label={labels.text}
      className="card fixed inset-x-3 bottom-[calc(88px+env(safe-area-inset-bottom))] z-50 mx-auto max-w-xl p-4 md:bottom-4"
    >
      <p className="mb-3">{labels.text}</p>
      <div className="flex gap-2">
        <button type="button" className="btn btn-dark flex-1" onClick={() => choose("granted")}>
          {labels.accept}
        </button>
        <button type="button" className="btn btn-outline flex-1" onClick={() => choose("denied")}>
          {labels.reject}
        </button>
      </div>
    </div>
  );
}
