/**
 * Analytics Hub config store — a single `analyticshub_config` collection in the
 * same MongoDB the /seoteam feature uses. Every value is AES-256-GCM encrypted
 * at rest (tokens, service-account keys, the password hash, even project name).
 * No SQL grants apply (Mongo); the collection is created on first write.
 *
 * Also hosts the durable 6h response cache and the login rate-limit counters,
 * so both survive across serverless instances. Server-only.
 */
import 'server-only';
import { Schema, model, models, type Model } from 'mongoose';
import { connectMongo } from '@/lib/db/mongoose';
import { encrypt, decrypt } from '@/lib/analyticshub/crypto';

interface ConfigDoc {
  key: string;
  value: string; // encrypted
  updatedAt: Date;
}

const configSchema = new Schema<ConfigDoc>({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

// Guard against re-registration under HMR / warm lambdas.
const ConfigModel: Model<ConfigDoc> =
  (models.AnalyticsHubConfig as Model<ConfigDoc>) ||
  model<ConfigDoc>('AnalyticsHubConfig', configSchema, 'analyticshub_config');

/** Read + decrypt a stored value (null if absent or undecryptable). */
export async function getValue(key: string): Promise<string | null> {
  await connectMongo();
  const doc = await ConfigModel.findOne({ key }).lean();
  if (!doc) return null;
  try {
    return decrypt(doc.value);
  } catch {
    return null;
  }
}

/** Read + decrypt + JSON.parse a stored object (null on any failure). */
export async function getJSON<T>(key: string): Promise<T | null> {
  const raw = await getValue(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Encrypt + upsert a value. */
export async function setValue(key: string, value: string): Promise<void> {
  await connectMongo();
  await ConfigModel.updateOne(
    { key },
    { $set: { value: encrypt(value), updatedAt: new Date() } },
    { upsert: true },
  );
}

/** Encrypt + upsert a JSON-serializable object. */
export async function setJSON(key: string, value: unknown): Promise<void> {
  await setValue(key, JSON.stringify(value));
}

/** Delete a key (idempotent). */
export async function delValue(key: string): Promise<void> {
  await connectMongo();
  await ConfigModel.deleteOne({ key });
}

// ── Response cache (6h TTL) ──────────────────────────────────────────────────
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export async function getCache<T>(cacheKey: string): Promise<T | null> {
  const wrapped = await getJSON<{ at: number; data: T }>(`cache:${cacheKey}`);
  if (!wrapped) return null;
  if (Date.now() - wrapped.at > CACHE_TTL_MS) return null;
  return wrapped.data;
}

export async function setCache<T>(cacheKey: string, data: T): Promise<void> {
  await setJSON(`cache:${cacheKey}`, { at: Date.now(), data });
}

/** Bust every cache entry for a source (called on connect/disconnect/refresh). */
export async function bustCache(source: string): Promise<void> {
  await connectMongo();
  await ConfigModel.deleteMany({ key: { $regex: `^cache:${source}:` } });
}

// ── Login rate limit (durable, 8 fails / 15 min) ─────────────────────────────
const MAX_FAILS = 8;
const WINDOW_MS = 15 * 60 * 1000;

export async function isLockedOut(): Promise<boolean> {
  const rec = await getJSON<{ fails: number; first: number }>('ratelimit:login');
  if (!rec) return false;
  if (Date.now() - rec.first > WINDOW_MS) return false;
  return rec.fails >= MAX_FAILS;
}

export async function recordLoginFail(): Promise<void> {
  const rec = await getJSON<{ fails: number; first: number }>('ratelimit:login');
  if (!rec || Date.now() - rec.first > WINDOW_MS) {
    await setJSON('ratelimit:login', { fails: 1, first: Date.now() });
  } else {
    await setJSON('ratelimit:login', { fails: rec.fails + 1, first: rec.first });
  }
}

export async function clearLoginFails(): Promise<void> {
  await delValue('ratelimit:login');
}
