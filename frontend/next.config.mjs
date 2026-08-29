import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // Disable SW in development to avoid stale-cache confusion during dev
  disable: process.env.NODE_ENV === "development",
  // Cache pages visited during frontend navigation
  cacheOnFrontEndNav: true,
  // Reload tabs that come back online
  reloadOnOnline: true,
  // Aggressive pre-caching of Next.js app shell
  aggressiveFrontEndNavCaching: true,
  // Offline fallback page (served when a navigation request fails offline)
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    // Don't precache Next.js server-side routes or API routes
    exclude: [
      /middleware-manifest\.json$/,
      /build-manifest\.json$/,
      /react-loadable-manifest\.json$/,
      /^.*\.map$/,
    ],
    runtimeCaching: [
      // ─── Static Assets (CacheFirst — hashed filenames = immutable) ─────────
      {
        urlPattern: /^https?:\/\/.*\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static",
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── Next.js Image Optimisation ────────────────────────────────────────
      {
        urlPattern: /^https?:\/\/.*\/_next\/image\?.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-image",
          expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── App Shell (icons, manifest) ───────────────────────────────────────
      {
        urlPattern: /^https?:\/\/.*\/(icons|manifest\.json).*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "app-shell",
          expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 30 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── Dashboard summary (NetworkFirst — fresh online, cached offline) ───
      {
        urlPattern: /\/api\/v1\/dashboard\/summary/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-dashboard",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── Personal Attendance (NetworkFirst) ────────────────────────────────
      {
        urlPattern: /\/api\/v1\/attendance\/me/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-attendance-me",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── Leave Requests + Balances (NetworkFirst) ──────────────────────────
      {
        urlPattern: /\/api\/v1\/leave\/(requests\/me|balances\/me)/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-leave-me",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── Notifications (NetworkFirst) ──────────────────────────────────────
      {
        urlPattern: /\/api\/v1\/notifications/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-notifications",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 4 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── Employee directory reads (NetworkFirst) ───────────────────────────
      {
        urlPattern: /\/api\/v1\/employees(\?.*)?$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-employees",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ─── ALL other API calls: NetworkOnly (mutations, auth) ────────────────
      // Auth routes (/api/auth/*) and mutation endpoints must NEVER be cached.
      {
        urlPattern: /\/api\/.*/i,
        handler: "NetworkOnly",
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
