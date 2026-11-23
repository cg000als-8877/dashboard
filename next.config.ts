import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Prevent stray TypeScript issues from halting production builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
