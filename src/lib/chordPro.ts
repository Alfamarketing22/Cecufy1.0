import type { Lyrics, LyricLine, LyricSection, ChordToken } from "../types";
import { chordToDegree, transposeChord, type Accidental, type Notation } from "./transpose";

const CHORD_TOKEN_RE = /\[([^\]]+)\]/g;

/**
 * Como se escriben los acordes dentro de los corchetes en el editor.
 * - "chord": acordes reales ("SOL", "REm", "G", "Am7"). Se guardan como grados.
 * - "degree": grados directos ("I", "VIm"). Se guardan tal cual.
 * En ambos casos el modelo de datos almacena grados, que es lo que permite
 * transponer despues a cualquier tonalidad.
 */
export type ChordInputMode = "chord" | "degree";

export type ChordTextOptions = {
  mode?: ChordInputMode;
  /** Tonica de la cancion, necesaria para convertir entre acorde y grado. */
  tonic?: string;
  notation?: Notation;
  accidental?: Accidental;
};

function parseLine(raw: string, toStored: (token: string) => string): LyricLine {
  const chords: ChordToken[] = [];
  let text = "";
  let lastIndex = 0;
  CHORD_TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CHORD_TOKEN_RE.exec(raw))) {
    text += raw.slice(lastIndex, match.index);
    const stored = toStored(match[1].trim());
    chords.push({ chord: stored, position: text.length, displayChord: stored, isPostFraseo: false });
    lastIndex = match.index + match[0].length;
  }
  text += raw.slice(lastIndex);
  return { text, chords };
}

function serializeLine(line: LyricLine, fromStored: (token: string) => string): string {
  const sorted = [...line.chords].sort((a, b) => a.position - b.position);
  let out = "";
  let cursor = 0;
  for (const token of sorted) {
    const pos = Math.min(Math.max(token.position, cursor), line.text.length);
    out += line.text.slice(cursor, pos);
    out += `[${fromStored(token.chord)}]`;
    cursor = pos;
  }
  out += line.text.slice(cursor);
  return out;
}

/**
 * Formato de edicion en texto plano:
 *   ## nombre-seccion
 *   [SOL]Letra de la linea[DO]mas letra
 *
 * Los encabezados "## seccion" delimitan secciones; las lineas de letra
 * se acumulan en el arreglo `lines` y cada seccion referencia su rango.
 */
export function parseSongText(raw: string, options: ChordTextOptions = {}): Lyrics {
  const { mode = "degree", tonic = "DO" } = options;
  const toStored = mode === "chord" ? (t: string) => chordToDegree(t, tonic) : (t: string) => t;

  const rawLines = raw.replace(/\r\n/g, "\n").split("\n");
  const lines: LyricLine[] = [];
  const sections: LyricSection[] = [];
  let currentSection: { name: string; startLine: number } | null = null;

  const closeSection = (endLine: number) => {
    if (currentSection && endLine >= currentSection.startLine) {
      sections.push({ name: currentSection.name, startLine: currentSection.startLine, endLine });
    }
  };

  for (const rawLine of rawLines) {
    const headerMatch = rawLine.match(/^##\s*(.+?)\s*$/);
    if (headerMatch) {
      closeSection(lines.length - 1);
      currentSection = { name: headerMatch[1], startLine: lines.length };
      continue;
    }
    lines.push(parseLine(rawLine, toStored));
  }
  closeSection(lines.length - 1);

  return { lines, sections };
}

export function serializeSongText(lyrics: Lyrics, options: ChordTextOptions = {}): string {
  const { mode = "degree", tonic = "DO", notation = "latin", accidental = "sharp" } = options;
  const fromStored =
    mode === "chord" ? (t: string) => transposeChord(t, tonic, accidental, notation) : (t: string) => t;

  const out: string[] = [];
  const sectionByStart = new Map(lyrics.sections.map((s) => [s.startLine, s.name]));
  lyrics.lines.forEach((line, idx) => {
    if (sectionByStart.has(idx)) {
      if (idx !== 0) out.push("");
      out.push(`## ${sectionByStart.get(idx)}`);
    }
    out.push(serializeLine(line, fromStored));
  });
  return out.join("\n");
}
