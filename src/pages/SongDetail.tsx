import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Song } from "../types";
import { ChordSheetView } from "../components/ChordSheetView";
import { TransposePanel } from "../components/TransposePanel";
import { Icon } from "../components/Icon";
import { SongCover } from "../components/SongCover";
import { formatKey, keyDistance, shiftKey, type Accidental, type Notation } from "../lib/transpose";

export function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetKey, setTargetKey] = useState("DO");
  const [accidental, setAccidental] = useState<Accidental>("sharp");
  const [notation, setNotation] = useState<Notation>("latin");
  const [showTranspose, setShowTranspose] = useState(false);
  const keyRef = useRef<HTMLSpanElement>(null);

  /** Reinicia la animacion del tono para que lata en cada cambio, no solo el primero. */
  const beat = () => {
    const el = keyRef.current;
    if (!el) return;
    el.classList.remove("beat");
    void el.offsetWidth;
    el.classList.add("beat");
  };

  useEffect(() => {
    if (!id) return;
    api
      .getSong(id)
      .then((s) => {
        setSong(s);
        const songNotation = s.notation ?? "latin";
        setNotation(songNotation);
        setTargetKey(formatKey(s.originalScale || "DO", "sharp", songNotation));
      })
      .catch((e) => setError(e.message));
  }, [id]);

  // Cambiar de grafia o de cifrado reescribe la tonalidad actual, no la resetea.
  const handleAccidental = (next: Accidental) => {
    setAccidental(next);
    setTargetKey((key) => formatKey(key, next, notation));
  };

  const handleNotation = (next: Notation) => {
    setNotation(next);
    setTargetKey((key) => formatKey(key, accidental, next));
  };

  if (error) return <div className="empty-state">{error}</div>;
  if (!song) return <div className="empty-state">Cargando la canción…</div>;

  const originalKey = formatKey(song.originalScale || "DO", accidental, notation);
  const steps = keyDistance(originalKey, targetKey);
  const isOriginal = steps === 0;

  return (
    <div className="song-viewer">
      <button className="icon-btn back-btn no-print" aria-label="Volver" onClick={() => navigate(-1)}>
        <Icon name="back" size={20} />
      </button>

      <header className="song-hero">
        <SongCover seed={song.id} className="song-hero-art" />
        <div className="song-hero-info">
          <span className="song-hero-eyebrow">Canción</span>
          <h1 className="song-hero-title">{song.title}</h1>
          <div className="song-hero-meta">
            <span className="song-hero-artist">{song.artist || "Desconocido"}</span>
            <span className="song-hero-count">{song.lyrics.lines.length} líneas</span>
          </div>
        </div>
      </header>

      {/* Barra de tono: queda a mano mientras se lee la hoja tocando. */}
      <div className="keybar no-print">
        <div className="keybar-readout">
          <span className="keybar-label">Tono</span>
          <span className="keybar-key" ref={keyRef} aria-live="polite">
            {targetKey}
          </span>
          {!isOriginal && (
            <span className="keybar-original">
              {steps > 0 ? `+${steps}` : steps} · original {originalKey}
            </span>
          )}
        </div>

        <div className="keybar-steppers">
          <button
            aria-label="Bajar un semitono"
            onClick={() => {
              setTargetKey((k) => shiftKey(k, -1, accidental, notation));
              beat();
            }}
          >
            −
          </button>
          <button
            aria-label="Subir un semitono"
            onClick={() => {
              setTargetKey((k) => shiftKey(k, 1, accidental, notation));
              beat();
            }}
          >
            +
          </button>
        </div>

        <div className="keybar-actions">
          {!isOriginal && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setTargetKey(originalKey);
                beat();
              }}
            >
              Restablecer
            </button>
          )}
          <button
            className="btn btn-secondary"
            aria-expanded={showTranspose}
            onClick={() => setShowTranspose((v) => !v)}
          >
            Todas las tonalidades
          </button>
        </div>
      </div>

      {showTranspose && (
        <TransposePanel
          targetKey={targetKey}
          accidental={accidental}
          notation={notation}
          onKeyChange={(k) => {
            setTargetKey(k);
            beat();
          }}
          onAccidentalChange={handleAccidental}
          onNotationChange={handleNotation}
        />
      )}

      <div className="lyrics-container">
        <ChordSheetView song={song} targetKey={targetKey} accidental={accidental} notation={notation} />
      </div>

      <div className="song-footer no-print">
        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Icon name="print" size={16} />
          Imprimir
        </button>
        {song.youtubeUrl && (
          <a className="btn btn-secondary" href={song.youtubeUrl} target="_blank" rel="noreferrer">
            Escuchar en YouTube
          </a>
        )}
      </div>
    </div>
  );
}
