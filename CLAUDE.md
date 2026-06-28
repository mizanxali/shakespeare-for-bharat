# CLAUDE.md

Guidance for working in this repository.

## What this is

**Shakespeare for Bharat** — a Next.js web app to read Shakespeare's plays and
translate/listen to any speech in Indian languages via the Sarvam AI API. It was
built on top of a fork of MIT's public-domain *Complete Works of William
Shakespeare* (static HTML), which now lives in `source-html/` as the content source.

## Commands

```bash
npm run dev      # dev server at http://localhost:3000
npm run build    # production build (runs SSG for all plays/scenes + tsc)
npm run start    # serve the production build
npm run parse    # regenerate data/*.json from source-html/ (MVP subset)
```

Parser variants:
```bash
npm run parse -- --all          # every play in source-html/
npm run parse -- macbeth lear   # specific slugs
```

There is no separate test suite or lint step wired up beyond `next build`'s
TypeScript check. Verify changes by building and by exercising pages/routes.

## Architecture

Data flows in one direction: **HTML → JSON → app**. The app never reads the HTML at
runtime; it reads the committed `data/*.json`.

```
source-html/      original Shakespeare HTML — the content source of truth
scripts/parse-plays.mjs   parses source-html/ → data/*.json + data/index.json
data/             generated, committed JSON (one file per play + index.json)
lib/plays.ts      data access + the Play/Act/Scene/Block types
lib/sarvam.ts     server-only Sarvam client (translate + tts)
lib/cache.ts      in-memory LRU cache keyed by sha256(text, lang)
lib/languages.ts  the 22 supported languages + per-language TTS capability flags
app/              routes (App Router)
  page.tsx                          home / catalogue
  play/[slug]/page.tsx              play overview (acts → scenes)
  play/[slug]/[act]/[scene]/page.tsx   reader (renders <Reader/>)
  api/translate, api/tts            POST proxies to Sarvam
components/        Reader, Speech, LanguagePicker, language-context, PlayCard, etc.
```

Routing convention: scenes are `/play/<slug>/<act>/<scene>`; act 0 / scene 0 are
prologues (`scene.isPrologue`). All play and scene pages are statically generated
via `generateStaticParams`.

## Key conventions & gotchas

- **The parser does NOT use a DOM tree.** The source HTML has non-compliant nested
  `<a>` tags (`<A NAME=speechN>` … and `<A NAME=lineId>` lines) that break
  node-html-parser's tree (it mis-nests siblings into the speaker). Instead
  `parse-plays.mjs` runs an **ordered regex scan** (`TOKEN_RE`) over speech-anchor,
  line-anchor, and `<i>` direction tokens, with a small entity decoder. node-html-parser
  is only used for the well-formed nav/catalogue `<a href>` links. If you touch the
  parser, keep this approach and re-run `npm run parse`, then sanity-check
  `data/hamlet.json` (first speech is BERNARDO "Who's there?").

- **Categories** (comedy/history/tragedy/poetry) are derived from the four columns of
  `source-html/index.html`, not hardcoded.

- **Sarvam key is server-only.** `lib/sarvam.ts` imports `server-only` and reads
  `process.env.SARVAM_API_KEY`. Never import it into a client component or expose the
  key to the browser. All Sarvam calls go through `app/api/translate` and
  `app/api/tts`, which validate input (language allow-list + length cap) and cache by
  hash. The client (`components/Speech.tsx`) only ever calls `/api/*`.

- **Sarvam request/response shapes** (verified against docs):
  - translate: POST `/translate`, body `{ input, source_language_code:"en-IN",
    target_language_code, model:"sarvam-translate:v1", mode:"classic-colloquial" }`,
    response `{ translated_text }`. Limit ~2000 chars.
  - tts: POST `/text-to-speech`, body `{ text, target_language_code, model:"bulbul:v3" }`,
    response `{ audios: string[] }` (base64 WAV chunks). Limit ~1500 chars.
  - Only languages with `tts: true` in `lib/languages.ts` can be spoken; others fall
    back to English via `ttsLanguageCode()`.

- **Cache is per-instance** (`lib/cache.ts`) and resets on cold start. For production,
  back `translationCache`/`ttsCache` with Vercel KV/Upstash using the same `cacheKey`.

- **Theme**: Tailwind v4 (config lives in `app/globals.css` via `@theme`). Dark mode is
  class-based (`.dark` on `<html>`), set before paint by an inline script in
  `app/layout.tsx` and toggled by `components/ThemeToggle.tsx`.

## Adding plays

Run `npm run parse -- --all` (or specific slugs). The home page and routes pick up
whatever is in `data/` automatically — no code change needed.

## Environment

Copy `.env.local.example` to `.env.local` and set `SARVAM_API_KEY` (from
dashboard.sarvam.ai). Without it, the read/translate UI still renders but Sarvam calls
return a 500 ("SARVAM_API_KEY is not configured").
