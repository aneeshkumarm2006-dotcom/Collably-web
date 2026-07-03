# Collably — Redesign Brief

> **How to use this brief:** This is a *requirements* document, not a spec of the current design.
> It tells you **what each page must accomplish and contain** — its purpose, the information it must
> convey, the data it displays, the actions users take, and the states it must handle. It deliberately
> does **not** prescribe layouts, colors, components, or copy. **You have full creative freedom** over
> visual language, layout, typography, color, and motion. Invent the design.
>
> **Non-negotiable rule:** every page listed here must still cover all of its *content, data, actions,
> and states*. Redesign freely — but don't drop functionality. Placeholder copy is fine; write fresh,
> on-intent text (final copy will be supplied later).

## What Collably is

A two-sided **local collaboration marketplace** (Canada-first). **Creators** find local businesses
offering real rewards (meals, services, products) in exchange for content; **businesses** post
campaigns, review creator pitches, accept creators, and verify the content they produce. No agencies,
no follower minimums. There is also a public marketing site and a private blog CMS.

Three audiences use it: **guests/visitors** (marketing + public browsing), **creators** (logged-in
app), **businesses** (logged-in app).

## Motion & experience goals (applies to every screen)

- This is a **motion-forward** redesign — animation is a first-class part of the experience, not
  decoration. Consider: entrance/scroll reveals, state transitions, hover/press feedback, list and
  card choreography, page transitions, loading/skeleton motion, celebratory moments, and micro-interactions.
- Motion must stay **performant and accessible** — respect reduced-motion, keep it fast, never block input.
- Design must be **fully responsive** (mobile → desktop) and support **light + dark** themes.
- Every screen needs its **loading, empty, and error** states designed — not just the happy path.

---

# 1. Marketing / Public Site

Public, unauthenticated (but adapts if a user is signed in). Shared site chrome: a top navigation and
a footer. Goal: convert visitors into creator or business sign-ups.

### Landing page — purpose: convince both sides to join; show the marketplace is alive
Must convey/contain:
- A **hero** that states the value proposition and drives two primary actions: *become a creator* and
  *become a business*. Include a trust signal (creator/business/city counts).
- A visual demonstration that the product is real and active (e.g. a preview of live campaigns and/or
  the app experience) — pulling in **real live campaign data** when available.
- **How it works** — the flow for creators and the flow for businesses (each a short ordered sequence).
- **Why Collably** — the core differentiators (real rewards not "exposure", no follower minimums, local matching).
- **Rewards** — make tangible what creators actually earn, with dollar values.
- **Social proof** — testimonials from both creators and businesses; headline platform stats.
- An **app-coming-soon** moment with an email capture.
- **FAQ** and a strong closing call-to-action.

### Pricing — purpose: show it's free for creators, tiered for businesses
Must contain:
- Clear message that **creators are free**.
- A **monthly/annual billing toggle** (annual = discount).
- **Three business tiers** (entry/free, a featured mid tier, a top tier), each with price, positioning
  line, feature list, and a CTA (top tier routes to contact/sales).
- Pricing-related FAQ + closing CTA. Currency is CAD.

### About — purpose: build trust via mission/story
- Origin story, headline stats, and a short set of company values. Closing CTA.

### For Creators / For Businesses — two audience landing pages
- Each: an audience-specific hero (value prop + primary CTA), a set of benefits for that audience, a
  3-step "how it works," an audience FAQ, and a closing CTA. Distinct visual tone per audience is welcome.

### Blog index — purpose: SEO + education
- A featured post, and a browsable/filterable list of posts (filter by category). Each post preview:
  category, title, short description, author, date, reading time. Empty state per filter. Link to RSS.

### Blog post — purpose: read one article
- Article header (category, title, author, date, reading time), a hero image, the article body, tags,
  social share actions, and a "related posts" section + closing CTA.
- **Constraint:** the body may come from two sources (hand-authored and CMS-authored HTML) — the
  template must render rich long-form content well either way.

### Contact — purpose: let people reach the team
- Contact channels (email/support/locations) + a **form**: name, email, a "who are you" selector
  (creator/business/press/etc.), and a message. Inline validation. A success confirmation state.

