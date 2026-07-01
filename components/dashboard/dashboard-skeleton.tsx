import { DashboardContainer } from '@/components/dashboard/page-shell';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Generic dashboard content skeleton, shown by the route `loading.tsx` files
 * while a server-rendered page (session + data fetch) streams in. Renders inside
 * the persistent dashboard shell, so the sidebar/topbar stay put and navigation
 * feels instant instead of blank.
 */
export function DashboardSkeleton() {
  return (
    <DashboardContainer>
      {/* Header */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[116px] w-full rounded-2xl" />
        ))}
      </div>

      {/* Content rows */}
      <div className="mt-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </DashboardContainer>
  );
}
