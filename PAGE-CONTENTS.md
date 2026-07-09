# LocalShout Web — Page-by-Page Contents (Redesign Reference)

> This is the **detailed contents** of every screen — every section, field, button, card, filter,
> state, and piece of copy — so a redesign can rebuild each page 1:1. Companion to `FEATURES.md`
> (which lists *what* features exist; this lists *what each page contains*).
>
> **Identity to keep:** Meta-blue `#1877F2`, FB-green `#31A24C` (money), grey `#F0F2F5` surfaces,
> rounded radii (6/8/12/16/22/28), system sans + mono editorial accents. Tokens in `app/globals.css`.

---

# A. Marketing / Public Site — `app/(marketing)/`

All pages wrapped by `SiteChrome` (auth-aware navbar + footer). Shared blocks: `Section`/`SectionLabel`/`Container`, `CtaBand` (gradient closing CTA), `Faq` (accordion), `AudiencePage` template, `LegalPage` template.

## Landing `/`
Server component, `revalidate = 300`. Emits Organization + WebSite + FAQPage JSON-LD. Fetches up to 8 active campaigns (graceful empty on error).

- **Hero** (2-col)
  - Eyebrow pill: "🍁 Canada-first · Local collabs, easy ahead"
  - H1, 3 animated lines: "Real collabs." / "Real rewards." / "Zero gatekeeping."
  - Subcopy about matching Canadian creators with local spots; "No agencies. No follower minimums."
  - CTAs (`HeroCta`, client): guests → "Join as a creator" (`/for-creators`) + "I'm a business" (`/for-businesses`); signed-in → "Go to dashboard" + "Browse campaigns" (`/explore`)
  - Trust row: 4 avatar chips (MK, JD, AL, RN) + "3,200+ creators · 640+ local spots · 18 cities"
  - Right: floating **phone mockup** — app top bar "Explore" + bell w/ dot; "Toronto, ON" + "18 live" pulse; auto-scrolling feed of 5 cards (café/beauty/fitness/retail/food, each glyph + category badge + reward chip + "Apply →"); floating toast "Reward unlocked · Brunch for 2 · $65"; dark chip "+142 new collabs this week"
- **Logo marquee**: "Trusted by local favourites across Canada" + scrolling business names
- **Stats band** (dark): 3,200+ Creators · 640+ Local businesses · $1.2M+ Rewards unlocked · 18 Canadian cities
- **How it works** (`#how`): H2 "Two sides. One easy flow." Two cards, each numbered 3-step:
  - For creators (blue, Users): Browse your niche → Apply with a pitch → Show up & earn
  - For businesses (warm, Gift): Post a collab → Review pitches → Accept & verify
- **Features** ("Why LocalShout", H2 "Built for real, local collabs."): 3 cards — Real rewards, never "exposure" (gift); No follower minimums (users); Local-first matching (map-pin)
- **Product showcase** (H2 "One dashboard for every collab."): browser-window `DashboardMockup` — URL "app.localshout.ca/dashboard", sidebar (Dashboard/Collabs/Applicants/Rewards/Messages), "Welcome back, Maple & Oat", 3 stat tiles (Active collabs 8, Rewards unlocked $1,240, New applicants 32), 7-bar "Applications this week" chart, floating "New reward · Tasting menu · $140"
- **Live campaigns** (if any): "Live right now" (pulse) + H2 "Fresh local campaigns." + "Explore all" → `/explore`; up to 4 real `CampaignCard`s each with `GuestApplyButton` ("Sign up to apply", guests only)
- **Real rewards** (2-col): H2 "Rewards you can actually spend." + CTA "Start earning" → `/explore`; right list of 5 sample rewards (name · business · city + green $ value): Brunch for two $65, Full skincare set $95, 3-month studio pass $270, Tasting menu for two $140, Signature cut & colour $180
- **Testimonials** (H2 "From creators & businesses."): 3 cards (5 stars + quote + avatar + name/role): Aanya Patel, Daniel Roy, Marcus Lee
- **App promo** (`AppPromo`, dark): "Coming soon" pill, H2 "LocalShout in your pocket.", non-submitting notify-me email form + two disabled store badges
- **FAQ** (H2 "Questions, answered."): accordion of 5 general FAQs
- **Final CTA** (`CtaBand`): "Ready to start collabbing?" + "Join as a creator" / "I'm a business"

## Pricing `/pricing`
- Header: label "Pricing", H1 "Free for creators. Fair for businesses."
- **PricingTiers** (client): Monthly/Annual toggle (Annual shows "save 20%" + annual prices)
  - **Creators banner** (blue→purple gradient): "Creators — Free, forever" + "Join as a creator" → `/signup`
  - **3 business tiers** (CAD, /mo):
    - **Starter** $0/$0 — "Pay only in the rewards you offer." CTA "Get started" → `/signup`. Features: post collabs & receive pitches; review & accept creators; verify submissions; direct messaging; 1 active collab
    - **Growth** (featured, "Most popular") $49/$39 — CTA "Start Growth" → `/signup`. Features: everything in Starter; up to 10 active collabs; priority placement in Explore; analytics dashboard; faster support
    - **Pro** $99/$79 — CTA "Talk to sales" → `/contact`. Features: everything in Growth; unlimited active collabs; team seats & roles; advanced analytics & exports; priority support
  - Footnote: "Prices in CAD. Rewards provided directly by businesses to creators."
