import type { ChordToken } from "../types";

export type Accidental = "sharp" | "flat";
/** "latin" = cifrado normal (DO RE MI) · "american" = cifrado americano (C D E) */
export type Notation = "latin" | "american";

const LATIN_SHARP = ["DO", "DO#", "RE", "RE#", "MI", "FA", "FA#", "SOL", "SOL#", "LA", "LA#", "SI"];
const LATIN_FLAT = ["DO", "REb", "RE", "MIb", "MI", "FA", "SOLb", "SOL", "LAb", "LA", "SIb", "SI"];
const AMERICAN_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const AMERICAN_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const NOTE_TABLES: Record<Notation, Record<Accidental, string[]>> = {
  latin: { sharp: LATIN_SHARP, flat: LATIN_FLAT },
  american: { sharp: AMERICAN_SHARP, flat: AMERICAN_FLAT },
};

/** Nombres naturales de ambos cifrados, ordenados de mas largo a mas corto
 *  para que "DO" gane sobre "D" y "SOL" sobre "S" al parsear. */
const NATURALS: [string, number][] = [
  ["SOL", 7],
  ["DO", 0],
  ["RE", 2],
  ["MI", 4],
  ["FA", 5],
  ["LA", 9],
  ["SI", 11],
  ["C", 0],
  ["D", 2],
  ["E", 4],
  ["F", 5],
  ["G", 7],
  ["A", 9],
  ["B", 11],
];

const DEGREE_SEMITONES: Record<string, number> = {
  I: 0,
  II: 2,
  III: 4,
  IV: 5,
  V: 7,
  VI: 9,
  VII: 11,
};

const ROMAN_ORDER = ["VII", "VI", "V", "IV", "III", "II", "I"];

/**
 * Convierte un nombre de nota de cualquiera de los dos cifrados a semitono.
 * Parsea primero la nota natural (match mas largo) y despues la alteracion,
 * porque "B" es a la vez SI natural y el sufijo de bemol ("SIb", "Db").
 */
export function noteToSemitone(note: string): number {
  const raw = note.trim().toUpperCase();
  const found = NATURALS.find(([name]) => raw.startsWith(name));
  if (!found) return 0;
  const [name, semitone] = found;
  const rest = raw.slice(name.length);
  let offset = 0;
  if (rest.startsWith("#")) offset = 1;
  else if (rest.startsWith("B")) offset = -1;
  return (((semitone + offset) % 12) + 12) % 12;
}

export function semitoneToNote(
  semitone: number,
  accidental: Accidental,
  notation: Notation = "latin"
): string {
  const idx = ((semitone % 12) + 12) % 12;
  return NOTE_TABLES[notation][accidental][idx];
}

/** Separa "LAm" -> { root: "LA", minor: true }. Tambien sirve para "Am". */
export function parseKey(key: string): { root: string; minor: boolean } {
  const trimmed = key.trim();
  if (trimmed.endsWith("m")) return { root: trimmed.slice(0, -1), minor: true };
  return { root: trimmed, minor: false };
}

/** Reescribe una tonalidad en otra grafia y/o cifrado, conservando el modo. */
export function formatKey(key: string, accidental: Accidental, notation: Notation = "latin"): string {
  const { root, minor } = parseKey(key);
  const name = semitoneToNote(noteToSemitone(root), accidental, notation);
  return minor ? `${name}m` : name;
}

/** Alias historico: reescribir solo cambiando la grafia de alteraciones. */
export const respellKey = formatKey;

/** Mueve la tonalidad `steps` semitonos, conservando el modo y la grafia. */
export function shiftKey(
  key: string,
  steps: number,
  accidental: Accidental,
  notation: Notation = "latin"
): string {
  const { root, minor } = parseKey(key);
  const name = semitoneToNote(noteToSemitone(root) + steps, accidental, notation);
  return minor ? `${name}m` : name;
}

/** Distancia en semitonos de `from` a `to`, en el rango -6..+6. */
export function keyDistance(from: string, to: string): number {
  const raw = (((noteToSemitone(parseKey(to).root) - noteToSemitone(parseKey(from).root)) % 12) + 12) % 12;
  return raw > 6 ? raw - 12 : raw;
}

