'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Link2,
  Loader2,
  UploadCloud,
  X,
} from 'lucide-react';

import type { PublicApplication } from '@/lib/api/types';
import { useSubmitContent } from '@/lib/api/queries';
import { errorMessage } from '@/lib/api/errors';
import { toast } from '@/lib/toast';
import { looksLikeUrl, normalizeUrl } from '@/lib/onboarding/creator';
import { uploadToCloudinary } from '@/lib/upload/cloudinary';
import {
  deadlineUrgency,
  formatCurrency,
  formatDate,
  formatTime,
  formatCountdown,
} from '@/lib/format';
import { deliverableLabel } from '@/components/creator/creator-collab-card';
import { CategoryTile } from '@/components/creator/category-tile';
import { StatusChip } from '@/components/creator/status-chip';
import { SubmissionStepper } from '@/components/creator/submission-stepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const BACK_HREF = '/dashboard/creator/collabs';

/**
 * The uploaded proof image URL, only when it is a safe http(s) URL. The
 * submission `link` is a post permalink (not an image), so it is never used as
 * an `<img src>`; this keeps untrusted data out of the DOM as a resource.
 */
function proofOrSubmissionImage(app: PublicApplication): string | null {
  const url = app.submissionProof;
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : null;
}

/** Centered status panel for the non-submittable + success states. */
function StatePanel({
  icon,
  title,
  message,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-hair bg-card p-8 text-center">
      <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success animate-in zoom-in-50 [&_svg]:h-8 [&_svg]:w-8">
        {icon}
      </div>
      <h1 className="text-xl font-bold text-ink">{title}</h1>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div>
    </div>
  );
}