### Legal (Privacy, Terms, Cookies) — purpose: compliance, readable long-form
- A shared legal layout with cross-navigation between the three docs, a "last updated" date, and
  well-structured long-form reading. Cookies page includes a categorized cookie table.

**SEO note:** these pages are SEO-critical (sitemap, structured data, OG images). Keep them
content-rich and semantically structured.

---

# 2. Auth

Purpose: get users in/out securely with minimal friction. A shared, branded auth surface is welcome.

- **Login** — email + password, a "continue with Google" option, a forgot-password link, and a link to
  sign up. Handle submit errors inline.
- **Sign up** — first choose a **role** (creator or business), then account details (name — labeled per
  role, email, password ≥8 chars) with a Google option. Show which role is selected and allow changing it.
- **Forgot password** — request state (enter email) → confirmation state ("check your inbox," expiry note).
- **Reset password** — set a new password (with confirm-match), then auto-login.
- Every form needs validation, loading, and error states.

---

# 3. Onboarding

Purpose: collect the profile info that makes matching work, as a guided **multi-step flow** with clear
progress. Required until complete. End with a **celebratory completion** moment.

### Creator onboarding — required to finish: at least one niche + at least one connected social
Steps must collect:
- **Bio + niches** (pick from a set of creator niches — at least one required).
- **Location** (city/region/country, with smart autocomplete).
- **Socials** — connect at least one platform (Instagram / YouTube / TikTok), each with handle + profile
  link + follower/subscriber numbers; plus a "UGC creator" flag. Show clearly which platforms are "connected."
- **Content types** they make (optional).
- **Portfolio** — upload or link a handful of work samples (optional).

### Business onboarding — required to finish: name + category
Steps must collect:
- **Basics** — business name, category (single choice from a set), about text.
- **Location** + website.
- **Socials** (optional).
- **Logo** upload.

Both flows: step progress indicator, back/continue navigation, validation gating, and a confetti-style
success screen that routes into the dashboard.

---

# 4. Creator Dashboard

Authenticated creator app. Shared app chrome: primary navigation (Overview, Explore, Applications,
Active Collabs, Messages, History + Profile, Settings), a top bar with notifications and account menu,
theme toggle. Navigation should surface unread counts (messages, notifications). Design the collapsed/
mobile navigation too.

- **Overview** — a personalized welcome + at-a-glance metrics (rewards earned, pending applications,
  active collabs, completed collabs), a list of active collabs needing action, recommended/pending items,
  and recent activity. Empty states for a brand-new creator.
- **Explore** — browse and filter live campaigns (see the Explore requirements in §6; the creator
  version adds personalized "matches your niche" recommendations and shows the creator's application
  status on each campaign).
- **My Applications** — track everything applied to, filterable by status (pending/accepted/rejected/
  completed/withdrawn). Each entry shows the campaign, reward, date, status, and a status-appropriate
  action (withdraw, submit content, view submission). Handle loading/empty/error.
- **Active Collabs** — campaigns the creator was accepted to, with the deliverables checklist, deadline
  countdown, and actions (submit content, message the brand, view the brief). Highlight overdue.
- **Submit content** (per collab) — a submission flow: recap the brief/deliverables + deadline, then
  collect a live post link, an optional proof upload, optional notes, and a confirmation. Handle the
  "already submitted," "nothing to submit," and "success" states.
- **Messages** — real-time chat: a searchable/filterable conversation list + a message thread with
  typing indicators, delivery/read states, date grouping, and infinite history. Include the collab
  context. (See §7.)
- **History** — completed collabs, with a link to the live post.
- **Profile** — edit the full creator profile (bio, niches, location, socials, content types, portfolio),
  with a link to view the public profile. Under-review state if not yet verified.
- **Settings** — appearance (theme), notification preferences, change email, change password, delete
  account (with confirmation).
- **Notifications** — full paginated notification feed with mark-all-read.

---

# 5. Business Dashboard

Authenticated business app. Shared app chrome with its own nav (Overview, Campaigns, Applications,
Active Collabs, Submissions, Messages + Profile, Settings).

