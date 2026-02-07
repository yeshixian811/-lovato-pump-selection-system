export const metadata = {
  title: '响应式演示',
  description: '直观演示页面的自适应功能',
};

export default function ResponsiveDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center py-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            📱 响应式自适应演示
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
            调整浏览器窗口大小，查看页面元素的自动变化
          </p>
        </div>

        {/* 当前断点指示器 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">当前屏幕尺寸</p>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="text-xs text-gray-500 dark:text-gray-400">视口宽度</span>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {typeof window !== 'undefined' && window.innerWidth}px
                </p>
              </div>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <span className="text-xs text-gray-500 dark:text-gray-400">视口高度</span>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {typeof window !== 'undefined' && window.innerHeight}px
                </p>
              </div>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
              ✓ 响应式已启用
            </div>
          </div>
        </div>

        {/* 断点状态 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">断点状态</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: '默认', size: '< 640px', color: 'gray' },
              { name: 'sm', size: '≥ 640px', color: 'blue' },
              { name: 'md', size: '≥ 768px', color: 'green' },
              { name: 'lg', size: '≥ 1024px', color: 'yellow' },
              { name: 'xl', size: '≥ 1280px', color: 'red' },
            ].map((bp) => {
              const isActive = typeof window !== 'undefined' && window.innerWidth >= (bp.color === 'gray' ? 0 : bp.color === 'blue' ? 640 : bp.color === 'green' ? 768 : bp.color === 'yellow' ? 1024 : 1280);
              // 对于默认，检查是否小于 640
              const isDefaultActive = typeof window !== 'undefined' && window.innerWidth < 640 && bp.name === '默认';

              return (
                <div
                  key={bp.name}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isActive || isDefaultActive
                      ? `bg-${bp.color}-100 dark:bg-${bp.color}-900/30 border-${bp.color}-500`
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 opacity-50'
                  }`}
                >
                  <p className="font-bold text-gray-900 dark:text-white">{bp.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{bp.size}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 网格布局演示 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 布局自适应</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { title: '项目 1', desc: '1 → 2 → 3 → 4 列', color: 'from-blue-500 to-blue-600' },
              { title: '项目 2', desc: '1 → 2 → 3 → 4 列', color: 'from-purple-500 to-purple-600' },
              { title: '项目 3', desc: '1 → 2 → 3 → 4 列', color: 'from-green-500 to-green-600' },
              { title: '项目 4', desc: '1 → 2 → 3 → 4 列', color: 'from-yellow-500 to-yellow-600' },
              { title: '项目 5', desc: '1 → 2 → 3 → 4 列', color: 'from-red-500 to-red-600' },
              { title: '项目 6', desc: '1 → 2 → 3 → 4 列', color: 'from-pink-500 to-pink-600' },
              { title: '项目 7', desc: '1 → 2 → 3 → 4 列', color: 'from-indigo-500 to-indigo-600' },
              { title: '项目 8', desc: '1 → 2 → 3 → 4 列', color: 'from-teal-500 to-teal-600' },
            ].map((item) => (
              <div key={item.title} className={`bg-gradient-to-br ${item.color} text-white p-4 rounded-lg`}>
                <p className="font-bold text-lg">{item.title}</p>
                <p className="text-xs opacity-80 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
            调整窗口大小，观察网格列数从 1 列逐渐增加到 4 列
          </p>
        </div>

        {/* 文字大小演示 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📝 文字大小自适应</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-gray-900 dark:text-white">
                这段文字会随屏幕尺寸变化
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                xs(12px) → sm(14px) → md(16px) → lg(18px) → xl(20px)
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <p className="w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 p-3 bg-white dark:bg-gray-700 rounded text-center font-medium">
                这个容器宽度会随屏幕变化
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                100% → 80% → 75% → 67% → 50%
              </p>
            </div>
          </div>
        </div>

        {/* Flex 布局演示 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔄 Flex 布局自适应</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            {[
              { title: '卡片 1', color: 'blue', desc: '垂直排列 → 水平排列' },
              { title: '卡片 2', color: 'green', desc: '垂直排列 → 水平排列' },
              { title: '卡片 3', color: 'yellow', desc: '垂直排列 → 水平排列' },
            ].map((card) => (
              <div key={card.title} className="flex-1 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                <div className={`w-12 h-12 bg-${card.color}-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold`}>
                  {card.title.charAt(card.title.length - 1)}
                </div>
                <p className="text-center font-bold text-gray-900 dark:text-white mb-1">{card.title}</p>
                <p className="text-xs text-center text-gray-600 dark:text-gray-400">{card.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
            小屏幕垂直排列，大屏幕水平排列
          </p>
        </div>

        {/* 导航栏演示 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🧭 导航栏自适应</h2>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg" />
                <span className="font-bold text-gray-900 dark:text-white hidden sm:block">品牌名称</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                {['首页', '产品', '选型', '关于'].map((item) => (
                  <span key={item} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                    {item}
                  </span>
                ))}
              </div>
              <div className="md:hidden w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                ☰
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
            小屏幕显示汉堡菜单，大屏幕显示完整导航
          </p>
        </div>

        {/* 提示 */}
        <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl shadow-lg p-6 text-center">
          <p className="text-lg font-bold mb-2">💡 如何测试</p>
          <p className="text-sm opacity-90">
            拖动浏览器窗口边缘，调整窗口大小，观察以上元素的实时变化。
            也可以按 F12 打开开发者工具，切换设备模拟模式查看不同设备的显示效果。
          </p>
        </div>

        {/* 返回链接 */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