- **FAQ** (4 pricing questions)
- **CtaBand**: "Start free, today."

## About `/about`
- **Story**: H1 "We're rebuilding local collabs — honestly." + 2 paragraphs (Toronto café origin, 2024)
- **Stats band** (dark): same 4 platform stats
- **What we believe**: 3 value cards — Real value, always (Gift); No gatekeeping (Sparkles); Local first (MapPin); + pill "Proudly built in Canada 🍁"
- **CtaBand**: "Come build with us."

## For Creators `/for-creators` (blue, `AudiencePage`)
- Hero: eyebrow "For Creators", H1 "Get paid in real rewards." + "Join as a creator" (`/signup`) / "Browse campaigns" (`/explore`); chips "Free to join · No follower minimums · UGC creators welcome"; floating card "Reward unlocked · Brunch for 2 · $65"
- Benefits (4): No follower gatekeeping; Rewards, never "exposure"; Collabs in your city; Build your portfolio
- Steps (3): Browse your niche → Apply with a pitch → Collab & earn
- FAQ (4) + CtaBand "Your next collab is waiting."

## For Businesses `/for-businesses` (warm, `AudiencePage`)
- Hero: eyebrow "For Businesses", H1 "Content that converts." + "List your business" (`/signup`) / "See pricing" (`/pricing`); chips "Free to post · No agency retainers · Verified submissions"; floating card "Verified content · 32 new applicants"
- Benefits (4): Pay in rewards, not retainers; Real pitches from real creators; Verified end-to-end; Reach the right local audience
- Steps (3): Post a campaign → Review & accept → Verify the content
- FAQ (4) + CtaBand "Post your first campaign today."

## Blog index `/blog`
Posts merge 2 static `content/blog/*.tsx` + published Mongo posts (newest-first, static wins on slug clash).
- Header: label "The LocalShout Blog", H1 "Playbooks for local collabs." + "RSS" → `/feed.xml`
- **Featured post** card (gradient, "Featured · {category}", title, 3-line desc, author row)
- **BlogFilter** (client): category filter pills ("All" + categories) + grid of `PostCard`s (gradient header, category badge, title, 2-line desc, author row). Empty: "No posts in this category yet."

## Blog post `/blog/[slug]`
Per-post metadata; 404 → noindex. Static = React Body; DB = sanitized HTML + keyword backlinks + view increment.
- BlogPosting + Breadcrumb JSON-LD
- "← All posts"; category eyebrow; H1; author row (avatar, name·role, date · N min read)
- Gradient hero banner (+ optional cover image)
- Body in `Prose`; "#tag" chips; **Share** tiles (LinkedIn, X, Facebook)
- **Related** ("Keep reading", up to 2, prefers same category)
- **CtaBand**: "Start your first collab free" — "Get started" / "Browse campaigns"

## Contact `/contact`
Reads `?topic=` to preselect. Topics: General, For businesses, For creators, Press, Support.
- Header: H1 "Let's talk." + "we usually reply within a day"
- Channels (3 cards): Email hello@localshout.ca; Support support@localshout.ca; HQ "Toronto · Vancouver"
- **ContactForm** (`POST /api/contact`, zod): **Name** (text, req 1–120); **Email** (req, valid); **"I'm a…" role pills** (Creator/Business/Press → topic); **Message** (textarea rows 5, 10–4000). Inline validation. Submit "Send message" → "Sending…". Success: check + "Message sent" + "Thanks, {firstName}…"

## Legal (`LegalPage` template) — all stamped **28 June 2026**
Sticky left side-nav between Privacy/Terms/Cookies; right = "Last updated", H1, body in `Prose`.
- **Privacy** `/privacy`: 10 sections (collection, use, sharing/no-selling, cookies, retention, rights → privacy@localshout.app, security, children <16, changes, contact)
- **Terms** `/terms`: 10 sections (service, accounts 16+, campaigns/rewards, acceptable use, content/licence, moderation, disclaimers, liability, termination, contact → legal@localshout.app)
- **Cookies** `/cookies`: 5 sections incl. **CookieTable** (Essential "Always on", Analytics "Optional", Marketing "Optional")

---

# B. Auth — `app/(auth)/`

Shared **split-screen** (`auth-layout.tsx`): left blue→purple gradient brand panel (blobs, logo → `/`, headline "Local collabs. Real rewards.", subtext about 3,200+ creators / 640+ businesses, testimonial from Maya K., "© 2026 LocalShout · Proudly Canadian 🍁"); right form (max-w 400px). Password rule for new passwords: **8–128 chars**.

