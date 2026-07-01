import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';

import { getSession } from '@/lib/auth/session';
import { emptyCampaignForm } from '@/lib/business/campaign-form';
import { DashboardContainer, PageHeader } from '@/components/dashboard/page-shell';
import { CampaignForm } from '@/components/business/campaign-form';

export const metadata: Metadata = { title: 'New Campaign' };

export default async function NewCampaignPage() {
  const session = await getSession();

  return (
    <DashboardContainer className="max-w-[820px]">
      <Link
        href="/dashboard/business/campaigns"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back to campaigns
      </Link>
      <PageHeader
        title="Create a campaign"
        subtitle="Post a collab opportunity for creators to discover and apply to."
      />
      <CampaignForm mode="create" initial={emptyCampaignForm()} canPublish={Boolean(session?.approved)} />
    </DashboardContainer>
  );
}
