"use client";

import { useEffect } from "react";

/**
 * Registers a lightweight service worker that caches the Next static shell
 * (JS/CSS/fonts/icons) so PWA reopen doesn't sit on a black splash as long.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // Only in production / standalone — avoid SW fighting HMR in dev.
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      ("standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone === true);
    if (process.env.NODE_ENV !== "production" && !isStandalone) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore registration failures */
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
