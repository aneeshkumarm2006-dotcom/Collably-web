# Analytics Hub — Setup

A self-configuring, password-gated analytics dashboard at **`/analyticshub`** inside
the LocalShout web app. It pulls **GA4 (Analytics)**, **Search Console**, **Meta Ads**,
and **Google Ads** into one glanceable overview + per-source deep dives. Single user
(the owner). All API credentials are entered **in the dashboard's own Settings page** and
stored **AES-256-GCM encrypted** in MongoDB — never in code or env.

> **Users source:** intentionally **skipped** in this deployment — LocalShout's signed-up
> creators/businesses live in the separate backend (Render + Atlas), not in this app's
> database, so there's no local users table to read. The Users page shows a note.

---

## 1. One-time: shared Google OAuth app (once, ever — reused by every deployment)

Enables the "Sign in with Google" path for GA4 + Search Console. (Without it, only the
service-account path is offered — that still works.)

1. Google Cloud Console → new/existing project.
2. **Enable APIs:** Google Analytics Data API, Google Analytics Admin API, Search Console API.
3. **OAuth consent screen:** External. Add yourself as a test user (or publish).
4. **Credentials → Create → OAuth client ID → Web application.** Add an **Authorized redirect URI** for each deployment:
   ```
   https://<your-domain>/api/analyticshub/oauth/google/callback
   ```
   (e.g. `https://localshout-web.vercel.app/api/analyticshub/oauth/google/callback`)
5. Copy the **Client ID** and **Client secret** → the two `GOOGLE_OAUTH_*` env vars below.

## 2. Per-project env vars (in Vercel → Settings → Environment Variables)

| Var | Required | How to get it |
|---|---|---|
| `ANALYTICSHUB_SECRET_KEY` | **Yes** | `openssl rand -base64 32` — paste the raw 44-char output, **no quotes**. |
| `GOOGLE_OAUTH_CLIENT_ID` | Recommended | From step 1. Omit → SA-only. |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Recommended | From step 1. |
| `MONGODB_URI` | **Yes** | Already set for `/seoteam`; the hub reuses it (separate `analyticshub_config` collection). |

> ⚠️ **Changing `ANALYTICSHUB_SECRET_KEY` later orphans everything already stored**
> (encrypted tokens can no longer be decrypted) — you'd re-connect each source.
>
> ⚠️ **Env vars only bake into deployments created *after* they're saved — redeploy after adding them.**

No Upstash/Vercel KV needed — this project has MongoDB.

## 3. Migration

**None.** Mongo creates the `analyticshub_config` collection on first write. No SQL grants apply.

## 4. First run (do this right after deploy — setup is first-claim)

Visit `https://<your-domain>/analyticshub`. The wizard runs:
1. **Create password** (min 8, confirm — there's **no reset flow**, so store it safely).
2. **Confirm project identity** (auto-detected name/colors, editable).
3. **Connect sources** (all skippable — connect now or later in Settings).

After setup you'll see a login screen when logged out (30-day session cookie).

## 5. Connecting sources (Settings → each card validates live before saving)

- **Google (GA4 + Search Console)** — either "Sign in with Google" (pick a GA4 property + a GSC site from the dropdowns), **or** paste a service-account key JSON + property ID + site URL. (Grant the SA `Viewer` on the GA4 property and add it as a user in Search Console.)
- **Meta Ads** *(optional)* — paste a long-lived token with `ads_read` (System User token), pick the ad account.
- **Google Ads** *(optional, most involved)* — developer token + OAuth client ID/secret + refresh token + customer ID (+ optional MCC login-customer-id). Every field is validated with a 1-row query before saving.

A revoked/expired token flips that one source to **"Reconnect needed"** — the others keep working.

## 6. Security notes

- One env secret → HKDF → separate AES key + cookie-HMAC key. Password = scrypt (node:crypto, no native deps).
- Session = httpOnly, Secure (prod), SameSite=Lax cookie, scoped to `/analyticshub`, 30-day; login locks out after 8 fails / 15 min.
- Fully isolated from the main app + `/seoteam` sessions (distinct cookie + secret).
- `noindex` + robots disallow + all third-party calls server-side only. The client only ever sees connected/not-connected + normalized numbers.
- Responses cached 6h in Mongo (per source + range); "Refresh" busts the cache.
