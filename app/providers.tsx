'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, type SessionUser } from '@/components/providers/auth-provider';
import { QueryProvider } from '@/components/providers/query-provider';

// Marks that the client bundle has booted, which unlocks the scroll-reveal
// hidden state (see the `.js`-gated rules in globals.css). Runs at module-parse
// time — before React commits — so above-the-fold content is hidden and revealed
// in the same paint with no flash. If the bundle never runs, the class is never
// added and reveal content stays fully visible instead of blank.
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('js');
}

/**
 * Single client-side provider tree mounted once in the root layout:
 *   QueryProvider (TanStack) → AuthProvider, with the global Tooltip context +
 * the app-themed Sonner toaster. `initialUser` is passed down from the Server
 * Component layout.
 */
export function Providers({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: SessionUser | null;
}) {
  return (
    <QueryProvider>
      <AuthProvider initialUser={initialUser}>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        <Toaster position="bottom-center" richColors closeButton />
      </AuthProvider>
    </QueryProvider>
  );
}
