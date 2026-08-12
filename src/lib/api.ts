import type { Song, SongInput, Songbook, SongbookInput } from "../types";

const BASE = "/api";
const TOKEN_KEY = "presbify_admin_token";

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore parse errors, keep default message
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  login: (password: string) =>
    request<{ token: string }>("/admin/login", { method: "POST", body: JSON.stringify({ password }) }),

  getSongs: () => request<Song[]>("/songs"),
  getSong: (id: string) => request<Song>(`/songs/${id}`),
  createSong: (input: SongInput) => request<Song>("/songs", { method: "POST", body: JSON.stringify(input) }),
  updateSong: (id: string, input: Partial<SongInput>) =>
    request<Song>(`/songs/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteSong: (id: string) => request<void>(`/songs/${id}`, { method: "DELETE" }),

  getSongbooks: () => request<Songbook[]>("/songbooks"),
  getSongbook: (id: string) => request<Songbook>(`/songbooks/${id}`),
  createSongbook: (input: SongbookInput) =>
    request<Songbook>("/songbooks", { method: "POST", body: JSON.stringify(input) }),
  updateSongbook: (id: string, input: Partial<SongbookInput>) =>
    request<Songbook>(`/songbooks/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteSongbook: (id: string) => request<void>(`/songbooks/${id}`, { method: "DELETE" }),
};
