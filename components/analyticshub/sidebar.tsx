'use client';
/**
 * Hub navigation. On desktop it's a fixed left rail with active states; on
 * mobile it collapses to a horizontal, scrollable strip pinned under the top
 * bar. Uses next/link so routes are real (bookmark/refresh safe).
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  LineChart as LineChartIcon,
  Search,
  Megaphone,
  BadgeDollarSign,
  Users,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/analyticshub', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/analyticshub/ga4', label: 'Analytics', icon: LineChartIcon },
  { href: '/analyticshub/gsc', label: 'Search Console', icon: Search },
  { href: '/analyticshub/meta', label: 'Meta Ads', icon: Megaphone },
  { href: '/analyticshub/gads', label: 'Google Ads', icon: BadgeDollarSign },
  { href: '/analyticshub/users', label: 'Users', icon: Users },
  { href: '/analyticshub/settings', label: 'Settings', icon: Settings },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ projectName }: { projectName: string }) {
  const isActive = useIsActive();

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-60 shrink-0 border-r border-hair bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-hair px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-sm font-bold text-white">
            {(projectName || 'A').slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold text-ink">{projectName || 'Analytics'}</p>
            <p className="text-[11px] text-faint">Analytics Hub</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-3" aria-label="Analytics Hub sections">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-soft text-brand'
                    : 'text-muted hover:bg-secondary hover:text-ink',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile strip */}
      <nav
        className="flex gap-1 overflow-x-auto border-b border-hair bg-card px-3 py-2 md:hidden"
        aria-label="Analytics Hub sections"
      >
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
                active ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-secondary hover:text-ink',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
