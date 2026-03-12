import { listS3Objects } from '../../_lib/s3.js';
import { allS3Keys, deleteByS3Key } from '../../_lib/db.js';

export async function onRequestPost(context) {
  try {
    const s3Keys = new Set(await listS3Objects(context.env));
    const dbKeys = new Set(await allS3Keys(context.env.DB));

    const orphanedInDb = [...dbKeys].filter((k) => !s3Keys.has(k));
    for (const key of orphanedInDb) {
      await deleteByS3Key(context.env.DB, key);
    }

    const orphanedInS3 = [...s3Keys].filter((k) => !dbKeys.has(k));

    return Response.json({
      removedFromDb: orphanedInDb.length,
      orphanedInS3: orphanedInS3.length,
      orphanedS3Keys: orphanedInS3,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
