import { getLegacyMetadata } from '../../_lib/s3.js';
import { fileCount, insertMany } from '../../_lib/db.js';

export async function onRequestPost(context) {
  try {
    const count = await fileCount(context.env.DB);
    if (count > 0) {
      return Response.json({ message: `D1 already has ${count} files. Skipping migration.` });
    }

    const legacy = await getLegacyMetadata(context.env);
    if (!legacy?.files?.length) {
      return Response.json({ message: 'No legacy _metadata.json found in S3.' });
    }

    const entries = legacy.files.map((f) => ({
      id: f.id,
      display_name: f.displayName,
      original_name: f.originalName,
      s3_key: f.s3Key,
      content_type: f.contentType || 'application/octet-stream',
      size: f.size || 0,
      uploaded_at: f.uploadedAt || new Date().toISOString(),
      uploaded_by: f.uploadedBy || 'Unknown',
      last_updated_by: f.lastUpdatedBy || 'Unknown',
      last_updated_at: f.lastUpdatedAt || new Date().toISOString(),
    }));

    await insertMany(context.env.DB, entries);
    return Response.json({ message: `Imported ${entries.length} file(s) from _metadata.json into D1.` });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
