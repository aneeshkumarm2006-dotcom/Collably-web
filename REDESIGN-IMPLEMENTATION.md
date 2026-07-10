# LocalShout Redesign — What Shipped

Implementation notes for the port of the Claude Design project
`3ad21024-7726-457c-ae34-585afa38727d` into the Next.js app.

Companion to [`REDESIGN-BRIEF.md`](./REDESIGN-BRIEF.md), which is the
*requirements* document. **Where this file and the brief disagree, see
"Conflicts with the brief" below** — those are open decisions, not oversights.

The design project contained 7 files: three landing-page variants, Auth, Creator
Dashboard, Business Dashboard, and a Logo concept board.

---

## Decisions taken

| Question | Decision |
| --- | --- |
| Landing variant | **v3** — neo-brutalist "sticker" |
| Brand seam | **All public surfaces** get the sticker language; dashboards stay Facebook-clean |
| Dashboard/landing clash | **Build dashboards exactly as designed.** Unification is a later pass |
| Logo | **2c "Talking O's"**, with a standalone icon derived from the pin-`o` |
| Dark mode | **Dropped entirely** |
| Pricing | Real figures from `/pricing`, **not** the mock's "$49 Business Pro" |

---

## Conflicts with the brief

`REDESIGN-BRIEF.md` asks for two things the design files do not provide. Both
were resolved in favour of the design files plus explicit direction:

1. **"Support light + dark themes."** None of the 7 design files define a dark
   theme — no `prefers-color-scheme`, no `.dark` class, no theming variables.
   Dark mode was **removed** (next-themes, the toggle, and all `dark:` variants).
   The only dark surfaces are intentional bands inside a light page: the rewards
   section, the blue stats band, and v3's black marquee and rules.
   *To restore it, a dark palette must be designed for both surfaces.*

2. **"Every screen needs its loading, empty, and error states designed."** The
   mockups show none. Rather than delete working behavior to match a static file,
   every existing loading, empty, error, and modal state was **preserved and
   restyled**. Their visual design is therefore extrapolated, not specified.

---

## The two-surface token architecture

The designs speak two deliberate visual languages. Rather than fork the component
library, both are expressed as **one set of variable names with two bindings**
(`app/globals.css`):

- **`:root`** — the public "sticker" surface. Cream page `#FFFDF8`, ink
  `#14181F`, hard `2.5px` ink outlines, solid non-blurred offset shadows
  (`5px 6px 0`), Space Grotesk headings, yellow `#FFC24B` + coral `#FF6B4A`.
- **`.surface-app`** — the dashboards. Grey page `#F0F2F5`, ink `#050505`,
  hairline borders, soft blurred elevation, system-ui throughout.

Both share the brand blue `#1877F2` and money green `#31A24C`.

A component written against `bg-page` / `text-ink` / `.sticker` / `.press`
renders correctly on **either** surface with no branching: `.sticker` collapses
to a hairline card and `.press` loses its press physics inside `.surface-app`.

> **`.surface-app` lives on `DashboardShell`, not on the `(dashboard)` route
> group layout.** That shell also wraps the public-app views (explore, campaign
> and profile detail) for signed-in users via `PublicAppChrome`, which renders
> *outside* that route group. Scoping it to the layout leaves the dashboard
> chrome sitting on the public surface's cream tokens.

**To unify the two languages later, delete `.surface-app`.** That is the whole seam.

### Legacy token aliases

`success`, `info`, `mint`, `warm`, `brand-secondary` and `dark-*` are the
pre-redesign palette names, re-pointed at the new tokens so ~85 existing call
sites keep rendering. Prefer `money` / `brand` / `coral` / `band` in new code.

---

## Where things live

| Concern | Location |
| --- | --- |
| Tokens | `app/globals.css`, `tailwind.config.ts` |
| Sticker primitives | `components/shared/sticker.tsx` — `StickerCard`, `StickerButton`, `Eyebrow`, `Pill`, `LiveDot` |
| Motion hooks | `lib/motion/` — `useReveal`, `useCountUp`, `useTilt`, `prefersReducedMotion` |
| Brand | `components/shared/brand-mark.tsx`, `app/icon.svg` |
| Landing v3 | `components/marketing/landing/*` (15 sections) |
| Public shell | `components/shared/{navbar,footer,site-chrome}.tsx` |
| App shell | `components/dashboard/dashboard-shell.tsx`, `components/shared/{dashboard-sidebar,dashboard-topbar}.tsx` |

Every JS-driven effect is skipped for reduced-motion users. `useTilt` is *also*
skipped on coarse pointers — a card that tracks a finger is nausea, not delight.

---

## Deliberate deviations from the mockups

The designs are static. The app is not. Where they conflicted, **behavior won**.

1. **No "Keep me logged in" checkbox.** The design shows one. Session lifetime is
   fixed server-side by the httpOnly cookie and `/api/auth/login` accepts no
   `rememberMe` flag. A control that silently does nothing is worse than no
   control. Add the backend field and it can come back.
2. **`/login` and `/signup` stay separate routes.** The design keeps them as one
   stateful component. The segmented toggle is two `next/link`s, and `next` is
   threaded from `searchParams` rather than read via `useSearchParams()` — that
   hook opts `/forgot-password` out of static prerender.
3. **The dashboard sidebar keeps its collapsed rail and mobile tab bar.** The
   designs show neither, but both are real behavior.
4. **Breadcrumbs survive as `sr-only`** when the top bar shows the design's
   eyebrow + page title, so assistive tech doesn't lose route position.
5. **No fabricated data.** The design's "Reward budget $2,400 of $4,000" card
   renders the real given figure *without* a cap until the API exposes a budget.
   The applicant "engagement" stat is omitted because `applicantView` has no such
   field.
6. **Pricing has one source** — `BUSINESS_TIERS` in `lib/marketing-content.ts`,
   read by both `/pricing` and the landing section. Two copies would drift and
   eventually put a wrong price on a public page.
7. **The FAQ stays bound to `GENERAL_FAQS`**, not the mock's wording, because
   `page.tsx` emits `faqPageJsonLd(GENERAL_FAQS)` and the visible copy must match
   the structured data.

---

## Known gaps

- **Business screens with no design** were extrapolated from designed siblings:
  `campaigns/[id]/edit`, the global `applications` inbox, `collabs`, and the
  standalone `profile` route.
- **No dedicated `campaigns/[id]` detail route** — the app merges detail into
  `campaigns/[id]/applications`.
- **Creator "Notification detail" and "Campaign detail"** exist in the design but
  have no app routes. Not invented.
- **Product/API gaps the design surfaced:** a campaign reward *budget* field, and
  an applicant *engagement rate*.
- **Analytics Hub (`/analyticshub`) and the SEO CMS (`/seoteam`)** were out of
  scope — internal tools, existing styling retained.

---

## Layout-coupled integrations

Restyling these needs the integration rewired, not just new classes:

- **TipTap** — the SEO CMS editor (`/seoteam`)
- **Google Maps JS** — explore + campaign location maps (`lib/maps/*`)
- **Hand-rolled SVG charts** — Analytics Hub (`components/analyticshub/line-chart.tsx`, `sparkline.tsx`)
