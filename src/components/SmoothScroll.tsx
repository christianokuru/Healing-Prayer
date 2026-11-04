"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Site-wide smooth scrolling for mouse wheel and trackpad (UI.md section 3.3).
 * Touch stays native. Not started at all for users who prefer reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      syncTouch: false,
      anchors: true,
      // Pause while the page is scroll-locked, e.g. under an open dialog.
      autoToggle: true,
      // Let textareas and other inner scroll areas scroll natively.
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      prevent: (node) => node.closest("dialog[open]") !== null,
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
