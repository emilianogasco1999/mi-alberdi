import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@mi-alberdi/shared'],
  output: 'standalone',
};

export default nextConfig;
