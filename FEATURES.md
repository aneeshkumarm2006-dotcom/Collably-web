# LocalShout Web — Full Feature Inventory

> One **Next.js 15 (App Router)** app that serves **both** the marketing site **and** the full
> web version of the LocalShout app (creator + business), over the **same backend** and **same
> shared domain layer** as the mobile app. Plus a private SEO blog CMS backed by its own MongoDB.
>
> **Stack:** Next.js 15 · React 19 · TypeScript ~5.7 · Tailwind CSS 3.4 · shadcn/ui · Lucide ·
> TanStack Query · socket.io-client · Zod · date-fns · Google Maps JS · TipTap · Mongoose (CMS only).
>
> This document is the complete surface to redesign.

---

## 1. Marketing / Public Site — `app/(marketing)/`

| Feature | Route | Notes |
| --- | --- | --- |
| **Landing page** | `/` | Hero with live campaign offers, category strip, "How it works" (dual creator/business columns), features grid, real-rewards list, live campaigns rail, testimonials, stats band, FAQ, app-promo ("coming soon"), final CTA |
| **Pricing** | `/pricing` | |
| **About** | `/about` | |
| **For Creators** | `/for-creators` | Audience landing page |
| **For Businesses** | `/for-businesses` | Audience landing page |
| **Blog index** | `/blog` | **Dual-sourced** — static code posts + DB posts from the SEO CMS |
| **Blog post** | `/blog/[slug]` | Static `.tsx` posts and sanitized-HTML DB posts with keyword backlinks |
| **Contact** | `/contact` | Contact form → `/api/contact` |
| **Privacy** | `/privacy` | Legal |
| **Terms** | `/terms` | Legal |
| **Cookies** | `/cookies` | Legal |

**SEO infrastructure:** `sitemap.ts`, `robots.ts`, RSS feed (`feed.xml`), OG image generation (`/api/og`), JSON-LD structured data (organization, website, FAQ, articles).

---

## 2. Auth — `app/(auth)/`

- **Login** — `/login`
- **Signup** — `/signup`
- **Forgot password** — `/forgot-password`
- **Reset password** — `/reset-password/[token]`
- **Google OAuth** sign-in
- **Cookie-based sessions** — httpOnly access cookie; JWT never exposed to client JS. Auth API handlers: `/api/auth/{login,register,logout,me,forgot-password,reset-password,google}`

---

## 3. Onboarding — `app/(onboarding)/`

- **Creator onboarding** — `/onboarding/creator`
  - Social handles step
  - Portfolio uploader
  - Niche / category selection
- **Business onboarding** — `/onboarding/business`
  - Logo uploader
  - Business details
- Multi-step progress indicator + **celebration screen** (confetti) on completion

---

## 4. Creator Dashboard — `app/(dashboard)/dashboard/creator/`

| Feature | Route |
| --- | --- |
| Overview (home / stats) | `/dashboard/creator` |
| Explore campaigns (with niche rail filters) | `/dashboard/creator/explore` |
| My Applications (track applications) | `/dashboard/creator/applications` |
| Active Collabs | `/dashboard/creator/collabs` |
| Content submission flow | `/dashboard/creator/collabs/[id]/submit` |
| Messages (real-time chat) | `/dashboard/creator/messages` + `/[conversationId]` |
| History | `/dashboard/creator/history` |
| Profile editor | `/dashboard/creator/profile` |
| Settings (account) | `/dashboard/creator/settings` |
| Notifications | `/dashboard/creator/notifications` |

---

## 5. Business Dashboard — `app/(dashboard)/dashboard/business/`

| Feature | Route |
| --- | --- |
| Overview | `/dashboard/business` |
| Campaigns — list | `/dashboard/business/campaigns` |
| Campaigns — create | `/dashboard/business/campaigns/new` |
| Campaigns — edit | `/dashboard/business/campaigns/[id]/edit` |
| Applications — global | `/dashboard/business/applications` |
| Applications — per campaign | `/dashboard/business/campaigns/[id]/applications` |
| Active Collabs | `/dashboard/business/collabs` |
| Submissions review | `/dashboard/business/submissions` |
| Messages (real-time chat) | `/dashboard/business/messages` + `/[conversationId]` |
| Profile | `/dashboard/business/profile` |
| Settings | `/dashboard/business/settings` |
| Notifications | `/dashboard/business/notifications` |

---

## 6. Public App Views — `app/(public-app)/`

- **Explore** — `/explore` — public campaign browsing with filters
- **Campaign detail** — `/campaign/[id]` — with **guest apply** panel
- **Business profile** — `/business/[id]` — public page
- **Creator profile** — `/creator/[id]` — public page
- **Google Maps integration** — campaign location maps + location picker

---

## 7. SEO Team — Private Blog CMS — `app/seoteam/`

> A self-contained content-management system, **separate from the main app/backend**. Talks
> directly to its **own MongoDB** (Mongoose). Powers the DB-backed half of the public blog.

