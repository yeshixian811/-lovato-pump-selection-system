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
  // 安全相关的 HTTP 头
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    return [
      {
        source: '/:path*',
        headers: [
          // HSTS (HTTP Strict Transport Security)
          // 强制使用 HTTPS 连接，有效期 2 年
          // 开发环境可以禁用
          ...(isDev ? [] : [{
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          }]),
          // 内容安全策略
          // 防止 XSS 攻击和数据注入攻击
          // 开发环境允许在 Coze iframe 中显示
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://trusted.cdn.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: https://lf-coze-web-cdn.coze.cn",
              "font-src 'self' data:",
              "connect-src 'self' https:",
              "media-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              // 开发环境允许所有 frame-ancestors，生产环境只允许同源
              ...(isDev ? ["frame-ancestors *"] : ["frame-ancestors 'self'"]),
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // X-Content-Type-Options
          // 防止 MIME 类型嗅探攻击
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // X-Frame-Options
          // 防止点击劫持攻击
          // 开发环境允许在 Coze iframe 中显示
          {
            key: 'X-Frame-Options',
            value: isDev ? 'ALLOWALL' : 'DENY',
          },
          // X-XSS-Protection
          // 启用浏览器 XSS 过滤器
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer-Policy
          // 控制 Referer 信息泄露
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions-Policy
          // 控制浏览器功能和 API 的使用
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  // 环境变量安全
  env: {
    // 确保敏感信息不会暴露到客户端
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
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
