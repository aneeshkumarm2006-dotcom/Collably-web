/**
 * Analytics Hub crypto primitives — node:crypto only, zero native deps.
 *
 * One env secret (`ANALYTICSHUB_SECRET_KEY`, 32-byte base64) is expanded via
 * HKDF into domain-separated sub-keys: one for AES-256-GCM value encryption,
 * one for the HMAC that signs the session cookie. Every credential/token/hash
 * we persist is encrypted with `encrypt()`. Passwords use scrypt (memory-hard).
 *
 * Server-only: this must never reach the client bundle.
 */
import 'server-only';
import {
  createHmac,
  hkdfSync,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

const RAW_SECRET = process.env.ANALYTICSHUB_SECRET_KEY ?? '';

/** Thrown when the env secret is missing/malformed — message names the fix. */
export class SecretKeyError extends Error {}

/**
 * Decode + validate `ANALYTICSHUB_SECRET_KEY`. Distinguishes the three failure
 * modes the operator will actually hit so /status can name the fix precisely.
 */
export function loadSecret(): Buffer {
  if (!RAW_SECRET) {
    throw new SecretKeyError(
      'ANALYTICSHUB_SECRET_KEY is not set. Generate one with `openssl rand -base64 32` and add it to your environment (redeploy after saving).',
    );
  }
  let decoded: Buffer;
  try {
    decoded = Buffer.from(RAW_SECRET, 'base64');
  } catch {
    throw new SecretKeyError('ANALYTICSHUB_SECRET_KEY is not valid base64.');
  }
  if (decoded.length !== 32) {
    throw new SecretKeyError(
      `ANALYTICSHUB_SECRET_KEY must decode to 32 bytes; got ${decoded.length}. Regenerate with \`openssl rand -base64 32\`.`,
    );
  }
  return decoded;
}

/** True when the secret is present and well-formed (for /status, no throw). */
export function secretStatus(): { ok: boolean; reason?: string } {
  try {
    loadSecret();
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'invalid secret' };
  }
}

// Domain-separated sub-keys via HKDF (SHA-256). `info` separates the purposes.
function subKey(info: string): Buffer {
  const master = loadSecret();
  return Buffer.from(hkdfSync('sha256', master, Buffer.alloc(0), Buffer.from(info), 32));
}

const encKey = (): Buffer => subKey('analyticshub:aes-256-gcm:v1');
const macKey = (): Buffer => subKey('analyticshub:cookie-hmac:v1');

/** AES-256-GCM encrypt → base64(iv | tag | ciphertext). */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString('base64');
}

/** Inverse of `encrypt`. Throws on tamper (bad tag) or malformed input. */
export function decrypt(payload: string): string {
  const buf = Buffer.from(payload, 'base64');
  if (buf.length < 28) throw new Error('ciphertext too short');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', encKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

// ── Password hashing (scrypt) ────────────────────────────────────────────────
const SCRYPT_N = 16384; // CPU/memory cost
const SCRYPT_KEYLEN = 64;

/** scrypt hash → `scrypt$<saltB64>$<hashB64>`. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_N });
  return `scrypt$${salt.toString('base64')}$${derived.toString('base64')}`;
}

/** Constant-time verify of a password against a stored `scrypt$…` string. */
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[1], 'base64');
  const expected = Buffer.from(parts[2], 'base64');
  let derived: Buffer;
  try {
    derived = scryptSync(password, salt, expected.length, { N: SCRYPT_N });
  } catch {
    return false;
  }
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

// ── Session cookie (HMAC-signed, self-contained) ─────────────────────────────
function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

/** Mint a signed session token valid for `ttlSeconds` (default 30 days). */
export function mintSession(ttlSeconds = 60 * 60 * 24 * 30): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = b64url(Buffer.from(JSON.stringify({ exp })));
  const sig = b64url(createHmac('sha256', macKey()).update(payload).digest());
  return `${payload}.${sig}`;
}

/** Verify a session token: signature (timing-safe) + not expired. */
export function verifySession(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = b64url(createHmac('sha256', macKey()).update(payload).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(fromB64url(payload).toString('utf8')) as { exp: number };
    return typeof exp === 'number' && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
