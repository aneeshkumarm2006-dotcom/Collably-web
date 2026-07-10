'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2, Lock } from 'lucide-react';

import { clientApi } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { useApplyToCampaign } from '@/lib/api/queries/campaigns';
import { useAuth } from '@/components/providers/auth-provider';
import { track } from '@/lib/analytics';
import { toast } from '@/lib/toast';
import type { ApplicationStatus, CampaignReward } from '@/lib/shared';
import { formatCurrency, formatCompactNumber } from '@/lib/format';
import { StickerButton, Eyebrow } from '@/components/shared/sticker';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type ApplyViewerRole = 'guest' | 'creator' | 'business' | 'admin';

export interface ApplyPanelProps {
  campaignId: string;
  campaignTitle: string;
  /** Campaign is Active and accepting applications. */
  isActive: boolean;
  /** Reward shown in the panel hero (real campaign data). */
  reward: CampaignReward;
  /** Number of applicants so far (real campaign data). */
  applicationsCount: number;
  /** Minimum followers required, or 0 for no minimum (real campaign data). */
  minFollowers: number;
}

/**
 * The apply call-to-action on a public campaign detail, with all states:
 * Closed · Sign up to apply (guest) · under-review (unapproved creator) ·
 * Apply (opens a pitch dialog) · Applied (already submitted).
 * Businesses/admins see a neutral note.
 *
 * The viewer's role + approval come from the client `AuthProvider` (the campaign
 * page itself is statically cached / ISR'd and reads no session), so this panel
 * shows a brief neutral "loading" state until the session probe resolves.
 */
export function ApplyPanel({
  campaignId,
  campaignTitle,
  isActive,
  reward,
  applicationsCount,
  minFollowers,
}: ApplyPanelProps) {
  const { user, isLoading } = useAuth();
  const role: ApplyViewerRole = user ? (user.role as ApplyViewerRole) : 'guest';
  const approved = user?.approved ?? false;
  const isCreator = role === 'creator';

  // Detect an existing application for this campaign (creator only).
  const existing = useQuery({
    queryKey: queryKeys.applications.list({ campaignId }),
    queryFn: ({ signal }) => clientApi.applications.list({ campaignId }, signal),
    enabled: isCreator,
  });
  const myApplication = existing.data?.data?.[0];

  const [open, setOpen] = useState(false);
  const [pitch, setPitch] = useState('');
  const apply = useApplyToCampaign();

  async function submit() {
    try {
      await apply.mutateAsync({ id: campaignId, pitch: pitch.trim() || undefined });
      track('campaign_apply', { campaignId });
      toast.success('Application submitted');
      setOpen(false);
      setPitch('');
      void existing.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit your application');
    }
  }

  const rewardValue =
    typeof reward.estimatedValue === 'number' && reward.estimatedValue > 0
      ? reward.estimatedValue
      : undefined;
  const rewardName = reward.description || reward.type;

  // The sticky panel chrome: reward hero + live stat rows + a hairline, then the
  // state-specific call-to-action passed in as children.
  function PanelShell({ children }: { children: React.ReactNode }) {
    return (
      <div className="sticker rounded-xl bg-card p-6">
        {/* Reward hero */}
        <div className="rounded-card border-2 border-ink bg-brand-soft p-4 text-center">
          <Eyebrow>Reward</Eyebrow>
          <div className="mt-1.5 font-display text-[22px] font-extrabold leading-tight text-ink">
            {rewardName}
          </div>
          {rewardValue !== undefined && (
            <div className="mt-1 font-mono text-[13px] font-semibold text-money">
              {formatCurrency(rewardValue)} value
            </div>
          )}
        </div>

        {/* Live stat rows */}
        <dl className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted">Applicants</dt>
            <dd className="font-mono font-semibold text-ink">{applicationsCount}</dd>
          </div>
          {minFollowers > 0 && (
            <div className="flex items-center justify-between text-sm">
              <dt className="text-muted">Min. followers</dt>
              <dd className="font-mono font-semibold text-ink">
                {formatCompactNumber(minFollowers)}
              </dd>
            </div>
          )}
        </dl>

        <div className="my-5 h-0.5 bg-hair-strong" />

        {children}
      </div>
    );
  }

  // --- Closed ---
  if (!isActive) {
    return (
      <PanelShell>
        <StickerButton disabled tone="ink" size="lg" className="w-full">
          Campaign closed
        </StickerButton>
        <Note>This campaign isn’t accepting applications right now.</Note>
      </PanelShell>
    );
  }

  // --- Resolving the session (static/ISR page hydrating) ---
  if (isLoading) {
    return (
      <PanelShell>
        <StickerButton disabled tone="ink" size="lg" className="w-full">
          <Loader2 className="h-4 w-4 animate-spin" />
        </StickerButton>
      </PanelShell>
    );
  }

  // --- Guest ---
  if (role === 'guest') {
    return (
      <PanelShell>
        <h3 className="font-display text-[17px] font-bold text-ink">Apply as a guest</h3>
        <p className="mt-1 text-[13px] text-muted">
          Create a free account to send your name and handle to the brand.
        </p>
        <StickerButton asChild tone="brand" size="lg" className="mt-4 w-full">
          <Link href={`/login?next=/campaign/${campaignId}`}>
            <Lock className="h-4 w-4" /> Continue to apply
          </Link>
        </StickerButton>
        <Note>Free to apply · No follower minimum</Note>
      </PanelShell>
    );
  }

  // --- Business / admin ---
  if (!isCreator) {
    return (
      <PanelShell>
        <StickerButton disabled tone="white" size="lg" className="w-full">
          For creators
        </StickerButton>
        <Note>You’re signed in as a business. Switch to a creator account to apply.</Note>
      </PanelShell>
    );
  }

  // --- Creator: already applied ---
  if (myApplication) {
    const status = myApplication.status as ApplicationStatus;
    return (
      <PanelShell>
        <StickerButton disabled tone="white" size="lg" className="w-full">
          <Check className="h-4 w-4" /> Application submitted
        </StickerButton>
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted">
          Status <StatusBadge status={status} />
        </div>
      </PanelShell>
    );
  }

  // --- Creator: under review (not approved) ---
  if (!approved) {
    return (
      <PanelShell>
        <StickerButton disabled tone="ink" size="lg" className="w-full">
          Apply now
        </StickerButton>
        <Note>Your creator account is under review. You can apply once it’s verified.</Note>
      </PanelShell>
    );
  }

  // --- Creator: can apply ---
  return (
    <PanelShell>
      <h3 className="font-display text-[17px] font-bold text-ink">Apply to this collab</h3>
      <p className="mt-1 text-[13px] text-muted">
        Send your pitch — the brand reviews it with your profile.
      </p>
      <StickerButton tone="brand" size="lg" className="mt-4 w-full" onClick={() => setOpen(true)}>
        Continue to apply
      </StickerButton>
      <Note>Free to apply · No follower minimum</Note>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to this campaign</DialogTitle>
            <DialogDescription>
              Tell {campaignTitle ? 'them' : 'the brand'} why you’d be a great fit: your style, your
              audience, why this brand. They’ll see this with your profile.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            rows={5}
            placeholder="Your pitch (optional)…"
            autoFocus
          />
          <DialogFooter>
            <StickerButton
              tone="white"
              onClick={() => setOpen(false)}
              disabled={apply.isPending}
            >
              Cancel
            </StickerButton>
            <StickerButton tone="brand" onClick={submit} disabled={apply.isPending}>
              {apply.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                </>
              ) : (
                'Submit application'
              )}
            </StickerButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PanelShell>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-center text-xs text-faint">{children}</p>;
}
