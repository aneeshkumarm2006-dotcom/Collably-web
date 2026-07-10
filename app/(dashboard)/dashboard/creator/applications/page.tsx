import type { Metadata } from 'next';

import { DashboardContainer } from '@/components/dashboard/page-shell';
import { CreatorApplicationsClient } from '@/components/creator/applications-client';

export const metadata: Metadata = { title: 'My Applications' };

export default function CreatorApplicationsPage() {
  return (
    <DashboardContainer>
      <CreatorApplicationsClient />
    </DashboardContainer>
  );
}
