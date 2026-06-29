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
        className="label text-xs uppercase tracking-[0.2em] text-[var(--fg-soft)] transition hover:text-[var(--accent)]"
      >
        ← All works
      </Link>

      <header className="mt-6 mb-12">
        <span className="label text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
          {play.category}
        </span>
        <h1 className="display mt-2 text-4xl font-semibold leading-tight text-[var(--fg)] sm:text-5xl">
          {play.title}
        </h1>
        <p className="label mt-3 text-xs uppercase tracking-[0.18em] text-[var(--fg-soft)]">
          {play.actCount} acts · {play.sceneCount} scenes · The programme
        </p>
      </header>

      <div className="space-y-10">
        {play.acts.map((act) => (
          <section key={act.act}>
            <div className="mb-4 flex items-baseline gap-4">
              <h2 className="label text-sm uppercase tracking-[0.25em] text-[var(--accent)]">
                Act {roman(act.act)}
              </h2>
              <span className="h-px flex-1 bg-[var(--border)]" />
            </div>
            <ul className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-raised)]">
              {act.scenes.map((s) => (
                <li key={s.scene}>
                  <Link
                    href={`/play/${play.slug}/${act.act}/${s.scene}`}
                    className="group flex items-baseline gap-4 border-b border-[var(--border)] px-4 py-3.5 transition last:border-0 hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
                  >
                    <span className="label w-24 shrink-0 text-xs uppercase tracking-[0.15em] text-[var(--accent)]">
                      {s.isPrologue ? "Prologue" : `Scene ${roman(s.scene)}`}
                    </span>
                    <span className="reading text-[var(--fg)] transition group-hover:text-[var(--accent)]">
                      {s.location}
                    </span>
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
