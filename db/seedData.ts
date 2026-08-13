import type { Song, Songbook } from "../src/types/index.js";

const now = new Date().toISOString();

// Canciones de ejemplo originales (no derivadas de obras con copyright),
// pensadas solo para validar el formato de acordes/transposicion.
export const seedSongs: Song[] = [
  {
    id: "ejemplo-1",
    title: "Cancion de ejemplo",
    artist: "CecuFy (ejemplo)",
    originalScale: "SOL",
    notation: "latin",
    youtubeUrl: "",
    createdAt: now,
    updatedAt: now,
    lyrics: {
      lines: [
        {
          text: "Esta es una linea de ejemplo para probar los acordes",
          chords: [
            { chord: "I", position: 0, displayChord: "I", isPostFraseo: false },
            { chord: "IV", position: 24, displayChord: "IV", isPostFraseo: false },
            { chord: "V", position: 48, displayChord: "V", isPostFraseo: false },
          ],
        },
        {
          text: "Y esta es la segunda linea de la estrofa",
          chords: [
            { chord: "VIm", position: 0, displayChord: "VIm", isPostFraseo: false },
            { chord: "IV", position: 26, displayChord: "IV", isPostFraseo: false },
          ],
        },
        { text: "", chords: [] },
        {
          text: "Este es el coro de la cancion de prueba",
          chords: [
            { chord: "IV", position: 0, displayChord: "IV", isPostFraseo: false },
            { chord: "I", position: 20, displayChord: "I", isPostFraseo: false },
            { chord: "V", position: 34, displayChord: "V", isPostFraseo: false },
          ],
        },
      ],
      sections: [
        { name: "estrofa1", startLine: 0, endLine: 2 },
        { name: "coro", startLine: 3, endLine: 3 },
      ],
    },
  },
  {
    id: "ejemplo-2",
    title: "Segunda cancion de prueba",
    artist: "CecuFy (ejemplo)",
    originalScale: "RE",
    notation: "american",
    youtubeUrl: "",
    createdAt: now,
    updatedAt: now,
    lyrics: {
      lines: [
        {
          text: "Linea unica para probar una tonalidad distinta",
          chords: [
            { chord: "I", position: 0, displayChord: "I", isPostFraseo: false },
            { chord: "bVII", position: 22, displayChord: "bVII", isPostFraseo: false },
            { chord: "IVmaj7", position: 40, displayChord: "IVmaj7", isPostFraseo: false },
          ],
        },
      ],
      sections: [{ name: "estrofa1", startLine: 0, endLine: 0 }],
    },
  },
];

export const seedSongbooks: Songbook[] = [
  {
    id: "songbook-ejemplo",
    title: "Cancionero de ejemplo",
    date: null,
    songs: [
      { songId: "ejemplo-1", scale: "SOL" },
      { songId: "ejemplo-2", scale: "RE" },
    ],
    createdAt: now,
    updatedAt: now,
  },
];
