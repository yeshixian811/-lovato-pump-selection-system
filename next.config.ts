import type { NextConfig } from 'next';
import path from 'path';
// import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  // outputFileTracingRoot: path.resolve(__dirname, '../../'),
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
    ],
  },
};

// Temporarily disable PWA to avoid Turbopack conflicts
// const pwaConfig = withPWA({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: true, // Disable PWA in all environments
// });

export default nextConfig; // pwaConfig(nextConfig);
