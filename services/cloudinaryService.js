import { File } from 'expo-file-system';
import sha1 from 'js-sha1';

import cloudinaryConfig from '../config/cloudinary';

const { cloudName, apiKey, apiSecret } = cloudinaryConfig;

function authHeader() {
  if (typeof globalThis.btoa !== 'function') {
    throw new Error('Cloudinary auth failed on this device');
  }
  return `Basic ${globalThis.btoa(`${apiKey}:${apiSecret}`)}`;
}

function titleFromPublicId(publicId) {
  const name = publicId.split('/').pop() || publicId;
  return name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
}

function signDownloadParams(params) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  const signature = sha1(toSign + apiSecret);

  return new URLSearchParams({
    ...params,
    api_key: apiKey,
    signature,
  }).toString();
}

export function getPdfOpenUrl(note) {
  const resourceType = note.resourceType || 'raw';
  const params = {
    attachment: 'false',
    public_id: note.publicId,
    timestamp: String(Math.floor(Date.now() / 1000)),
    type: 'upload',
  };

  if (!note.publicId.toLowerCase().endsWith('.pdf')) {
    params.format = 'pdf';
  }

  const query = signDownloadParams(params);
  return `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/download?${query}`;
}

function mapResource(resource) {
  return {
    id: resource.public_id,
    publicId: resource.public_id,
    resourceType: resource.resource_type,
    title: titleFromPublicId(resource.public_id),
  };
}

async function searchPdfsInFolder(folderPath) {
  const expression = `(asset_folder:"${folderPath}" OR public_id:${folderPath}/*) AND (format:pdf OR format:doc OR format:docx)`;
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
    {
      method: 'POST',
      headers: {
        Authorization: authHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expression,
        max_results: 100,
      }),
    }
  );
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || 'Could not load notes');
  }

  return (data.resources || []).map(mapResource);
}

async function listRawByPrefix(prefix) {
  const params = new URLSearchParams({
    type: 'upload',
    prefix,
    max_results: '100',
  });

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/raw?${params}`,
    { headers: { Authorization: authHeader() } }
  );
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || 'Could not load notes');
  }

  return (data.resources || []).map(mapResource);
}

export async function listNotesInFolder(folderPath) {
  const [searchResults, rawResults] = await Promise.all([
    searchPdfsInFolder(folderPath),
    listRawByPrefix(folderPath),
  ]);

  const merged = new Map();
  [...searchResults, ...rawResults].forEach((note) => {
    merged.set(note.publicId, note);
  });

  return [...merged.values()];
}

function signUploadParams(params) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return {
    signature: sha1(toSign + apiSecret),
    timestamp: params.timestamp,
  };
}

function safeFileBaseName(fileName) {
  const base = fileName.replace(/\.[^.]+$/, '');
  return base.replace(/[^a-zA-Z0-9._-]/g, '_') || 'note';
}

export async function uploadNote(folderPath, fileUri, fileName, mimeType) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const publicId = safeFileBaseName(fileName);
  const uploadParams = {
    asset_folder: folderPath,
    folder: folderPath,
    public_id: publicId,
    timestamp,
  };
  const { signature } = signUploadParams(uploadParams);

  const formData = new FormData();
  formData.append('file', new File(fileUri));
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folderPath);
  formData.append('asset_folder', folderPath);
  formData.append('public_id', publicId);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
    { method: 'POST', body: formData }
  );
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || 'Upload failed');
  }

  return mapResource(data);
}

export async function deleteNote(publicId, resourceType = 'raw') {
  const params = new URLSearchParams({ public_ids: publicId });
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}/upload?${params}`,
    { method: 'DELETE', headers: { Authorization: authHeader() } }
  );
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || 'Delete failed');
  }
  if (data.deleted?.[publicId] !== 'deleted') {
    throw new Error('Delete failed');
  }
}
