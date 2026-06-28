import { NextResponse } from "next/server";
import { tts, SarvamError } from "@/lib/sarvam";
import { getLanguage } from "@/lib/languages";
import { isValidVoice } from "@/lib/voices";
import { cacheKey, ttsCache } from "@/lib/cache";

export const runtime = "nodejs";

const MAX_INPUT = 1500;

export async function POST(req: Request) {
  let payload: { text?: string; language?: string; speaker?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = (payload.text ?? "").trim();
  const language = payload.language ?? "";
  const lang = getLanguage(language);
  // Ignore an unknown/empty speaker and let Sarvam fall back to its default.
  const speaker =
    payload.speaker && isValidVoice(payload.speaker) ? payload.speaker : undefined;

  if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });
  if (text.length > MAX_INPUT)
    return NextResponse.json({ error: "Text too long" }, { status: 413 });
  if (!lang || !lang.tts)
    return NextResponse.json({ error: "Speech not available for this language" }, { status: 400 });

  const key = cacheKey("tts", language, speaker ?? "", text);
  const cached = ttsCache.get(key);
  if (cached !== undefined) {
    return NextResponse.json({ audio: cached, cached: true });
  }

  try {
    const chunks = await tts(text, language, speaker);
    if (chunks.length === 0)
      return NextResponse.json({ error: "No audio returned" }, { status: 502 });
    // bulbul returns base64 WAV chunks; for a short speech there is usually one.
    // Return the first chunk as a data URL the browser can play directly.
    const audio = `data:audio/wav;base64,${chunks[0]}`;
    ttsCache.set(key, audio);
    return NextResponse.json({ audio, cached: false });
  } catch (err) {
    const status = err instanceof SarvamError ? err.status : 502;
    const message = err instanceof Error ? err.message : "Speech synthesis failed";
    return NextResponse.json({ error: message }, { status });
  }
}