/** Tonalidades mayores en el orden cromatico del selector. */
export function majorKeys(accidental: Accidental, notation: Notation = "latin"): string[] {
  return [...NOTE_TABLES[notation][accidental]];
}

/** Tonalidades menores: misma raiz cromatica, sufijo "m". */
export function minorKeys(accidental: Accidental, notation: Notation = "latin"): string[] {
  return majorKeys(accidental, notation).map((n) => `${n}m`);
}

function parseRomanToken(token: string): { degreeSemitone: number; suffix: string } | null {
  let rest = token.trim();
  let accidental = 0;
  if (rest.startsWith("b")) {
    accidental = -1;
    rest = rest.slice(1);
  } else if (rest.startsWith("#")) {
    accidental = 1;
    rest = rest.slice(1);
  }
  const numeral = ROMAN_ORDER.find((r) => rest.startsWith(r));
  if (!numeral) return null;
  const suffix = rest.slice(numeral.length);
  return { degreeSemitone: DEGREE_SEMITONES[numeral] + accidental, suffix };
}

/**
 * Convierte un grado en numeros romanos al acorde real para la tonica elegida.
 * Los grados son cromaticos y absolutos respecto de la tonica, asi que solo
 * importa la raiz de `targetKey` (el sufijo "m" describe el modo de la cancion).
 */
export function transposeChord(
  chord: string,
  targetKey: string,
  accidental: Accidental = "sharp",
  notation: Notation = "latin"
): string {
  const parsed = parseRomanToken(chord);
  if (!parsed) return chord;
  const { root } = parseKey(targetKey);
  const noteName = semitoneToNote(noteToSemitone(root) + parsed.degreeSemitone, accidental, notation);
  return `${noteName}${parsed.suffix}`;
}

export function transposeChordToken(
  token: ChordToken,
  targetKey: string,
  accidental: Accidental = "sharp",
  notation: Notation = "latin"
): ChordToken {
  return { ...token, displayChord: transposeChord(token.chord, targetKey, accidental, notation) };
}

/* ---------- Camino inverso: acorde real -> grado ---------- */

/** Grado en romanos para cada intervalo en semitonos desde la tonica. */
const SEMITONE_TO_DEGREE = [
  "I",
  "bII",
  "II",
  "bIII",
  "III",
  "IV",
  "#IV",
  "V",
  "bVI",
  "VI",
  "bVII",
  "VII",
];

/**
 * Separa un acorde real en raiz y sufijo: "SOLmaj7" -> { root: "SOL", suffix: "maj7" },
 * "G#m" -> { root: "G#", suffix: "m" }. Devuelve null si no empieza con una nota.
 */
export function splitChord(chord: string): { root: string; suffix: string } | null {
  const raw = chord.trim();
  if (!raw) return null;
  // Un grado gana sobre la lectura como acorde: sin esto "bVII" se leeria
  // como la nota SIb seguida de un sufijo "VII".
  if (parseRomanToken(raw)) return null;
  const upper = raw.toUpperCase();
  const natural = NATURALS.find(([name]) => upper.startsWith(name));
  if (!natural) return null;
  let length = natural[0].length;
  // La alteracion es parte de la raiz: "SOLb" es raiz, no sufijo "b".
  const next = raw[length];
  if (next === "#" || next === "b" || next === "B") length += 1;
  return { root: raw.slice(0, length), suffix: raw.slice(length) };
}

/**
 * Convierte un acorde real al grado relativo a la tonica.
 * Es el inverso de `transposeChord`: "SOL" en tono DO -> "V", "REm" -> "IIm".
 * Si el texto no parece un acorde se devuelve tal cual, para no perder lo escrito.
 */
export function chordToDegree(chord: string, tonicKey: string): string {
  const parts = splitChord(chord);
  if (!parts) return chord;
  const { root } = parseKey(tonicKey);
  const interval = (((noteToSemitone(parts.root) - noteToSemitone(root)) % 12) + 12) % 12;
  return `${SEMITONE_TO_DEGREE[interval]}${parts.suffix}`;
}

/** True si el texto arranca con un nombre de nota valido de cualquiera de los cifrados. */
export function looksLikeChord(text: string): boolean {
  return splitChord(text) !== null;
}

/** Lista plana usada por selectores simples (editor, cancioneros). */
export const KEYS = LATIN_SHARP;
