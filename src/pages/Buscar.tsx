import { useMemo, useState } from "react";
import { useSongs } from "../lib/hooks";
import { SongCollection, ViewToggle, type ViewMode } from "../components/SongCollection";
import { Icon } from "../components/Icon";

export function Buscar() {
  const { songs, error } = useSongs();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<ViewMode>("list");

  const filtered = useMemo(() => {
    if (!songs) return [];
    const q = query.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter(
      (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    );
  }, [songs, query]);

  if (error) return <div className="empty-state">Error cargando canciones: {error}</div>;

  return (
    <div>
      <div className="page-hero">
        <h1 className="page-heading">Buscar</h1>
        <p className="page-subtext">Busca por titulo o artista</p>
      </div>

      <div className="search-row">
        <div className="search-bar">
          <span className="search-icon">
            <Icon name="search" size={16} />
          </span>
          <input
            className="search-input"
            type="text"
            autoFocus
            placeholder="Titulo o artista..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ViewToggle mode={mode} onChange={setMode} />
      </div>

      {songs && <SongCollection songs={filtered} mode={mode} />}
    </div>
  );
}
