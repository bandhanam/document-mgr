import { AwsClient } from 'aws4fetch';

function getClient(env) {
  return new AwsClient({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION || 'ap-southeast-2',
  });
}

function bucketUrl(env) {
  const region = env.AWS_REGION || 'ap-southeast-2';
  const bucket = env.S3_BUCKET_NAME || 'bandhanam-doc';
  return `https://${bucket}.s3.${region}.amazonaws.com`;
}

export async function uploadToS3(env, key, body, contentType) {
  const aws = getClient(env);
  const url = `${bucketUrl(env)}/${key}`;
  const res = await aws.fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body,
  });
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`);
}

export async function deleteFromS3(env, key) {
  const aws = getClient(env);
  const url = `${bucketUrl(env)}/${key}`;
  const res = await aws.fetch(url, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) throw new Error(`S3 delete failed: ${res.status}`);
}

export async function getPresignedDownloadUrl(env, key, fileName) {
  const aws = getClient(env);
  const url = new URL(`${bucketUrl(env)}/${key}`);
  url.searchParams.set('X-Amz-Expires', '300');
  url.searchParams.set('response-content-disposition', `attachment; filename="${fileName}"`);

  const signed = await aws.sign(new Request(url), { aws: { signQuery: true } });
  return signed.url;
}

export async function listS3Objects(env, prefix = 'uploads/') {
  const aws = getClient(env);
  const objects = [];
  let continuationToken;

  do {
    const url = new URL(bucketUrl(env));
    url.searchParams.set('list-type', '2');
    url.searchParams.set('prefix', prefix);
    if (continuationToken) url.searchParams.set('continuation-token', continuationToken);

    const res = await aws.fetch(url);
    if (!res.ok) throw new Error(`S3 list failed: ${res.status}`);

    const text = await res.text();
    const keys = [...text.matchAll(/<Key>([^<]+)<\/Key>/g)].map((m) => m[1]);
    objects.push(...keys);

    const truncated = text.includes('<IsTruncated>true</IsTruncated>');
    const tokenMatch = text.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/);
    continuationToken = truncated && tokenMatch ? tokenMatch[1] : undefined;
  } while (continuationToken);

  return objects;
}

export async function getLegacyMetadata(env) {
  const aws = getClient(env);
  const url = `${bucketUrl(env)}/_metadata.json`;
  const res = await aws.fetch(url);
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`S3 metadata fetch failed: ${res.status}`);
  return res.json();
}
