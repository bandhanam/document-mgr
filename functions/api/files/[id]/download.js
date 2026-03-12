import { getById, toClientFormat } from '../../../_lib/db.js';
import { getPresignedDownloadUrl } from '../../../_lib/s3.js';

export async function onRequestGet(context) {
  try {
    const row = await getById(context.env.DB, context.params.id);
    if (!row) return Response.json({ error: 'File not found' }, { status: 404 });

    const url = await getPresignedDownloadUrl(context.env, row.s3_key, row.original_name);
    return Response.json({ url });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
