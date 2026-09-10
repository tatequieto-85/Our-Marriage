CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  due_date TEXT NOT NULL,
  url TEXT,
  photo_key TEXT,
  audio_key TEXT,
  completed_at TEXT,
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
