import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api, isAdminLoggedIn } from "../lib/api";
import { useSongs } from "../lib/hooks";
import type { Songbook } from "../types";
import { Icon } from "../components/Icon";

export function SongbookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { songs } = useSongs();
  const [songbook, setSongbook] = useState<Songbook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addQuery, setAddQuery] = useState("");
  const canEdit = isAdminLoggedIn();

  const load = () => {
    if (!id) return;
    api.getSongbook(id).then(setSongbook).catch((e) => setError(e.message));
  };

  useEffect(load, [id]);

  const songById = useMemo(() => new Map((songs ?? []).map((s) => [s.id, s])), [songs]);

  const addResults = useMemo(() => {
    if (!addQuery.trim() || !songs) return [];
    const q = addQuery.toLowerCase();
    const already = new Set(songbook?.songs.map((s) => s.songId));
    return songs
      .filter((s) => !already.has(s.id) && (s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [addQuery, songs, songbook]);

  const addSong = async (songId: string, scale: string) => {
    if (!songbook) return;
    const updated = await api.updateSongbook(songbook.id, {
      songs: [...songbook.songs, { songId, scale }],
    });
    setSongbook(updated);
    setAddQuery("");
  };

  const removeSong = async (songId: string) => {
    if (!songbook) return;
    const updated = await api.updateSongbook(songbook.id, {
      songs: songbook.songs.filter((s) => s.songId !== songId),
    });
    setSongbook(updated);
  };

  const handleDelete = async () => {
    if (!songbook || !window.confirm("¿Eliminar este cancionero?")) return;
    await api.deleteSongbook(songbook.id);
    navigate("/songbooks");
  };

  if (error) return <div className="empty-state">{error}</div>;
  if (!songbook) return <div className="empty-state">Cargando...</div>;

  return (
    <div>
      <button className="btn" onClick={() => navigate("/songbooks")} style={{ marginBottom: 16 }}>
        <Icon name="back" size={16} />
        Volver
      </button>

      <div className="page-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-heading">{songbook.title}</h1>
          <p className="page-subtext">{songbook.songs.length} canciones</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="btn" href={`/songbooks/${songbook.id}/print`} target="_blank" rel="noreferrer">
            <Icon name="print" size={16} />
            Imprimir
          </a>
          {canEdit && (
            <button className="btn btn-danger" onClick={handleDelete}>
              <Icon name="trash" size={16} />
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        {songbook.songs.length === 0 && <div className="empty-state">Todavia no agregaste canciones.</div>}
        <div className="song-list">
          {songbook.songs.map((entry) => {
            const song = songById.get(entry.songId);
            return (
              <div key={entry.songId} className="song-list-row">
                <Link to={`/canciones/${entry.songId}`}>
                  <div className="song-list-title">{song?.title ?? entry.songId}</div>
                  <div className="song-list-artist">{song?.artist ?? ""}</div>
                </Link>
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className="song-list-scale">{entry.scale}</span>
                  {canEdit && (
                    <button className="btn btn-danger" onClick={() => removeSong(entry.songId)}>
                      Quitar
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {canEdit && (
        <div className="card">
          <div className="form-field">
            <label>Agregar cancion</label>
            <input
              type="text"
              placeholder="Buscar por titulo o artista..."
              value={addQuery}
              onChange={(e) => setAddQuery(e.target.value)}
            />
          </div>
          {addResults.map((song) => (
            <div key={song.id} className="song-list-row">
              <span>
                <div className="song-list-title">{song.title}</div>
                <div className="song-list-artist">{song.artist}</div>
              </span>
              <button className="btn btn-primary" onClick={() => addSong(song.id, song.originalScale || "DO")}>
                Agregar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
