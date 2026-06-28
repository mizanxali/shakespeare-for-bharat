import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="reading text-xl font-semibold tracking-tight text-[var(--fg)]">
            Shakespeare
          </span>
          <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-white transition group-hover:bg-[var(--accent-2)]">
            for Bharat
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
