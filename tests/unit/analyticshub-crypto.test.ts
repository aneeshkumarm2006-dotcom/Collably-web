/**
 * Analytics Hub crypto + auth-primitive tests: AES-GCM round-trip + tamper,
 * scrypt hash/verify, and HMAC session mint/verify/expiry. The secret is set
 * before importing the module (it reads the env var at module load).
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';

// A valid 32-byte base64 secret, set before the module under test loads.
process.env.ANALYTICSHUB_SECRET_KEY = Buffer.alloc(32, 7).toString('base64');

let mod: typeof import('@/lib/analyticshub/crypto');
beforeAll(async () => {
  mod = await import('@/lib/analyticshub/crypto');
});

describe('secret validation', () => {
  it('accepts a well-formed 32-byte base64 secret', () => {
    expect(mod.secretStatus().ok).toBe(true);
  });
});

describe('AES-256-GCM encrypt/decrypt', () => {
  it('round-trips arbitrary strings', () => {
    for (const s of ['', 'hello', '🔐 tokens & keys', JSON.stringify({ a: 1, b: [2, 3] })]) {
      expect(mod.decrypt(mod.encrypt(s))).toBe(s);
    }
  });

  it('produces a different ciphertext each time (random IV)', () => {
    expect(mod.encrypt('same')).not.toBe(mod.encrypt('same'));
  });

  it('rejects a tampered ciphertext (auth tag fails)', () => {
    const ct = mod.encrypt('secret-value');
    const buf = Buffer.from(ct, 'base64');
    buf[buf.length - 1] ^= 0xff; // flip a ciphertext byte
    expect(() => mod.decrypt(buf.toString('base64'))).toThrow();
  });

  it('rejects malformed/short input', () => {
    expect(() => mod.decrypt('nope')).toThrow();
  });
});

describe('scrypt password hashing', () => {
  it('verifies the correct password and rejects the wrong one', () => {
    const hash = mod.hashPassword('correct horse battery');
    expect(hash.startsWith('scrypt$')).toBe(true);
    expect(mod.verifyPassword('correct horse battery', hash)).toBe(true);
    expect(mod.verifyPassword('wrong', hash)).toBe(false);
  });

  it('rejects malformed stored hashes', () => {
    expect(mod.verifyPassword('x', 'not-a-hash')).toBe(false);
    expect(mod.verifyPassword('x', '')).toBe(false);
  });
});

describe('HMAC session token', () => {
  it('mints a token that verifies', () => {
    const t = mod.mintSession(3600);
    expect(mod.verifySession(t)).toBe(true);
  });

  it('rejects tampered payloads and signatures', () => {
    const t = mod.mintSession(3600);
    const [payload, sig] = t.split('.');
    expect(mod.verifySession(`${payload}x.${sig}`)).toBe(false);
    expect(mod.verifySession(`${payload}.${sig}x`)).toBe(false);
    expect(mod.verifySession('garbage')).toBe(false);
    expect(mod.verifySession(undefined)).toBe(false);
  });

  it('rejects an expired token', () => {
    const t = mod.mintSession(-1); // already expired
    expect(mod.verifySession(t)).toBe(false);
  });
});
