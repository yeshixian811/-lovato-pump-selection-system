import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '洛瓦托水泵选型系统',
    template: '%s | 洛瓦托水泵选型',
  },
  description:
    '洛瓦托水泵选型系统是一款智能水泵选型工具，支持性能曲线分析、参数匹配和产品管理。通过输入流量和扬程参数，智能匹配最合适的水泵产品。',
  keywords: [
    '水泵选型',
    '洛瓦托',
    '智能选型',
    '性能曲线',
    '水泵',
    '选型系统',
    '参数匹配',
  ],
  authors: [{ name: '洛瓦托', url: 'https://luowato.com' }],
  generator: '洛瓦托水泵选型系统',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '洛瓦托水泵选型',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: '洛瓦托水泵选型系统',
    description: '智能水泵选型系统，支持性能曲线分析和参数匹配',
    url: 'https://luowato.com',
    siteName: '洛瓦托水泵选型',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="en">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
