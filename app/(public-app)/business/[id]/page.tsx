import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, BadgeCheck, Globe, Instagram, MapPin, Megaphone } from 'lucide-react';

import { publicApi } from '@/lib/api/public';
import { isApiError } from '@/lib/api/errors';
import type { PublicBusinessProfileResponse, PublicCampaign } from '@/lib/api/types';
import { toCampaignCardData } from '@/lib/campaign-card';
import { buildMetadata, businessJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { Container } from '@/components/marketing/section';
import { Avatar } from '@/components/shared/avatar';
import { CampaignCard } from '@/components/shared/campaign-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Reveal } from '@/components/shared/reveal';
import { StickerButton } from '@/components/shared/sticker';
import { JsonLd } from '@/components/shared/json-ld';

// Public profile: on-demand ISR (no per-user variance); cached for `revalidate`.
export const revalidate = 300;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

const getBusiness = cache(async (id: string): Promise<PublicBusinessProfileResponse | null> => {
  try {
    return await publicApi.profiles.getPublicBusiness(id);
  } catch (err) {
    if (isApiError(err) && err.status === 404) return null;
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const res = await getBusiness(id);
  if (!res) {
    return buildMetadata({ title: 'Business not found', description: '', path: `/business/${id}`, noIndex: true });
  }
  const { profile } = res;
  return buildMetadata({
    title: profile.businessName,
    description:
      profile.description?.slice(0, 180) ??
      `${profile.businessName} runs creator collabs on LocalShout.`,
    path: `/business/${id}`,
    image: profile.logo ?? undefined,
    ogEyebrow: `${profile.category} · Business`,
  });
}

export default async function BusinessProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getBusiness(id);
  if (!res) notFound();

  const { profile } = res;
  const loc = [profile.location?.city, profile.location?.state].filter(Boolean).join(', ');
  const igHandle = profile.socialLinks?.instagram;

  let active: PublicCampaign[] = [];
  try {
    const list = await publicApi.campaigns.list({ businessId: id, status: 'Active', limit: 12 });
    active = list.data;
  } catch {
    active = [];
  }

  return (
    <div className="bg-page pb-16">
      <JsonLd
        data={[
          businessJsonLd({
            id,
            name: profile.businessName,
            description: profile.description,
            logo: profile.logo,
            website: profile.website,
            city: profile.location?.city,
            country: profile.location?.country,
          }),
          breadcrumbJsonLd([
            { name: 'Explore', path: '/explore' },
            { name: profile.businessName, path: `/business/${id}` },
          ]),
        ]}
      />

      <Container className="pt-6">
        {/* Cover banner */}
        <div className="relative">
          <div
            className="sticker h-[180px] w-full overflow-hidden rounded-xl"
            style={{ background: 'linear-gradient(135deg,#0064E0,#3E8BFF)' }}
          />
          <Link
            href="/explore"
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/30"
          >
            <ArrowLeft className="h-4 w-4" /> Explore
          </Link>
        </div>

        {/* Identity */}
        <div className="px-2 sm:px-4">
          <div className="-mt-[44px] flex h-[104px] w-[104px] items-center justify-center overflow-hidden rounded-2xl border-outline border-ink bg-card shadow-sticker">
            <Avatar
              name={profile.businessName}
              src={profile.logo}
              size={96}
              shape="square"
              className="rounded-[20px]"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
                  {profile.businessName}
                </h1>
                {profile.isVerified && (
                  <BadgeCheck className="h-6 w-6 shrink-0 text-brand" aria-label="Verified" />
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[15px] text-muted">
                <span>{profile.category}</span>
                {loc && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {loc}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {profile.website && (
                <StickerButton asChild tone="white" size="sm">
                  <a href={profile.website} target="_blank" rel="noopener noreferrer nofollow">
                    <Globe className="h-4 w-4" /> Website
                  </a>
                </StickerButton>
              )}
              {igHandle && (
                <StickerButton asChild tone="white" size="sm">
                  <a
                    href={`https://instagram.com/${igHandle.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                </StickerButton>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.description && (
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
              {profile.description}
            </p>
          )}

          {/* Stat row */}
          <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4 border-y-2 border-ink py-5">
            <Stat value={String(profile.totalCampaigns)} label="Collabs run" />
            <Stat value={String(profile.totalCollabsCompleted)} label="Collabs completed" />
            <Stat value={String(active.length)} label="Live now" />
          </div>
        </div>

        {/* Live campaigns */}
        <div className="mt-10 px-2 sm:px-4">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-[22px] font-bold text-ink">Live campaigns</h2>
            {active.length > 0 && (
              <Link
                href={`/explore?location=${encodeURIComponent(profile.location?.city ?? '')}`}
                className="text-sm font-semibold text-brand hover:underline"
              >
                Explore more →
              </Link>
            )}
          </div>
          {active.length > 0 ? (
            <Reveal className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {active.map((c) => (
                <div key={c._id} className="r">
                  <CampaignCard campaign={toCampaignCardData(c)} className="h-full" />
                </div>
              ))}
            </Reveal>
          ) : (
            <EmptyState
              icon={<Megaphone />}
              title="No live campaigns"
              description={`${profile.businessName} doesn’t have any open campaigns right now. Check back soon.`}
            />
          )}
        </div>
      </Container>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-[28px] font-extrabold leading-none tracking-tight text-ink">
        {value}
      </div>
      <div className="mt-1.5 text-[13px] text-muted">{label}</div>
    </div>
  );
}
