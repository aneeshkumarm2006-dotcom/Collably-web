/**
 * User blocking. Maps 1:1 to `backend/src/routes/blocks.ts`.
 *
 * A block is account-level and enforced server-side in *both* directions, so the
 * UI only has to fire-and-refresh — there is no local suppression to maintain.
 * Existing threads stay readable; only sending is cut.
 */
import type { HttpClient } from '../types';

/** One row of the caller's blocked list. */
export interface BlockedAccount {
  userId: string;
  name: string;
  avatar: string | null;
  role: string;
  blockedAt: string;
}

export function createBlocksApi(http: HttpClient) {
  return {
    /** GET /blocks: accounts the caller has blocked, newest first. */
    list: () => http.get<{ blocks: BlockedAccount[] }>('/blocks'),
    /** POST /blocks: block a user. Idempotent. */
    block: (userId: string) => http.post<{ blocked: boolean; userId: string }>('/blocks', { userId }),
    /** DELETE /blocks/:userId: unblock. Idempotent. */
    unblock: (userId: string) =>
      http.delete<{ blocked: boolean; userId: string }>(`/blocks/${userId}`),
  };
}

export type BlocksApi = ReturnType<typeof createBlocksApi>;
