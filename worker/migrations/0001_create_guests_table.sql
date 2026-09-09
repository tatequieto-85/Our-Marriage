CREATE TABLE guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rsvp TEXT NOT NULL DEFAULT 'pending' CHECK (rsvp IN ('pending', 'yes', 'no')),
  guests_count INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
