import { readFile } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "data");

export type Line = { id: string; text: string };

export type SpeechBlock = {
  type: "speech";
  speaker: string | null;
  lines: Line[];
};

export type DirectionBlock = {
  type: "direction";
  text: string;
};

export type Block = SpeechBlock | DirectionBlock;

export type Scene = {
  scene: number;
  location: string;
  isPrologue: boolean;
  blocks: Block[];
};

export type Act = { act: number; scenes: Scene[] };

export type Play = {
  slug: string;
  name: string;
  title: string;
  category: "comedy" | "history" | "tragedy" | "poetry" | "other";
  actCount: number;
  sceneCount: number;
  acts: Act[];
};

export type PlaySummary = Pick<
  Play,
  "slug" | "name" | "title" | "category" | "actCount" | "sceneCount"
>;

export async function getCatalogue(): Promise<PlaySummary[]> {
  const raw = await readFile(join(DATA_DIR, "index.json"), "utf8");
  return JSON.parse(raw) as PlaySummary[];
}

export async function getPlay(slug: string): Promise<Play | null> {
  try {
    const raw = await readFile(join(DATA_DIR, `${slug}.json`), "utf8");
    return JSON.parse(raw) as Play;
  } catch {
    return null;
  }
}

export function findScene(play: Play, act: number, scene: number): Scene | null {
  return (
    play.acts.find((a) => a.act === act)?.scenes.find((s) => s.scene === scene) ??
    null
  );
}

/** Flat, ordered list of {act, scene} for prev/next navigation. */
export function sceneSequence(play: Play): { act: number; scene: number }[] {
  return play.acts.flatMap((a) => a.scenes.map((s) => ({ act: a.act, scene: s.scene })));
}

export function plainText(block: SpeechBlock): string {
  return block.lines.map((l) => l.text).join("\n");
}
