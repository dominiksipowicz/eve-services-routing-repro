import path from 'node:path';
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import { withWorkflow } from 'workflow/next';
import { withEve } from 'eve/next';

// `vercel.json` explicitly declares the web and Eve services. On Vercel,
// withEve() detects that declaration and does not generate another Services
// config; outside Vercel it still provides the local Eve integration.
//
// Set USE_EVE=0 only when deploying the plain-Next control.
const USE_EVE = process.env.USE_EVE !== '0';

const nextConfig: NextConfig = {
  // Production parity: the monorepo traces from the repo root, and keeps some
  // server packages external (resolved from node_modules at runtime — the
  // same resolution the launcher's require of next/setup-node-env needs).
  outputFileTracingRoot: path.join(__dirname, '../..'),
  serverExternalPackages: ['zod', 'stripe', 'googleapis', '@google-cloud/bigquery'],
  reactStrictMode: true,
  // Production parity: next-level rewrites and headers coexist with the
  // vercel.json services rewrites, as in the app this was found in.
  async rewrites() {
    return [{ source: '/icon-test', destination: '/en/lab' }];
  },
  async headers() {
    return [
      { source: '/(.*)', headers: [{ key: 'X-Repro', value: '1' }] },
    ];
  },
  // Surfaced to the client so /probe can label which build you are looking at.
  env: { NEXT_PUBLIC_USE_EVE: USE_EVE ? '1' : '0' },
  // Same router config as the app this was found in: route prediction OFF
  // (its locale-less rewrites made 16.3's default prediction 404-flash), and
  // the same router-cache staleTimes.
  experimental: {
    optimisticRouting: false,
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
};

// Production parity: the full wrapper chain from the app this was found in.
// withWorkflow is outermost over an async adapter; withEve wraps the
// Sentry-wrapped config; named-agent mount at /eve/agents/demo/eve/v1/*.
const sentryWrappedConfig = withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
});

const eveWrappedConfig = withEve(sentryWrappedConfig, {
  agents: { demo: './agents/demo' },
});

export default USE_EVE
  ? withWorkflow(async (phase: string, context: { readonly defaultConfig: import("next").NextConfig }) =>
      eveWrappedConfig(phase, context),
    )
  : nextConfig;
