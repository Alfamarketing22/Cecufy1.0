import { useNavigate } from "react-router-dom";
import type { Song } from "../types";
import { Icon } from "./Icon";
import { SongCover, hueStyle } from "./SongCover";

export function QuickCard({ song, index = 0 }: { song: Song; index?: number }) {
  const navigate = useNavigate();
  return (
    <button
      className="quick-card enter"
      style={{ ...hueStyle(song.id), ["--i" as string]: Math.min(index, 14) }}
      onClick={() => navigate(`/canciones/${song.id}`)}
    >
      <SongCover className="quick-cover" />
      <span className="quick-title">{song.title}</span>
      <span className="btn-play quick-play" aria-label={`Reproducir ${song.title}`}>
        <Icon name="play" size={16} />
      </span>
    </button>
  );
}

export function QuickRow({ songs }: { songs: Song[] }) {
  return (
    <div className="quick-row">
      {songs.map((song, i) => (
        <QuickCard key={song.id} song={song} index={i} />
      ))}
    </div>
  );
}
