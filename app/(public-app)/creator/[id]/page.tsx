import { cache } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  BadgeCheck,
  ExternalLink,
  Image as ImageIcon,
  Instagram,
  MapPin,
  Music2,
  Youtube,
} from 'lucide-react';

import { publicApi } from '@/lib/api/public';
import { isApiError } from '@/lib/api/errors';
import type { PublicCreatorProfileResponse } from '@/lib/api/types';
import { formatCompactNumber, formatCurrency } from '@/lib/format';
import { nicheIcon } from '@/lib/domain-meta';
import { buildMetadata, creatorJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { Container } from '@/components/marketing/section';
import { Avatar } from '@/components/shared/avatar';
import { EmptyState } from '@/components/shared/empty-state';
import { JsonLd } from '@/components/shared/json-ld';

// Public profile: on-demand ISR (no per-user variance); cached for `revalidate`.
export const revalidate = 300;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

const getCreator = cache(async (id: string): Promise<PublicCreatorProfileResponse | null> => {
  try {
    return await publicApi.profiles.getPublicCreator(id);
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
  const res = await getCreator(id);
  if (!res) {
    return buildMetadata({ title: 'Creator not found', description: '', path: `/creator/${id}`, noIndex: true });
  }
  const name = res.user?.name ?? 'Creator';
  return buildMetadata({
    title: name,
    description:
      res.profile.bio?.slice(0, 180) ??
      `${name} is a creator on Collably${res.profile.niche.length ? `: ${res.profile.niche.join(', ')}.` : '.'}`,
    path: `/creator/${id}`,
    image: res.user?.avatar ?? undefined,
    ogEyebrow: 'Creator',
  });
}

export default async function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getCreator(id);
  if (!res) notFound();

  const { profile, user } = res;
  const name = user?.name ?? 'Creator';
  const loc = [profile.location?.city, profile.location?.state].filter(Boolean).join(', ');
  const handles = profile.socialHandles ?? {};
  const platformCount = [handles.instagram, handles.youtube, handles.tiktok].filter(Boolean).length;

  // Total reach across connected platforms (real data; 0 → hide the stat).
  const totalFollowers =
    (handles.instagram?.followerCount ?? 0) +
    (handles.youtube?.subscriberCount ?? 0) +
    (handles.tiktok?.followerCount ?? 0);

  // Headline: primary niche + "creator" (falls back to a generic label).
  const headline = profile.niche.length
    ? `${profile.niche.slice(0, 2).join(' & ')} creator`
    : 'Creator';

  // Soft-tint palette cycled across the niche/verified pills.
  const pillTints = [
    'bg-brand-soft text-brand',
    'bg-grape-soft text-grape',
    'bg-mint-soft text-mint',
  ];

  const socialRows = [
    handles.instagram && {
      icon: Instagram,
      handle: handles.instagram.handle,
      link: handles.instagram.link,
      count: handles.instagram.followerCount,
      unit: 'followers',
    },
    handles.youtube && {
      icon: Youtube,
      handle: handles.youtube.handle,
      link: handles.youtube.link,
      count: handles.youtube.subscriberCount,
      unit: 'subscribers',
    },
    handles.tiktok && {
      icon: Music2,
      handle: handles.tiktok.handle,
      link: handles.tiktok.link,
      count: handles.tiktok.followerCount,
      unit: 'followers',
    },
  ].filter(Boolean) as {
    icon: typeof Instagram;
    handle: string;
    link: string;
    count?: number;
    unit: string;
  }[];

  return (
    <div className="bg-page pb-16">
      <JsonLd
        data={[
          creatorJsonLd({ id, name, bio: profile.bio, avatar: user?.avatar, niche: profile.niche }),
          breadcrumbJsonLd([
            { name: 'Explore', path: '/explore' },
            { name, path: `/creator/${id}` },
          ]),
        ]}
      />

      <Container className="pt-6">
        {/* Back to explore */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Explore
        </Link>

        {/* Header */}
        <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Avatar name={name} src={user?.avatar} size={96} className="shrink-0 shadow-card" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">
                {name}
              </h1>
              {profile.isVerified && (
                <BadgeCheck className="h-6 w-6 shrink-0 text-brand" aria-label="Verified" />
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[15px] text-muted">
              <span>{headline}</span>
              {loc && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {loc}
                  </span>
                </>
              )}
            </div>

            {/* Niche / verified pills */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.isUGCOnly && (
                <span className="inline-flex items-center rounded-full bg-mint-soft px-2.5 py-1 text-[12px] font-bold text-mint">
                  UGC creator
                </span>
              )}
              {profile.niche.map((n, i) => {
                const NicheIcon = nicheIcon(n);
                return (
                  <span
                    key={n}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold ${
                      pillTints[i % pillTints.length]
                    }`}
                  >
                    <NicheIcon aria-hidden className="h-3.5 w-3.5" /> {n}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">{profile.bio}</p>
        )}

        {/* Stat row */}
        <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4 border-y border-hair py-5">
          {totalFollowers > 0 && (
            <Stat value={formatCompactNumber(totalFollowers)} label="Followers" />
          )}
          <Stat value={String(profile.totalCollabsCompleted)} label="Collabs" />
          <Stat value={String(platformCount)} label="Platforms" />
          {profile.totalRewardsEarned > 0 && (
            <Stat value={formatCurrency(profile.totalRewardsEarned)} label="Earned" />
          )}
        </div>

        {/* Socials */}
        {socialRows.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {socialRows.map((s) => (
              <a
                key={s.handle}
                href={s.link}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-3 rounded-2xl border border-hair bg-card px-4 py-3 transition-colors hover:border-brand"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <s.icon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-ink">
                    @{s.handle.replace(/^@/, '')}
                  </div>
                  {typeof s.count === 'number' && (
                    <div className="text-xs text-muted">
                      <span className="font-mono text-ink">{formatCompactNumber(s.count)}</span>{' '}
                      {s.unit}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Content types */}
        {profile.contentTypes.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {profile.contentTypes.map((t) => (
              <span
                key={t}
                className="rounded-full border border-hair bg-card px-2.5 py-1 text-[13px] text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Portfolio */}
        <div className="mt-10">
          <h2 className="mb-5 font-display text-[22px] font-bold text-ink">Portfolio</h2>
          {profile.portfolio.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
              {profile.portfolio.map((item, i) => (
                <a
                  key={i}
                  href={item.link || item.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-secondary"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.caption ?? ''}
                    fill
                    sizes="(max-width: 640px) 50vw, 280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 transition-opacity group-hover:opacity-100">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                  {item.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-[13px] font-medium text-white">{item.caption}</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ImageIcon />}
              title="No portfolio yet"
              description={`${name} hasn’t added portfolio work yet.`}
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
