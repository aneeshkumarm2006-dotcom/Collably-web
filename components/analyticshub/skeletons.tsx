'use client';
/** Loading placeholders for every async area, so the hub never flashes blank. */
import { Skeleton } from '@/components/ui/skeleton';

export function KpiRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-hair bg-card p-4 shadow-card">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-7 w-20" />
          <Skeleton className="mt-3 h-[30px] w-full" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-hair bg-card p-5 shadow-card">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-4 w-full" style={{ height }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-hair bg-card p-4 shadow-card">
      <Skeleton className="h-5 w-36" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StripSkeleton() {
  return <TableSkeleton rows={5} />;
}
