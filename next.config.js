const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow an isolated build output dir (e.g. CI / a side-by-side prod build that
  // must not clobber a running `next dev`'s `.next`). Defaults to `.next`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // This app lives inside the LocalShout monorepo (which has sibling lockfiles);
  // pin the file-tracing root to this directory so Next doesn't infer the wrong one.
  // (Mirrors `admin/next.config.js`.)
  outputFileTracingRoot: path.join(__dirname),
  // Allow importing the monorepo `shared/` source (via the `@shared/*` alias),
  // which lives outside this app dir as raw TS. Next compiles it with SWC.
  // See README "Shared types".
  experimental: {
    externalDir: true,
  },
  images: {
    // Serve modern formats (AVIF first, WebP fallback) and cache optimized
    // variants for a day — campaign covers / avatars rarely change.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      // Cloudinary-hosted media (avatars/logos/campaign covers/portfolio/submissions).
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Stock imagery used by the marketing site / blog.
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
    ],
  },
  // Security response headers (defense-in-depth). The first five never affect
  // functionality. The CSP is a permissive-but-meaningful baseline: it blocks
  // framing (clickjacking), plugin/object embeds, and <base> hijacking, and is
  // the second layer behind the blog's HTML sanitizer. `script-src` allowlists
  // the analytics/maps hosts the app loads; `connect-src` stays broad (https:/wss:)
  // so the same-origin API proxy AND the cross-origin Socket.io endpoint keep
  // working. VERIFY on staging before trusting it in prod — if an external
  // script/host is missing, add it here (or switch this one header to
  // `Content-Security-Policy-Report-Only` while tuning).
  async headers() {
    // Next.js dev-mode Fast Refresh evaluates its HMR runtime with `eval`, which
    // a strict `script-src` blocks — the whole client bundle then fails to boot
    // and the page renders as a bare server shell. `unsafe-eval` is added ONLY in
    // development; the production CSP stays locked down (no eval).
    const isDev = process.env.NODE_ENV !== 'production';
    const scriptSrc = [
      "script-src 'self' 'unsafe-inline'",
      isDev ? "'unsafe-eval'" : '',
      'https://www.googletagmanager.com https://www.google-analytics.com https://plausible.io https://maps.googleapis.com https://maps.gstatic.com',
    ]
      .filter(Boolean)
      .join(' ');
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://cdn.pixabay.com https://maps.gstatic.com https://maps.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      scriptSrc,
      "connect-src 'self' https: wss:",
    ].join('; ');
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
