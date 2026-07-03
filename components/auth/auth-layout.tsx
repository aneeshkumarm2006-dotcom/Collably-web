import Link from 'next/link';

import { cn } from '@/lib/utils';
import { BrandMark } from '@/components/shared/brand-mark';

/**
 * Shared auth shell: the split-screen brand panel (left, gradient) + form panel
 * (right). Used by every `(auth)` page so login / signup / forgot / reset share
 * one branded frame; only the form (`children`) changes per page. The optional
 * copy props are preserved for API compatibility but the brand panel now renders
 * a fixed marketing message + testimonial (per the redesign mockups).
 *
 * Server component (purely presentational). The brand panel collapses below `md`
 * so the form gets the full width on mobile.
 */

export interface ProofStat {
  value: string;
  label: string;
}

export interface AuthLayoutProps {
  children: React.ReactNode;
  /** Big headline on the brand panel (unused by the redesigned panel; kept for API compat). */
  tagline?: string;
  /** Supporting line under the tagline (kept for API compat). */
  subtitle?: string;
  /** Social-proof stats (kept for API compat). */
  proof?: ProofStat[];
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel (hidden on small screens) */}
      <aside
        className="relative hidden flex-[0_0_44%] flex-col justify-between overflow-hidden p-11 text-white md:flex"
        style={{ background: 'linear-gradient(150deg,#0064E0,#7B61FF)' }}
      >
        {/* Decorative floating blobs */}
        <span
          aria-hidden
          className="animate-cb-float pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full bg-white/10"
        />
        <span
          aria-hidden
          className="animate-cb-float-b pointer-events-none absolute -left-10 bottom-32 h-40 w-40 rounded-[36px] bg-white/[0.08]"
        />
        <span
          aria-hidden
          className="animate-cb-float pointer-events-none absolute right-24 bottom-16 h-24 w-24 rounded-full bg-white/[0.07]"
        />

        <Link href="/" className="relative z-10 w-fit">
          <BrandMark onDark />
        </Link>

        <div className="relative z-10 max-w-[440px]">
          <h2 className="font-display text-[40px] font-extrabold leading-[1.08] tracking-[-0.03em]">
            Local collabs.
            <br />
            Real rewards.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#DCEAFF]">
            Join 3,200+ Canadian creators and 640+ local businesses collaborating the honest way.
          </p>

          <figure className="mt-8 rounded-2xl border border-white/20 bg-white/12 p-[18px]">
            <blockquote className="text-[15px] leading-relaxed text-white">
              &ldquo;I earned a $180 dinner in my first week — no follower minimum, no agency.&rdquo;
            </blockquote>
            <figcaption className="mt-3.5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-[13px] font-bold text-white">
                MK
              </span>
              <span className="text-[13px] leading-tight">
                <span className="block font-bold text-white">Maya K.</span>
                <span className="block text-[#DCEAFF]">Food creator · Toronto</span>
              </span>
            </figcaption>
          </figure>
        </div>

        <p className="relative z-10 text-[13px] text-[#DCEAFF]">
          © 2026 Collably · Proudly Canadian
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 items-center justify-center bg-card p-10">
        <div className="w-full max-w-[400px]">
          {/* Mobile brand (brand panel is hidden < md) */}
          <Link href="/" className="mb-8 inline-flex md:hidden">
            <BrandMark />
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}

/** Small "or" divider between the Google button and the email form. */
export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-3.5 text-[13px] text-faint">
      <span className="h-px flex-1 bg-hair" />
      or
      <span className="h-px flex-1 bg-hair" />
    </div>
  );
}

/** Inline error banner shown above the form on submit failure. */
export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={cn(
        'mb-4 rounded-md border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger',
      )}
    >
      {message}
    </div>
  );
}
