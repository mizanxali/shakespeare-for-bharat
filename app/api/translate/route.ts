import { NextResponse } from "next/server";
import { translate, SarvamError } from "@/lib/sarvam";
import { isTranslationTarget } from "@/lib/languages";
import { cacheKey, translationCache } from "@/lib/cache";

export const runtime = "nodejs";

const MAX_INPUT = 2000;

export async function POST(req: Request) {
  let payload: { text?: string; target?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = (payload.text ?? "").trim();
  const target = payload.target ?? "";

  if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });
  if (text.length > MAX_INPUT)
    return NextResponse.json({ error: "Text too long" }, { status: 413 });
  if (!isTranslationTarget(target))
    return NextResponse.json({ error: "Unsupported target language" }, { status: 400 });

  const key = cacheKey("tr", target, text);
  const cached = translationCache.get(key);
  if (cached !== undefined) {
    return NextResponse.json({ translated: cached, cached: true });
  }

  try {
    const translated = await translate(text, target);
    translationCache.set(key, translated);
    return NextResponse.json({ translated, cached: false });
  } catch (err) {
    const status = err instanceof SarvamError ? err.status : 502;
    const message = err instanceof Error ? err.message : "Translation failed";
    return NextResponse.json({ error: message }, { status });
  }
}
