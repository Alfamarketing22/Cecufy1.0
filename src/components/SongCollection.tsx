import type { Song } from "../types";
import { SongCard, SongListRow } from "./SongCard";
import { Icon } from "./Icon";

export type ViewMode = "grid" | "list";

export function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
  return (
    <div className="view-toggle">
      <button className={mode === "grid" ? "active" : ""} onClick={() => onChange("grid")} aria-label="Vista de grilla">
        <Icon name="grid" size={16} />
      </button>
      <button className={mode === "list" ? "active" : ""} onClick={() => onChange("list")} aria-label="Vista de lista">
        <Icon name="list" size={16} />
      </button>
    </div>
  );
}

export function SongCollection({ songs, mode }: { songs: Song[]; mode: ViewMode }) {
  if (songs.length === 0) {
    return <div className="empty-state">No hay canciones para mostrar.</div>;
  }
  if (mode === "grid") {
    return (
      <div className="song-grid">
        {songs.map((song, i) => (
          <SongCard key={song.id} song={song} index={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="song-list">
      {songs.map((song, i) => (
        <SongListRow key={song.id} song={song} index={i} />
      ))}
    </div>
  );
}
