/**
 * Mongoose connection singleton for the SEO blog's own MongoDB (independent of
 * the external backend the rest of the app proxies to). Uses the standard
 * Next.js global-cache pattern so a single connection is reused across HMR
 * reloads in dev and warm serverless invocations in prod — otherwise every
 * request would open a new connection and exhaust the pool.
 *
 * Server-only: importing this from a client bundle is a build error.
 */
import 'server-only';
import mongoose from 'mongoose';
import { config } from '@/lib/config';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache on globalThis so the connection survives module re-evaluation (HMR /
// lambda reuse). Typed via a module-scoped augmentation.
const globalForMongoose = globalThis as unknown as { _seoMongoose?: MongooseCache };

const cache: MongooseCache = globalForMongoose._seoMongoose ?? { conn: null, promise: null };
globalForMongoose._seoMongoose = cache;

/**
 * Connect to the SEO blog database (or return the cached connection). Throws a
 * clear error when `MONGODB_URI` is unset so misconfiguration fails loudly
 * rather than hanging on a buffered query.
 */
export async function connectMongo(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!config.seo.mongodbUri) {
    throw new Error(
      'MONGODB_URI is not set. The /seoteam blog needs a MongoDB connection string (see .env.example).',
    );
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(config.seo.mongodbUri, {
      // Fail fast instead of buffering commands until a (possibly missing)
      // connection appears — surfaces config/network problems immediately.
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    // Reset the promise so a transient failure can be retried on the next call.
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}
