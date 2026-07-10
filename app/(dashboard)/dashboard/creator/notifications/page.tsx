import type { Metadata } from 'next';

import { DashboardContainer } from '@/components/dashboard/page-shell';
import { NotificationsClient } from '@/components/creator/notifications-client';

export const metadata: Metadata = { title: 'Notifications' };

export default function CreatorNotificationsPage() {
  return (
    <DashboardContainer>
      <NotificationsClient role="creator" />
    </DashboardContainer>
  );
}
