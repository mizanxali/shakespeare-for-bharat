"use client";

import { LANGUAGES } from "@/lib/languages";
import { useLanguage } from "./language-context";

export function LanguagePicker() {
  const { language, setLanguage } = useLanguage();

  return (
    <label className="flex items-center gap-2 text-sm text-[var(--fg-soft)]">
      <span className="hidden sm:inline">Translate to</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="reading rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-1.5 text-[var(--fg)] outline-none transition focus:border-[var(--accent)]"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native} — {l.label}
            {l.tts ? " 🔊" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
