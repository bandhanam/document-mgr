import { listAll } from '../../_lib/db.js';

export async function onRequestGet(context) {
  try {
    const files = await listAll(context.env.DB);
    return Response.json(files);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
