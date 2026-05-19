import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
};

// Bundle analyzer: run with ANALYZE=true pnpm build to inspect chunk sizes.
async function withAnalyzer(): Promise<NextConfig> {
  if (process.env.ANALYZE !== "true") return nextConfig;
  const bundleAnalyzer = (await import("@next/bundle-analyzer")).default;
  return bundleAnalyzer({ enabled: true })(nextConfig);
}

export default process.env.ANALYZE === "true" ? withAnalyzer() : nextConfig;
