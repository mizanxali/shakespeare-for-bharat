// Resolves a speaker name to a gender so we can offer gender-appropriate TTS
// voices. Shakespeare's casts are overwhelmingly male, so the strategy is:
// treat a name as female only when a title keyword (LADY, QUEEN, NURSE, …) or a
// known female character name says so, and default everything else to male.
//
// This is a best-effort heuristic over ~1000 distinct speakers; it will miss
// obscure cases, but the voice picker lets the reader override any character.

export type Gender = "male" | "female";

// Title / role words that mark a speaker female regardless of the rest of the
// name (matched as whole words, case-insensitive).
const FEMALE_KEYWORDS = [
  "LADY",
  "QUEEN",
  "DUCHESS",
  "COUNTESS",
  "PRINCESS",
  "MISTRESS",
  "NURSE",
  "WIDOW",
  "ABBESS",
  "BAWD",
  "GENTLEWOMAN",
  "HOSTESS",
  "COURTEZAN",
  "WITCH",
  "DAUGHTER",
  "MOTHER",
  "WIFE",
  "GIRL",
  "NUN",
  "MAID",
];

const FEMALE_KEYWORD_RE = new RegExp(`\\b(${FEMALE_KEYWORDS.join("|")})\\b`, "i");

// Named female characters across the plays (and the female goddesses that speak).
// Matched against the full name or its first word.
const FEMALE_NAMES = new Set([
  "ADRIANA", "AEMELIA", "AEMILIA", "ALICE", "ANNE", "AUDREY", "BEATRICE",
  "BIANCA", "BLANCH", "BONA", "CALPURNIA", "CASSANDRA", "CELIA", "CERES",
  "CHARMIAN", "CLEOPATRA", "CONSTANCE", "CORDELIA", "CRESSIDA", "DESDEMONA",
  "DIANA", "DIONYZA", "DORCAS", "ELINOR", "EMILIA", "FRANCISCA", "GONERIL",
  "HECATE", "HELEN", "HELENA", "HERMIA", "HERMIONE", "HERNIA", "HERO",
  "HIPPOLYTA", "HORTENSIA", "IMOGEN", "IRAS", "IRIS", "ISABEL", "ISABELLA",
  "JAQUENETTA", "JESSICA", "JOAN", "JULIA", "JULIET", "JUNO", "KATARINA",
  "KATHARINA", "KATHARINE", "KATHERINA", "LAVINIA", "LUCE", "LUCETTA",
  "LUCIANA", "LYCHORIDA", "MARGARET", "MARIA", "MARIANA", "MARINA", "MIRANDA",
  "MOPSA", "NERISSA", "OCTAVIA", "OLIVIA", "OPHELIA", "PATIENCE", "PAULINA",
  "PERDITA", "PHEBE", "PHRYNIA", "PORTIA", "REGAN", "ROSALIND", "ROSALINE",
  "SILVIA", "TAMORA", "THAISA", "TIMANDRA", "TITANIA", "URSULA", "VALERIA",
  "VIOLA", "VIRGILIA", "VOLUMNIA",
]);

export function characterGender(speaker: string): Gender {
  const name = speaker.trim().toUpperCase();
  if (!name) return "male";
  if (FEMALE_KEYWORD_RE.test(name)) return "female";
  if (FEMALE_NAMES.has(name)) return "female";
  const first = name.split(/\s+/)[0];
  if (FEMALE_NAMES.has(first)) return "female";
  return "male";
}
