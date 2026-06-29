"use client";

import { useState } from "react";
import Link from "next/link";
import type { Scene } from "@/lib/plays";
import { LanguageProvider } from "./language-context";
import { LanguageButton, LanguageDrawer } from "./LanguageDrawer";
import { Speech } from "./Speech";
import { VoiceProvider } from "./voice-context";
import { CharacterVoices } from "./CharacterVoices";

const roman = (n: number) =>
  ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] ?? String(n);

type NavTarget = { act: number; scene: number } | null;

export function Reader({
  playSlug,
  playName,
  scene,
  act,
  prev,
  next,
  characters,
}: {
  playSlug: string;
  playName: string;
  scene: Scene;
  act: number;
  prev: NavTarget;
  next: NavTarget;
  characters: string[];
}) {
  const [voicesOpen, setVoicesOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <LanguageProvider>
      <VoiceProvider slug={playSlug}>
        {/* Sticky toolbar, parked directly under the 56px (h-14) site header */}
        <div className="sticky top-14 z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-2.5">
            <Link
              href={`/play/${playSlug}`}
              className="display truncate text-base font-medium text-[var(--fg)] transition hover:text-[var(--accent)]"
            >
              {playName}
            </Link>
            <div className="flex items-center gap-2">
              <LanguageButton onOpen={() => setLangOpen(true)} />
              <button
                onClick={() => setVoicesOpen(true)}
                className="label press flex min-h-[2.25rem] items-center gap-1.5 rounded-xl bg-[var(--bg-raised)] px-3 py-1.5 text-sm uppercase leading-none tracking-[0.1em] text-[var(--fg-soft)] shadow-[var(--shadow-sm)] outline-none ring-1 ring-[var(--border)] transition-[color,box-shadow,scale] duration-200 hover:text-[var(--accent)] hover:ring-[var(--accent)]"
              >
                <span aria-hidden className="leading-none">🎭</span>
                <span className="hidden leading-none sm:inline">Voices</span>
              </button>
            </div>
          </div>
        </div>

        <LanguageDrawer open={langOpen} onClose={() => setLangOpen(false)} />

        <CharacterVoices
          characters={characters}
          open={voicesOpen}
          onClose={() => setVoicesOpen(false)}
        />

      <article className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-3 text-center">
          <p
            className="enter label tnum text-xs uppercase tracking-[0.3em] text-[var(--accent)]"
            style={{ "--enter-i": 0 } as React.CSSProperties}
          >
            Act {roman(act)}
            {scene.isPrologue ? "" : ` · Scene ${roman(scene.scene)}`}
          </p>
          <h1
            className="enter display mt-3 text-3xl font-semibold leading-tight text-[var(--fg)]"
            style={{ "--enter-i": 1 } as React.CSSProperties}
          >
            {scene.isPrologue ? "Prologue" : scene.location}
          </h1>
        </header>

        <p
          className="enter mb-10 text-center text-xs text-[var(--fg-soft)]"
          style={{ "--enter-i": 2 } as React.CSSProperties}
        >
          Hover a speech to translate it — or press play to hear it performed.
        </p>

        <div>
          {scene.blocks.map((block, i) =>
            block.type === "speech" ? (
              <Speech key={i} block={block} />
            ) : (
              <p
                key={i}
                className="reading my-6 text-center text-base italic text-[var(--fg-soft)]"
              >
                {block.text}
              </p>
            ),
          )}
        </div>

        {/* Exeunt / enter */}
        <nav className="mt-14 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
          {prev ? (
            <Link
              href={`/play/${playSlug}/${prev.act}/${prev.scene}`}
              className="label press rounded-xl bg-[var(--bg-raised)] px-4 py-2 text-sm uppercase tracking-[0.1em] text-[var(--fg-soft)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)] transition-[color,box-shadow,scale] duration-200 hover:text-[var(--accent)] hover:ring-[var(--accent)]"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/play/${playSlug}/${next.act}/${next.scene}`}
              className="label press rounded-xl bg-[var(--bg-raised)] px-4 py-2 text-sm uppercase tracking-[0.1em] text-[var(--fg-soft)] shadow-[var(--shadow-sm)] ring-1 ring-[var(--border)] transition-[color,box-shadow,scale] duration-200 hover:text-[var(--accent)] hover:ring-[var(--accent)]"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
        </article>
      </VoiceProvider>
    </LanguageProvider>
  );
}
