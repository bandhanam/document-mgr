CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  s3_key TEXT NOT NULL UNIQUE,
  content_type TEXT DEFAULT 'application/octet-stream',
  size INTEGER DEFAULT 0,
  uploaded_at TEXT NOT NULL,
  uploaded_by TEXT DEFAULT 'Unknown',
  last_updated_by TEXT DEFAULT 'Unknown',
  last_updated_at TEXT NOT NULL
);
