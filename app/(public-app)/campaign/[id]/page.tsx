import { cache } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  MapPin,
  Users,
} from 'lucide-react';

import { publicApi } from '@/lib/api/public';
import { isApiError } from '@/lib/api/errors';
import type { PublicCampaign } from '@/lib/api/types';
import { toCampaignCardData } from '@/lib/campaign-card';
import { formatCountdown, formatRelativeTime, deadlineUrgency } from '@/lib/format';
import { categoryIcon, categoryGradient } from '@/lib/domain-meta';
import { buildMetadata, campaignJsonLd, breadcrumbJsonLd, absoluteUrl } from '@/lib/seo';
import { Container } from '@/components/marketing/section';
import { StatusBadge } from '@/components/shared/status-badge';
import { Avatar } from '@/components/shared/avatar';
import { CampaignCard } from '@/components/shared/campaign-card';
import { JsonLd } from '@/components/shared/json-ld';
import { ApplyPanel } from '@/components/campaign/apply-panel';
import { CampaignLocationMap } from '@/components/maps/campaign-location-map.lazy';

// Public, ISR-cached page: the apply state + (for accepted creators) precise
// location hydrate client-side; the cached shell shows the public projection.
// `generateStaticParams` (empty) opts the route into on-demand ISR: nothing is
// prerendered at build, but each id is rendered once and cached for `revalidate`.
export const revalidate = 120;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

