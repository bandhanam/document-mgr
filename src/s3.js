import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: import.meta.env.VITE_AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = import.meta.env.VITE_S3_BUCKET_NAME || 'bandhanam-doc';
const METADATA_KEY = '_metadata.json';

async function getMetadata() {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: METADATA_KEY }));
    const body = await res.Body.transformToString();
    return JSON.parse(body);
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return { files: [] };
    }
    throw err;
  }
}

async function saveMetadata(metadata) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: METADATA_KEY,
    Body: JSON.stringify(metadata),
    ContentType: 'application/json',
  }));
}

export async function listFiles() {
  const metadata = await getMetadata();
  return metadata.files || [];
}

export async function uploadFile(file, displayName, userName, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result;
        const uint8 = new Uint8Array(arrayBuffer);
        if (onProgress) onProgress(30);

        const s3Key = `uploads/${Date.now()}_${file.name}`;

        await s3.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: s3Key,
          Body: uint8,
          ContentType: file.type || 'application/octet-stream',
        }));

        if (onProgress) onProgress(70);

        const metadata = await getMetadata();
        const fileEntry = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          displayName,
          originalName: file.name,
          s3Key,
          contentType: file.type || 'application/octet-stream',
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: userName || 'Unknown',
          lastUpdatedBy: userName || 'Unknown',
          lastUpdatedAt: new Date().toISOString(),
        };
        metadata.files = [fileEntry, ...(metadata.files || [])];
        await saveMetadata(metadata);

        if (onProgress) onProgress(100);
        resolve(fileEntry);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
    if (onProgress) onProgress(10);
  });
}

export async function getDownloadUrl(s3Key, fileName) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    ResponseContentDisposition: `attachment; filename="${fileName}"`,
  });
  return getSignedUrl(s3, command, { expiresIn: 300 });
}

export async function renameFile(id, newName, userName) {
  const metadata = await getMetadata();
  const file = (metadata.files || []).find((f) => f.id === id);
  if (!file) throw new Error('File not found');
  file.displayName = newName.trim();
  file.lastUpdatedBy = userName || 'Unknown';
  file.lastUpdatedAt = new Date().toISOString();
  await saveMetadata(metadata);
  return file;
}

export async function deleteFile(id, s3Key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: s3Key }));
  const metadata = await getMetadata();
  metadata.files = (metadata.files || []).filter((f) => f.id !== id);
  await saveMetadata(metadata);
  return true;
}
