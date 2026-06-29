import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[color-mix(in_srgb,var(--brass)_45%,var(--curtain))] bg-[var(--curtain)] shadow-[var(--shadow-md)]">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="group press flex items-center gap-2.5 transition-[scale] duration-200 ease-[cubic-bezier(0.2,0,0,1)]">
          <span className="display text-2xl font-semibold leading-none tracking-tight text-[var(--brass)]">
            Shakespeare
          </span>
          <span className="label rounded-full border border-[color-mix(in_srgb,var(--brass)_60%,transparent)] px-2 py-1 text-[0.65rem] uppercase leading-none tracking-[0.18em] text-[var(--curtain-fg)] transition-colors duration-200 group-hover:border-[var(--brass)] group-hover:text-[var(--brass)]">
            for Bharat
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
