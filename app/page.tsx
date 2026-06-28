import { getCatalogue } from "@/lib/plays";
import { PlayCard } from "@/components/PlayCard";
import { LANGUAGES } from "@/lib/languages";

const CATEGORY_ORDER = ["tragedy", "comedy", "history", "poetry", "other"];
const CATEGORY_LABEL: Record<string, string> = {
  tragedy: "Tragedies",
  comedy: "Comedies",
  history: "Histories",
  poetry: "Poetry",
  other: "More",
};

export default async function HomePage() {
  const plays = await getCatalogue();
  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    plays: plays.filter((p) => p.category === cat),
  })).filter((g) => g.plays.length > 0);

  return (
    <div className="mx-auto max-w-5xl px-5">
      {/* Hero */}
      <section className="py-16 text-center sm:py-24">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
          भारत · Bharat
        </p>
        <h1 className="reading mx-auto max-w-3xl text-4xl font-bold leading-tight text-[var(--fg)] sm:text-6xl">
          Shakespeare, in the languages of India
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--fg-soft)]">
          Read the immortal plays, then translate any speech into{" "}
          {LANGUAGES.length} Indian languages and hear it spoken aloud — powered
          by Sarvam AI.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {LANGUAGES.slice(0, 11).map((l) => (
            <span
              key={l.code}
              className="reading rounded-full border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-1 text-sm text-[var(--fg-soft)]"
            >
              {l.native}
            </span>
          ))}
        </div>
      </section>

      {/* Catalogue */}
      {byCategory.map((group) => (
        <section key={group.cat} className="mb-12">
          <h2 className="reading mb-5 text-2xl font-semibold text-[var(--fg)]">
            {CATEGORY_LABEL[group.cat] ?? group.cat}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.plays.map((p) => (
              <PlayCard key={p.slug} play={p} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
