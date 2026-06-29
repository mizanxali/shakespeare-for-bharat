import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[color-mix(in_srgb,var(--brass)_45%,var(--curtain))] bg-[var(--curtain)]">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="display text-2xl font-semibold leading-none tracking-tight text-[var(--brass)]">
            Shakespeare
          </span>
          <span className="label rounded-full border border-[color-mix(in_srgb,var(--brass)_60%,transparent)] px-2 py-1 text-[0.65rem] uppercase leading-none tracking-[0.18em] text-[var(--curtain-fg)] transition group-hover:border-[var(--brass)] group-hover:text-[var(--brass)]">
            for Bharat
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
