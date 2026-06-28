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
        {/* Sticky toolbar */}
        <div className="sticky top-[57px] z-20 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-2.5">
            <Link
              href={`/play/${playSlug}`}
              className="reading truncate text-sm font-semibold text-[var(--fg)] hover:text-[var(--accent)]"
            >
              {playName}
            </Link>
            <div className="flex items-center gap-2">
              <LanguageButton onOpen={() => setLangOpen(true)} />
              <button
                onClick={() => setVoicesOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-1.5 text-sm text-[var(--fg-soft)] outline-none transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <span aria-hidden>🎭</span>
                <span className="hidden sm:inline">Voices</span>
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

      <article className="mx-auto max-w-3xl px-5 py-10">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
            Act {roman(act)}
            {scene.isPrologue ? "" : ` · Scene ${roman(scene.scene)}`}
          </p>
          <h1 className="reading mt-2 text-2xl font-bold text-[var(--fg)]">
            {scene.isPrologue ? "Prologue" : scene.location}
          </h1>
        </header>

        <p className="mb-6 text-center text-xs text-[var(--fg-soft)]">
          Hover a speech (or tap on mobile) to translate it or hear it aloud.
        </p>

        <div>
          {scene.blocks.map((block, i) =>
            block.type === "speech" ? (
              <Speech key={i} block={block} />
            ) : (
              <p
                key={i}
                className="reading my-5 text-center text-base italic text-[var(--fg-soft)]"
              >
                {block.text}
              </p>
            ),
          )}
        </div>

        {/* Prev / next */}
        <nav className="mt-12 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
          {prev ? (
            <Link
              href={`/play/${playSlug}/${prev.act}/${prev.scene}`}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-2 text-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/play/${playSlug}/${next.act}/${next.scene}`}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-2 text-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
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
