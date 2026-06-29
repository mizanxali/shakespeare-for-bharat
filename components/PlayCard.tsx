import Link from "next/link";
import type { PlaySummary } from "@/lib/plays";

const CATEGORY_STYLE: Record<string, string> = {
  tragedy: "text-[var(--color-rose)]",
  comedy: "text-[var(--accent-2)]",
  history: "text-[var(--accent)]",
  poetry: "text-[var(--accent-2)]",
};

export function PlayCard({ play }: { play: PlaySummary }) {
  return (
    <Link
      href={`/play/${play.slug}`}
      className="group press flex flex-col rounded-2xl bg-[var(--bg-raised)] p-5 shadow-[var(--shadow-sm)] ring-1 ring-[var(--edge)] transition-[box-shadow,translate,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      <span
        className={`label text-xs uppercase tracking-[0.22em] ${
          CATEGORY_STYLE[play.category] ?? "text-[var(--fg-soft)]"
        }`}
      >
        {play.category}
      </span>
      <h3 className="display mt-2 text-2xl font-medium leading-tight text-[var(--fg)]">
        {play.name}
      </h3>
      {/* The curtain line rises on hover. */}
      <span className="mt-3 h-px w-10 origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-300 group-hover:scale-x-100" />
      <p className="label tnum mt-3 text-xs uppercase tracking-[0.15em] text-[var(--fg-soft)]">
        {play.actCount} acts · {play.sceneCount} scenes
      </p>
    </Link>
  );
}