| Feature | Route / File |
| --- | --- |
| Posts table (search, filter, status, views, categories, actions) | `/seoteam` |
| New post | `/seoteam/new` |
| Edit post | `/seoteam/[id]/edit` |
| Separate CMS auth (login / logout) | `/api/seoteam/{login,logout}` |
| Posts CRUD API | `/api/seoteam/posts` + `/posts/[id]` |
| Image upload API | `/api/seoteam/upload` |

**Editor & tooling:**

- **TipTap rich-text editor** (`components/seoteam/tiptap-editor.tsx`)
- **Content templates** — How-To / Tutorial, Listicle (Top N), Comparison (X vs Y), Product/Service Review, News / Update, Generic Article
- **Live SEO check panel** — real-time scoring on: content length / word count, keywords appear in body, links, image alt text, cover image, meta title
- **Keyword manager** — internal SEO backlinks (keyword → URL, `dofollow`/`nofollow` rel, link-all-occurrences toggle)
- **Cover-image upload**, auto reading-time, slug generation, HTML sanitization
- **Instant publish** (no redeploy) with cache revalidation
- Separate session/guard/rate-limit layer (`lib/seoteam/`)

**Post model fields:** title, slug, template, body, excerpt, metaTitle, category, tags, coverImage, keywords[], linkAllOccurrences, status, author{name,role}, views, publishedAt.

---

## 7b. Analytics Hub — `app/analyticshub/`

> Password-gated, single-user analytics dashboard. Pulls **GA4**, **Search Console**,
> **Meta Ads** and **Google Ads** into one overview + per-source deep dives. All
> credentials are entered in-dashboard and stored **AES-256-GCM encrypted** in
> MongoDB — never in code or env. See `ANALYTICSHUB_SETUP.md`.

| Feature | Route |
| --- | --- |
| Overview | `/analyticshub` |
| GA4 · Search Console · Meta Ads · Google Ads | `/analyticshub/{ga4,gsc,meta,gads}` |
| Users (intentionally a stub — no local users table) | `/analyticshub/users` |
| Settings (credential entry + live validation) | `/analyticshub/settings` |
| Catch-all API + OAuth callback | `/api/analyticshub/[...path]` |

**Charts are hand-rolled inline SVG** (`components/analyticshub/{line-chart,sparkline}.tsx`),
not a chart library — restyling means touching that SVG directly.

---

## 8. Cross-cutting / System

- **Real-time chat** (socket.io) — conversation list, threads, composer, message bubbles; `socket-token` auth endpoint
- **Notifications** system — bell + unread badges
- **Cookie consent** + analytics scripts (consent-gated)
- **Light-only theme.** Dark mode was removed in the redesign — the source designs define none. See `REDESIGN-IMPLEMENTATION.md`.
- **Image uploads** (Cloudinary)
- **Report / flag** system (report content / users)
- **Location autocomplete** (Canada-first city/region/country) + location fields — used in campaigns, onboarding, explore filters
- **Geocoding** (address → coordinates for maps)
- **Explore filters** — sort options, category filters, follower buckets, status tabs
- Toasts (sonner), confirm modals, empty states, error states, skeletons
- **shadcn/ui** primitives (24, in `components/ui/`) + the sticker primitives in `components/shared/sticker.tsx`
- **Motion hooks** (`lib/motion/`) — scroll reveal with stagger, count-up, cursor tilt; all reduced-motion aware
- **Mock mode** (MSW) — run the UI without a live backend

---

## 9. System pages

- **Styleguide** — `/styleguide` — internal design-system reference
- **Error** — `app/error.tsx`
- **Global error** — `app/global-error.tsx`
- **404 Not Found** — `app/not-found.tsx`
- **Health probe** — `/api/health`
- **Backend proxy** — `/api/backend/[...path]` (same-origin proxy; cookie → Bearer)

---

## Design system

The app runs **two visual languages on one token set**:

- **Public** (marketing, auth, onboarding, public-app views, errors) — neo-brutalist
  "sticker": cream `#FFFDF8`, ink `#14181F`, `2.5px` ink outlines, solid offset shadows,
  Space Grotesk headings, yellow `#FFC24B` + coral `#FF6B4A`.
- **App** (`.surface-app`, both dashboards) — Facebook-clean: grey `#F0F2F5`, ink
  `#050505`, hairlines, soft elevation, system-ui.

Shared across both: brand blue `#1877F2`, money green `#31A24C`. Light-only.
Full token table in `app/globals.css` + `tailwind.config.ts`.
Rationale and deviations: **`REDESIGN-IMPLEMENTATION.md`**.

## Heads-up for future work

- **SEO Team CMS** uses **TipTap** — layout changes need the editor integration adapted, not just restyled.
- **Maps** use **Google Maps JS** (`lib/maps/*`) — same note; layout changes need the integration re-wired.
- **Analytics Hub** charts are **hand-rolled inline SVG** — same note.
- **Blog** is **dual-sourced** (static `.tsx` + DB posts) — the post template must render both.
