import { describe, expect, it } from 'vitest';
import type { PublicUser } from '@/lib/shared';
import {
  canTakeGatedAction,
  needsVerification,
  onboardingPath,
  postAuthPath,
  roleHome,
  toSessionUser,
  VERIFY_PATH,
  type SessionUser,
} from '@/lib/auth/user';

/** Build a minimal valid PublicUser, overridable per test. */
function makeUser(overrides: Partial<PublicUser> = {}): PublicUser {
  return {
    _id: 'u_1',
    name: 'Maya Bennett',
    email: 'maya@example.com',
    role: 'creator',
    avatar: 'https://cdn.example.com/maya.png',
    isVerified: true,
    isPhoneVerified: true,
    phone: '+14165550199',
    isOnboarded: true,
    isBanned: false,
    createdAt: '2026-06-01T12:00:00.000Z',
    ...overrides,
  };
}

/** A fully-verified session shape for postAuthPath cases (verification passes). */
function verified(over: Partial<SessionUser> = {}): Pick<
  SessionUser,
  'role' | 'isOnboarded' | 'emailVerified' | 'phoneVerified'
> {
  return { role: 'creator', isOnboarded: true, emailVerified: true, phoneVerified: true, ...over };
}

describe('toSessionUser', () => {
  it('maps the PublicUser fields plus the approved flag onto a SessionUser', () => {
    const session = toSessionUser(makeUser(), true);
    expect(session).toEqual<SessionUser>({
      id: 'u_1',
      name: 'Maya Bennett',
      email: 'maya@example.com',
      role: 'creator',
      avatar: 'https://cdn.example.com/maya.png',
      emailVerified: true,
      phoneVerified: true,
      phone: '+14165550199',
      isOnboarded: true,
      approved: true,
    });
  });

  it('null-coalesces a missing or null avatar to null', () => {
    expect(toSessionUser(makeUser({ avatar: undefined }), false).avatar).toBeNull();
    expect(toSessionUser(makeUser({ avatar: null }), false).avatar).toBeNull();
  });

  it('keeps a present avatar untouched', () => {
    expect(toSessionUser(makeUser({ avatar: '/a.png' }), false).avatar).toBe('/a.png');
  });

  it('derives emailVerified from the source isVerified flag', () => {
    expect(toSessionUser(makeUser({ isVerified: false }), true).emailVerified).toBe(false);
    expect(toSessionUser(makeUser({ isVerified: true }), true).emailVerified).toBe(true);
  });

  it('passes the approved argument straight through (independent of the user)', () => {
    expect(toSessionUser(makeUser(), false).approved).toBe(false);
    expect(toSessionUser(makeUser(), true).approved).toBe(true);
  });

  it('carries isOnboarded across unchanged', () => {
    expect(toSessionUser(makeUser({ isOnboarded: false }), true).isOnboarded).toBe(false);
  });
});

describe('roleHome', () => {
  it('routes business and creator to their dashboards', () => {
    expect(roleHome('business')).toBe('/dashboard/business');
    expect(roleHome('creator')).toBe('/dashboard/creator');
  });

  it('falls back to the site root for admin (admins live in the separate app)', () => {
    expect(roleHome('admin')).toBe('/');
  });
});

describe('onboardingPath', () => {
  it('sends creators to the creator onboarding entry point', () => {
    expect(onboardingPath('creator')).toBe('/onboarding/creator');
  });

  it('sends non-creators (business / admin) to business onboarding', () => {
    expect(onboardingPath('business')).toBe('/onboarding/business');
    expect(onboardingPath('admin')).toBe('/onboarding/business');
  });
});

describe('postAuthPath', () => {
  it('routes a verified, onboarded user to their role home', () => {
    expect(postAuthPath(verified({ role: 'creator' }))).toBe('/dashboard/creator');
    expect(postAuthPath(verified({ role: 'business' }))).toBe('/dashboard/business');
  });

  it('routes a verified, not-yet-onboarded user to onboarding', () => {
    expect(postAuthPath(verified({ role: 'creator', isOnboarded: false }))).toBe(
      '/onboarding/creator',
    );
    expect(postAuthPath(verified({ role: 'business', isOnboarded: false }))).toBe(
      '/onboarding/business',
    );
  });

  it('routes an unverified user to the verification gate first (before onboarding)', () => {
    expect(postAuthPath(verified({ emailVerified: false }))).toBe(VERIFY_PATH);
    expect(postAuthPath(verified({ phoneVerified: false }))).toBe(VERIFY_PATH);
    // Even an onboarded account is gated until both channels are confirmed.
    expect(postAuthPath(verified({ isOnboarded: true, phoneVerified: false }))).toBe(VERIFY_PATH);
  });
});

describe('needsVerification', () => {
  it('is true until BOTH email and phone are verified', () => {
    expect(needsVerification({ role: 'creator', emailVerified: false, phoneVerified: false })).toBe(true);
    expect(needsVerification({ role: 'creator', emailVerified: true, phoneVerified: false })).toBe(true);
    expect(needsVerification({ role: 'creator', emailVerified: false, phoneVerified: true })).toBe(true);
    expect(needsVerification({ role: 'creator', emailVerified: true, phoneVerified: true })).toBe(false);
  });

  it('exempts admins (they use the separate admin app)', () => {
    expect(needsVerification({ role: 'admin', emailVerified: false, phoneVerified: false })).toBe(false);
  });
});

describe('canTakeGatedAction', () => {
  it('always permits admins regardless of approval', () => {
    expect(canTakeGatedAction({ role: 'admin', approved: false })).toBe(true);
    expect(canTakeGatedAction({ role: 'admin', approved: true })).toBe(true);
  });

  it('gates creators and businesses on the approved flag', () => {
    expect(canTakeGatedAction({ role: 'creator', approved: true })).toBe(true);
    expect(canTakeGatedAction({ role: 'creator', approved: false })).toBe(false);
    expect(canTakeGatedAction({ role: 'business', approved: true })).toBe(true);
    expect(canTakeGatedAction({ role: 'business', approved: false })).toBe(false);
  });
});
