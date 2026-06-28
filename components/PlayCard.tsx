import Link from "next/link";
import type { PlaySummary } from "@/lib/plays";

const CATEGORY_STYLE: Record<string, string> = {
  tragedy: "text-[var(--color-rose)]",
  comedy: "text-[var(--color-peacock)]",
  history: "text-[var(--accent)]",
  poetry: "text-[var(--color-peacock-deep)]",
};

export function PlayCard({ play }: { play: PlaySummary }) {
  return (
    <Link
      href={`/play/${play.slug}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 transition group-hover:opacity-20"
        style={{ background: "var(--accent)" }}
      />
      <div>
        <span
          className={`text-xs font-semibold uppercase tracking-widest ${
            CATEGORY_STYLE[play.category] ?? "text-[var(--fg-soft)]"
          }`}
        >
          {play.category}
        </span>
        <h3 className="reading mt-1 text-xl font-semibold text-[var(--fg)]">
          {play.name}
        </h3>
      </div>
      <p className="mt-4 text-sm text-[var(--fg-soft)]">
        {play.actCount} acts · {play.sceneCount} scenes
      </p>
    </Link>
  );
}
