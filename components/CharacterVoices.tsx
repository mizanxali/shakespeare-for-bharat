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
        className={`fixed right-0 top-0 z-40 flex h-full w-80 max-w-[85vw] flex-col border-l border-[var(--border)] bg-[var(--bg-raised)] shadow-[var(--shadow-lg)] transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Character voices"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--curtain)] px-5 py-4">
          <h2 className="label text-sm uppercase tracking-[0.2em] text-[var(--curtain-fg)]">
            The cast
          </h2>
          <button
            onClick={onClose}
            className="press grid h-9 w-9 place-items-center rounded-full text-lg text-[var(--curtain-fg)] transition-[color,scale] duration-200 hover:text-[var(--brass)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="px-5 pt-3 text-xs text-[var(--fg-soft)]">
          Cast a voice for each character. Choices are saved on this device.
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
                      <span className="label text-sm uppercase tracking-[0.1em] text-[var(--fg)]">
                        {name}
                      </span>
                      <select
                        value={getVoice(name)}
                        onChange={(e) => setVoice(name, e.target.value)}
                        className="reading appearance-none rounded-lg border border-[var(--border)] bg-[var(--bg)] py-1.5 pl-3 pr-9 text-sm text-[var(--fg)] outline-none transition-[border-color] duration-200 focus:border-[var(--accent)]"
                        style={{
                          backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='12'%20height='12'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23a87f2e'%20stroke-width='2.5'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpath%20d='M6%209l6%206%206-6'/%3E%3C/svg%3E\")",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 0.75rem center",
                          backgroundSize: "0.7rem",
                        }}
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
