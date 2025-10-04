import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      root: __dirname, // force turbopack to use /frontend
    },
  },
};

export default nextConfig;
