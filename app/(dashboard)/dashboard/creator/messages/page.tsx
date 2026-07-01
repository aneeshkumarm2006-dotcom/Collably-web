import type { Metadata } from 'next';

import { getSession } from '@/lib/auth/session';
import { DashboardContainer, PageHeader } from '@/components/dashboard/page-shell';
import { ConversationList } from '@/components/chat/conversation-list';

export const metadata: Metadata = { title: 'Messages' };

export default async function CreatorMessagesPage() {
  const session = await getSession();
  return (
    <DashboardContainer className="max-w-[820px]">
      <PageHeader title="Messages" subtitle="Chat with the brands you’re collaborating with." />
      <div className="rounded-2xl border border-hair bg-card p-4 shadow-card sm:p-5">
        <ConversationList role="creator" meId={session!.user.id} />
      </div>
    </DashboardContainer>
  );
}
