import { Pool } from "pg";
import type { Song, SongInput, Songbook, SongbookInput } from "../src/types/index.js";
import type { Store } from "./types.js";
import { generateId } from "./id.js";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    pool = new Pool({
      connectionString,
      ssl: connectionString?.includes("neon.tech") || connectionString?.includes("sslmode=require")
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  return pool;
}

function rowToSong(row: any): Song {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    originalScale: row.original_scale,
    notation: row.notation === "american" ? "american" : "latin",
    lyrics: row.lyrics,
    youtubeUrl: row.youtube_url,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

function rowToSongbook(row: any): Songbook {
  return {
    id: row.id,
    title: row.title,
    date: row.date ? (row.date instanceof Date ? row.date.toISOString().slice(0, 10) : row.date) : null,
    songs: row.songs,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

export const pgStore: Store = {
  async listSongs() {
    const { rows } = await getPool().query("SELECT * FROM songs ORDER BY title ASC");
    return rows.map(rowToSong);
  },

  async getSong(id) {
    const { rows } = await getPool().query("SELECT * FROM songs WHERE id = $1", [id]);
    return rows[0] ? rowToSong(rows[0]) : null;
  },

  async createSong(input: SongInput) {
    const id = generateId();
    const { rows } = await getPool().query(
      `INSERT INTO songs (id, title, artist, original_scale, notation, lyrics, youtube_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        id,
        input.title,
        input.artist,
        input.originalScale,
        input.notation ?? "latin",
        JSON.stringify(input.lyrics),
        input.youtubeUrl,
      ]
    );
    return rowToSong(rows[0]);
  },

  async updateSong(id, input) {
    const existing = await this.getSong(id);
    if (!existing) return null;
    const merged = { ...existing, ...input };
    const { rows } = await getPool().query(
      `UPDATE songs SET title=$2, artist=$3, original_scale=$4, notation=$5, lyrics=$6, youtube_url=$7, updated_at=now()
       WHERE id=$1 RETURNING *`,
      [
        id,
        merged.title,
        merged.artist,
        merged.originalScale,
        merged.notation ?? "latin",
        JSON.stringify(merged.lyrics),
        merged.youtubeUrl,
      ]
    );
    return rows[0] ? rowToSong(rows[0]) : null;
  },

  async deleteSong(id) {
    const { rowCount } = await getPool().query("DELETE FROM songs WHERE id = $1", [id]);
    return (rowCount ?? 0) > 0;
  },

  async listSongbooks() {
    const { rows } = await getPool().query("SELECT * FROM songbooks ORDER BY updated_at DESC");
    return rows.map(rowToSongbook);
  },

  async getSongbook(id) {
    const { rows } = await getPool().query("SELECT * FROM songbooks WHERE id = $1", [id]);
    return rows[0] ? rowToSongbook(rows[0]) : null;
  },

  async createSongbook(input: SongbookInput) {
    const id = generateId();
    const { rows } = await getPool().query(
      `INSERT INTO songbooks (id, title, date, songs) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, input.title, input.date, JSON.stringify(input.songs)]
    );
    return rowToSongbook(rows[0]);
  },

  async updateSongbook(id, input) {
    const existing = await this.getSongbook(id);
    if (!existing) return null;
    const merged = { ...existing, ...input };
    const { rows } = await getPool().query(
      `UPDATE songbooks SET title=$2, date=$3, songs=$4, updated_at=now() WHERE id=$1 RETURNING *`,
      [id, merged.title, merged.date, JSON.stringify(merged.songs)]
    );
    return rows[0] ? rowToSongbook(rows[0]) : null;
  },

  async deleteSongbook(id) {
    const { rowCount } = await getPool().query("DELETE FROM songbooks WHERE id = $1", [id]);
    return (rowCount ?? 0) > 0;
  },
};
