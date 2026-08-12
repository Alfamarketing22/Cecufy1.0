import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import type { Song, SongInput, Songbook, SongbookInput } from "../src/types";
import type { Store } from "./types";
import { generateId } from "./id";
import { seedSongs, seedSongbooks } from "./seedData";

const DATA_DIR = path.resolve(process.cwd(), "db");
const DATA_FILE = path.join(DATA_DIR, "local-data.json");

type Data = { songs: Song[]; songbooks: Songbook[] };

function load(): Data {
  if (!existsSync(DATA_FILE)) {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    const initial: Data = { songs: seedSongs, songbooks: seedSongbooks };
    writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const parsed: Data = JSON.parse(readFileSync(DATA_FILE, "utf8"));
  // Registros guardados antes de que existiera `notation` caen a "latin".
  parsed.songs = parsed.songs.map((s) => ({
    ...s,
    notation: s.notation === "american" ? "american" : "latin",
  }));
  return parsed;
}

function save(data: Data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export const fileStore: Store = {
  async listSongs() {
    return load().songs.sort((a, b) => a.title.localeCompare(b.title, "es"));
  },

  async getSong(id) {
    return load().songs.find((s) => s.id === id) ?? null;
  },

  async createSong(input: SongInput) {
    const data = load();
    const now = new Date().toISOString();
    const song: Song = { ...input, id: generateId(), createdAt: now, updatedAt: now };
    data.songs.push(song);
    save(data);
    return song;
  },

  async updateSong(id, input) {
    const data = load();
    const idx = data.songs.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: Song = { ...data.songs[idx], ...input, id, updatedAt: new Date().toISOString() };
    data.songs[idx] = updated;
    save(data);
    return updated;
  },

  async deleteSong(id) {
    const data = load();
    const before = data.songs.length;
    data.songs = data.songs.filter((s) => s.id !== id);
    save(data);
    return data.songs.length < before;
  },

  async listSongbooks() {
    return load().songbooks.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async getSongbook(id) {
    return load().songbooks.find((s) => s.id === id) ?? null;
  },

  async createSongbook(input: SongbookInput) {
    const data = load();
    const now = new Date().toISOString();
    const songbook: Songbook = { ...input, id: generateId(), createdAt: now, updatedAt: now };
    data.songbooks.push(songbook);
    save(data);
    return songbook;
  },

  async updateSongbook(id, input) {
    const data = load();
    const idx = data.songbooks.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    const updated: Songbook = { ...data.songbooks[idx], ...input, id, updatedAt: new Date().toISOString() };
    data.songbooks[idx] = updated;
    save(data);
    return updated;
  },

  async deleteSongbook(id) {
    const data = load();
    const before = data.songbooks.length;
    data.songbooks = data.songbooks.filter((s) => s.id !== id);
    save(data);
    return data.songbooks.length < before;
  },
};
