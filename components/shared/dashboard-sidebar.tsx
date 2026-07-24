'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Building2,
  ChevronsLeft,
  ChevronsRight,
  Compass,
  FileText,
  Handshake,
  History,
  LayoutDashboard,
  type LucideIcon,
  Megaphone,
  MessageSquare,
  Settings,
  Sparkles,
  Upload,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { BrandGlyph, BrandMark } from '@/components/shared/brand-mark';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface DashNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
  /** Filled blue badge rather than the muted grey default. */
  badgeAccent?: boolean;
}

/** Default role-aware navigation. */
export const DASH_NAV: Record<'creator' | 'business', { main: DashNavItem[]; account: DashNavItem[] }> =
  {
    creator: {
      main: [
        { label: 'Overview', href: '/dashboard/creator', icon: LayoutDashboard },
        { label: 'Explore', href: '/dashboard/creator/explore', icon: Compass },
        { label: 'My Applications', href: '/dashboard/creator/applications', icon: FileText },
        { label: 'Active Collabs', href: '/dashboard/creator/collabs', icon: Handshake },
        { label: 'Messages', href: '/dashboard/creator/messages', icon: MessageSquare, badgeAccent: true },
        { label: 'History', href: '/dashboard/creator/history', icon: History },
      ],
      account: [
        { label: 'Profile', href: '/dashboard/creator/profile', icon: Sparkles },
        { label: 'Settings', href: '/dashboard/creator/settings', icon: Settings },
      ],
    },
    business: {
      main: [
        { label: 'Overview', href: '/dashboard/business', icon: LayoutDashboard },
        { label: 'My Campaigns', href: '/dashboard/business/campaigns', icon: Megaphone },
        { label: 'Applications', href: '/dashboard/business/applications', icon: FileText, badgeAccent: true },
        { label: 'Active Collabs', href: '/dashboard/business/collabs', icon: Handshake },
        { label: 'Submissions', href: '/dashboard/business/submissions', icon: Upload },
        { label: 'Messages', href: '/dashboard/business/messages', icon: MessageSquare },
      ],
      account: [
        { label: 'Profile', href: '/dashboard/business/profile', icon: Building2 },
        { label: 'Settings', href: '/dashboard/business/settings', icon: Settings },
      ],
    },
  };

export interface DashboardSidebarProps {
  role: 'creator' | 'business';
  user: { name: string; role?: string; avatar?: string | null };
  items?: DashNavItem[];
  accountItems?: DashNavItem[];
  onLogout?: () => void;
  defaultCollapsed?: boolean;
  /** Card pinned above the profile chip — e.g. the creator's "Rewards earned". */
  highlight?: React.ReactNode;
  className?: string;
}

function useActive(rootHref: string) {
  const pathname = usePathname() ?? '';
  return (href: string) =>
    href === rootHref ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Sticker nav item. Active = an ink-outlined brand pill with a solid offset
 * shadow (the marketing language's signature); inactive = quiet ink text that
 * warms to a beige tint on hover. The whole row nudges right on hover so the
 * rail feels tactile.
 */
function NavLink({
  item,
  active,
  collapsed,
}: {
  item: DashNavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const link = (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-[14px] font-semibold transition-all duration-150',
        active
          ? 'border-2 border-ink bg-brand text-white shadow-[2px_2px_0_var(--ink)]'
          : 'border-2 border-transparent text-ink/70 hover:-translate-y-px hover:bg-secondary hover:text-ink',
        collapsed && 'justify-center px-0',
      )}
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.4 : 2.1} />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge != null && (
        <span
          className={cn(
            'ml-auto inline-flex min-w-[20px] items-center justify-center rounded-full border-2 border-ink px-1.5 py-0.5 font-mono text-[11px] font-bold leading-none',
            active
              ? 'bg-white text-brand'
              : item.badgeAccent
                ? 'bg-brand text-white'
                : 'bg-yellow text-ink',
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}

/** Initials for the avatar tile when the user has no uploaded image. */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * DashboardSidebar — sticker / neo-brutalist rail, unified with the marketing
 * site: cream page, a hard ink right edge, Space Grotesk wordmark, coral mono
 * section labels, and ink-outlined active pills. Collapses to an icon rail
 * (tooltips) on tablet and a bottom tab bar on mobile.
 */
export function DashboardSidebar({
  role,
  user,
  items,
  accountItems,
  defaultCollapsed = false,
  highlight,
  className,
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const main = items ?? DASH_NAV[role].main;
  const account = accountItems ?? DASH_NAV[role].account;
  const isActive = useActive(main[0]?.href ?? '');
  const profileHref = account[0]?.href ?? '/';

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r-[2.5px] border-ink bg-page md:flex',
          collapsed ? 'w-[68px]' : 'w-[256px]',
          className,
        )}
      >
        <div className={cn('flex h-[68px] items-center', collapsed ? 'justify-center' : 'px-5')}>
          {collapsed ? (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border-2 border-ink bg-brand text-white shadow-[2px_2px_0_var(--ink)]">
              <BrandGlyph className="h-[18px] w-[18px]" />
            </span>
          ) : (
            <Link href={main[0]?.href ?? '/'} aria-label="Local Creator Crew dashboard">
              <BrandMark className="text-[20px]" />
            </Link>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-2 pt-1">
          {!collapsed && (
            <div className="px-2 pb-1.5 pt-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-coral">
              {role === 'creator' ? 'Creator' : 'Business'}
            </div>
          )}

          {main.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />
          ))}

          {collapsed ? (
            <div className="mx-auto my-2 h-0.5 w-6 rounded-full bg-ink/15" />
          ) : (
            <div className="px-2 pb-1.5 pt-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-coral">
              Account
            </div>
          )}

          {account.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />
          ))}
        </nav>

        {!collapsed && (
          <div className="space-y-2.5 px-3 pb-3">
            {highlight}
            <Link
              href={profileHref}
              className="press flex items-center gap-2.5 rounded-[12px] border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--ink)]"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[9px] border-2 border-ink bg-yellow font-display text-[13px] font-bold text-ink">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- small avatar tile
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(user.name)
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[13.5px] font-bold text-ink">
                  {user.name}
                </span>
                {user.role && (
                  <span className="block truncate text-[11px] font-medium text-muted">
                    {user.role}
                  </span>
                )}
              </span>
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'mx-3 mb-3 inline-flex items-center gap-2 rounded-[10px] border-2 border-transparent px-3 py-2 text-[13px] font-semibold text-muted transition-colors hover:border-ink hover:bg-secondary hover:text-ink',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-[18px] w-[18px]" />
          ) : (
            <>
              <ChevronsLeft className="h-[18px] w-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t-[2.5px] border-ink bg-page md:hidden">
        {main.slice(0, 5).map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition-colors',
                active ? 'text-brand' : 'text-muted',
              )}
            >
              {active && (
                <span className="absolute inset-x-4 top-0 h-[3px] rounded-b-full bg-brand" aria-hidden />
              )}
              <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className="max-w-full truncate px-0.5">{item.label}</span>
              {item.badge != null && (
                <span className="absolute right-1/4 top-1.5 h-2 w-2 rounded-full border border-ink bg-coral" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
