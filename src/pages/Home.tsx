import { useMemo, useState } from "react";
import { useSongs, greeting } from "../lib/hooks";
import { SongCollection, ViewToggle, type ViewMode } from "../components/SongCollection";
import { QuickRow } from "../components/QuickCard";
import { Icon } from "../components/Icon";

export function Home() {
  const { songs, error } = useSongs();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<ViewMode>("grid");

  const filtered = useMemo(() => {
    if (!songs) return [];
    const q = query.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter(
      (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    );
  }, [songs, query]);

  const recent = useMemo(() => {
    if (!songs) return [];
    return [...songs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);
  }, [songs]);

  if (error) return <div className="empty-state">Error cargando canciones: {error}</div>;

  return (
    <div>
      <div className="page-hero">
        <h1 className="page-heading">{greeting()}</h1>
        <p className="page-subtext">{songs ? `${songs.length} canciones en la biblioteca` : "Cargando..."}</p>
      </div>

      <div className="search-row">
        <div className="search-bar">
          <span className="search-icon">
            <Icon name="search" size={16} />
          </span>
          <input
            className="search-input"
            type="text"
            placeholder="¿Que queres cantar hoy?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <ViewToggle mode={mode} onChange={setMode} />
      </div>

      {!query && recent.length > 0 && (
        <div className="shelf">
          <h2 className="section-title">Actualizadas recientemente</h2>
          <QuickRow songs={recent} />
        </div>
      )}

      <div className="shelf">
        <h2 className="section-title">{query ? "Resultados" : "Toda la biblioteca"}</h2>
        <SongCollection songs={filtered} mode={mode} />
      </div>
    </div>
  );
}
