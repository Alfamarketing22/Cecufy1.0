import { useState } from "react";
import { Link } from "react-router-dom";
import { api, clearAdminToken, isAdminLoggedIn, setAdminToken } from "../lib/api";
import { useSongs } from "../lib/hooks";
import { SongEditor } from "../components/SongEditor";
import { Icon } from "../components/Icon";
import type { Song, SongInput } from "../types";

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await api.login(password);
      setAdminToken(token);
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" style={{ maxWidth: 360 }} onSubmit={handleSubmit}>
      <div className="form-field">
        <label>Clave de acceso</label>
        <input
          type="password"
          autoFocus
          placeholder="Clave de acceso"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <div style={{ color: "var(--error)", marginBottom: 12 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        <Link className="btn" to="/">
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function AdminSongs() {
  const { songs, error, reload } = useSongs();
  const [editing, setEditing] = useState<Song | "new" | null>(null);

  const handleSave = async (input: SongInput) => {
    if (editing === "new") {
      await api.createSong(input);
    } else if (editing) {
      await api.updateSong(editing.id, input);
    }
    setEditing(null);
    reload();
  };

  const handleDelete = async (song: Song) => {
    if (!window.confirm(`¿Eliminar "${song.title}"?`)) return;
    await api.deleteSong(song.id);
    reload();
  };

  if (editing) {
    return (
      <SongEditor
        song={editing === "new" ? undefined : editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Canciones</h2>
        <button className="btn btn-primary" onClick={() => setEditing("new")}>
          <Icon name="plus" size={16} />
          Nueva cancion
        </button>
      </div>

      {error && <div className="empty-state">{error}</div>}
      {!songs && <div className="empty-state">Cargando...</div>}

      <div className="song-list">
        {songs?.map((song) => (
          <div key={song.id} className="song-list-row">
            <span>
              <div className="song-list-title">{song.title}</div>
              <div className="song-list-artist">{song.artist || "Desconocido"}</div>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="song-list-scale">{song.originalScale}</span>
              <button className="btn" onClick={() => setEditing(song)}>
                Editar
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(song)}>
                Eliminar
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Admin() {
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());

  if (!loggedIn) {
    return (
      <div>
        <div className="page-hero">
          <h1 className="page-heading">Administrar</h1>
          <p className="page-subtext">Ingresa la clave para gestionar las canciones y cancioneros</p>
        </div>
        <AdminLogin onSuccess={() => setLoggedIn(true)} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-heading">Administrar</h1>
          <p className="page-subtext">
            Gestiona canciones aca. Los cancioneros se arman desde <Link to="/songbooks">Cancioneros</Link>.
          </p>
        </div>
        <button
          className="btn"
          onClick={() => {
            clearAdminToken();
            setLoggedIn(false);
          }}
        >
          Cerrar sesion
        </button>
      </div>
      <AdminSongs />
    </div>
  );
}
