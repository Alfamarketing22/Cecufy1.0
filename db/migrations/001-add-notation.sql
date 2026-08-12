-- Agrega el cifrado por cancion (latin = DO RE MI, american = C D E).
-- Correr una sola vez sobre bases creadas antes de esta columna:
--   psql "$DATABASE_URL" -f db/migrations/001-add-notation.sql

ALTER TABLE songs
  ADD COLUMN IF NOT EXISTS notation TEXT NOT NULL DEFAULT 'latin';
