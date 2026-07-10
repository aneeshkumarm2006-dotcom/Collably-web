'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BellOff, Flag, ShieldBan, UploadCloud, X } from 'lucide-react';

import type { Conversation } from '@/lib/shared';
import type { UserSummary } from '@/lib/shared';
import { clientApi } from '@/lib/api/client';
import { errorMessage } from '@/lib/api/errors';
import { toast } from '@/lib/toast';
import { Avatar } from '@/components/shared/avatar';
import { ConfirmModal } from '@/components/shared/confirm-modal';

/**
 * The contact slide-over for a chat thread: a 340px right rail with the other
 * participant's identity, the collab this thread belongs to, and moderation
 * actions.
 *
 * Only what the platform can actually back is wired:
 *   • Report — files a real moderation report (`POST /reports`).
 *   • Submit content (creator) — deep-links to the collab's submission flow.
 * Mute and Block are rendered but disabled ("Coming soon") because no
 * mute/block API exists yet; About / shared-media / links from the mock are
 * omitted rather than faked, since there's no data source for them.
 */
export function ContactPanel({
  conversation,
  other,
  role,
  onClose,
}: {
  conversation: Conversation;
  other: UserSummary | undefined;
  role: 'creator' | 'business';
  onClose: () => void;
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);

  const name = other?.name ?? 'Contact';
  const kind = role === 'creator' ? 'business' : 'creator';

  async function fileReport() {
    if (!other?._id) return;
    setReporting(true);
    try {
      await clientApi.reports.file({
        targetType: 'user',
        targetId: other._id,
        reason: `Reported from direct messages (conversation ${conversation._id})`,
      });
      toast.success('Report submitted. Our team will review it.');
      setReportOpen(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not submit that report.'));
    } finally {
      setReporting(false);
    }
  }

  return (
    <aside
      aria-label="Contact info"
      className="absolute inset-y-0 right-0 z-10 w-full overflow-y-auto border-l border-hair bg-card p-[18px] shadow-[-8px_0_24px_rgba(0,0,0,0.06)] sm:w-[340px]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-faint">
          Contact info
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close contact info"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-faint transition-colors hover:bg-secondary hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Identity */}
      <div className="mt-4 text-center">
        <div className="mx-auto w-fit">
          <Avatar name={name} src={other?.avatar} size={76} shape="square" />
        </div>
        <div className="mt-3 text-[17px] font-bold text-ink">{name}</div>
        <div className="text-[12.5px] capitalize text-faint">{kind}</div>
      </div>

      {/* Top actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex flex-col items-center gap-1.5 rounded-[10px] border border-hair bg-card px-1 py-2.5 text-[11.5px] font-semibold text-brand transition-colors hover:bg-elev"
        >
          <UploadCloud className="h-[18px] w-[18px]" />
          Back to chat
        </button>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="flex cursor-not-allowed flex-col items-center gap-1.5 rounded-[10px] border border-hair bg-card px-1 py-2.5 text-[11.5px] font-semibold text-faint opacity-70"
        >
          <BellOff className="h-[18px] w-[18px]" />
          Mute
        </button>
      </div>

      {/* Current campaign */}
      {conversation.campaignTitle && (
        <div className="mt-4 rounded-xl border border-hair bg-card p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-faint">
            Current campaign
          </div>
          <div className="mt-1 text-[14px] font-semibold text-ink">
            {conversation.campaignTitle}
          </div>
          {role === 'creator' && conversation.applicationId && (
            <Link
              href={`/dashboard/creator/collabs/${conversation.applicationId}/submit`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-sm bg-brand px-3 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Submit content
            </Link>
          )}
        </div>
      )}

      {/* Moderation */}
      <div className="mt-4 flex flex-col gap-0.5 border-t border-divider pt-3.5">
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="flex items-center gap-2.5 rounded-md px-2 py-2.5 text-left text-[13.5px] font-semibold text-danger transition-colors hover:bg-danger-soft"
        >
          <Flag className="h-4 w-4" />
          Report {kind}
        </button>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-2 py-2.5 text-left text-[13.5px] font-semibold text-danger opacity-50"
        >
          <ShieldBan className="h-4 w-4" />
          Block
        </button>
      </div>

      <ConfirmModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        title={`Report this ${kind}?`}
        description={`Our moderation team will review this conversation with ${name}. Reports are confidential.`}
        confirmLabel="Report"
        destructive
        loading={reporting}
        onConfirm={fileReport}
      />
    </aside>
  );
}
