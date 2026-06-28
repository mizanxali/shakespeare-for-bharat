"use client";

import { characterGender } from "@/lib/characters";
import { voicesForGender } from "@/lib/voices";
import { useVoice } from "./voice-context";

export function CharacterVoices({
  characters,
  open,
  onClose,
}: {
  characters: string[];
  open: boolean;
  onClose: () => void;
}) {
  const { getVoice, setVoice } = useVoice();

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
        aria-label="Character voices"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
            Character voices
          </h2>
          <button
            onClick={onClose}
            className="rounded-full px-2 text-lg text-[var(--fg-soft)] transition hover:text-[var(--accent)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="px-5 pt-3 text-xs text-[var(--fg-soft)]">
          Pick a voice for each character. Choices are saved on this device.
        </p>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {characters.length === 0 ? (
            <p className="text-sm text-[var(--fg-soft)]">No characters found.</p>
          ) : (
            <ul className="space-y-3">
              {characters.map((name) => {
                const gender = characterGender(name);
                const options = voicesForGender(gender);
                return (
                  <li key={name}>
                    <label className="flex flex-col gap-1">
                      <span className="reading text-sm font-medium text-[var(--fg)]">
                        {name}
                      </span>
                      <select
                        value={getVoice(name)}
                        onChange={(e) => setVoice(name, e.target.value)}
                        className="reading rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)]"
                      >
                        {options.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
