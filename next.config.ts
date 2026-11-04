import type { NextConfig } from "next";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const apiTarget = process.env.API_PROXY_TARGET;

// Dev server only: let phones and other devices on the local network load the page's
// JavaScript (Next.js blocks other origins by default). Add more with DEV_ALLOWED_ORIGINS,
// comma-separated hostnames, e.g. "192.0.2.2,my-laptop.local".
const devOrigins = [
  "192.168.*.*",
  "10.*.*.*",
  "*.local",
  ...(process.env.DEV_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const nextConfig: NextConfig = {
  allowedDevOrigins: devOrigins,
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Development against a real FastAPI: forward /api/* before the mock route can match.
  async rewrites() {
    if (useMock || !apiTarget) return [];
    return {
      beforeFiles: [{ source: "/api/:path*", destination: `${apiTarget}/api/:path*` }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
