import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCatalogue,
  getPlay,
  findScene,
  sceneSequence,
} from "@/lib/plays";
import { Reader } from "@/components/Reader";

export async function generateStaticParams() {
  const plays = await getCatalogue();
  const params: { slug: string; act: string; scene: string }[] = [];
  for (const summary of plays) {
    const play = await getPlay(summary.slug);
    if (!play) continue;
    for (const a of play.acts)
      for (const s of a.scenes)
        params.push({ slug: play.slug, act: String(a.act), scene: String(s.scene) });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; act: string; scene: string }>;
}): Promise<Metadata> {
  const { slug, act, scene } = await params;
  const play = await getPlay(slug);
  const s = play && findScene(play, Number(act), Number(scene));
  if (!play || !s) return {};
  const where = s.isPrologue ? "Prologue" : `Act ${act}, Scene ${scene}`;
  return {
    title: `${play.name} — ${where}`,
    description: `${play.name}, ${where}: ${s.location}. Read, translate, and listen in Indian languages.`,
  };
}

export default async function ScenePage({
  params,
}: {
  params: Promise<{ slug: string; act: string; scene: string }>;
}) {
  const { slug, act, scene } = await params;
  const actNum = Number(act);
  const sceneNum = Number(scene);
  const play = await getPlay(slug);
  if (!play) notFound();

  const current = findScene(play, actNum, sceneNum);
  if (!current) notFound();

  const seq = sceneSequence(play);
  const idx = seq.findIndex((x) => x.act === actNum && x.scene === sceneNum);
  const prev = idx > 0 ? seq[idx - 1] : null;
  const next = idx < seq.length - 1 ? seq[idx + 1] : null;

  return (
    <Reader
      playSlug={play.slug}
      playName={play.name}
      act={actNum}
      scene={current}
      prev={prev}
      next={next}
    />
  );
}
