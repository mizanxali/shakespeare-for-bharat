"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  const isDark = mounted && dark;

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "House lights up" : "House lights down"}
      title={isDark ? "House lights up" : "House lights down"}
      className="press relative grid h-10 w-10 place-items-center rounded-full border border-[color-mix(in_srgb,var(--brass)_45%,transparent)] text-[var(--curtain-fg)] transition-[color,border-color,scale] duration-200 hover:border-[var(--brass)] hover:text-[var(--brass)]"
    >
      {/* Both icons stay mounted and cross-fade — opacity + scale + blur,
          no layout swap. The hidden one shrinks to 0.25 and blurs out. */}
      <span
        className="absolute transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
        style={{
          opacity: isDark ? 1 : 0,
          scale: isDark ? "1" : "0.25",
          filter: isDark ? "blur(0)" : "blur(4px)",
        }}
        aria-hidden
      >
        <SunIcon />
      </span>
      <span
        className="absolute transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
        style={{
          opacity: isDark ? 0 : 1,
          scale: isDark ? "0.25" : "1",
          filter: isDark ? "blur(4px)" : "blur(0)",
        }}
        aria-hidden
      >
        <MoonIcon />
      </span>
    </button>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}
