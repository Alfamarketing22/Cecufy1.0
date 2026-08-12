CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT '',
  original_scale TEXT NOT NULL DEFAULT '',
  notation TEXT NOT NULL DEFAULT 'latin',
  lyrics JSONB NOT NULL DEFAULT '{"lines":[],"sections":[]}',
  youtube_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS songbooks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE,
  songs JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS songs_title_idx ON songs (title);
CREATE INDEX IF NOT EXISTS songs_updated_at_idx ON songs (updated_at DESC);
