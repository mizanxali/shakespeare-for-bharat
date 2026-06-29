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

  const speakable = LANGUAGES.filter((l) => l.tts);

  return (
    <div className="mx-auto max-w-5xl px-5">
      {/* Marquee */}
      <section className="border-b border-[var(--border)] py-16 text-center sm:py-24">
        <p className="label text-sm uppercase tracking-[0.4em] text-[var(--accent)]">
          भारत · Bharat · 🇮🇳
        </p>
        <h1 className="display mx-auto mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] text-[var(--fg)] sm:text-7xl">
          Shakespeare, in the
          <span className="italic text-[var(--accent)]"> voices </span>
          of Bharat
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-[var(--fg-soft)]">
          Read the complete plays — then translate any speech into one of{" "}
          {LANGUAGES.length} Indian languages and hear it performed aloud.
        </p>

        <div className="mt-9">
          <p className="label text-xs uppercase tracking-[0.25em] text-[var(--fg-soft)]">
            Now playing in
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {speakable.map((l) => (
              <span
                key={l.code}
                className="script rounded-full border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-1 text-sm text-[var(--fg-soft)]"
              >
                {l.native}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* The repertoire */}
      <div className="py-12">
        {byCategory.map((group) => (
          <section key={group.cat} className="mb-14">
            <div className="mb-6 flex items-baseline gap-4">
              <h2 className="label text-sm uppercase tracking-[0.25em] text-[var(--accent)]">
                {CATEGORY_LABEL[group.cat] ?? group.cat}
              </h2>
              <span className="h-px flex-1 bg-[var(--border)]" />
              <span className="label text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)]">
                {group.plays.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.plays.map((p) => (
                <PlayCard key={p.slug} play={p} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
