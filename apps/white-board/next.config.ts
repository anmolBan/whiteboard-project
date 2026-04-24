import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@repo/db", "@repo/types"]
};

export default nextConfig;
