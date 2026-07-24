'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu } from 'lucide-react';

import { cn } from '@/lib/utils';
import { postAuthPath } from '@/lib/auth/user';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { track } from '@/lib/analytics';
import { BrandMark } from '@/components/shared/brand-mark';
import { StickerButton } from '@/components/shared/sticker';
import { NotificationBell } from '@/components/shared/notification-bell';
import { UserMenu } from '@/components/shared/user-menu';

const LINKS = [
  { label: 'For Creators', href: '/for-creators' },
  { label: 'For Businesses', href: '/for-businesses' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Public, auth-aware navbar. Signed out → Log in / Get started; signed in →
 * notification bell + avatar menu.
 *
 * Sticker language: solid (never translucent) so the heavy ink underline reads
 * as a drawn rule rather than a blurred edge. `onDark` tints it for dark bands.
 */
export function Navbar({ onDark }: { onDark?: boolean }) {
  const { user, logout } = useAuth();
  const pathname = usePathname() ?? '/';
  const [menuOpen, setMenuOpen] = useState(false);
  // Signed-in users land on their dashboard from the logo; guests go to marketing home.
  const homeHref = user ? postAuthPath(user) : '/';
  // The prospect-facing nav links are hidden once signed in — the dashboard sidebar
  // + avatar menu are the app's navigation then.
  const navLinks = user ? [] : LINKS;

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 h-[68px] border-b-outline',
        onDark ? 'border-ink bg-band' : 'border-ink bg-page',
      )}
    >
      <div className="mx-auto flex h-full max-w-shell items-center justify-between gap-4 px-6 lg:px-10">
        <div className="flex items-center gap-8">
          <Link href={homeHref} aria-label={user ? 'Local Creator Crew dashboard' : 'Local Creator Crew home'}>
            <BrandMark onDark={onDark} />
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'font-display text-[15px] font-semibold transition-colors',
                  isActive(pathname, l.href)
                    ? 'text-brand'
                    : onDark
                      ? 'text-white/70 hover:text-white'
                      : 'text-ink hover:text-coral',
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              <NotificationBell notifications={[]} />
              <UserMenu user={user} onLogout={logout} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => track('cta_login', { location: 'navbar' })}
                className="hidden rounded-md px-3.5 py-2 font-display text-[15px] font-semibold text-ink transition-colors hover:text-coral sm:inline-flex"
              >
                Log in
              </Link>
              <StickerButton asChild tone="yellow" size="sm">
                <Link
                  href="/signup"
                  onClick={() => track('cta_get_started', { location: 'navbar' })}
                >
                  Get started
                </Link>
              </StickerButton>
            </>
          )}

          {/* Mobile menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted hover:bg-secondary hover:text-ink md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader className="px-0 pt-0">
                <SheetTitle>
                  <BrandMark />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <SheetClose asChild key={l.href}>
                    <Link
                      href={l.href}
                      className={cn(
                        'rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary',
                        isActive(pathname, l.href) ? 'text-brand' : 'text-ink',
                      )}
                    >
                      {l.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
              {!user && (
                <div className="mt-4 flex flex-col gap-2 border-t border-hair pt-4">
                  <SheetClose asChild>
                    <Button asChild variant="outline">
                      <Link href="/login" onClick={() => track('cta_login', { location: 'mobile_menu' })}>
                        Log in
                      </Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild>
                      <Link
                        href="/signup"
                        onClick={() => track('cta_get_started', { location: 'mobile_menu' })}
                      >
                        Get started
                      </Link>
                    </Button>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
