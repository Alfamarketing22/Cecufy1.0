import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSongbooks } from "../lib/hooks";
import { api, isAdminLoggedIn } from "../lib/api";
import { Icon } from "../components/Icon";
import { hueStyle } from "../components/SongCover";

export function Songbooks() {
  const { songbooks, error, reload } = useSongbooks();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const canEdit = isAdminLoggedIn();

  const handleCreate = async () => {
    const title = window.prompt("Nombre del cancionero (ej: Domingo 16 de agosto)");
    if (!title) return;
    setCreating(true);
    try {
      const songbook = await api.createSongbook({ title, date: null, songs: [] });
      navigate(`/songbooks/${songbook.id}`);
    } catch (e) {
      window.alert((e as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este cancionero?")) return;
    await api.deleteSongbook(id);
    reload();
  };

  if (error) return <div className="empty-state">{error}</div>;

  return (
    <div>
      <div className="page-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-heading">Cancioneros</h1>
          <p className="page-subtext">Armá el repertorio de cada domingo</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
            <Icon name="plus" size={16} />
            Nuevo cancionero
          </button>
        )}
      </div>

      {!songbooks && <div className="empty-state">Cargando...</div>}

      {songbooks && songbooks.length === 0 && (
        <div className="empty-state">
          Todavia no hay cancioneros. {canEdit ? "Crea el primero." : "Iniciá sesión en Administrar para crear uno."}
        </div>
      )}

      <div className="songbook-grid">
        {songbooks?.map((sb, i) => (
          <article
            key={sb.id}
            className="songbook-card enter"
            style={{ ...hueStyle(sb.id), ["--i" as string]: Math.min(i, 14) }}
          >
            <Link className="songbook-open" to={`/songbooks/${sb.id}`}>
              <h3 className="songbook-title">{sb.title}</h3>
              <span className="songbook-count">
                {sb.songs.length === 1 ? "1 canción" : `${sb.songs.length} canciones`}
              </span>
            </Link>

            <div className="songbook-actions">
              <a className="btn btn-secondary" href={`/songbooks/${sb.id}/print`} target="_blank" rel="noreferrer">
                <Icon name="print" size={16} />
                Imprimir
              </a>
              {canEdit && (
                <button
                  className="icon-btn songbook-delete"
                  aria-label={`Eliminar ${sb.title}`}
                  onClick={() => handleDelete(sb.id)}
                >
                  <Icon name="trash" size={18} />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
