import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Song, Songbook } from "../types";
import { buildChordRow } from "../lib/chordSheet";
import { formatKey } from "../lib/transpose";

export function SongbookPrint() {
  const { id } = useParams<{ id: string }>();
  const [songbook, setSongbook] = useState<Songbook | null>(null);
  const [songs, setSongs] = useState<Map<string, Song>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getSongbook(id)
      .then(async (sb) => {
        setSongbook(sb);
        const entries = await Promise.all(sb.songs.map((s) => api.getSong(s.songId)));
        setSongs(new Map(entries.map((s) => [s.id, s])));
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div style={{ padding: 24 }}>{error}</div>;
  if (!songbook) return <div style={{ padding: 24 }}>Cargando...</div>;

  return (
    <div className="print-sheet">
      <style>{`
        body { background: white; }
        .print-sheet { max-width: 800px; margin: 0 auto; padding: 32px; font-family: var(--font-sans); color: black; }
        .print-sheet h1 { margin-bottom: 4px; }
        .print-song { margin-bottom: 32px; page-break-inside: avoid; }
        .print-song h2 { border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; }
        .print-chord-line { font-family: var(--font-mono); white-space: pre; margin-bottom: 6px; }
        .print-chord-row { color: #444; font-weight: 700; }
        @media print {
          .no-print { display: none; }
        }
      `}</style>
      <button className="btn no-print" onClick={() => window.print()} style={{ marginBottom: 16 }}>
        Imprimir
      </button>
      <h1>{songbook.title}</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>{songbook.songs.length} canciones</p>

      {songbook.songs.map((entry) => {
        const song = songs.get(entry.songId);
        if (!song) return null;
        return (
          <div className="print-song" key={entry.songId}>
            <h2>
              {song.title} — {formatKey(entry.scale, "sharp", song.notation ?? "latin")}
            </h2>
            <div style={{ color: "#666", marginBottom: 8 }}>{song.artist}</div>
            {song.lyrics.lines.map((line, idx) => {
              const chordRow = buildChordRow(line.chords, entry.scale, "sharp", song.notation ?? "latin");
              return (
                <div key={idx} className="print-chord-line">
                  {chordRow && <div className="print-chord-row">{chordRow}</div>}
                  <div>{line.text || " "}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
