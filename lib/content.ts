/**
 * Content layer — reads and writes JSON content files.
 * In development: reads/writes from local /content directory.
 * In production (Vercel): uses Vercel Blob for storage.
 */

import path from 'path';
import fs from 'fs/promises';
import type { ContentKey } from './types';

// Use local files when no Blob token is configured (works on Vercel too — files are bundled)
const isDev = process.env.NODE_ENV !== 'production' || !process.env.BLOB_READ_WRITE_TOKEN;
const CONTENT_DIR = path.join(process.cwd(), 'content');

// ─── Blob storage helpers (production) ──────────────────────────────────────
async function readFromBlob(key: ContentKey): Promise<unknown> {
  const { list } = await import('@vercel/blob');
  const blobKey = `content/${key}.json`;

  try {
    const { blobs } = await list({ prefix: blobKey });
    if (blobs.length === 0) {
      // Fallback: read from local file (initial seed)
      return readFromLocal(key);
    }
    const blob = blobs[0];
    // Vercel Blob is served through a CDN. Because we overwrite the same path
    // on every save (addRandomSuffix: false), a cached copy can otherwise be
    // returned after a write. Bust the cache with the blob's uploadedAt and
    // force a fresh fetch so admin edits are read back immediately.
    const bust = blob.uploadedAt ? new Date(blob.uploadedAt).getTime() : Date.now();
    const response = await fetch(`${blob.url}?v=${bust}`, { cache: 'no-store' });
    return response.json();
  } catch {
    return readFromLocal(key);
  }
}

async function writeToBlob(key: ContentKey, data: unknown): Promise<void> {
  const { put } = await import('@vercel/blob');
  const blobKey = `content/${key}.json`;
  const content = JSON.stringify(data, null, 2);
  await put(blobKey, content, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    // Keep the CDN cache short so freshly-saved content is read back quickly.
    cacheControlMaxAge: 0,
  });
}

// ─── Local filesystem helpers (development) ──────────────────────────────────
async function readFromLocal(key: ContentKey): Promise<unknown> {
  const filePath = path.join(CONTENT_DIR, `${key}.json`);
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function writeToLocal(key: ContentKey, data: unknown): Promise<void> {
  const filePath = path.join(CONTENT_DIR, `${key}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Public API ──────────────────────────────────────────────────────────────
export async function readContent<T>(key: ContentKey): Promise<T> {
  if (isDev) {
    return readFromLocal(key) as Promise<T>;
  }
  return readFromBlob(key) as Promise<T>;
}

export async function writeContent<T>(key: ContentKey, data: T): Promise<void> {
  // On Vercel (production) the filesystem is read-only, so edits MUST go to
  // Vercel Blob. If the Blob token is missing, fail loudly with a clear message
  // instead of silently writing to an ephemeral/read-only filesystem — that was
  // the cause of "admin saves that never persist".
  if (process.env.NODE_ENV === 'production' && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      'Content storage is not configured. Set BLOB_READ_WRITE_TOKEN in your ' +
        'Vercel project (connect a Blob store) so admin edits can persist.'
    );
  }

  if (isDev) {
    await writeToLocal(key, data);
  } else {
    await writeToBlob(key, data);
  }
}

// ─── Convenience getters ─────────────────────────────────────────────────────
export async function getProfile() {
  return readContent<import('./types').Profile>('profile');
}

export async function getProjects() {
  return readContent<import('./types').Project[]>('projects');
}

export async function getSkills() {
  return readContent<import('./types').SkillCategory[]>('skills');
}

export async function getContact() {
  return readContent<import('./types').ContactData>('contact');
}

export async function getDemos() {
  return readContent<import('./types').DemosData>('demos');
}

export async function getResume() {
  return readContent<import('./types').ResumeData>('resume');
}

export async function getAnalytics() {
  return readContent<import('./types').AnalyticsData>('analytics');
}

export async function getMeta() {
  return readContent<import('./types').MetaData>('meta');
}
