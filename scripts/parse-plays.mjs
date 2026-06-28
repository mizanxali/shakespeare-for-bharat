#!/usr/bin/env node
/**
 * Parse MIT's static Shakespeare HTML into structured JSON for the app.
 *
 *   node scripts/parse-plays.mjs            # parse the MVP subset
 *   node scripts/parse-plays.mjs --all      # parse every play
 *   node scripts/parse-plays.mjs hamlet     # parse specific slug(s)
 *
 * Output: data/<slug>.json (one per play) + data/index.json (catalogue).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(REPO, "source-html"); // original MIT Shakespeare HTML
const DATA_DIR = join(REPO, "data");

const MVP_SLUGS = ["hamlet", "macbeth", "romeo_juliet"];

/** Categories keyed by the four columns of the root index.html. */
const CATEGORY_BY_COLUMN = ["comedy", "history", "tragedy", "poetry"];

/* ------------------------------------------------------------------ */
/* Catalogue: slug -> { name, category }                              */
/* ------------------------------------------------------------------ */

function readCatalogue() {
  const html = readFileSync(join(ROOT, "index.html"), "latin1");
  const root = parse(html);
  // The category table: first row = headers, second row = one <td> per column.
  const tables = root.querySelectorAll("table");
  const catTable = tables.find((t) => /Comedy/i.test(t.text) && /Tragedy/i.test(t.text));
  const rows = catTable.querySelectorAll("tr");
  const columnCells = rows[rows.length - 1].querySelectorAll("td");

  const catalogue = {};
  columnCells.forEach((cell, columnIdx) => {
    const category = CATEGORY_BY_COLUMN[columnIdx] ?? "other";
    for (const a of cell.querySelectorAll("a")) {
      const href = a.getAttribute("href") || "";
      const m = href.match(/^([^/]+)\/index\.html$/);
      if (!m) continue;
      const slug = m[1];
      const name = a.text.replace(/\s+/g, " ").trim();
      catalogue[slug] = { name, category };
    }
  });
  return catalogue;
}

/* ------------------------------------------------------------------ */
/* Scene list for a play, from its index.html                         */
/* ------------------------------------------------------------------ */

function readSceneList(slug) {
  const html = readFileSync(join(ROOT, slug, "index.html"), "latin1");
  const root = parse(html);
  const scenes = [];
  for (const a of root.querySelectorAll("a")) {
    const href = a.getAttribute("href") || "";
    // e.g. hamlet.1.1.html  or  romeo_juliet.1.0.html (prologue)
    const m = href.match(/\.(\d+)\.(\d+)\.html$/);
    if (!m) continue;
    scenes.push({
      file: href,
      act: Number(m[1]),
      scene: Number(m[2]),
      location: a.text.replace(/\s+/g, " ").trim(),
    });
  }
  return scenes;
}

/* ------------------------------------------------------------------ */
/* Parse a single scene file into ordered blocks                      */
/* ------------------------------------------------------------------ */

// The corpus uses non-compliant nested <a> tags that confuse DOM parsers, but
// every speech/line/direction token is self-contained. A single ordered scan
// over those tokens is robust where tree-walking is not.
//
// We start scanning after the closing </table> (the nav block) so the nav's
// <a href> links are never mistaken for content.
const TOKEN_RE =
  /<a\s+name=(["']?)speech\d+\1[^>]*>([\s\S]*?)<\/a>|<a\s+name=(["']?)(\d[\w.]*)\3[^>]*>([\s\S]*?)<\/a>|<i\b[^>]*>([\s\S]*?)<\/i>/gi;

function parseScene(slug, file) {
  const html = readFileSync(join(ROOT, slug, file), "latin1");
  const body = html.replace(/^[\s\S]*?<\/table>/i, ""); // drop nav table

  const blocks = [];
  let current = null; // active speech
  let lastSpeaker = null;

  const flush = () => {
    if (current && current.lines.length) blocks.push(current);
    current = null;
  };

  let m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(body)) !== null) {
    if (m[2] !== undefined) {
      // speaker
      flush();
      lastSpeaker = clean(text(m[2]));
      current = { type: "speech", speaker: lastSpeaker, lines: [] };
    } else if (m[5] !== undefined) {
      // spoken line
      if (!current) current = { type: "speech", speaker: lastSpeaker, lines: [] };
      current.lines.push({ id: m[4], text: clean(text(m[5])) });
    } else if (m[6] !== undefined) {
      // stage direction
      flush();
      const t = clean(text(m[6]));
      if (t) blocks.push({ type: "direction", text: t });
    }
  }
  flush();
  return blocks;
}