## Login `/login`
- Heading "Welcome back" + "Log in to your LocalShout account."
- **Google button** ("Continue with Google"); degrades to placeholder toast if no client ID
- "or" divider + `ErrorBanner`
- Form: **Email** (type=email, req+valid, "you@email.com"); **Password** (type=password, current-password, "••••••••") with inline **"Forgot password?"** → `/forgot-password`
- Submit "Log in" / "Logging in…"; footer "New to LocalShout?" → "Create an account" (`/signup`, preserves `next`)

## Signup `/signup` (two-step, no route change)
- **Step 1 — Role**: heading "Create your account" / "First, tell us who you are." Two cards: **I'm a Business** (Store, "Post campaigns & find creators", warm) / **I'm a Creator** (Sparkles, "Find collabs & earn rewards", blue). Footer "Already have an account?" → `/login`
- **Step 2 — Details**: role badge pill + "change" link; Google button ("Sign up with Google"); "or" + ErrorBanner; Form: **Name** (role-dependent label: "Business name"/organization vs "Full name"/name, req ≤120); **Email** (req+valid); **Password** (new-password, 8–128, hint "Use 8+ characters."). Submit "Create account". "Choose a different role" back button
- Routing: new/un-onboarded → onboarding; else `next`/postAuth

## Forgot password `/forgot-password`
- **Request state**: Mail badge, "Reset password" + "Enter the email… we'll send a link." Form: **Email** (req+valid). Submit "Send reset link". "Back to log in" → `/login`
- **Sent state**: CheckCircle2 badge, "Check your inbox" + "sent to {email}… expires in 30 minutes." Dev shortcut link (non-prod); "Use a different email"; "Back to log in"

## Reset password `/reset-password/[token]`
- Check badge, "Set a new password" + "You'll be logged in right after."
- Form: **New password** (new-password, 8–128, hint); **Confirm password** (must match). Submit "Update & log in" → auto-login → postAuth. "Back to log in"

---

# C. Onboarding — `app/(onboarding)/`

Guarded (`requireOnboardingSession`); wrong-role bounced. Shared `OnboardingFrame` (grey bg, logo, "Log out", no skip) + `OnboardingShell` (progress "Step n of total" + active label + blue→purple progress bar; card with fade/slide; Back/Continue/Finish footer). `TogglePill` (multi-select), `SelectCard` (single-select).

## Creator `/onboarding/creator` — 5 steps: Bio & niche / Location / Socials / Content / Portfolio
1. **Bio & niche**: Bio textarea (max 2000, live counter, optional); **Niches** toggle pills — Food, Lifestyle, Fashion, Beauty, Fitness, Health & Wellness, Tech, Gaming, Travel, Parenting, Education, Comedy, Music, Art & Design, Business & Finance. **Required ≥1**
2. **Location**: `LocationFields` — City autocomplete (auto-fills region+country), State/Region, Country (Canada-first, free text). Optional
3. **Socials** (`SocialHandlesStep`) — **required ≥1 connected platform**: 3 PlatformCards → **Instagram** (handle, profile url, Followers, Engagement %), **YouTube** (handle, url, Subscribers), **TikTok** (handle, url, Followers). Green "Connected" badge when handle+valid link; amber warning if link invalid. **UGC toggle** switch "I'm a UGC creator"
4. **Content**: toggle pills — Reel, Short, Story, Post, Long Video, Review, Photo, UGC. Optional
5. **Portfolio** (`PortfolioUploader`): up to **6** pieces; 3-col grid thumbs w/ remove X; "Upload" (Cloudinary) + "Add URL" tiles. Optional
- **Finish** re-guards ≥1 social → `PUT /api/profile/creator` → celebration
- **Celebration**: 48-piece confetti, gradient Check, "You're all set, {firstName}! 🎉", CTA "Explore campaigns" → `/dashboard/creator`

## Business `/onboarding/business` — 4 steps: Basics / Location / Socials / Logo
1. **Basics** — **required: name + category**: Business name (organization, ≤160); **Category** SelectCards (warm) — Restaurant, Cafe, Food & Beverage, Fashion, Beauty, Salon & Spa, Health & Wellness, Fitness, Tech, Gaming, Travel, Home & Lifestyle, Education, Other; About textarea (max 2000, counter, optional)
2. **Location**: `LocationFields` + **Website** (type=url, ≤2048). Optional
3. **Socials** (all optional, free text): Instagram / YouTube / TikTok inputs
4. **Logo** (`LogoUploader`): 160×160 dashed drop-target → Cloudinary; Replace/Remove; "Recommended: square, ≥400×400px"
- **Finish** re-guards name+category → `PUT /api/profile/business` → celebration "You're all set, {businessName}! 🎉" → "Go to dashboard"

