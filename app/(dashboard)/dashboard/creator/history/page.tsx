import Link from 'next/link';
import type { Metadata } from 'next';
import { ExternalLink, History } from 'lucide-react';

import { serverApi } from '@/lib/api/server';
import { formatDate } from '@/lib/format';
import { DashboardContainer } from '@/components/dashboard/page-shell';
import { Reveal } from '@/components/shared/reveal';
import { CreatorApplicationRow } from '@/components/creator/application-row';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'History' };

export default async function CreatorHistoryPage() {
  const res = await serverApi.applications
    .list({ status: 'Completed', limit: 50 })
    .catch(() => null);
  const completed = (res?.data ?? [])
    .slice()
    .sort(
      (a, b) =>
        +new Date(b.verifiedAt ?? b.updatedAt ?? b.createdAt) -
        +new Date(a.verifiedAt ?? a.updatedAt ?? a.createdAt),
    );

  return (
    <DashboardContainer>
      {completed.length === 0 ? (
        <div className="sticker rounded-card bg-card">
          <EmptyState
            icon={<History />}
            title="No completed collabs yet"
            description="Once a brand verifies your submission, the finished collab is recorded here."
            action={
              <Button asChild>
                <Link href="/dashboard/creator/explore">Browse campaigns</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <Reveal className="sticker overflow-hidden rounded-card bg-card">
          <div className="grid grid-cols-[minmax(0,2.4fr)_auto] gap-3 border-b border-hair px-[18px] py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-faint sm:grid-cols-[minmax(0,2.4fr)_1fr_1fr_auto]">
            <span>Collab</span>
            <span className="hidden sm:block">Reward</span>
            <span className="hidden sm:block">Completed</span>
            <span className="text-right">Status</span>
          </div>
          {completed.map((a) => (
            <CreatorApplicationRow
              key={a._id}
              application={a}
              className="r"
              dateLabel={a.verifiedAt ? formatDate(a.verifiedAt) : 'Completed'}
              actions={
                a.submissionLink ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={a.submissionLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" /> View post
                    </a>
                  </Button>
                ) : undefined
              }
            />
          ))}
        </Reveal>
      )}
    </DashboardContainer>
  );
}
