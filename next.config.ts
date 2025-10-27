import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allows production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Allows production builds to complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none', // Changed from 'same-origin-allow-popups' to fix window.closed blocking
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
};

export default nextConfig;