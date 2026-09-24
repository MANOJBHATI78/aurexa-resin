import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" output is for self-hosting this sandbox (bun .next/standalone/server.js).
  // On Netlify the Next.js runtime packages the app itself — standalone must be off there.
  output: process.env.NETLIFY ? undefined : "standalone",
  // Native/database packages must stay outside webpack bundles (required on
  // serverless runtimes and incompatible with browser bundles)
  serverExternalPackages: ["@libsql/client", "@prisma/adapter-libsql", "@prisma/client"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
