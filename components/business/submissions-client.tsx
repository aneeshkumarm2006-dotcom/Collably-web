'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Check, ClipboardCheck, ExternalLink, Play, RotateCcw, SearchX, X } from 'lucide-react';

import { useApplications, useVerifySubmission } from '@/lib/api/queries';
import { toast } from '@/lib/toast';
import { errorMessage } from '@/lib/api/errors';
import type { PublicApplication } from '@/lib/api/types';
import { applicantView } from '@/lib/business/applicant';
import { formatRelativeTime } from '@/lib/format';
import { categoryGradient } from '@/lib/domain-meta';
import { Avatar } from '@/components/shared/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function BusinessSubmissionsClient() {
  const query = useApplications({ status: 'Accepted', limit: 100 });
  const [proof, setProof] = useState<string | null>(null);

  // The review queue = accepted collabs that have submitted content.
  const submissions = useMemo(
    () => (query.data?.data ?? []).filter((a) => Boolean(a.submittedAt)),
    [query.data],
  );

  return (
    <>
      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState
          icon={<SearchX />}
          title="Couldn’t load submissions"
          description="Something went wrong. Please try again."
          action={
            <Button variant="outline" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck />}
          title="Nothing to review"
          description="When an accepted creator submits their content, it lands here for you to verify."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {submissions.map((app) => (
            <SubmissionCard key={app._id} app={app} onViewProof={setProof} />
          ))}
        </div>
      )}

      <Dialog open={proof !== null} onOpenChange={(open) => !open && setProof(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Proof screenshot</DialogTitle>
          </DialogHeader>
          {proof && (
            <div className="relative max-h-[70vh] overflow-auto rounded-md border border-hair">
              {/* eslint-disable-next-line @next/next/no-img-element -- full-size proof view */}
              <img src={proof} alt="Submission proof" className="h-auto w-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SubmissionCard({
  app,
  onViewProof,
}: {
  app: PublicApplication;
  onViewProof: (url: string) => void;
}) {
  const verify = useVerifySubmission();
  const view = applicantView(app);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [note, setNote] = useState('');

  async function act(action: 'verify' | 'revision' | 'fail') {
    try {
      await verify.mutateAsync({
        id: app._id,
        input: { action, note: note.trim() || undefined },
      });
      toast.success(
        action === 'verify'
          ? 'Submission verified, collab completed'
          : action === 'revision'
            ? 'Revision requested'
            : 'Submission marked as failed',
      );
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the submission'));
    }
  }

  const busy = verify.isPending;
  const contentType = app.campaign?.deliverables?.[0]?.contentType ?? 'Content';
  const gradientKey = app.campaign?.category;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-hair bg-card shadow-card">
      {/* Preview */}
      <button
        type="button"
        onClick={() => app.submissionProof && onViewProof(app.submissionProof)}
        disabled={!app.submissionProof}
        className="group relative block h-[150px] w-full overflow-hidden text-left"
        style={{ background: categoryGradient(gradientKey) }}
        aria-label={app.submissionProof ? 'View submission proof' : 'Submission preview'}
      >
        {app.submissionProof ? (
          <Image
            src={app.submissionProof}
            alt="Submission proof"
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-opacity group-hover:opacity-90"
          />
        ) : null}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-ink shadow-sm [&_svg]:h-5 [&_svg]:w-5">
            <Play className="translate-x-px fill-current" />
          </span>
        </span>
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink">
          {contentType}
        </span>
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col p-[18px]">
        <div className="flex items-center gap-3">
          <Avatar name={view.name} src={view.avatar} size={40} />
          <div className="min-w-0">
            <h3 className="truncate font-display text-[15px] font-bold text-ink">{view.name}</h3>
            <p className="truncate text-[13px] text-muted">
              {app.campaign?.title ? `“${app.campaign.title}”` : 'Campaign'}
            </p>
          </div>
        </div>

        {app.submittedAt && (
          <p className="mt-2 text-[12px] text-faint">Submitted {formatRelativeTime(app.submittedAt)}</p>
        )}

        {app.submissionLink && (
          <a
            href={app.submissionLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-fit items-center gap-1.5 text-[13px] font-bold text-brand hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View live post
          </a>
        )}

        {app.submissionNote && (
          <div className="mt-3 rounded-xl bg-[#F7F9FD] px-3.5 py-3 text-sm text-muted">
            <span className="font-semibold text-ink">Creator note: </span>
            {app.submissionNote}
          </div>
        )}

        {/* Revision box */}
        {revisionOpen && (
          <div className="mt-3 rounded-xl border border-warn/30 bg-warn-soft p-3.5">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="What needs to change? Be specific so the creator can fix it quickly…"
              className="bg-card"
            />
            <div className="mt-2.5 flex justify-end gap-2">
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => setRevisionOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" disabled={busy} onClick={() => act('revision')}>
                Send revision request
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={busy}
            onClick={() => setRevisionOpen((o) => !o)}
          >
            <RotateCcw className="h-4 w-4" /> Request changes
          </Button>
          <Button variant="money" size="sm" className="flex-1" disabled={busy} onClick={() => act('verify')}>
            <Check className="h-4 w-4" /> Approve
          </Button>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => act('fail')}
          className="mt-2 inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-danger transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" /> Mark failed
        </button>
      </div>
    </div>
  );
}
