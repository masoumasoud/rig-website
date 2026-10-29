import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// GitHub Pages demo: `NEXT_PUBLIC_DEMO=1` builds the public site as a static export (see scripts/build-demo.sh).
const demo = process.env.NEXT_PUBLIC_DEMO === "1";

const nextConfig: NextConfig = {
  // Cache Components imply PPR, which a static export cannot use; the demo falls back to plain `use cache`.
  cacheComponents: !demo,
  partialPrefetching: !demo,
  poweredByHeader: false,
  output: demo ? "export" : "standalone",
  ...(demo && { basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "", trailingSlash: true }),
  serverExternalPackages: ["sharp", "@libsql/client", "@node-rs/argon2", "imapflow", "mailparser", "nodemailer"],
  images: {
    unoptimized: demo,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600],
    localPatterns: [{ pathname: "/media/**" }, { pathname: "/img/**" }],
  },
  experimental: {
    globalNotFound: true,
    ...(demo && { useCache: true }),
    ...(!demo && { proxyClientMaxBodySize: "30mb", serverActions: { bodySizeLimit: "30mb" } }),
  },
  // Rewrites and headers are not supported by a static export.
  ...(!demo && {
    async rewrites() {
      return [{ source: "/:key([a-zA-Z0-9-]{16,128}).txt", destination: "/api/indexnow?key=:key" }];
    },
    async headers() {
      return [
        { source: "/:path*", headers: securityHeaders },
        {
          source: "/fonts/:path*",
          headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
        },
      ];
    },
  }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