/** Cached per-request fetch so generateMetadata + the page share one round-trip. */
const getCampaign = cache(async (id: string): Promise<PublicCampaign | null> => {
  try {
    const res = await publicApi.campaigns.get(id);
    return res.campaign;
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
  const campaign = await getCampaign(id);
  if (!campaign) {
    return buildMetadata({ title: 'Campaign not found', description: '', path: `/campaign/${id}`, noIndex: true });
  }
  const businessName = campaign.business?.businessName;
  return buildMetadata({
    title: campaign.title,
    description:
      campaign.description.slice(0, 180) +
      (businessName ? `, a collab from ${businessName} on LocalShout.` : ''),
    path: `/campaign/${id}`,
    image: campaign.coverImage ?? undefined,
    ogEyebrow: `Campaign · ${campaign.category}`,
    keywords: [campaign.category, campaign.reward.type, ...campaign.tags],
  });
}

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) notFound();

  const business = campaign.business;
  const CategoryIcon = categoryIcon(campaign.category);
  const isActive = campaign.status === 'Active';
  const locationText = campaign.isRemote
    ? 'Remote / Online'
    : [campaign.location?.city, campaign.location?.state].filter(Boolean).join(', ') || 'On-site';

  // "More from this business": other active campaigns by the same business.
  let otherCampaigns: PublicCampaign[] = [];
  if (business?._id) {
    try {
      const res = await publicApi.campaigns.list({
        businessId: business._id,
        status: 'Active',
        limit: 4,
      });
      otherCampaigns = res.data.filter((c) => c._id !== campaign._id).slice(0, 2);
    } catch {
      otherCampaigns = [];
    }
  }

  return (
    <div className="bg-page pb-16">
      <JsonLd
        data={[
          campaignJsonLd({
            id: campaign._id,
            title: campaign.title,
            description: campaign.description,
            category: campaign.category,
            rewardValue: campaign.reward.estimatedValue,
            deadline: campaign.deadline,
            active: isActive,
            businessName: business?.businessName,
            businessId: business?._id,
            image: campaign.coverImage ? absoluteUrl(campaign.coverImage) : null,
          }),
          breadcrumbJsonLd([
            { name: 'Explore', path: '/explore' },
            { name: campaign.category, path: `/explore?category=${encodeURIComponent(campaign.category)}` },
            { name: campaign.title, path: `/campaign/${campaign._id}` },
          ]),
        ]}
      />

      <Container className="pt-6" size="default">
        {/* Back to explore */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to explore
        </Link>

        {/* Hero banner */}
        <div
          className="relative mt-5 h-[230px] w-full overflow-hidden rounded-[22px]"
          style={{ background: categoryGradient(campaign.category) }}
        >
          {campaign.coverImage && (
            <Image
              src={campaign.coverImage}
              alt={campaign.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1180px"
              className="object-cover"
            />
          )}
          {!campaign.coverImage && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-90">
              <CategoryIcon className="h-16 w-16 text-white/85" />
            </span>
          )}
          {/* Legibility scrim */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
          />
          {/* LIVE chip */}
          {isActive && (
            <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-white backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Live campaign
            </span>
          )}
          <h1 className="absolute inset-x-5 bottom-5 font-display text-[28px] font-extrabold leading-tight tracking-tight text-white drop-shadow-sm sm:text-[34px]">
            {campaign.title}
          </h1>
        </div>

        <div className="mt-8 grid gap-9 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          {/* LEFT */}
          <div>
            {/* Business row */}
            {business && (
              <div className="flex items-center gap-4 rounded-2xl border border-hair bg-card p-4">
                <Avatar name={business.businessName} src={business.logo} size={52} shape="square" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-[16px] font-bold text-ink">
                      {business.businessName}
                    </span>
                    {business.isVerified && (
                      <BadgeCheck className="h-[18px] w-[18px] shrink-0 text-brand" aria-label="Verified" />
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted">
                    <span>{campaign.category}</span>
                    <span aria-hidden>·</span>
                    <span>{locationText}</span>
                    <span aria-hidden>·</span>
                    <Link
                      href={`/business/${business._id}`}
                      className="font-semibold text-brand hover:underline"
                    >
                      View profile →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* About */}
            <section className="mt-8">
              <h2 className="mb-3 font-display text-[20px] font-bold text-ink">
                About this collab
              </h2>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted">
                {campaign.description}
              </p>
            </section>

            {/* Deliverables */}
            {campaign.deliverables.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 font-display text-[20px] font-bold text-ink">
                  What you&rsquo;ll create
                </h2>
                <ul className="flex flex-col gap-3">
                  {campaign.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <span className="font-semibold text-ink">
                          {d.quantity}× {d.platform} {d.contentType}
                        </span>
                        {d.requirements && (
                          <p className="mt-1 text-[13px] leading-relaxed text-muted">
                            {d.requirements}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Tags */}
            {campaign.tags.length > 0 && (
              <section className="mt-8">
                <div className="flex flex-wrap gap-2">
                  {campaign.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-hair bg-card px-3 py-1 font-mono text-[12px] text-muted"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Location (omitted for remote campaigns) */}
            {!campaign.isRemote && campaign.location && (
              <section className="mt-8">
                <h2 className="mb-3 flex items-center gap-2 font-display text-[20px] font-bold text-ink">
                  <MapPin className="h-5 w-5 text-brand" /> Location
                </h2>
                <div className="overflow-hidden rounded-2xl">
                  <CampaignLocationMap location={campaign.location} />
                </div>
              </section>
            )}

            {/* Meta strip */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <StatusBadge status={campaign.status} />
                <span>Posted {formatRelativeTime(campaign.createdAt)}</span>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 font-semibold ${
                  deadlineUrgency(campaign.deadline) === 'warn'
                    ? 'text-warn'
                    : deadlineUrgency(campaign.deadline) === 'danger'
                      ? 'text-danger'
                      : 'text-ink'
                }`}
              >
                <Calendar className="h-[15px] w-[15px]" /> {formatCountdown(campaign.deadline)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-[15px] w-[15px]" /> {campaign.applicationsCount} applicants
              </span>
            </div>
          </div>

          {/* RIGHT: sticky apply card + more-from, stuck together as one block */}
          <aside className="lg:sticky lg:top-[88px] lg:self-start">
            <ApplyPanel
              campaignId={campaign._id}
              campaignTitle={campaign.title}
              isActive={isActive}
              reward={campaign.reward}
              applicationsCount={campaign.applicationsCount}
              minFollowers={campaign.minFollowers}
            />

            {/* More from business */}
            {otherCampaigns.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                  More from {business?.businessName}
                </h3>
                <div className="flex flex-col gap-3">
                  {otherCampaigns.map((c) => (
                    <CampaignCard key={c._id} campaign={toCampaignCardData(c)} variant="compact" />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}
