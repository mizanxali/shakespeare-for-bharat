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
    if (!res.ok) throw new Error(data.error || "Translation failed");
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
      setError(e instanceof Error ? e.message : "Translation failed");
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
      if (!res.ok) throw new Error(data.error || "Speech failed");

      const audio = new Audio(data.audio);
      audioRef.current = audio;
      audio.onended = () => setPlaying(null);
      audio.onpause = () => setPlaying((p) => (p === kind ? null : p));
      await audio.play();
      setPlaying(kind);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Speech failed");
    } finally {
      setLoadingAudio(null);
    }
  }

  return (
    <div className="group mb-6 rounded-xl px-3 py-2 transition hover:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]">
      {block.speaker && (
        <div className="reading text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
          {block.speaker}
        </div>
      )}

      <div className="reading mt-1 text-lg leading-relaxed text-[var(--fg)]">
        {block.lines.map((l) => (
          <span key={l.id} className="block">
            {l.text}
          </span>
        ))}
      </div>

      {shown && translated && (
        <blockquote className="reading mt-3 animate-fade-up border-l-2 border-[var(--accent-2)] pl-3 text-lg leading-relaxed text-[var(--fg)]">
          {translated.split("\n").map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
          <span className="mt-1 block text-xs font-sans text-[var(--fg-soft)]">
            {langLabel}
          </span>
        </blockquote>
      )}

      {error && (
        <p className="mt-2 text-sm text-[var(--color-rose)]">{error}</p>
      )}

      {/* Controls — appear on hover / focus, always visible on touch */}
      <div className="mt-2 flex flex-wrap items-center gap-2 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        <Btn onClick={handleTranslate} loading={translating}>
          {shown ? "Hide" : "Translate"}
        </Btn>
        <Btn onClick={() => handleListen("original")} loading={loadingAudio === "original"} active={playing === "original"}>
          {playing === "original" ? "⏸ English" : "🔊 English"}
        </Btn>
        {canSpeakTranslation && (
          <Btn onClick={() => handleListen("translated")} loading={loadingAudio === "translated"} active={playing === "translated"}>
            {playing === "translated" ? `⏸ ${langLabel}` : `🔊 ${langLabel}`}
          </Btn>
        )}
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
      className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-60 ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
          : "border-[var(--border)] bg-[var(--bg-raised)] text-[var(--fg-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }`}
    >
      {loading ? "…" : children}
    </button>
  );
}
