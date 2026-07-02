/**
 * Browser-side image upload for the SEO dashboard. Mirrors
 * `lib/upload/cloudinary.ts`, but fetches signed params from
 * `/api/seoteam/upload` (SEO-session gated) instead of the app-JWT backend,
 * then POSTs the file straight to Cloudinary. Reuses the shared validate/resize
 * helpers so behaviour matches the rest of the app.
 */
'use client';
import { assertValidImage, resizeImageFile } from '@/lib/upload/cloudinary';

interface SignedParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  uploadUrl: string;
}

/** Upload an image and return its hosted Cloudinary `secure_url`. */
export async function uploadSeoImage(file: File, folder = 'blog'): Promise<string> {
  assertValidImage(file);
  const resized = await resizeImageFile(file);

  const signRes = await fetch('/api/seoteam/upload', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ folder }),
  });
  if (!signRes.ok) {
    const detail = (await signRes.json().catch(() => ({}))) as { message?: string };
    throw new Error(detail.message || 'Could not authorize the upload.');
  }
  const signed = (await signRes.json()) as SignedParams;

  const form = new FormData();
  form.append('file', resized);
  form.append('api_key', signed.apiKey);
  form.append('timestamp', String(signed.timestamp));
  form.append('folder', signed.folder);
  form.append('signature', signed.signature);

  const res = await fetch(signed.uploadUrl, { method: 'POST', body: form });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Upload failed (${res.status})${detail ? `: ${detail}` : ''}`);
  }
  const json = (await res.json()) as { secure_url?: string };
  if (!json.secure_url) throw new Error('Cloudinary did not return an image URL.');
  return json.secure_url;
}
