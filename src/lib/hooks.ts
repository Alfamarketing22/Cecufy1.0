import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import type { Song, Songbook } from "../types";

export function useSongs() {
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    api
      .getSongs()
      .then(setSongs)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { songs, error, reload };
}

export function useSongbooks() {
  const [songbooks, setSongbooks] = useState<Songbook[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    api
      .getSongbooks()
      .then(setSongbooks)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { songbooks, error, reload };
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Buenas noches";
  if (hour < 12) return "Buenos dias";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}
