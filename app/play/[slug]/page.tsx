import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCatalogue, getPlay } from "@/lib/plays";

export async function generateStaticParams() {
  const plays = await getCatalogue();
  return plays.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const play = await getPlay(slug);
  if (!play) return {};
  return {
    title: play.name,
    description: `Read ${play.title} and translate any speech into Indian languages.`,
  };
}

const roman = (n: number) =>
  ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] ?? String(n);

export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const play = await getPlay(slug);
  if (!play) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/"
        className="text-sm text-[var(--fg-soft)] transition hover:text-[var(--accent)]"
      >
        ← All works
      </Link>

      <header className="mt-6 mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          {play.category}
        </span>
        <h1 className="reading mt-1 text-4xl font-bold text-[var(--fg)]">
          {play.title}
        </h1>
        <p className="mt-2 text-[var(--fg-soft)]">
          {play.actCount} acts · {play.sceneCount} scenes
        </p>
      </header>

      <div className="space-y-8">
        {play.acts.map((act) => (
          <section key={act.act}>
            <h2 className="reading mb-3 text-lg font-semibold text-[var(--fg-soft)]">
              Act {roman(act.act)}
            </h2>
            <ul className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-raised)]">
              {act.scenes.map((s) => (
                <li key={s.scene}>
                  <Link
                    href={`/play/${play.slug}/${act.act}/${s.scene}`}
                    className="flex items-baseline gap-3 border-b border-[var(--border)] px-4 py-3 transition last:border-0 hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
                  >
                    <span className="w-20 shrink-0 text-sm font-medium text-[var(--accent)]">
                      {s.isPrologue ? "Prologue" : `Scene ${roman(s.scene)}`}
                    </span>
                    <span className="reading text-[var(--fg)]">{s.location}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
