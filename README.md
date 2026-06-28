# Shakespeare for Bharat

A modern web app to **read** the plays of William Shakespeare and **translate** or
**listen to** any speech in Indian languages — powered by [Sarvam AI](https://www.sarvam.ai).

Built on MIT's public-domain *Complete Works of William Shakespeare*. The original
HTML is kept as the content source and parsed into structured JSON that the app reads.

## Features

- 📖 Clean, mobile-first reader for the plays (acts → scenes → speeches)
- 🌐 Translate any speech into 22 Indian languages (Sarvam `sarvam-translate:v1`)
- 🔊 Listen to the original English **and** the translation via TTS (Sarvam `bulbul:v3`)
- ⚡ Server-side API proxy keeps the Sarvam key secret; results are cached per (text, language)
- 🌗 Light / dark reading themes

## Tech

Next.js (App Router) · React · TypeScript · Tailwind CSS v4. Deploys on Vercel.

## Getting started

```bash
npm install

# 1. Parse the source HTML into data/*.json
npm run parse              # MVP subset: Hamlet, Macbeth, Romeo & Juliet
# npm run parse -- --all   # every play
# npm run parse -- macbeth lear   # specific plays

# 2. Add your Sarvam key
cp .env.local.example .env.local   # then edit SARVAM_API_KEY

# 3. Run
npm run dev                # http://localhost:3000
```

Get a key from the [Sarvam dashboard](https://dashboard.sarvam.ai). The key is read
only on the server (`lib/sarvam.ts` imports `server-only`) and is never sent to the
browser.

## Project layout

```
source-html/              original MIT public-domain Shakespeare HTML (content source)
scripts/parse-plays.mjs   HTML → JSON parser (reads source-html/)
data/*.json               generated play data (committed) + index.json catalogue
lib/sarvam.ts             server-only Sarvam client
lib/cache.ts              in-memory LRU cache (swap for Vercel KV in prod)
lib/languages.ts          supported languages + TTS capability flags
lib/plays.ts              data access + types
app/                      routes: home, /play/[slug], /play/[slug]/[act]/[scene]
app/api/translate         POST proxy → Sarvam /translate
app/api/tts               POST proxy → Sarvam /text-to-speech
components/               Reader, Speech, LanguagePicker, PlayCard, header, theme
```

## Deploying

1. Push to GitHub and import the repo in Vercel.
2. Set `SARVAM_API_KEY` in the Vercel project's environment variables.
3. Deploy. `npm run build` runs the parser-generated data through SSG.

> **Production note:** the cache in `lib/cache.ts` is per-instance and resets on cold
> start. For shared, durable caching, back `translationCache` / `ttsCache` with
> [Vercel KV](https://vercel.com/docs/storage/vercel-kv) or Upstash Redis using the
> same `cacheKey(...)` hashes.

## Adding more plays

The parser handles all 38 plays. Run `npm run parse -- --all`, then the home page and
routes pick them up automatically (categories come from the source `index.html`).
