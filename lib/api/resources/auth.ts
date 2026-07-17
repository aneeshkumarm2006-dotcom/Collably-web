/**
 * Auth endpoints (PRD §17) against the BACKEND contract (`/auth/*`). These return
 * the JWT pair in JSON.
 *
 * IMPORTANT: in the browser, auth must NOT be called through the generic proxy,
 * or the JWT would land in client JS. Phase 3 adds dedicated same-origin route
 * handlers (`/api/auth/*`) that call these endpoints *server-side* and stash the
 * tokens in httpOnly cookies. This resource is therefore primarily for the server
 * transport (and those Phase 3 handlers); `GET /auth/me` is the one browser-safe
 * read (it carries no token in the body).
 */
import type { HttpClient } from '../types';
import type { AuthResponse, ForgotPasswordResponse, MeResponse } from '../types';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: 'business' | 'creator';
}

export interface LoginInput {
  email: string;
  password: string;
}

export function createAuthApi(http: HttpClient) {
  return {
    /** POST /auth/register: create an account, return tokens. */
    register: (input: RegisterInput) => http.post<AuthResponse>('/auth/register', input),

    /** POST /auth/login: email + password → tokens. */
    login: (input: LoginInput) => http.post<AuthResponse>('/auth/login', input),

    /** POST /auth/refresh: exchange a refresh token for a fresh pair. */
    refresh: (refreshToken: string) => http.post<AuthResponse>('/auth/refresh', { refreshToken }),

    /** POST /auth/google: verify a Google ID token, find-or-create the user. */
    google: (idToken: string, role?: 'business' | 'creator') =>
      http.post<AuthResponse>('/auth/google', { idToken, role }),

    /** POST /auth/forgot-password: start a reset (always 200, anti-enumeration). */
    forgotPassword: (email: string) =>
      http.post<ForgotPasswordResponse>('/auth/forgot-password', { email }),

    /** POST /auth/reset-password: set a new password from a token (auto-login). */
    resetPassword: (token: string, password: string) =>
      http.post<AuthResponse>('/auth/reset-password', { token, password }),

    /** GET /auth/me: the authenticated user + approval flag. */
    me: (signal?: AbortSignal) => http.get<MeResponse>('/auth/me', { signal }),

    /** PATCH /auth/me: update name / avatar / notification prefs. */
    updateMe: (input: {
      name?: string;
      avatar?: string | null;
      notificationPrefs?: { push?: boolean; email?: boolean };
    }) => http.patch<{ user: AuthResponse['user'] }>('/auth/me', input),

    /** PATCH /auth/password: change password (verifies the current one). */
    changePassword: (input: { currentPassword?: string; newPassword: string }) =>
      http.patch<{ updated: true }>('/auth/password', input),

    /** PATCH /auth/email: change email (verifies password + uniqueness). */
    changeEmail: (input: { email: string; password?: string }) =>
      http.patch<{ user: AuthResponse['user'] }>('/auth/email', input),

    /** DELETE /auth/me: permanently delete the account and its data. */
    deleteAccount: (password?: string) =>
      http.delete<{ deleted: true }>('/auth/me', password ? { password } : undefined),

    // --- Account verification (OTP: email + phone) ---
    // Backend hands `devCode` back only in non-prod when EXPOSE_DEV_OTP is on, so
    // the whole flow is testable before Resend/Twilio credentials exist.

    /** POST /auth/verify/email/send: email the signed-in user a 6-digit code. */
    sendEmailCode: () =>
      http.post<VerifySendResponse>('/auth/verify/email/send', {}),

    /** POST /auth/verify/email/confirm: check the code, mark email verified. */
    confirmEmailCode: (code: string) =>
      http.post<{ user: AuthResponse['user'] }>('/auth/verify/email/confirm', { code }),

    /** POST /auth/verify/phone/send: SMS the given E.164 number a 6-digit code. */
    sendPhoneCode: (phone: string) =>
      http.post<VerifySendResponse>('/auth/verify/phone/send', { phone }),

    /** POST /auth/verify/phone/confirm: check the code, store the verified number. */
    confirmPhoneCode: (phone: string, code: string) =>
      http.post<{ user: AuthResponse['user'] }>('/auth/verify/phone/confirm', { phone, code }),
  };
}

/** Shared shape of the two verification "send code" responses (email + phone). */
export interface VerifySendResponse {
  sent: boolean;
  expiresInMinutes?: number;
  alreadyVerified?: boolean;
  /** Dev-only: present when EXPOSE_DEV_OTP is on in a non-prod backend. */
  devCode?: string;
}

export type AuthApi = ReturnType<typeof createAuthApi>;
