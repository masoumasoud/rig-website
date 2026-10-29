import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  output: "standalone",
  serverExternalPackages: ["sharp", "@libsql/client", "@node-rs/argon2", "imapflow", "mailparser", "nodemailer"],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600],
    localPatterns: [{ pathname: "/media/**" }, { pathname: "/img/**" }],
  },
  experimental: {
    globalNotFound: true,
    proxyClientMaxBodySize: "30mb",
    serverActions: { bodySizeLimit: "30mb" },
  },
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
