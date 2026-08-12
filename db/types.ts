import type { Song, SongInput, Songbook, SongbookInput } from "../src/types";

export interface Store {
  listSongs(): Promise<Song[]>;
  getSong(id: string): Promise<Song | null>;
  createSong(input: SongInput): Promise<Song>;
  updateSong(id: string, input: Partial<SongInput>): Promise<Song | null>;
  deleteSong(id: string): Promise<boolean>;

  listSongbooks(): Promise<Songbook[]>;
  getSongbook(id: string): Promise<Songbook | null>;
  createSongbook(input: SongbookInput): Promise<Songbook>;
  updateSongbook(id: string, input: Partial<SongbookInput>): Promise<Songbook | null>;
  deleteSongbook(id: string): Promise<boolean>;
}
