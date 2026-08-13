import { useEffect, useRef, useState } from "react";
import type { Song, LyricLine } from "../types";
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
  const hasChords = line.chords.length > 0;
  return (
    <div className="lyrics-line">
      {hasChords ? (
        <div className="chords-row">
          {line.chords.map((token, i) => (
            <span key={i} className="chord" style={{ left: `${token.position}ch` }}>
              {transposeChord(token.chord, targetKey, accidental, notation)}
            </span>
          ))}
        </div>
      ) : (
        <div className="chords-row chord-placeholder" />
      )}
      <div className="text-row">{line.text || " "}</div>
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
  const sheetRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // La letra prioriza tamaño legible, no evitar el scroll a toda costa
  // (estilo Cifra Club): el font-size queda fijo por CSS y una linea larga
  // simplemente se desliza. Esto solo marca cuando hay mas para el costado.
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 2);
      setCanScrollRight(el.scrollLeft < maxScroll - 2);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      resizeObserver.disconnect();
    };
  }, [song.id, targetKey, accidental, notation]);

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
    <div
      className={`lyrics-scroll${canScrollLeft ? " can-scroll-left" : ""}${
        canScrollRight ? " can-scroll-right" : ""
      }`}
    >
      <div className="lyrics-sheet" ref={sheetRef}>
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
    </div>
  );
}
