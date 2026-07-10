'use client';

import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

import { clientApi } from '@/lib/api/client';
import { errorMessage } from '@/lib/api/errors';
import { toast } from '@/lib/toast';
import { NICHES, CONTENT_TYPES } from '@/lib/constants';
import type { CreatorProfile, Niche, ContentType } from '@/lib/shared';
import { nicheIcon } from '@/lib/domain-meta';
import { useAuth } from '@/components/providers/auth-provider';
import {
  type CreatorForm,
  creatorFormFromProfile,
  hasOneSocial,
  MAX_PORTFOLIO,
  toCreatorPayload,
} from '@/lib/onboarding/creator';
import { TogglePill } from '@/components/onboarding/onboarding-ui';
import { SocialHandlesStep } from '@/components/onboarding/social-handles-step';
import { PortfolioUploader } from '@/components/onboarding/portfolio-uploader';
import { LocationFields } from '@/components/shared/location-fields';
import { ErrorBanner } from '@/components/auth/auth-layout';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const BIO_MAX = 2000;

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

/** A titled card section grouping a slice of the profile form. */
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-hair bg-card p-5 sm:p-6">
      <h2 className="text-[16px] font-bold text-ink">{title}</h2>
      {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * Creator profile editor (Phase 7). A single-page, sectioned form prefilled from
 * the existing profile that submits via `PUT /api/profile/creator`, reusing the
 * onboarding form model (`creatorFormFromProfile` / `toCreatorPayload`) so the
 * payload + validation stay identical to onboarding.
 */
export function CreatorProfileForm({
  profile,
  name,
  avatar,
}: {
  profile: CreatorProfile;
  name?: string;
  avatar?: string | null;
}) {
  const { logout } = useAuth();
  const [form, setForm] = useState<CreatorForm>(() => creatorFormFromProfile(profile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (partial: Partial<CreatorForm>) => setForm((f) => ({ ...f, ...partial }));
  const initial = (name ?? 'C').charAt(0).toUpperCase();

  async function save() {
    setError(null);
    if (!hasOneSocial(form)) {
      setError('Connect at least one platform with a handle and a valid profile link.');
      return;
    }
    setSaving(true);
    try {
      await clientApi.profiles.saveCreator(toCreatorPayload(form));
      toast.success('Profile updated');
    } catch (err) {
      const message = errorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Profile hero header */}
      <section className="flex flex-wrap items-center gap-4 rounded-lg border border-hair bg-card p-5 sm:p-6">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar preview
          <img
            src={avatar}
            alt=""
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-warn-soft text-3xl font-bold text-warn"
            aria-hidden
          >
            {initial}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-ink">{name ?? 'Your profile'}</h2>
          {form.niche.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {form.niche.slice(0, 5).map((n) => (
                <span
                  key={n}
                  className="rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-bold text-brand"
                >
                  {n}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <Section title="About you" description="Your bio and niche help brands and our matching find you.">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio">Bio</Label>
            <span className="font-mono text-[11px] text-faint">
              {form.bio.length} / {BIO_MAX}
            </span>
          </div>
          <Textarea
            id="bio"
            maxLength={BIO_MAX}
            value={form.bio}
            onChange={(e) => patch({ bio: e.target.value })}
            placeholder="Toronto food & lifestyle creator sharing the city's best bites…"
          />
        </div>
        <div className="mt-5">
          <Label>Your niches</Label>
          <div className="mt-2 flex flex-wrap gap-2.5">
            {NICHES.map((n: Niche) => (
              <TogglePill
                key={n}
                label={n}
                icon={nicheIcon(n)}
                selected={form.niche.includes(n)}
                onClick={() => patch({ niche: toggle(form.niche, n) })}
              />
            ))}
          </div>
        </div>
      </Section>

      <Section title="Location" description="Brands love working with local creators.">
        <LocationFields value={form.location} onChange={(location) => patch({ location })} />
      </Section>

      <Section
        title="Social handles"
        description="Connect at least one platform: add a handle and its profile link."
      >
        <SocialHandlesStep
          social={form.social}
          onSocialChange={(partial) => patch({ social: { ...form.social, ...partial } })}
          isUGCOnly={form.isUGCOnly}
          onUGCChange={(isUGCOnly) => patch({ isUGCOnly })}
        />
      </Section>

      <Section title="Content types" description="The formats you're great at.">
        <div className="flex flex-wrap gap-2.5">
          {CONTENT_TYPES.map((ct: ContentType) => (
            <TogglePill
              key={ct}
              label={ct}
              selected={form.contentTypes.includes(ct)}
              onClick={() => patch({ contentTypes: toggle(form.contentTypes, ct) })}
            />
          ))}
        </div>
      </Section>

      <Section title="Portfolio" description={`Show your best work, up to ${MAX_PORTFOLIO} pieces.`}>
        <PortfolioUploader
          items={form.portfolio}
          onChange={(portfolio) => patch({ portfolio })}
          max={MAX_PORTFOLIO}
        />
      </Section>

      {error && <ErrorBanner message={error} />}

      {/* Sticky save bar */}
      <div className="sticky bottom-0 z-10 -mx-5 flex items-center justify-end gap-3 border-t border-hair bg-card/90 px-5 py-3.5 backdrop-blur sm:-mx-6 sm:px-6">
        <Button size="lg" onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            'Save changes'
          )}
        </Button>
      </div>

      {/* Log out */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex items-center gap-2 rounded-sm bg-danger-soft px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:brightness-95"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </div>
  );
}
