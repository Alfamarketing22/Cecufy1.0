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

/** Letra minima antes de resignarse y dejar que la linea se deslice. */
const MIN_FONT_PX = 9.5;

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

  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;

    const updateScrollFade = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 2);
      setCanScrollRight(el.scrollLeft < maxScroll - 2);
    };

    // Los acordes se ubican con `left: Nch`, una unidad ligada al ancho del
    // caracter en la tipografia monoespaciada actual. Por eso reducir el
    // font-size entero de la hoja reescala todo el sistema de coordenadas
    // sin romper la alineacion: es mas seguro que un transform: scale.
    const fitToWidth = () => {
      el.style.fontSize = ""; // vuelve al tamaño base de la hoja de estilos
      const available = el.clientWidth;
      const needed = el.scrollWidth;
      if (available <= 0 || needed <= available) return;

      const baseFontSize = parseFloat(getComputedStyle(el).fontSize);
      const scale = available / needed;
      const target = Math.max(MIN_FONT_PX, baseFontSize * scale);
      // Un pixel de margen: al re-envolver el texto en el nuevo tamaño el
      // ancho real puede variar unas decimas por redondeo de subpixeles.
      el.style.fontSize = `${(target - 0.3).toFixed(2)}px`;
    };

    const update = () => {
      fitToWidth();
      updateScrollFade();
    };

    update();
    el.addEventListener("scroll", updateScrollFade, { passive: true });

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollFade);
      resizeObserver.disconnect();
    };
    // Reevalua cuando cambia el tono/cifrado (los acordes cambian de ancho)
    // o la cancion mostrada.
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
