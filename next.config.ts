import type { NextConfig } from "next";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const apiTarget = process.env.API_PROXY_TARGET;

const nextConfig: NextConfig = {
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
