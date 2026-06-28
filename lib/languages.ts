// Indian languages supported by Sarvam AI.
// `translate` covers all 22 scheduled languages (sarvam-translate:v1).
// `tts` is true only for languages Sarvam's TTS (bulbul) can speak.
export type Language = {
  code: string; // BCP-47, e.g. "hi-IN"
  label: string; // English name
  native: string; // endonym
  tts: boolean;
};

export const ENGLISH: Language = {
  code: "en-IN",
  label: "English",
  native: "English",
  tts: true,
};

export const LANGUAGES: Language[] = [
  { code: "hi-IN", label: "Hindi", native: "हिन्दी", tts: true },
  { code: "bn-IN", label: "Bengali", native: "বাংলা", tts: true },
  { code: "ta-IN", label: "Tamil", native: "தமிழ்", tts: true },
  { code: "te-IN", label: "Telugu", native: "తెలుగు", tts: true },
  { code: "mr-IN", label: "Marathi", native: "मराठी", tts: true },
  { code: "gu-IN", label: "Gujarati", native: "ગુજરાતી", tts: true },
  { code: "kn-IN", label: "Kannada", native: "ಕನ್ನಡ", tts: true },
  { code: "ml-IN", label: "Malayalam", native: "മലയാളം", tts: true },
  { code: "pa-IN", label: "Punjabi", native: "ਪੰਜਾਬੀ", tts: true },
  { code: "od-IN", label: "Odia", native: "ଓଡ଼ିଆ", tts: true },
  { code: "as-IN", label: "Assamese", native: "অসমীয়া", tts: true },
  { code: "ur-IN", label: "Urdu", native: "اردو", tts: false },
  { code: "sa-IN", label: "Sanskrit", native: "संस्कृतम्", tts: false },
  { code: "ne-IN", label: "Nepali", native: "नेपाली", tts: false },
  { code: "kok-IN", label: "Konkani", native: "कोंकणी", tts: false },
  { code: "mai-IN", label: "Maithili", native: "मैथिली", tts: false },
  { code: "doi-IN", label: "Dogri", native: "डोगरी", tts: false },
  { code: "ks-IN", label: "Kashmiri", native: "كٲشُر", tts: false },
  { code: "sd-IN", label: "Sindhi", native: "سنڌي", tts: false },
  { code: "mni-IN", label: "Manipuri", native: " মৈতৈলোন্", tts: false },
  { code: "brx-IN", label: "Bodo", native: "बड़ो", tts: false },
  { code: "sat-IN", label: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", tts: false },
];

const BY_CODE = new Map<string, Language>(
  [ENGLISH, ...LANGUAGES].map((l) => [l.code, l]),
);

export const getLanguage = (code: string): Language | undefined => BY_CODE.get(code);

export const isTranslationTarget = (code: string): boolean =>
  LANGUAGES.some((l) => l.code === code);

export const ttsLanguageCode = (code: string): string =>
  getLanguage(code)?.tts ? code : ENGLISH.code;
