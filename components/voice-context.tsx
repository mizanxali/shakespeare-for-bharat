"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { characterGender } from "@/lib/characters";
import { defaultVoiceForGender, isValidVoice } from "@/lib/voices";

type Ctx = {
  /** The chosen (or default) Sarvam speaker id for a character. */
  getVoice: (speaker: string | null) => string;
  setVoice: (speaker: string, voiceId: string) => void;
  /** Whether this character is currently using a non-default voice. */
  voices: Record<string, string>;
};

const VoiceContext = createContext<Ctx>({
  getVoice: () => "",
  setVoice: () => {},
  voices: {},
});

const storageKey = (slug: string) => `sfb:voices:${slug}`;

export function VoiceProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  // Map of character name -> explicitly chosen voice id. Defaults are derived
  // from gender and not stored, so this only holds the reader's overrides.
  const [voices, setVoices] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(slug));
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, string>;
      const clean: Record<string, string> = {};
      for (const [name, id] of Object.entries(parsed)) {
        if (typeof id === "string" && isValidVoice(id)) clean[name] = id;
      }
      setVoices(clean);
    } catch {}
  }, [slug]);

  const value = useMemo<Ctx>(() => {
    const getVoice = (speaker: string | null) => {
      if (!speaker) return defaultVoiceForGender("male");
      return voices[speaker] ?? defaultVoiceForGender(characterGender(speaker));
    };
    const setVoice = (speaker: string, voiceId: string) => {
      setVoices((prev) => {
        const next = { ...prev, [speaker]: voiceId };
        try {
          localStorage.setItem(storageKey(slug), JSON.stringify(next));
        } catch {}
        return next;
      });
    };
    return { getVoice, setVoice, voices };
  }, [voices, slug]);

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export const useVoice = () => useContext(VoiceContext);
