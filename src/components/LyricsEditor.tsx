import { useRef } from "react";
import { transposeChord, type Accidental, type Notation } from "../lib/transpose";
import type { ChordInputMode } from "../lib/chordPro";

/** Secciones frecuentes de una cancion de alabanza. */
const SECTIONS = [
  "intro",
  "estrofa",
  "pre-coro",
  "coro",
  "puente",
  "interludio",
  "instrumental",
  "final",
];

/** Grados de la escala mayor, para armar la paleta del tono elegido. */
const PALETTE_DEGREES = ["I", "IIm", "IIIm", "IV", "V", "VIm", "VIIdim", "bVII"];

export function LyricsEditor({
  value,
  onChange,
  mode,
  tonic,
  notation,
  accidental,
}: {
  value: string;
  onChange: (next: string) => void;
  mode: ChordInputMode;
  tonic: string;
  notation: Notation;
  accidental: Accidental;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  /**
   * Inserta texto en la posicion del cursor y deja el cursor donde indique
   * `caretOffset` (relativo al inicio de lo insertado).
   */
  const insert = (snippet: string, caretOffset = snippet.length, { onOwnLine = false } = {}) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const after = value.slice(end);

    // El encabezado tiene que quedar solo en su linea, con una libre debajo.
    const prefix = onOwnLine && before.length > 0 && !before.endsWith("\n") ? "\n" : "";
    const suffix = onOwnLine && !after.startsWith("\n") ? "\n" : "";

    const inserted = `${prefix}${snippet}${suffix}`;
    const next = `${before}${inserted}${after}`;
    onChange(next);

    const caret = start + prefix.length + caretOffset;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  /** Envuelve la seleccion en corchetes, o inserta unos vacios con el cursor dentro. */
  const insertBrackets = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const snippet = `[${selected}]`;
    const next = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
    onChange(next);
    const caret = start + 1 + selected.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  // Paleta de acordes reales del tono elegido (solo en modo cifrado).
  const palette =
    mode === "chord"
      ? PALETTE_DEGREES.map((degree) => ({
          degree,
          label: transposeChord(degree, tonic, accidental, notation),
        }))
      : PALETTE_DEGREES.map((degree) => ({ degree, label: degree }));

  return (
    <div className="lyrics-editor">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <span className="toolbar-label">Secciones</span>
          <div className="toolbar-buttons">
            {SECTIONS.map((name) => (
              <button
                key={name}
                type="button"
                className="chip-btn"
                onClick={() => insert(`## ${name}`, `## ${name}`.length, { onOwnLine: true })}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-group">
          <span className="toolbar-label">Acordes</span>
          <div className="toolbar-buttons">
            <button type="button" className="chip-btn chip-btn-accent" onClick={insertBrackets}>
              [ ] corchetes
            </button>
            {palette.map(({ degree, label }) => (
              <button
                key={degree}
                type="button"
                className="chip-btn chip-mono"
                title={mode === "chord" ? `Grado ${degree}` : label}
                onClick={() => insert(`[${label}]`)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <textarea
        ref={ref}
        className="lyrics-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder={
          mode === "chord"
            ? `## intro\n[${transposeChord("I", tonic, accidental, notation)}]  [${transposeChord(
                "IV",
                tonic,
                accidental,
                notation
              )}]\n\n## estrofa\n[${transposeChord(
                "I",
                tonic,
                accidental,
                notation
              )}]Escribi la letra aca[${transposeChord("IV", tonic, accidental, notation)}]y sigue`
            : `## intro\n[I]  [IV]\n\n## estrofa\n[I]Escribi la letra aca[IV]y sigue`
        }
      />
    </div>
  );
}