export function SubmitContentClient({ application }: { application: PublicApplication }) {
  const submit = useSubmitContent();
  const campaign = application.campaign;
  const deliverables = campaign?.deliverables ?? [];

  const [link, setLink] = useState('');
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofUploading, setProofUploading] = useState(false);
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [linkTouched, setLinkTouched] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit = application.status === 'Accepted' || application.status === 'Overdue';
  const alreadySubmitted = canSubmit && Boolean(application.submittedAt);
  const linkValid = looksLikeUrl(link);

  // --- Success ---
  if (success) {
    return (
      <StatePanel
        icon={<CheckCircle2 />}
        title="Submission received!"
        message={`${campaign?.business?.businessName ?? 'The brand'} will review your content shortly. You'll be notified once it's verified.`}
      >
        <Button asChild>
          <Link href={BACK_HREF}>
            <ArrowLeft className="h-4 w-4" /> Back to collabs
          </Link>
        </Button>
      </StatePanel>
    );
  }

  // --- Not in a submittable state ---
  if (!canSubmit) {
    return (
      <StatePanel
        icon={<AlertTriangle />}
        title="Nothing to submit here"
        message="This collab isn't awaiting a submission right now."
      >
        <Button asChild variant="outline">
          <Link href={BACK_HREF}>Back to collabs</Link>
        </Button>
      </StatePanel>
    );
  }

  // --- Already submitted (awaiting review): the "view submission" screen ---
  if (alreadySubmitted) {
    const businessName = campaign?.business?.businessName ?? 'The brand';
    const deliverableText = campaign?.deliverables?.[0]
      ? deliverableLabel(campaign.deliverables[0])
      : (campaign?.title ?? 'Submission');
    const submittedAt = application.submittedAt;
    const reward = campaign?.reward;
    const rewardValue = reward?.estimatedValue ? formatCurrency(reward.estimatedValue) : null;

    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 self-start">
          <Link href={BACK_HREF}>
            <ArrowLeft className="h-4 w-4" /> Back to collabs
          </Link>
        </Button>

        <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          {/* Submitted content */}
          <div className="overflow-hidden rounded-lg border border-hair bg-card">
            <div className="flex items-center gap-3 border-b border-divider px-5 py-4">
              <CategoryTile category={campaign?.category} size={42} radius={11} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[16px] font-bold text-ink">{businessName}</div>
                <div className="truncate text-[12px] text-faint">
                  {deliverableText}
                  {submittedAt ? ` · submitted ${formatDate(submittedAt)}` : ''}
                </div>
              </div>
              <StatusChip status="In review" />
            </div>
            <div className="p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-faint">
                Submitted content
              </p>
              {proofOrSubmissionImage(application) ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-hair bg-elev">
                  {/* eslint-disable-next-line @next/next/no-img-element -- submission proof */}
                  <img
                    src={proofOrSubmissionImage(application)!}
                    alt="Your submitted content"
                    className="max-h-[280px] w-full object-contain"
                  />
                </div>
              ) : (
                <div className="mt-3 flex h-[180px] items-center justify-center rounded-xl bg-page text-faint">
                  <UploadCloud className="h-8 w-8" />
                </div>
              )}
              {application.submissionNote && (
                <p className="mt-3.5 whitespace-pre-wrap text-[14px] leading-[1.6] text-ink">
                  {application.submissionNote}
                </p>
              )}
              {application.submissionLink && (
                <a
                  href={application.submissionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 break-all text-[13px] font-medium text-brand hover:underline"
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0" />
                  {application.submissionLink}
                </a>
              )}
              {submittedAt && (
                <p className="mt-2 text-[12px] text-faint">
                  Submitted {formatDate(submittedAt)} · {formatTime(submittedAt)}
                </p>
              )}
            </div>
          </div>

          {/* Review status + reward */}
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-hair bg-card p-5">
              <h2 className="mb-4 text-[15px] font-bold text-ink">Review status</h2>
              <SubmissionStepper application={application} />
            </div>
            <div className="rounded-lg border border-hair bg-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-faint">
                Reward on approval
              </p>
              <div className="num mt-1 text-[28px] font-bold text-money-ink">
                {rewardValue ?? reward?.description ?? reward?.type ?? '—'}
              </div>
              {rewardValue && reward?.description && (
                <div className="text-[13px] text-muted">{reward.description}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function handleProof(file: File | undefined) {
    if (!file) return;
    setProofUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'submissions');
      setProofUrl(url);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not upload that screenshot'));
    } finally {
      setProofUploading(false);
    }
  }

  async function onSubmit() {
    setLinkTouched(true);
    if (!linkValid || !confirmed) return;
    try {
      await submit.mutateAsync({
        id: application._id,
        input: {
          submissionLink: normalizeUrl(link),
          submissionProof: proofUrl ?? undefined,
          submissionNote: note.trim() || undefined,
        },
      });
      setSuccess(true);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not submit your content'));
    }
  }

  const urgency = campaign?.deadline ? deadlineUrgency(campaign.deadline) : 'normal';

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 self-start">
        <Link href={BACK_HREF}>
          <ArrowLeft className="h-4 w-4" /> Back to collabs
        </Link>
      </Button>

      <div>
        <h1 className="text-[22px] font-bold text-ink">Submit your content</h1>
        <p className="mt-1 text-sm text-muted">Add proof of your work, then submit for review.</p>
      </div>

      {/* Context panel */}
      <div className="rounded-lg border border-hair bg-card p-5">
        <h2 className="text-[16px] font-bold text-ink">{campaign?.title ?? 'Campaign'}</h2>
        <p className="text-[13px] text-muted">{campaign?.business?.businessName}</p>

        {deliverables.length > 0 && (
          <div className="mt-4 rounded-lg bg-brand-soft p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-brand">
              The brief · deliverables to submit
            </p>
            <ul className="space-y-1.5">
              {deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>{deliverableLabel(d)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {campaign?.deadline && (
          <div
            className={cn(
              'mt-4 flex items-center gap-2 rounded-md px-3 py-2.5 text-[13px] font-medium',
              urgency === 'danger'
                ? 'bg-danger-soft text-danger'
                : urgency === 'warn'
                  ? 'bg-warn-soft text-warn'
                  : 'bg-secondary text-muted',
            )}
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {formatCountdown(campaign.deadline)}, {formatDate(campaign.deadline)}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="rounded-lg border border-hair bg-card p-5">
        <div className="space-y-1.5">
          <Label htmlFor="submission-link">Live post link</Label>
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input
              id="submission-link"
              type="url"
              inputMode="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onBlur={() => setLinkTouched(true)}
              placeholder="https://instagram.com/reel/…"
              className="pl-9"
              aria-invalid={linkTouched && !linkValid}
            />
          </div>
          {linkTouched && !linkValid && (
            <p className="text-[12.5px] text-danger">Enter the public URL of your posted content.</p>
          )}
        </div>

        <div className="mt-5 space-y-1.5">
          <Label>Proof screenshot (optional)</Label>
          {proofUrl ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element -- proof preview */}
              <img
                src={proofUrl}
                alt="Submission proof"
                className="h-32 w-auto rounded-md border border-hair object-cover"
              />
              <button
                type="button"
                onClick={() => setProofUrl(null)}
                aria-label="Remove screenshot"
                className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(19,26,46,0.7)] text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label
              className={cn(
                'flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-hair-strong bg-elev p-8 text-center transition-colors hover:border-brand',
                proofUploading && 'pointer-events-none opacity-60',
              )}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-brand-soft text-brand">
                {proofUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <UploadCloud className="h-5 w-5" />
                )}
              </span>
              <span className="mt-3 text-sm font-semibold text-ink">
                {proofUploading ? 'Uploading…' : 'Drop files or click to upload'}
              </span>
              <span className="mt-1 text-[12.5px] text-faint">
                MP4, MOV, JPG or PNG · up to 200MB
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={proofUploading}
                onChange={(e) => {
                  void handleProof(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </label>
          )}
        </div>

        <div className="mt-5 space-y-1.5">
          <Label htmlFor="submission-note">Notes to the brand (optional)</Label>
          <Textarea
            id="submission-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Anything the brand should know about your post…"
          />
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-md bg-secondary p-3.5">
          <Checkbox
            checked={confirmed}
            onCheckedChange={(c) => setConfirmed(c === true)}
            className="mt-0.5"
          />
          <span className="text-sm text-ink">
            I confirm my submission meets all the requirements from the brief.
          </span>
        </label>

        <Button
          size="lg"
          className="mt-5 w-full"
          onClick={onSubmit}
          disabled={!confirmed || !linkValid || submit.isPending}
        >
          {submit.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
            </>
          ) : (
            'Submit for review →'
          )}
        </Button>
      </div>
    </div>
  );
}
