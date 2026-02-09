'use client';

import { useEffect, useState } from 'react';

export default function TestSimplePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('✅ Test page mounted successfully!');
  }, []);

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-green-700 mb-6">✅ 简单测试页面</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">功能测试</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-2xl">✓</span>
              <span>页面加载正常</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-2xl">✓</span>
              <span>JavaScript 运行正常</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-2xl">✓</span>
              <span>React 渲染正常</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-2xl">✓</span>
              <span>Tailwind CSS 正常</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">交互测试</h2>
          <button
            onClick={() => alert('按钮点击成功！')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            点击测试按钮
          </button>
          <p className="mt-4 text-gray-600">如果点击按钮有反应，说明交互功能正常。</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">系统信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">当前时间：</span>
              <span>{new Date().toLocaleString('zh-CN')}</span>
            </div>
            <div>
              <span className="font-semibold">User Agent：</span>
              <span className="text-xs break-all">{typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</span>
            </div>
            <div>
              <span className="font-semibold">URL：</span>
              <span>{typeof window !== 'undefined' ? window.location.href : 'N/A'}</span>
            </div>
            <div>
              <span className="font-semibold">端口：</span>
              <span>5000</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800 underline">
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