- **Overview** — greeting + key metrics (active campaigns, total applicants, content approved, reward
  value given), a list of active campaigns, and newest applications to review. Empty states.
- **Campaigns list** — all the business's campaigns, filterable by status (draft/active/paused/closed/
  completed), searchable, sortable. Each campaign shows status, reward, applicant count, and quick
  actions (edit, view applicants, and a menu to publish/pause/resume/close/mark-complete/delete, with
  confirmations). Offer a list and a map view.
- **Create / edit campaign** — this is the richest form in the product. It must capture:
  - **Basics**: title, category (single choice), description.
  - **Cover image** upload.
  - **Location**: in-person vs remote; if in-person, address fields + an optional precise map pin.
  - **Reward**: type (single choice), description, estimated dollar value.
  - **Deliverables**: a repeatable list (1–many), each with platform, content type, quantity, and
    requirements.
  - **Settings**: deadline, minimum followers (0 = open to all).
  - **Tags**.
  - Save-as-draft vs publish (publish gated on account verification), full validation with inline errors.
  Design this as a pleasant, non-overwhelming multi-section form.
- **Applications** — review creators who applied (across all campaigns, and scoped to one campaign),
  filterable by status. Each applicant: identity, niche/followers/location, their pitch, and
  accept/decline actions. Link to the creator's public profile.
- **Active Collabs** — accepted creators working on deliverables; filter by awaiting/submitted/overdue;
  actions to review content, send a reminder, or message. Highlight overdue.
- **Submissions** — review submitted content: preview the proof, view the live post, read creator notes,
  then approve (completes the collab), request changes (with a note), or mark failed.
- **Messages** — same real-time chat as creators (§7), business-side framing.
- **Profile** — edit business profile (name, category, about, location, website, socials, logo) + link
  to public profile. Under-review state.
- **Settings** — same as creator settings.
- **Notifications** — same as creator.

---

# 6. Public App Views (guest-accessible, shareable)

These pages work for logged-out visitors and logged-in users alike.

- **Explore** — the core discovery experience. Must provide:
  - Search (campaigns, brands, rewards) + a location filter.
  - Rich **filtering**: category, location / remote-only, reward type, platform, and creator follower
    tier. Plus quick category chips and a "clear all."
  - Sorting (newest, closing soon, highest reward, most applied; a relevance sort for signed-in creators).
  - **List and map** views (map shows reward-value pins that cluster; clicking a pin opens the campaign).
  - Infinite scroll with skeletons; empty and error states.
  - A guest banner prompting sign-up to apply.
  - **Campaign cards** showing: cover/category, business, title, reward (with $ value), key deliverable
    meta (platform/type/quantity/deadline), and applicant count; plus per-viewer status when relevant
    (applied/accepted/not selected) and a closed state.
