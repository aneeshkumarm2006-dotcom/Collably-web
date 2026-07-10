import { DashboardContainer } from '@/components/dashboard/page-shell';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Instant loading UI for every /dashboard/creator/* navigation. Mirrors the
 * design's skeleton: a four-up stat row over a two-column content grid, so the
 * shell (sidebar + top bar) stays put while the server page streams in.
 */
export default function CreatorDashboardLoading() {
  return (
    <DashboardContainer>
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-hair bg-card p-[18px]">
            <Skeleton className="h-[38px] w-[38px] rounded-[10px]" />
            <Skeleton className="mt-4 h-[26px] w-[55%]" />
            <Skeleton className="mt-2.5 h-3 w-[40%]" />
          </div>
        ))}
      </div>

      <div className="mt-[22px] grid gap-[18px] lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <div className="rounded-lg border border-hair bg-card p-[18px]">
          <Skeleton className="h-[18px] w-2/5" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mt-3 h-14 w-full rounded-[10px]" />
          ))}
        </div>
        <div className="rounded-lg border border-hair bg-card p-[18px]">
          <Skeleton className="h-[18px] w-1/2" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mt-3 h-10 w-full rounded-[10px]" />
          ))}
        </div>
      </div>
    </DashboardContainer>
  );
}