---

# D. Dashboard shell (creator + business) — `app/(dashboard)/`

Guarded per role (`requireRoleSession`). `DashboardShell` = **Sidebar** (dark, gradient, collapsible icon-rail on desktop, bottom tab bar on mobile, brand logo top) + sticky **Topbar** (pathname breadcrumbs, theme toggle, **notification bell** [dropdown: up to 8 items + unread count + "Mark all read" + "View all notifications"], user avatar menu + logout) + content area (brand/grape radial wash). Live realtime keeps chat + notifications fresh; Messages nav shows unread badge.

- **Creator nav**: Overview, Explore, My Applications, Active Collabs, Messages, History · Account: Profile, Settings
- **Business nav**: Overview, My Campaigns, Applications, Active Collabs, Submissions, Messages · Account: Profile, Settings

---

# D1. Creator Dashboard — `dashboard/creator/`

## Overview `/dashboard/creator`
- **Hero banner** (blue→purple): "Welcome back, {firstName} 👋" + count summary + white "Find new collabs →"
- **4 stat tiles**: **Rewards earned** ($ lifetime), **Applications** (pending review), **Active collabs** (in progress), **Completed** (verified)
- **Active collabs** card (left, wider): up to 4, priority-sorted (un-submitted first, soonest deadline); each row = gradient initial tile, title, business, reward, StatusBadge; links to submit. Empty "No active collabs yet" + "Browse campaigns →"
- **Recommended** card (right): up to 3 pending apps (→ public campaign) + **Recent activity** (up to 5 notifications w/ icon, message, relative time, unread dot). Empty "You're all caught up."

## Explore `/dashboard/creator/explore`
Authed default sort "Best match". (Same engine as public Explore — see section F1.) Adds personalized **niche rail** ("Matching your niche: …", up to 6 relevance cards excluding already-applied) + per-card application-status corner badges.

## My Applications `/dashboard/creator/applications`
- Header "My Applications" / "Track every campaign you've applied to."
- **Filter tabs** (counts): All, Pending, Accepted, Rejected, Completed, Withdrawn
- **Table** cols: Campaign / Reward (sm+) / Applied (md+) / Status
- **Rows** (`CreatorApplicationRow`): gradient initial, title (→ `/campaign/[id]`), business·category, reward, "Applied {date}", StatusBadge, action:
  - Pending → **Withdraw** (confirm modal → toast "Application withdrawn")
  - Accepted/Overdue not-submitted → **Submit content →**
  - Accepted/Overdue submitted → "Under review"
  - Completed w/ link → **View submission** (external)
- States: skeletons; error + Retry; "No applications yet" + "Browse campaigns"; empty-tab message

## Active Collabs `/dashboard/creator/collabs`
Fetches Accepted+Overdue, priority-sorted.
- Header "Active Collabs" / "Take action before the deadline."
- Empty: Handshake, "No active collabs" + "Browse campaigns"
- **Grid (2-col) `CreatorCollabCard`**: gradient tile, title, business + location, RewardPill, StatusBadge (Completed/Submitted/Overdue/Not started), **deliverables checklist** ("{qty}× {platform} {contentType}: {requirements}", green check if submitted), deadline row (`CountdownChip` + date). Actions: **Submit content →** (or "View submission"/"Under review"), **Message** (if conversation), **View briefing**. Overdue = red left border

## Submit Content `/dashboard/creator/collabs/[id]/submit`
Participant-scoped (else notFound). Gate states: Not submittable (AlertTriangle) / Already submitted (CheckCircle + optional View submission) / Success (CheckCircle "Submission received!").
- Main form: back link + "Submit your content"; **context panel** (title, business, brief deliverables checklist, deadline banner colored by urgency)
- Fields: **Live post link** (type=url, validated), **Proof screenshot** (optional drag/click upload → Cloudinary, preview + remove, "MP4/MOV/JPG/PNG up to 200MB"), **Notes to the brand** (textarea max 1000), **Confirmation checkbox**
- **Submit for review →** (disabled until confirmed + valid link) → success panel

## Messages `/dashboard/creator/messages` (+ `[conversationId]`)
Split-pane (list 340px + thread). Mobile single-pane.
- **List header**: "Messages" / "Chat with the brands you're collaborating with."
- **ConversationList**: search (name/campaign/last message + clear X); pills **All / Unread {n}**; rows (avatar, name, relative time, preview ["You: …"], unread badge, campaign subline). States: skeletons/error+Retry/"No chats found"/"No messages yet"
- **Index right pane**: MessagesSquare, "Your messages" / "Select a conversation…"
- **Thread** (`ChatThread`): header (mobile back, avatar+name, "typing…"/campaign/"Collab chat"); brand-tinted **collab strip** "Collab · {campaignTitle}"; column-reverse timeline w/ grouped `MessageBubble`s, date separators, typing bubble, infinite older-history ("Loading earlier messages…"); bubbles show timestamp + delivery state (Clock/Check/CheckCheck); **ChatComposer** (auto-grow textarea "Message…", circular send, Enter=send Shift+Enter=newline, typing events). Marks read on open + each incoming

