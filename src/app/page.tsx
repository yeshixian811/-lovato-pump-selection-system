import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <img
              src="/luwatto-logo.png"
              alt="洛瓦托LOGO"
              className="h-8 sm:h-10 w-auto"
            />
          </div>
          <nav className="flex gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
            <Link href="/products">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                产品库
              </Button>
            </Link>
            <Link href="/selection">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                高级选型
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            洛瓦托智能水泵选型系统
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            快速、精准、高效 - 根据您的需求智能匹配最合适的水泵产品
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/selection">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                立即选型
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">100+</div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">产品型号</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-600">99%</div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">匹配准确率</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600">24/7</div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">在线服务</div>
          </div>
        </div>
      </main>
    </div>
  );
}
