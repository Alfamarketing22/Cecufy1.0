import type { Song, LyricLine } from "../types";
import { splitLineIntoWords } from "../lib/chordSheet";
import { transposeChord, type Accidental, type Notation } from "../lib/transpose";

function LyricLineView({
  line,
  targetKey,
  accidental,
  notation,
}: {
  line: LyricLine;
  targetKey: string;
  accidental: Accidental;
  notation: Notation;
}) {
  const words = splitLineIntoWords(line);
  const isBlank = words.every((w) => w.chords.length === 0 && w.text.trim() === "");

  if (isBlank) {
    return <div className="chord-line-spacer" aria-hidden="true" />;
  }

  return (
    <div className="chord-line">
      {words.map((word, i) => (
        <span className="chord-word" key={i}>
          <span className="chord-word-chord">
            {word.chords.length > 0
              ? word.chords.map((c) => transposeChord(c.chord, targetKey, accidental, notation)).join(" ")
              : " "}
          </span>
          <span className="chord-word-text">{word.text}</span>
        </span>
      ))}
    </div>
  );
}

export function ChordSheetView({
  song,
  targetKey,
  accidental = "sharp",
  notation = "latin",
}: {
  song: Song;
  targetKey: string;
  accidental?: Accidental;
  notation?: Notation;
}) {
  const { lines, sections } = song.lyrics;

  // Agrupa las lineas por seccion; lo que quede fuera de rango va a un bloque suelto.
  const ordered = [...sections].sort((a, b) => a.startLine - b.startLine);
  const claimed = new Set<number>();
  const blocks = ordered.map((section) => {
    const items: { index: number; line: LyricLine }[] = [];
    for (let i = section.startLine; i <= section.endLine && i < lines.length; i++) {
      if (claimed.has(i)) continue;
      claimed.add(i);
      items.push({ index: i, line: lines[i] });
    }
    return { name: section.name, items };
  });

  const orphans = lines
    .map((line, index) => ({ index, line }))
    .filter(({ index }) => !claimed.has(index));

  return (
    <div className="lyrics-sheet">
      {blocks.map(
        (block, i) =>
          block.items.length > 0 && (
            <section className="lyrics-section" key={`${block.name}-${i}`}>
              <div className="section-header">
                <span className="section-badge">{block.name}</span>
              </div>
              {block.items.map(({ index, line }) => (
                <LyricLineView
                  key={index}
                  line={line}
                  targetKey={targetKey}
                  accidental={accidental}
                  notation={notation}
                />
              ))}
            </section>
          )
      )}

      {orphans.length > 0 && (
        <section className="lyrics-section">
          {orphans.map(({ index, line }) => (
            <LyricLineView key={index} line={line} targetKey={targetKey} accidental={accidental} notation={notation} />
          ))}
        </section>
      )}
    </div>
  );
}