## History `/dashboard/creator/history`
Completed, verifiedAt desc. Header "History" / "Every collab you've completed." Empty: History icon. Table: Collab / Reward (sm+) / Completed (md+) / Status; action **View post** (external) if link.

## Profile `/dashboard/creator/profile`
Header "Edit profile" + **View public profile** (→ `/creator/[id]`). No profile → EmptyState "Go to onboarding". Under-review banner if unapproved.
- Form (reuses onboarding model, `PUT /api/profile/creator`): profile hero (avatar/initial, name, up to 5 niche pills); **About** (Bio max 2000 + niche toggle pills); **Location**; **Social handles** (`SocialHandlesStep`, ≥1 required); **Content types** pills; **Portfolio** (up to 6). Error banner; **sticky "Save changes"**; **Log out** (danger)

## Settings `/dashboard/creator/settings`
Shared `AccountSettings`. Header "Settings". 2-col:
- **Appearance** (Light/Dark/System)
- **Notifications** (switches: Email, Push mobile — optimistic)
- **Email address** (email + current-password → "Update email")
- **Password** (current/new≥8/confirm → "Change password")
- **Delete account** (danger, confirm dialog w/ password → logout + home)

## Notifications `/dashboard/creator/notifications`
Header + **Mark all read** (disabled when 0). Infinite (20/page) list: icon chip, message, relative time, unread dot/tint, role-aware deep link. "Load more". States: skeletons/error+Retry/"No notifications yet"

---

# D2. Business Dashboard — `dashboard/business/`

## Overview `/dashboard/business`
Fetches profile + own campaigns + applications.
- Header: time-of-day greeting + pending-count subtitle + **New campaign**
- **4 StatTiles** (glyph + blob + Bricolage value + delta): **Active campaigns** ("N filling fast"), **Total applicants** ("▲ N this week"), **Content approved**, **Reward value given** (compact $)
- **Active campaigns** panel (max 5, Active-first): row = initials tile, title, reward, applicant count → `campaigns/[id]/applications`; "Manage" link; empty "No campaigns yet" + Create
- **New applications** panel (5 recent pending): creator avatar, name, "niche · N followers", "Review" → applications; footer banner "N applications awaiting review" when pending>0

## Campaigns list `/dashboard/business/campaigns`
- Header "My Campaigns" + **New campaign**
- **List/Map** view toggle; **Status tabs** (counts): All, Draft, Active, Paused, Closed, Completed; toolbar: search (title) + sort (Newest / Most applications / Closing soon)
- **`CampaignRow` cards** (up to 3-col): gradient/cover header + **status pill** (Live/Paused/Draft/Closed/Completed); title (→ applications), reward line; footer stats (N applicants, N spots); actions **Edit** / **Applicants** / **⋯** (Publish/Pause/Resume/Close/Mark completed/Delete)
- ConfirmModal for close/complete/delete (delete destructive)
- States: 6 skeletons / error+Retry / "No campaigns yet" / "No campaigns match"

## Campaign create `/dashboard/business/campaigns/new` & edit `/campaigns/[id]/edit`
`CampaignForm` — 7 numbered sections + sticky action bar. Validation mirrors backend zod; inline red errors.
- **01 Basics**: **Title** (≤160, req); **Category** SelectCards (14, req); **Description** (textarea rows 5, ≤5000, counter, req)
- **02 Cover image**: `CoverUploader` 16:9 dashed → Cloudinary; Replace/Remove; "PNG/JPG up to 10MB · 16:9". Optional
- **03 Location**: toggle **In-person** / **Remote / Online**; if in-person → `LocationFields` + lazy Google Maps **LocationPicker** ("Pin the exact spot", precise only to accepted creators)
- **04 Reward**: **Reward type** SelectCards (Product, Experience, Voucher, Service, Cash + Product); **Reward description** (≤1000, req); **Estimated value** (number, `$` prefix, ≥0, optional)
- **05 Deliverables** (1–20): each `DeliverableEditor` = **Platform** select (Instagram/YouTube/TikTok/Google/Any), **Content type** select (Reel/Short/Story/Post/Long Video/Review/Photo/UGC), **Qty** (≥1), **Requirements** (textarea ≤1000). "Add another deliverable"
- **06 Settings**: **Deadline** (date, optional); **Min. followers** (number ≥0, "Set 0 to accept all incl. UGC") — *no capacity/spots field by design*
- **07 Tags**: up to 30 chips (≤40 chars each), add on Enter/comma/blur, strips `#`, dedupes
- **Action bar** — create: Cancel / **Save as draft** / **Publish campaign** (disabled unless approved; note "Publishing unlocks once an admin verifies your business"); edit: Cancel / **Save changes**. Failure → banner + scroll top; success → toast + redirect

