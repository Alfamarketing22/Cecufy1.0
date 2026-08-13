import { useState } from "react";
import type { Notation, Song, SongInput } from "../types";
import { formatKey, majorKeys, type Accidental } from "../lib/transpose";
import {
  parseSongText,
  serializeSongText,
  type ChordInputMode,
  type ChordTextOptions,
} from "../lib/chordPro";
import { LyricsEditor } from "./LyricsEditor";

export function SongEditor({
  song,
  onSave,
  onCancel,
}: {
  song?: Song;
  onSave: (input: SongInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(song?.title ?? "");
  const [artist, setArtist] = useState(song?.artist ?? "");
  const [notation, setNotation] = useState<Notation>(song?.notation ?? "latin");
  const [accidental] = useState<Accidental>("sharp");
  const [originalScale, setOriginalScale] = useState(song?.originalScale ?? "DO");
  const [youtubeUrl, setYoutubeUrl] = useState(song?.youtubeUrl ?? "");
  const [mode, setMode] = useState<ChordInputMode>("chord");
  const [text, setText] = useState(
    song
      ? serializeSongText(song.lyrics, {
          mode: "chord",
          tonic: song.originalScale || "DO",
          notation: song.notation ?? "latin",
          accidental: "sharp",
        })
      : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textOptions = (overrides: ChordTextOptions = {}): ChordTextOptions => ({
    mode,
    tonic: originalScale,
    notation,
    accidental,
    ...overrides,
  });

  /**
   * Reescribe lo ya tipeado: se reinterpreta con los valores viejos y se vuelve
   * a emitir con los nuevos, para que los acordes sigan sonando igual.
   */
  const rewrite = (next: ChordTextOptions) => {
    const lyrics = parseSongText(text, textOptions());
    setText(serializeSongText(lyrics, textOptions(next)));
  };

  const handleModeChange = (next: ChordInputMode) => {
    if (next === mode) return;
    rewrite({ mode: next });
    setMode(next);
  };

  /**
   * El tono NO reescribe el texto a proposito: los acordes tipeados son
   * literales. Declarar el tono solo define contra que se calculan los grados
   * al guardar, asi que se puede escribir primero y elegir el tono despues.
   *
   * Se guarda siempre en cifrado latino aunque se muestre en americano, para
   * que el valor almacenado no dependa de como estaba viendo quien lo edito.
   */
  const handleScaleChange = (displayed: string) => {
    setOriginalScale(formatKey(displayed, accidental, "latin"));
  };

  const handleNotationChange = (next: Notation) => {
    if (next === notation) return;
    rewrite({ notation: next });
    setNotation(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("El titulo es obligatorio");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        artist: artist.trim(),
        originalScale,
        notation,
        youtubeUrl: youtubeUrl.trim(),
        lyrics: parseSongText(text, textOptions()),
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const keyOptions = majorKeys(accidental, notation);
  const displayedScale = formatKey(originalScale, accidental, notation);
  // Ejemplo de acorde con bajo en el cifrado que esta usando la persona.
  const bassExample = notation === "american" ? "A/E" : "LA/MI";

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>Titulo</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="form-field">
        <label>Artista</label>
        <input value={artist} onChange={(e) => setArtist(e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Cifrado</label>
          <select value={notation} onChange={(e) => handleNotationChange(e.target.value as Notation)}>
            <option value="latin">Normal (DO RE MI)</option>
            <option value="american">Americano (C D E)</option>
          </select>
        </div>
        <div className="form-field">
          <label>Tono original</label>
          <select value={displayedScale} onChange={(e) => handleScaleChange(e.target.value)}>
            {keyOptions.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Los acordes los escribo en</label>
          <select value={mode} onChange={(e) => handleModeChange(e.target.value as ChordInputMode)}>
            <option value="chord">Cifrado ({notation === "latin" ? "SOL, REm" : "G, Dm"})</option>
            <option value="degree">Grados (I, IV, VIm)</option>
          </select>
        </div>
      </div>

      <div className="form-field">
        <label>Enlace de YouTube (opcional)</label>
        <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
      </div>

      <div className="form-field">
        <label>Letra y acordes</label>
        <LyricsEditor
          value={text}
          onChange={setText}
          mode={mode}
          tonic={originalScale}
          notation={notation}
          accidental={accidental}
        />
        <span style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>
          {mode === "chord" ? (
            <>
              Escribí los acordes tal como suenan en <strong>{displayedScale}</strong>. Se guardan como
              grados relativos al tono, así la canción se puede transponer después. Para un acorde con
              bajo usá la barra: <code>{bassExample}</code> — el bajo también se transpone.
            </>
          ) : (
            <>
              Grados relativos al tono: <code>I</code>, <code>IV</code>, <code>V</code>, <code>VIm</code>,{" "}
              <code>IVmaj7</code>, <code>bVII</code>. Con bajo: <code>I/V</code>.
            </>
          )}
        </span>
      </div>

      {error && <div style={{ color: "var(--error)", marginBottom: 12 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" className="btn" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
