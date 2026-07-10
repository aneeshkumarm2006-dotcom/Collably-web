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
        'group flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-brand-soft-2 text-brand'
          : 'text-[#4B4F56] hover:bg-elev hover:text-ink',
        collapsed && 'justify-center px-0',
      )}
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge != null && (
        <span
          className={cn(
            'ml-auto rounded-full px-1.5 py-0.5 font-mono text-[11px] leading-none',
            item.badgeAccent ? 'bg-brand text-white' : 'bg-secondary text-muted',
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
 * DashboardSidebar: white, 244px, role-aware nav, per the dashboard designs.
 *
 * The designs show no collapsed state and no mobile layout, but the app has
 * both and they are real behavior — so the icon rail (with tooltips) and the
 * mobile bottom tab bar are kept, restyled rather than removed.
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
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-hair bg-card md:flex',
          collapsed ? 'w-16' : 'w-[244px]',
          className,
        )}
      >
        <div className={cn('flex h-16 items-center', collapsed ? 'justify-center' : 'px-4')}>
          {collapsed ? (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-brand text-white">
              <BrandGlyph className="h-[17px] w-[17px]" />
            </span>
          ) : (
            <Link href={main[0]?.href ?? '/'} aria-label="LocalShout dashboard">
              <BrandMark className="text-[18px]" />
            </Link>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
          {!collapsed && (
            <div className="px-3 pb-1.5 pt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
              {role === 'creator' ? 'Menu' : 'Business'}
            </div>
          )}

          {main.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />
          ))}

          {collapsed ? (
            <div className="my-2 h-px bg-hair" />
          ) : (
            <div className="px-3 pb-1.5 pt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
              Account
            </div>
          )}

          {account.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} collapsed={collapsed} />
          ))}
        </nav>

        {!collapsed && (
          <div className="space-y-2 px-3 pb-2">
            {highlight}
            <Link
              href={profileHref}
              className="flex items-center gap-2.5 rounded-sm px-2 py-2 transition-colors hover:bg-elev"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warn-soft font-mono text-[11px] font-semibold text-warn">
                {initials(user.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-ink">{user.name}</span>
                {user.role && <span className="block truncate text-[11px] text-muted">{user.role}</span>}
              </span>
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'mx-3 mb-2 inline-flex items-center gap-2 rounded-sm px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-elev hover:text-ink',
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
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-hair bg-card md:hidden">
        {main.slice(0, 5).map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                active ? 'text-brand' : 'text-muted',
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="max-w-full truncate px-0.5">{item.label}</span>
              {item.badge != null && (
                <span className="absolute right-1/4 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
