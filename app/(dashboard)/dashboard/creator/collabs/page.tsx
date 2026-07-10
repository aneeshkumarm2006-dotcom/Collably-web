import Link from 'next/link';
import type { Metadata } from 'next';
import { Handshake } from 'lucide-react';

import { serverApi } from '@/lib/api/server';
import { DashboardContainer } from '@/components/dashboard/page-shell';
import { Reveal } from '@/components/shared/reveal';
import { CreatorCollabCard, compareCollabPriority } from '@/components/creator/creator-collab-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Active Collabs' };

export default async function CreatorCollabsPage() {
  const res = await serverApi.applications
    .list({ status: 'Accepted,Overdue', limit: 50 })
    .catch(() => null);
  const collabs = (res?.data ?? []).slice().sort(compareCollabPriority);

  return (
    <DashboardContainer>
      {collabs.length === 0 ? (
        <div className="rounded-lg border border-hair bg-card">
          <EmptyState
            icon={<Handshake />}
            title="No active collabs"
            description="When a business accepts your application, the collab shows up here with its deliverables and deadline."
            action={
              <Button asChild>
                <Link href="/dashboard/creator/explore">Browse campaigns</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <Reveal className="flex flex-col gap-3.5">
          {collabs.map((a) => (
            <CreatorCollabCard key={a._id} application={a} className="r" />
          ))}
        </Reveal>
      )}
    </DashboardContainer>
  );
}
