CREATE TABLE ideas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  photo_key TEXT,
  audio_key TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