## Applications `/dashboard/business/applications` (all) & `/campaigns/[id]/applications` (per-campaign)
Per-campaign adds **All campaigns** back + **campaign banner** (thumb, title + StatusBadge, RewardPill, deadline, big count).
- `BusinessApplicationsClient`: **Status tabs** (counts) All/Pending/Accepted/Rejected/Completed (default Pending when scoped, else All)
- **`ApplicantRow`**: avatar/initials, name, StatusBadge, "niche · N followers · city" (+ "Applied to {campaign}" on all-view); actions **Profile** (new tab) + if Pending **Decline** / **Approve** (→ toasts)
- States: 3 skeletons / error+Retry / empty / no-match

## Active Collabs `/dashboard/business/collabs`
Accepted+Overdue. **Filter pills** (counts): All, Awaiting submission, Submitted, Overdue.
- **`CollabRow`** (2-col; overdue red border): avatar, creator, campaign in quotes, StatusBadge (Awaiting/Submitted/Overdue), deliverables summary, `CountdownChip`; actions: **Review content** (if submitted → submissions) / **Send reminder** (if remindable) / disabled "Awaiting content" + **Message**

## Submissions `/dashboard/business/submissions`
Accepted with `submittedAt`. **`SubmissionCard`** (2-col): **preview** button (150px header, proof image + Play overlay → Dialog "Proof screenshot"), content-type pill; creator avatar+name+campaign, "Submitted {time}"; **View live post** (external); **Creator note** box; **revision box** (toggle, textarea ≤1000, "Send revision request"); actions **Request changes** / **Approve** (verify+complete) / **Mark failed** (danger)

## Messages / Thread — same split-pane + `ChatThread` + `ChatComposer` as creator (role="business"), subtitle "Chat with the creators in your collabs."

## Profile `/dashboard/business/profile`
Header "Business profile" + **View public profile** (→ `/business/[id]`). Under-review banner if unapproved.
- `BusinessProfileForm` (`PUT /api/profile/business`): profile header card (logo/initials, name, Verified/Under-review badge); **Basics** (name ≤160 req; Category SelectCards req; About ≤2000 counter); **Location & website** (`LocationFields` + Website url ≤2048); **Social links** (IG/YT/TikTok ≤200); **Logo** (`LogoUploader`); **Log out** (danger); sticky "Save changes"

## Settings — shared `AccountSettings` (identical to creator: Appearance / Notifications / Email / Password / Delete account)

## Notifications — shared `NotificationsClient role="business"`, header subtitle "Everything happening with your campaigns."

---

# F. Public App Views — `app/(public-app)/`

`PublicAppChrome`: guests/crawlers get marketing `SiteChrome`; signed-in users get `DashboardShell` around the same content. All guest-accessible + shareable.

## F1. Explore `/explore`
SSR-seeds first 12; `ExploreClient`.
- **Header**: H1 "Explore local collabs" / "Browse live campaigns from verified local businesses across Canada." Search (magnifier, "Search campaigns, brands, or rewards…", 350ms debounce) + location pill ("All of Canada"). **Category quick-filter pills** ("All" + each category, single-select, syncs w/ sidebar)
- **Filter sidebar** (`FilterSidebar`, sticky desktop / mobile "Filters" drawer, "Clear all" link, multi-open accordion):
  - **Category** checkboxes (14, optional counts)
  - **Location** free-text "City…" + "Remote / Online" checkbox
  - **Reward type** checkboxes: Product, Experience, Voucher, Service, Cash+Product
  - **Platform** checkboxes: Instagram, YouTube, TikTok, Google, Any
  - **Creator tier** radio: Open to all, Nano (1K-10K), Micro (10K-50K), Mid (50K+)
  - *(no status filter — feed is implicitly live)*
- **Results**: toolbar (mobile Filters btn, "N campaigns found", **List/Map toggle**, **Sort** [Best match/Newest/Closing soon/Highest reward/Most applied — guests lose Best match]); **guest banner** (Sparkles + "Sign up to apply"); **List** = 1/2/3-col grid + infinite scroll + skeletons + "You've reached the end."; **Map** (code-split Google Map, green value pins → count clusters → `/campaign/[id]`, auto-fit bounds, eager-fetch all pages; degrades gracefully; "No on-site campaigns to map")
- **`CampaignCard`** (full): cover 16:9 (category-gradient fallback + icon, hover zoom); overlays (category chip, spots-left chip [red ≤3, often absent — no spots model], viewer status badge Applied/Accepted/Not selected); business row (avatar+name+city); title (2-line); **RewardPill** (icon+label+green $); mono meta chips (platform, content type, N×, deadline); footer ("N applied", "N left")

