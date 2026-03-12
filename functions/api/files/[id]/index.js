import { getById, deleteById } from '../../../_lib/db.js';
import { deleteFromS3 } from '../../../_lib/s3.js';

export async function onRequestDelete(context) {
  try {
    const row = await getById(context.env.DB, context.params.id);
    if (!row) return Response.json({ error: 'File not found' }, { status: 404 });

    await deleteFromS3(context.env, row.s3_key);
    await deleteById(context.env.DB, context.params.id);

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
