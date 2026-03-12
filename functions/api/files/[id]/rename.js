import { getById, renameFile, toClientFormat } from '../../../_lib/db.js';

export async function onRequestPatch(context) {
  try {
    const { newName, userName } = await context.request.json();
    if (!newName?.trim()) return Response.json({ error: 'New name required' }, { status: 400 });

    const existing = await getById(context.env.DB, context.params.id);
    if (!existing) return Response.json({ error: 'File not found' }, { status: 404 });

    await renameFile(context.env.DB, context.params.id, newName.trim(), userName || 'Unknown');
    const updated = await getById(context.env.DB, context.params.id);
    return Response.json(toClientFormat(updated));
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
