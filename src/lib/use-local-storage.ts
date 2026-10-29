"use client";

import { useSyncExternalStore } from "react";

const EVENT = "rig-storage";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** localStorage value that is safe during SSR (null on the server) and syncs across components/tabs. */
export function useLocalStorage(key: string): [string | null, (value: string | null) => void] {
  const value = useSyncExternalStore(
    (cb) => {
      window.addEventListener("storage", cb);
      window.addEventListener(EVENT, cb);
      return () => {
        window.removeEventListener("storage", cb);
        window.removeEventListener(EVENT, cb);
      };
    },
    () => read(key),
    () => null,
  );
  const set = (v: string | null) => {
    try {
      if (v === null) localStorage.removeItem(key);
      else localStorage.setItem(key, v);
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  };
  return [value, set];
}

/** True only after hydration on the client. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