const NAMED = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", mdash: "—",
  ndash: "–", hellip: "…", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”",
  eacute: "é", egrave: "è", agrave: "à", ccedil: "ç", uuml: "ü", ouml: "ö",
  auml: "ä", aelig: "æ", oelig: "œ", AElig: "Æ",
};

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (full, name) => (name in NAMED ? NAMED[name] : full));

const stripTags = (s) => s.replace(/<[^>]+>/g, "");
const text = (s) => decode(stripTags(s));
const clean = (s) => (s || "").replace(/\s+/g, " ").trim();

/* ------------------------------------------------------------------ */
/* Build one play                                                     */
/* ------------------------------------------------------------------ */

function buildPlay(slug, catalogue) {
  const meta = catalogue[slug] || { name: slug, category: "other" };
  const sceneList = readSceneList(slug);
  if (sceneList.length === 0) throw new Error(`No scenes found for ${slug}`);

  // Title from the first scene's td.play
  let title = meta.name;
  try {
    const first = parse(readFileSync(join(ROOT, slug, sceneList[0].file), "latin1"));
    const playCell = first.querySelector("td.play");
    if (playCell) title = clean(playCell.text);
  } catch {}

  const actsMap = new Map();
  for (const s of sceneList) {
    const blocks = parseScene(slug, s.file);
    if (!actsMap.has(s.act)) actsMap.set(s.act, []);
    actsMap.get(s.act).push({
      scene: s.scene,
      location: s.location,
      isPrologue: s.scene === 0,
      blocks,
    });
  }

  const acts = [...actsMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([act, scenes]) => ({
      act,
      scenes: scenes.sort((a, b) => a.scene - b.scene),
    }));

  const sceneCount = acts.reduce((n, a) => n + a.scenes.length, 0);
  return {
    slug,
    name: meta.name,
    title,
    category: meta.category,
    actCount: acts.length,
    sceneCount,
    acts,
  };
}

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */

function main() {
  const args = process.argv.slice(2);
  const catalogue = readCatalogue();

  let slugs;
  if (args.includes("--all")) {
    slugs = Object.keys(catalogue).filter((s) => s !== "Poetry" && existsSync(join(ROOT, s, "index.html")));
  } else {
    const explicit = args.filter((a) => !a.startsWith("--"));
    slugs = explicit.length ? explicit : MVP_SLUGS;
  }

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  const index = [];
  for (const slug of slugs) {
    try {
      const play = buildPlay(slug, catalogue);
      writeFileSync(join(DATA_DIR, `${slug}.json`), JSON.stringify(play));
      index.push({
        slug: play.slug,
        name: play.name,
        title: play.title,
        category: play.category,
        actCount: play.actCount,
        sceneCount: play.sceneCount,
      });
      console.log(`✓ ${slug.padEnd(16)} ${play.actCount} acts, ${play.sceneCount} scenes`);
    } catch (err) {
      console.error(`✗ ${slug}: ${err.message}`);
    }
  }

  index.sort((a, b) => a.name.localeCompare(b.name));
  writeFileSync(join(DATA_DIR, "index.json"), JSON.stringify(index, null, 2));
  console.log(`\nWrote ${index.length} plays to data/  (index.json + ${index.length} play files)`);
}

main();
