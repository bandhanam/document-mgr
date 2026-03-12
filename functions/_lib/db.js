export function toClientFormat(row) {
  return {
    id: row.id,
    displayName: row.display_name,
    originalName: row.original_name,
    s3Key: row.s3_key,
    contentType: row.content_type,
    size: row.size,
    uploadedAt: row.uploaded_at,
    uploadedBy: row.uploaded_by,
    lastUpdatedBy: row.last_updated_by,
    lastUpdatedAt: row.last_updated_at,
  };
}

export async function listAll(db) {
  const { results } = await db.prepare('SELECT * FROM files ORDER BY uploaded_at DESC').all();
  return results.map(toClientFormat);
}

export async function getById(db, id) {
  return db.prepare('SELECT * FROM files WHERE id = ?').bind(id).first();
}

export async function insertFile(db, entry) {
  return db
    .prepare(
      `INSERT INTO files (id, display_name, original_name, s3_key, content_type, size, uploaded_at, uploaded_by, last_updated_by, last_updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      entry.id,
      entry.display_name,
      entry.original_name,
      entry.s3_key,
      entry.content_type,
      entry.size,
      entry.uploaded_at,
      entry.uploaded_by,
      entry.last_updated_by,
      entry.last_updated_at
    )
    .run();
}

export async function renameFile(db, id, displayName, updatedBy) {
  const now = new Date().toISOString();
  return db
    .prepare('UPDATE files SET display_name = ?, last_updated_by = ?, last_updated_at = ? WHERE id = ?')
    .bind(displayName, updatedBy, now, id)
    .run();
}

export async function deleteById(db, id) {
  return db.prepare('DELETE FROM files WHERE id = ?').bind(id).run();
}

export async function deleteByS3Key(db, s3Key) {
  return db.prepare('DELETE FROM files WHERE s3_key = ?').bind(s3Key).run();
}

export async function fileCount(db) {
  const row = await db.prepare('SELECT COUNT(*) as cnt FROM files').first();
  return row.cnt;
}

export async function allS3Keys(db) {
  const { results } = await db.prepare('SELECT s3_key FROM files').all();
  return results.map((r) => r.s3_key);
}

export async function insertMany(db, entries) {
  const stmt = db.prepare(
    `INSERT INTO files (id, display_name, original_name, s3_key, content_type, size, uploaded_at, uploaded_by, last_updated_by, last_updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const batch = entries.map((e) =>
    stmt.bind(e.id, e.display_name, e.original_name, e.s3_key, e.content_type, e.size, e.uploaded_at, e.uploaded_by, e.last_updated_by, e.last_updated_at)
  );
  return db.batch(batch);
}
