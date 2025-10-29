import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
        protocol: 'https',
        hostname: 'img.mlbstatic.com'
      }]
  }
  /* config options here */
};

export default nextConfig;
