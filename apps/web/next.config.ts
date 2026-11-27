import type { NextConfig } from 'next';

// Server-side only: where the Express API lives. Browsers never see this value.
const API_ORIGIN = process.env.API_ORIGIN ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  transpilePackages: ['@mi-alberdi/shared'],
  output: process.env.OUTPUT_STANDALONE === 'true' ? 'standalone' : undefined,
  async rewrites() {
    return [
      {
        // Same-origin auth: keeps Better Auth cookies first-party.
        source: '/api/:path*',
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
