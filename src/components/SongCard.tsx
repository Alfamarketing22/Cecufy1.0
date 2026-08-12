import { useNavigate } from "react-router-dom";
import type { Song } from "../types";
import { Icon } from "./Icon";
import { SongCover, hueStyle } from "./SongCover";
import { formatKey } from "../lib/transpose";

/** Tono mostrado en el cifrado propio de la cancion. */
function displayScale(song: Song): string {
  return song.originalScale ? formatKey(song.originalScale, "sharp", song.notation ?? "latin") : "";
}

/** Escalona la entrada de la grilla sin que la ultima tarjeta tarde una eternidad. */
function stagger(index: number): React.CSSProperties {
  return { ["--i" as string]: Math.min(index, 14) };
}

export function SongCard({ song, index = 0 }: { song: Song; index?: number }) {
  const navigate = useNavigate();
  return (
    <button
      className="song-card enter"
      style={{ ...hueStyle(song.id), ...stagger(index) }}
      onClick={() => navigate(`/canciones/${song.id}`)}
    >
      <SongCover className="song-card-cover" />
      <h3 className="song-card-title">{song.title}</h3>
      <span className="song-card-artist">{song.artist || "Desconocido"}</span>
      {song.originalScale && <span className="scale-badge">{displayScale(song)}</span>}
      <span className="btn-play" aria-label={`Reproducir ${song.title}`}>
        <Icon name="play" size={18} />
      </span>
    </button>
  );
}

export function SongListRow({ song, index = 0 }: { song: Song; index?: number }) {
  const navigate = useNavigate();
  return (
    <button
      className="song-list-row enter"
      style={{ ...hueStyle(song.id), ...stagger(index) }}
      onClick={() => navigate(`/canciones/${song.id}`)}
    >
      <span className="song-list-main">
        <SongCover className="song-list-cover" />
        <span>
          <div className="song-list-title">{song.title}</div>
          <div className="song-list-artist">{song.artist || "Desconocido"}</div>
        </span>
      </span>
      {song.originalScale && <span className="song-list-scale">{displayScale(song)}</span>}
    </button>
  );
}
