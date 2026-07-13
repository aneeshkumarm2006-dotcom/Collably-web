import { cn } from '@/lib/utils';

/**
 * Shared dashboard page primitives: a centered content container and the
 * `.page-head` (title + subtitle + optional action) used across every dashboard
 * route, so the inner pages stay consistent without repeating layout classes.
 */
export function DashboardContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-[1600px] px-5 py-7 sm:px-6 lg:px-10', className)}>{children}</div>
  );
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Uppercase coral mono label above the title (the sticker eyebrow). */
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, eyebrow, action, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-coral">
            {eyebrow}
          </p>
        )}
        {/* Space Grotesk display title — unified with the marketing surface. */}
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-ink">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