## F2. Campaign detail `/campaign/[id]`
ISR `revalidate=120`; 404→notFound; campaign+breadcrumb JSON-LD.
- "Back to explore"
- **Hero** (230px): cover over category gradient + bottom scrim; "Live campaign" ping chip (Active); **title** overlaid
- **Two-col** (main + sticky rail):
  - **Business row card**: logo, name + BadgeCheck (verified), "category · location · View profile →" (→ `/business/[id]`)
  - **About this collab** (full description)
  - **What you'll create** (deliverables checklist: "qty× platform contentType" + requirements)
  - **Tags** (# pills)
  - **Location** (non-remote): `CampaignLocationMap` — privacy-aware (accepted see precise pin + address; others fuzzed center + radius + "Approximate area shown… exact address shared once accepted"); text fallback
  - **Meta strip**: StatusBadge + "Posted {time}" + deadline countdown + "{N} applicants"
  - **Right rail — Apply panel** + "More from {business}" (up to 2 compact cards)
- **Apply panel** (`PanelShell`): reward hero (REWARD eyebrow, name, "{$value} value"); stat rows (Applicants, Min. followers); state CTA:
  - Closed → disabled "Campaign closed"
  - Resolving → spinner
  - Guest → "Apply as a guest" → "Continue to apply" (Lock) → `/login?next=…` + "Free to apply · No follower minimum"
  - Business/admin → disabled "For creators"
  - Creator applied → disabled "Application submitted" + StatusBadge
  - Creator under review → disabled "Apply now" + "under review" note
  - Creator can apply → "Apply to this collab" → **pitch dialog** (title "Apply to this campaign", pitch Textarea optional 5 rows, Cancel / "Submit application") → toast "Application submitted"

## F3. Business profile `/business/[id]`
ISR `revalidate=300`; business+breadcrumb JSON-LD.
- **Cover banner** (180px blue gradient) + floating "Explore" back
- **Identity**: logo (104px, overlaps banner), name + BadgeCheck (verified), "category · city, state"; actions **Website** (external nofollow) + Instagram icon btn; **Bio**; **stat row** (Collabs run, Collabs completed, Live now)
- **Live campaigns**: heading + "Explore more →"; grid (1/2/3) of up to 12 active `CampaignCard`s; empty "No live campaigns"
- *(no tabs, no past-collabs list)*

## F4. Creator profile `/creator/[id]`
ISR `revalidate=300`; creator+breadcrumb JSON-LD.
- "Explore" back
- **Header**: avatar (96px), name + BadgeCheck; headline (niche(s) "Fashion & Beauty creator" + "city, state"); **niche/type pills** (mint "UGC creator" + per-niche icons)
- **Bio**
- **Stat row**: Followers (total reach, hidden if 0), Collabs, Platforms, Earned (currency, hidden if 0)
- **Socials**: one card per connected platform (icon, @handle, follower/sub count, external nofollow)
- **Content types** pills
- **Portfolio**: 2/3/4-col square tiles (external link, hover zoom + ExternalLink badge + caption); empty "No portfolio yet."
- *(no tabs, no separate campaigns list)*

---

# G. SEO Team — Private Blog CMS — `app/seoteam/`

Isolated from public chrome & user-JWT; `noindex,nofollow`, `force-dynamic`. Server checks `hasSeoSession()` → renders `SeoLogin` or `SeoShell`. **`SeoShell`**: sticky top bar — left "SEO Dashboard" + nav "Posts" / "New post"; right "View blog" (→ `/blog` new tab) + "Log out".

## SEO Login
Password gate, centered card: Lock badge, "SEO Dashboard" / "Enter the team password to continue." Single **Password** field (autofocus). **Sign in** (→ "Signing in…"). POSTs `/api/seoteam/login` → `router.refresh()`. Password-only (no email/remember/forgot).

## Posts Table `/seoteam`
Loads from Mongo (title, slug, status, views, category, publishedAt, updatedAt; sorted updatedAt desc).
- Header "Posts" + "N post(s) · publish to make them live on /blog instantly." + **New post**
- Controls: **Search** ("Search by title…") + **Status filter** segmented (all / published / draft)
- **Columns**: Title (+ `/slug`) / Status (Badge) / Views (Eye + count) / Published (date or "—") / Actions (**Edit** pencil, **Publish/Unpublish** toggle [Send/EyeOff → toast], **Delete** trash → confirm dialog)
- Empty "No posts yet. Create one."; Delete dialog "Delete this post?" (Cancel / Delete destructive)

## Post Editor `/seoteam/new` & `/seoteam/[id]/edit`
Two-col (main + 340px sidebar). Header "New/Edit post" + **Save draft** (outline) / **Publish** (primary, "Published — live on /blog"). Both require a title. No delete in editor.
- **Main**: **Template picker**; **Details card** (Title [auto-slugs until slug edited], Slug [`/blog/` prefix, ≤80], Category [default "Guides"], Author name [default "LocalShout Team"]); **Content** (Tiptap); **Keyword backlinks** (KeywordManager)
- **Sidebar**: **Cover image** (16:9 preview / dashed placeholder, Upload/Replace → Cloudinary `blog/covers`, Remove); **Search appearance** (Meta title [live count 30–60, green in range], Meta description [textarea, count 70–160]); **SEO checks** panel
- Saved payload: title, slug, template, body, excerpt, metaTitle, category, tags, coverImage, keywords, linkAllOccurrences, author{name,role}, status. *(tags + author role are saved but have no UI input)*

### Template Picker — 6 templates (each with starter HTML)
How-To / Tutorial · Listicle (Top N …) · Comparison / "X vs Y" · Product / Service Review · News / Update · **Generic Article** (default). Overwrite guarded by `confirm()` when body non-empty.

### TipTap Editor
StarterKit + Link + Image + Placeholder; headings H2/H3/H4; min-h ~360px. Toolbar: **Bold**, **Italic**, **H2**, **H3**, **Bullet list**, **Numbered list**, **Quote**, **Link** (prompt), **Image** (upload → Cloudinary), **Undo**, **Redo**.

### Keyword Manager
"Keyword backlinks" + **Add**. Rows: **keyword** / **URL** / **rel** select (dofollow default / nofollow / sponsored) / remove. **Link all occurrences** switch ("Off = link only first occurrence (recommended)"). Empty "No keywords yet."

### SEO Check Panel — live "X/Y passing"
1. Meta title length 30–60
2. Meta description length 70–160
3. Content length ≥300 words
4. Keywords appear in body (if ≥1 keyword)
5. Links present (>0, "N internal · N external")
6. Image alt text (no `<img>` missing alt)
7. Cover image set

---

# H. System pages

## Styleguide `/styleguide`
Dev/QA design-system reference (most sections shown light + dark side-by-side via `DualPanel`; ThemeToggle in header). Showcases: **Color tokens** (Brand/Money/Page/Card/Muted/Hover/Success/Warning/Error/Info), **Typography** (H1–H3, body, secondary, mono money), **Buttons** (Primary/Secondary/Outline/Ghost/Link/Money/Destructive/Disabled + sizes), **Form controls** (Input/Textarea/Select/Checkbox/Switch/RadioGroup/Slider), **Badges & StatusBadge tones**, **Reward & Category pills**, **Avatars** (sizes + square + image), **Tabs/Accordion/Progress/Skeleton**, **Tooltip/Popover/Dropdown/Bell + toasts**, **Campaign cards** (default/accepted/closed/compact), **Stat cards**, **Application cards** (pending/accepted/rejected), **Collab cards** (accepted/overdue), **Image upload + Step progress**, **Empty state**, **Confirm modal**, **Filter sidebar** (desktop + mobile), **Navbar** (signed-out light + on-dark), **Dashboard shell**, **Footer**.

## Error `app/error.tsx`
Segment error boundary → `ErrorState`: AlertTriangle (danger circle), "Something went wrong", "An unexpected error occurred… come back in a bit.", **Try again** (`reset()`) + **Go home** (`/`).

## Global error `app/global-error.tsx`
Root-layout boundary, own `<html>/<body>`, no theme/providers. "Something went wrong" / "The page failed to load. Please try again." + **Try again** (brand). No home link/icon.

## 404 `app/not-found.tsx`
Self-contained, no navbar. BrandMark (→ home), mono "404" eyebrow, "Page not found" / "…doesn't exist or may have moved.", **Back to home** (`/`) + **Explore campaigns** (`/explore`).

---

# Shared vocabulary (used everywhere)

- **StatusBadge** (soft pill + dot + uppercase mono): Pending=warn, Accepted/Verified=success, Rejected/Overdue=danger, Withdrawn/Cancelled=neutral, Completed/Submitted=info, "Under review"=warn
- **RewardPill**: reward icon + label + green mono `$value` (sm chip vs lg row)
- **CountdownChip / formatCountdown**: deadline colored normal/warn/danger by urgency
- **Enums** (`shared/constants/*`): 14 categories, 5 reward types, 5 platforms, 8 content types, 15 niches, follower tiers (Nano/Micro/Mid)

---

# Redesign heads-up (integration-sensitive screens)

- **Campaign form** is the single richest surface — 7 sections, ~20 fields, live validation. Redesign carefully.
- **Chat** (ChatThread/Composer/MessageBubble/ConversationList) is realtime (socket.io) — layout changes must preserve typing/read/delivery/infinite-history behavior.
- **Maps** (explore map + privacy-fuzzed detail map + location picker) use Google Maps JS — send these screens explicitly if layouts change.
- **SEO CMS editor** uses TipTap — toolbar/layout changes need editor re-wiring, not just restyling.
- **Blog post** template must render BOTH static React bodies and sanitized DB HTML.
- **Apply panel** has 7 distinct viewer states — design all of them.
- **Auth/onboarding** left brand panel is shared chrome; onboarding has confetti celebration screens.
