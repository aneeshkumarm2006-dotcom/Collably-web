import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';

import { serverApi } from '@/lib/api/server';
import { getSession } from '@/lib/auth/session';
import { campaignFormFromCampaign } from '@/lib/business/campaign-form';
import { DashboardContainer, PageHeader } from '@/components/dashboard/page-shell';
import { CampaignForm } from '@/components/business/campaign-form';

export const metadata: Metadata = { title: 'Edit Campaign' };

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [res, profileRes, session] = await Promise.all([
    serverApi.campaigns.get(id).catch(() => null),
    serverApi.profiles.getBusiness().catch(() => null),
    getSession(),
  ]);

  // Only the owning business may edit (the backend also enforces this on save).
  const ownsIt = profileRes?.profile?._id && res?.campaign.businessId === profileRes.profile._id;
  if (!res?.campaign || !ownsIt) notFound();

  return (
    <DashboardContainer className="max-w-[820px]">
      <Link
        href="/dashboard/business/campaigns"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back to campaigns
      </Link>
      <PageHeader title="Edit campaign" subtitle="Update your campaign’s details." />
      <CampaignForm
        mode="edit"
        campaignId={id}
        initial={campaignFormFromCampaign(res.campaign)}
        canPublish={Boolean(session?.approved)}
      />
    </DashboardContainer>
  );
}
