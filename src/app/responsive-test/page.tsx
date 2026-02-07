export const metadata = {
  title: '响应式测试',
  description: '测试页面响应式功能',
};

export default function ResponsiveTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 标题 */}
        <div className="text-center py-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            响应式测试页面
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
            这个页面用于测试不同屏幕尺寸的显示效果
          </p>
        </div>

        {/* 屏幕宽度指示器 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">当前视口宽度</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {typeof window !== 'undefined' && window.innerWidth}px (浏览器)
            </p>
          </div>
        </div>

        {/* 响应式网格测试 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            响应式网格测试
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-6 rounded-lg text-center"
              >
                <p className="text-2xl font-bold">{i}</p>
                <p className="text-sm mt-2">
                  <span className="hidden sm:inline">sm: </span>
                  <span className="hidden md:inline">md: </span>
                  <span className="hidden lg:inline">lg: </span>
                  Grid Item {i}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            • 小屏幕（默认）：1列
            • sm (≥640px)：2列
            • md (≥768px)：3列
            • lg (≥1024px)：4列
          </p>
        </div>

        {/* 响应式文本测试 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            响应式文本测试
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium text-gray-900 dark:text-white">
                这个文字大小会随屏幕变化
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                xs: 12px → sm: 14px → md: 16px → lg: 18px → xl: 20px
              </p>
            </div>
            <div>
              <p className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                这个容器宽度会随屏幕变化
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                100% → 75% → 50% → 33%
              </p>
            </div>
          </div>
        </div>

        {/* Flex 响应式测试 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Flex 响应式测试
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-green-100 dark:bg-green-900/30 p-4 rounded-lg text-center">
              <p className="font-medium">项目 1</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">垂直 → 水平</p>
            </div>
            <div className="flex-1 bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg text-center">
              <p className="font-medium">项目 2</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">垂直 → 水平</p>
            </div>
            <div className="flex-1 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg text-center">
              <p className="font-medium">项目 3</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">垂直 → 水平</p>
            </div>
          </div>
        </div>

        {/* 断点信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Tailwind CSS 断点说明
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
              <span className="font-medium">默认</span>
              <span className="text-gray-600 dark:text-gray-400">&lt; 640px (移动端)</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
              <span className="font-medium">sm:</span>
              <span className="text-gray-600 dark:text-gray-400">≥ 640px (小平板)</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-100 dark:bg-green-900/30 rounded">
              <span className="font-medium">md:</span>
              <span className="text-gray-600 dark:text-gray-400">≥ 768px (平板)</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
              <span className="font-medium">lg:</span>
              <span className="text-gray-600 dark:text-gray-400">≥ 1024px (桌面端)</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-red-100 dark:bg-red-900/30 rounded">
              <span className="font-medium">xl:</span>
              <span className="text-gray-600 dark:text-gray-400">≥ 1280px (大屏幕)</span>
            </div>
          </div>
        </div>

        {/* 调整浏览器窗口大小来查看效果 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6 text-center">
          <p className="text-lg font-bold">💡 提示</p>
          <p className="text-sm mt-2">
            调整浏览器窗口大小，查看以上元素的响应式变化
          </p>
        </div>
      </div>
    </div>
  );
}
