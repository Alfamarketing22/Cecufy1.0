import type { ChordToken } from "../types";
import { transposeChord, type Accidental, type Notation } from "./transpose";

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
