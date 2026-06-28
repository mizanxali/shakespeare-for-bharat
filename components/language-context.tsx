"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { LANGUAGES } from "@/lib/languages";

type Ctx = { language: string; setLanguage: (code: string) => void };

const LanguageContext = createContext<Ctx>({
  language: "hi-IN",
  setLanguage: () => {},
});

const STORAGE_KEY = "sfb:language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState("hi-IN");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES.some((l) => l.code === saved)) setLanguageState(saved);
    } catch {}
  }, []);

  const setLanguage = (code: string) => {
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {}
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
