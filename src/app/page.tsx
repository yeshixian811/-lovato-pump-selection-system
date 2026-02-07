
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            洛瓦托智能水泵选型系统
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8">
            快速、精准、高效 - 根据您的需求智能匹配最合适的水泵产品
          </p>
          <Link href="/selection">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-sm md:text-base h-10 md:h-12">
              开始选型
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mt-12 md:mt-16">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">100+</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 md:mt-2">产品型号</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-600">99%</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 md:mt-2">匹配准确率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600">24/7</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 md:mt-2">在线服务</div>
          </div>
        </div>
      </main>
    </div>
  );
}
