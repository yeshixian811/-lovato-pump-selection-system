import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Vercel 优化配置
  output: undefined, // 移除 standalone 模式，使用默认模式

  // 构建优化
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },

  // 开发环境配置
  allowedDevOrigins: ['*.dev.coze.site'],
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // 图片配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
    ],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    formats: ['image/avif', 'image/webp'],
  },

  // 安全相关的 HTTP 头
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    return [
      {
        source: '/:path*',
        headers: [
          // HSTS
          ...(isDev ? [] : [{
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          }]),
          // CSP
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: https://lf-coze-web-cdn.coze.cn https://images.unsplash.com https://source.unsplash.com",
              "font-src 'self' data:",
              "connect-src 'self' https:",
              "media-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              ...(isDev ? ["frame-ancestors *"] : ["frame-ancestors 'self'"]),
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // X-Content-Type-Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // X-Frame-Options
          {
            key: 'X-Frame-Options',
            value: isDev ? 'ALLOWALL' : 'DENY',
          },
          // X-XSS-Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer-Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions-Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
