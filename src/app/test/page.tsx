import Link from "next/link";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 系统测试页面</h1>

        <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-green-700 font-bold">✅ 服务器正常运行！</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📊 可用路由</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                / - 首页
              </Link>
            </li>
            <li>
              <Link href="/selection" className="text-blue-600 hover:underline">
                /selection - 水泵选型
              </Link>
            </li>
            <li>
              <Link href="/products" className="text-blue-600 hover:underline">
                /products - 产品库
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-blue-600 hover:underline">
                /dashboard - 仪表盘
              </Link>
            </li>
            <li>
              <a href="/test.html" className="text-blue-600 hover:underline">
                /test.html - 静态测试页面
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🎯 功能特点</h2>
          <ul className="space-y-2">
            <li>✅ 智能水泵选型系统</li>
            <li>✅ 22个水泵样本产品</li>
            <li>✅ 匹配度智能计算</li>
            <li>✅ 完整数据库支持</li>
            <li>✅ 响应式设计</li>
          </ul>
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6">
          <h2 className="text-xl font-bold mb-4">⚠️ 如果看到404错误</h2>
          <p className="text-gray-700">
            请访问正确的 URL：<strong>http://localhost:3002</strong> 或 <strong>http://9.129.104.56:3002</strong>
          </p>
          <p className="text-gray-700 mt-2">
            不要访问 <strong>/test</strong>，应访问 <strong>/test.html</strong>
          </p>
        </div>

        <div className="mt-6">
          <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
