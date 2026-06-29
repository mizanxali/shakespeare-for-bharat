"use client";

import { LANGUAGES, getLanguage } from "@/lib/languages";
import { useLanguage } from "./language-context";

/** Toolbar button that shows the current language and opens the drawer. */
export function LanguageButton({ onOpen }: { onOpen: () => void }) {
  const { language } = useLanguage();
  const current = getLanguage(language);

  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-1.5 text-sm text-[var(--fg-soft)] outline-none transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      <span aria-hidden className="leading-none">🌐</span>
      {/* Devanagari/Bengali metrics reserve extra top ascent, so the glyphs
          settle low next to the icon — nudge them up to optically centre. */}
      <span className="script relative top-0.5 leading-none text-[var(--fg)]">
        {current?.native ?? "Language"}
      </span>
    </button>
  );
}

export function LanguageDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { language, setLanguage } = useLanguage();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/30 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-40 flex h-full w-80 max-w-[85vw] flex-col border-l border-[var(--border)] bg-[var(--bg-raised)] shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Translation language"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--curtain)] px-5 py-4">
          <h2 className="label text-sm uppercase tracking-[0.2em] text-[var(--curtain-fg)]">
            Translate to
          </h2>
          <button
            onClick={onClose}
            className="rounded-full px-2 text-lg text-[var(--curtain-fg)] transition hover:text-[var(--brass)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="px-5 pt-3 text-xs text-[var(--fg-soft)]">
          Pick a language to translate speeches into. 🔊 marks languages that can
          also be performed aloud.
        </p>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          <ul className="space-y-1">
            {LANGUAGES.map((l) => {
              const active = l.code === language;
              return (
                <li key={l.code}>
                  <button
                    onClick={() => {
                      setLanguage(l.code);
                      onClose();
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                      active
                        ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] font-medium text-[var(--fg)]"
                        : "border-transparent text-[var(--fg)] hover:border-[var(--border)] hover:bg-[var(--bg)]"
                    }`}
                  >
                    <span className="script relative top-0.5 leading-none">
                      {l.native} <span className="text-[var(--fg-soft)]">— {l.label}</span>
                    </span>
                    {l.tts && <span aria-hidden>🔊</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}
