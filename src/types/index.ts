export type ChordToken = {
  chord: string;
  position: number;
  displayChord: string;
  isPostFraseo: boolean;
};

export type LyricLine = {
  text: string;
  chords: ChordToken[];
};

export type LyricSection = {
  name: string;
  startLine: number;
  endLine: number;
};

export type Lyrics = {
  lines: LyricLine[];
  sections: LyricSection[];
};

/** Cifrado con el que se muestra la cancion por defecto. */
export type Notation = "latin" | "american";

export type Song = {
  id: string;
  title: string;
  artist: string;
  originalScale: string;
  /** "latin" = DO RE MI · "american" = C D E. Por defecto "latin". */
  notation: Notation;
  lyrics: Lyrics;
  youtubeUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type SongbookEntry = {
  songId: string;
  scale: string;
};

export type Songbook = {
  id: string;
  title: string;
  date: string | null;
  songs: SongbookEntry[];
  createdAt: string;
  updatedAt: string;
};

export type SongInput = Omit<Song, "id" | "createdAt" | "updatedAt">;
export type SongbookInput = Omit<Songbook, "id" | "createdAt" | "updatedAt">;