- **Campaign detail** — everything a creator needs to decide to apply: hero, business (with verified
  status, link to their profile), full description, "what you'll create" (deliverables), tags, location
  (a **privacy-aware map** — exact address only for accepted creators, approximate area for everyone
  else), status/posted-time/deadline/applicant count, and "more from this business."
  - An **apply panel** that must handle all viewer states: closed campaign; guest (prompt to sign in);
    signed-in as a business (can't apply); creator who already applied (show status); creator under review;
    and creator who can apply (opens a pitch dialog). Design each state.
- **Business public profile** — cover/identity (logo, name, verified), website + socials, bio, headline
  stats (campaigns run/completed, live now), and their live campaigns grid. Empty state.
- **Creator public profile** — avatar/identity (name, verified, niches, UGC flag, location), bio, stats
  (followers/collabs/platforms/earned), connected socials, content types, and a portfolio gallery.
  Empty state.

---

# 7. Real-time Chat (creator + business)

Purpose: let the two sides talk within a collab. Requirements:
- A **conversation list** (searchable, filter by unread) — each item: other party, last message preview,
  timestamp, unread count, and collab context.
- A **thread** — grouped messages, date separators, a **typing indicator**, per-message **delivery/read
  status**, and **infinite scroll** into older history. Show which collab the chat belongs to.
- A **composer** — auto-growing input, send on enter (newline on shift-enter), emits typing.
- All loading/empty/error states. This is live (socket-based) — motion should reflect real-time arrival.

---

# 8. SEO Blog CMS (private, internal tool)

Purpose: let the team author and publish blog posts that appear on the public blog instantly. This is a
separate, password-gated internal app with its own chrome. It can have its own utilitarian-but-polished
aesthetic distinct from the consumer app.

- **Login** — simple password gate.
- **Posts table** — list all posts with search + status filter (all/published/draft); columns for title/
  slug, status, views, publish date, and row actions (edit, publish/unpublish toggle, delete with
  confirm). Empty state.
- **Post editor** — the core tool:
  - Content essentials: title (auto-generates a slug), editable slug, category, author.
  - A **rich-text (WYSIWYG) editor** with a formatting toolbar (bold/italic, headings, lists, quote,
    link, image upload, undo/redo).
  - **Starter templates** to choose from (how-to, listicle, comparison, review, news, generic).
  - A **cover image** uploader.
  - **Search-appearance** fields (meta title + meta description) with live length guidance.
  - A **keyword-backlinks** manager (keyword → URL, with rel type, and an "all occurrences" toggle).
  - A **live SEO checklist** panel that grades the post (title/description length, content length,
    keyword presence, links, image alt text, cover image) and shows pass/warn per check.
  - Save-as-draft vs publish.

---

# 9. System pages

- **Styleguide** — an internal design-system reference page. In the redesign this becomes the living
  showcase of the new system: color tokens, typography, buttons, form controls, badges/status, cards
  (campaign/stat/application/collab), pills, avatars, overlays (tooltip/popover/dropdown/toast/modal),
  navigation, empty states, and loading skeletons — ideally shown in both light and dark.
- **Error** and **global-error** — friendly failure states with retry + home actions.
- **404 / not-found** — a branded, helpful dead-end with routes back into the app.

---

# Cross-cutting elements to design (used across many pages)

- **Status badges** for application/collab lifecycle: pending, accepted, rejected, completed, submitted,
  under-review, overdue, withdrawn/cancelled, verified — each visually distinct.
- **Reward display** — reward type/label + a prominent dollar value.
- **Deadline countdown** — with urgency escalation (normal → warning → danger).
- **Cards** — campaign, stat/metric, application/applicant, collab, blog post, testimonial.
- **Uploaders** — image/portfolio/logo/cover/proof (drag-drop, preview, remove, progress).
- **Overlays** — dialogs/confirm modals, dropdowns, popovers, tooltips, toasts, mobile sheets.
- **Empty / loading (skeleton) / error** patterns — as a consistent, motion-aware system.

---

# Domain vocabulary (so labels/filters are complete)

- **Categories** (~14): Restaurant, Cafe, Food & Beverage, Fashion, Beauty, Salon & Spa, Health &
  Wellness, Fitness, Tech, Gaming, Travel, Home & Lifestyle, Education, Other.
- **Reward types**: Product, Experience, Voucher, Service, Cash + Product.
- **Platforms**: Instagram, YouTube, TikTok, Google, Any.
- **Content types**: Reel, Short, Story, Post, Long Video, Review, Photo, UGC.
- **Creator niches** (~15): Food, Lifestyle, Fashion, Beauty, Fitness, Health & Wellness, Tech, Gaming,
  Travel, Parenting, Education, Comedy, Music, Art & Design, Business & Finance.
- **Follower tiers**: Open to all, Nano (1K–10K), Micro (10K–50K), Mid (50K+).
- **Campaign statuses**: Draft, Active, Paused, Closed, Completed.
- **Application statuses**: Pending, Accepted, Rejected, Completed, Withdrawn, Cancelled, Overdue.

---

## Deliverable expectations for the design

For each page: design the **primary (happy) state**, plus its **empty**, **loading**, and **error**
states where applicable, in **light and dark**, **responsive**, with **motion** specified or shown.
Cover every page in sections 1–9. Invent the visual language freely — the only hard requirement is that
nothing in the *content, data, actions, and states* above is lost.
