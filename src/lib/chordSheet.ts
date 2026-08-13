import type { ChordToken, LyricLine } from "../types";
import { transposeChord, type Accidental, type Notation } from "./transpose";

export type ChordWord = {
  chords: ChordToken[];
  text: string;
};

/**
 * Parte una linea en palabras reales (separadas por espacio), cada una con
 * los acordes que le corresponden por posicion. Envolver por PALABRA (y no
 * por el tramo entero entre dos acordes) es lo que permite que una linea
 * larga se acomode sola en pantallas angostas: si se agrupara todo el texto
 * entre dos acordes como un solo bloque, un tramo largo sin acordes cercanos
 * seguiria sin poder partirse y desbordaria igual.
 */
export function splitLineIntoWords(line: LyricLine): ChordWord[] {
  const chordsSorted = [...line.chords].sort((a, b) => a.position - b.position);
  const wordMatches = Array.from(line.text.matchAll(/\S+/g));

  if (wordMatches.length === 0) {
    // Linea sin texto (separador en blanco, o solo espacios).
    return chordsSorted.length > 0 ? [{ chords: chordsSorted, text: "" }] : [{ chords: [], text: line.text }];
  }

  const words: ChordWord[] = wordMatches.map((m) => ({ chords: [], text: m[0] }));
  const ends = wordMatches.map((m) => m.index! + m[0].length);

  let wi = 0;
  for (const chord of chordsSorted) {
    while (wi < words.length - 1 && chord.position >= ends[wi]) wi++;
    words[wi].chords.push(chord);
  }

  return words;
}

/**
 * Arma la fila de acordes como texto plano, rellenando con espacios hasta la
 * posicion de cada acorde. Se usa en la vista de impresion, donde no hay
 * posicionamiento absoluto.
 */
export function buildChordRow(
  chords: ChordToken[],
  targetKey: string,
  accidental: Accidental = "sharp",
  notation: Notation = "latin"
): string {
  if (chords.length === 0) return "";
  const sorted = [...chords].sort((a, b) => a.position - b.position);
  const chars: string[] = [];
  for (const token of sorted) {
    const display = transposeChord(token.chord, targetKey, accidental, notation);
    let pos = token.position;
    if (pos < chars.length) {
      pos = chars.length + 1;
    }
    while (chars.length < pos) chars.push(" ");
    for (const ch of display) chars.push(ch);
  }
  return chars.join("");
}
