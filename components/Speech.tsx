"use client";

import { useEffect, useRef, useState } from "react";
import type { SpeechBlock } from "@/lib/plays";
import { getLanguage, ttsLanguageCode } from "@/lib/languages";
import { useLanguage } from "./language-context";
import { useVoice } from "./voice-context";

type AudioKind = "original" | "translated";

export function Speech({ block }: { block: SpeechBlock }) {
  const { language } = useLanguage();
  const { getVoice } = useVoice();
  const original = block.lines.map((l) => l.text).join("\n");

  // Translations cached per language so switching back is instant.
  const cache = useRef<Map<string, string>>(new Map());
  const [translated, setTranslated] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<AudioKind | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<AudioKind | null>(null);

  const lang = getLanguage(language);
  const langNative = lang?.native ?? lang?.label ?? "";
  const langLabel = lang?.label ?? "";
  const canSpeakTranslation = lang?.tts ?? false;

  // When the target language changes, swap to its cached translation if we have
  // one, otherwise drop the now-stale translation from the previous language.
  useEffect(() => {
    const cached = cache.current.get(language);
    setTranslated(cached ?? null);
    if (!cached) setShown(false);
  }, [language]);

  async function fetchTranslation(): Promise<string> {
    const cached = cache.current.get(language);
    if (cached) return cached;
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: original, target: language }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Couldn't translate that just now — try again.");
    cache.current.set(language, data.translated);
    return data.translated;
  }

  async function handleTranslate() {
    setError(null);
    if (shown && translated) {
      setShown(false);
      return;
    }
    setTranslating(true);
    try {
      const t = await fetchTranslation();
      setTranslated(t);
      setShown(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't translate that just now — try again.");
    } finally {
      setTranslating(false);
    }
  }

  function stopAudio() {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(null);
  }

  async function handleListen(kind: AudioKind) {
    setError(null);
    if (playing === kind) {
      stopAudio();
      return;
    }
    stopAudio();

    let text = original;
    let ttsLang = "en-IN";
    try {
      setLoadingAudio(kind);
      if (kind === "translated") {
        text = translated ?? (await fetchTranslation());
        setTranslated(text);
        setShown(true);
        ttsLang = ttsLanguageCode(language);
      }
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: ttsLang, speaker: getVoice(block.speaker) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't play that just now — try again.");

      const audio = new Audio(data.audio);
      audioRef.current = audio;
      audio.onended = () => setPlaying(null);
      audio.onpause = () => setPlaying((p) => (p === kind ? null : p));
      await audio.play();
      setPlaying(kind);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't play that just now — try again.");
    } finally {
      setLoadingAudio(null);
    }
  }

  const isPerforming = playing !== null;

  return (
    <div
      className={`group mb-5 rounded-xl px-3 py-3 transition ${
        isPerforming
          ? "performing"
          : "hover:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]"
      }`}
    >
      <div className="sm:grid sm:grid-cols-[7rem_1fr] sm:gap-6">
        {/* Speaker rail — pt nudges the label caps down to meet the
            dialogue's first line, which carries extra top leading. */}
        <div className="sm:pt-1.5 sm:text-right">
          {block.speaker && (
            <div className="label text-xs font-semibold uppercase leading-none tracking-[0.12em] text-[var(--accent)]">
              {block.speaker}
            </div>
          )}
          {isPerforming && (
            <div className="label mt-1.5 flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.15em] text-[var(--accent)] sm:justify-end">
              <span className="inline-block h-1.5 w-1.5 animate-nowplaying rounded-full bg-[var(--accent)]" />
              On stage
            </div>
          )}
        </div>

        {/* Speech body */}
        <div className="mt-2 sm:mt-0">
          <div className="reading text-lg leading-relaxed text-[var(--fg)]">
            {block.lines.map((l) => (
              <span key={l.id} className="block">
                {l.text}
              </span>
            ))}
          </div>

          {shown && translated && (
            <blockquote className="script mt-3 animate-fade-up border-l-2 border-[var(--accent-2)] pl-3 text-lg leading-relaxed text-[var(--fg)]">
              {translated.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
              <span className="label mt-1.5 block text-[0.65rem] uppercase tracking-[0.15em] text-[var(--accent-2)]">
                {langLabel}
              </span>
            </blockquote>
          )}

          {error && (
            <p className="mt-2 text-sm text-[var(--color-rose)]">{error}</p>
          )}

          {/* Controls — appear on hover / focus, stay while performing */}
          <div
            className={`mt-3 flex flex-wrap items-center gap-2 sm:transition ${
              isPerforming
                ? "opacity-100"
                : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
            }`}
          >
            <Btn onClick={handleTranslate} loading={translating}>
              {shown ? "Hide translation" : "Translate"}
            </Btn>
            <Btn
              onClick={() => handleListen("original")}
              loading={loadingAudio === "original"}
              active={playing === "original"}
            >
              {playing === "original" ? "◼ English" : "▶ English"}
            </Btn>
            {canSpeakTranslation && (
              <Btn
                onClick={() => handleListen("translated")}
                loading={loadingAudio === "translated"}
                active={playing === "translated"}
              >
                {playing === "translated" ? `◼ ${langNative}` : `▶ ${langNative}`}
              </Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Btn({
  children,
  onClick,
  loading,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`label rounded-full border px-3 py-1 text-xs uppercase tracking-[0.08em] transition disabled:opacity-60 ${
        active
          ? "border-[var(--curtain)] bg-[var(--curtain)] text-[var(--curtain-fg)]"
          : "border-[var(--border)] bg-[var(--bg-raised)] text-[var(--fg-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }`}
    >
      {loading ? "…" : children}
    </button>
  );
}
