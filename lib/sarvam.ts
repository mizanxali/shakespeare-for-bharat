// Server-only typed client for Sarvam AI. The API key lives in SARVAM_API_KEY
// and must never be sent to the browser — only import this from route handlers.
import "server-only";

const BASE = "https://api.sarvam.ai";
const TRANSLATE_MAX_CHARS = 2000; // sarvam-translate:v1 limit
const TTS_MAX_CHARS = 2500; // bulbul:v3 limit

function apiKey(): string {
  const key = process.env.SARVAM_API_KEY;
  if (!key) throw new SarvamError("SARVAM_API_KEY is not configured", 500);
  return key;
}

export class SarvamError extends Error {
  constructor(
    message: string,
    public status: number = 502,
  ) {
    super(message);
    this.name = "SarvamError";
  }
}

async function call<T>(path: string, body: unknown): Promise<T> {
  const key = apiKey(); // throws a 500 SarvamError if unconfigured
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": key,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new SarvamError("Could not reach Sarvam AI", 502);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new SarvamError(
      `Sarvam ${path} failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`,
      res.status === 429 ? 429 : 502,
    );
  }
  return (await res.json()) as T;
}

/** Translate English text into a target Indian language. */
export async function translate(
  input: string,
  targetLanguageCode: string,
): Promise<string> {
  const trimmed = input.slice(0, TRANSLATE_MAX_CHARS);
  const data = await call<{ translated_text: string }>("/translate", {
    input: trimmed,
    source_language_code: "en-IN",
    target_language_code: targetLanguageCode,
    // model: "sarvam-translate:v1",
    // mode: "classic-colloquial",
  });
  return data.translated_text;
}

/**
 * Synthesise speech. Returns a list of base64-encoded WAV chunks (Sarvam may
 * split long inputs). The caller turns these into playable audio.
 */
export async function tts(
  text: string,
  targetLanguageCode: string,
): Promise<string[]> {
  const trimmed = text.slice(0, TTS_MAX_CHARS);
  const data = await call<{ audios: string[] }>("/text-to-speech", {
    text: trimmed,
    target_language_code: targetLanguageCode,
    model: "bulbul:v3",
  });
  return data.audios ?? [];
}
