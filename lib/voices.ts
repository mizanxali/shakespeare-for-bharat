// Sarvam TTS speakers (bulbul:v3). Each speaker is a fixed voice with a gender;
// we only ever offer male voices for male characters and female voices for
// female ones (see lib/characters.ts for how a character's gender is resolved).
import type { Gender } from "./characters";

export type Voice = {
  id: string; // value sent to Sarvam's `speaker` field
  label: string; // display name
  gender: Gender;
};

// `shubh` is Sarvam's default; we keep it as the default for male characters.
export const DEFAULT_VOICE = "shubh";

export const VOICES: Voice[] = [
  { id: "shubh", label: "Shubh", gender: "male" },
  { id: "aditya", label: "Aditya", gender: "male" },
  { id: "ritu", label: "Ritu", gender: "female" },
  { id: "priya", label: "Priya", gender: "female" },
  { id: "neha", label: "Neha", gender: "female" },
  { id: "rahul", label: "Rahul", gender: "male" },
  { id: "pooja", label: "Pooja", gender: "female" },
  { id: "rohan", label: "Rohan", gender: "male" },
  { id: "simran", label: "Simran", gender: "female" },
  { id: "kavya", label: "Kavya", gender: "female" },
  { id: "amit", label: "Amit", gender: "male" },
  { id: "dev", label: "Dev", gender: "male" },
  { id: "ishita", label: "Ishita", gender: "female" },
  { id: "shreya", label: "Shreya", gender: "female" },
  { id: "ratan", label: "Ratan", gender: "male" },
  { id: "varun", label: "Varun", gender: "male" },
  { id: "manan", label: "Manan", gender: "male" },
  { id: "sumit", label: "Sumit", gender: "male" },
  { id: "roopa", label: "Roopa", gender: "female" },
  { id: "kabir", label: "Kabir", gender: "male" },
  { id: "aayan", label: "Aayan", gender: "male" },
  { id: "ashutosh", label: "Ashutosh", gender: "male" },
  { id: "advait", label: "Advait", gender: "male" },
  { id: "anand", label: "Anand", gender: "male" },
  { id: "tanya", label: "Tanya", gender: "female" },
  { id: "tarun", label: "Tarun", gender: "male" },
  { id: "sunny", label: "Sunny", gender: "male" },
  { id: "mani", label: "Mani", gender: "male" },
  { id: "gokul", label: "Gokul", gender: "male" },
  { id: "vijay", label: "Vijay", gender: "male" },
  { id: "shruti", label: "Shruti", gender: "female" },
  { id: "suhani", label: "Suhani", gender: "female" },
  { id: "mohit", label: "Mohit", gender: "male" },
  { id: "kavitha", label: "Kavitha", gender: "female" },
  { id: "rehan", label: "Rehan", gender: "male" },
  { id: "soham", label: "Soham", gender: "male" },
  { id: "rupali", label: "Rupali", gender: "female" },
];

const BY_ID = new Map(VOICES.map((v) => [v.id, v]));

export const isValidVoice = (id: string): boolean => BY_ID.has(id);

export const getVoice = (id: string): Voice | undefined => BY_ID.get(id);

export const voicesForGender = (gender: Gender): Voice[] =>
  VOICES.filter((v) => v.gender === gender);

// The default speaker we assign to a character before the user picks one.
export const defaultVoiceForGender = (gender: Gender): string =>
  gender === "female" ? "ritu" : DEFAULT_VOICE;
