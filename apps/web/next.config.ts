import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@mi-alberdi/shared'],
  output: process.env.OUTPUT_STANDALONE === 'true' ? 'standalone' : undefined,
};

export default nextConfig;
