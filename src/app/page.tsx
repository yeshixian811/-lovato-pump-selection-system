import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Database, Settings, Droplets } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              水泵选型系统
            </h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/products">
              <Button variant="ghost">产品库</Button>
            </Link>
            <Link href="/selection">
              <Button variant="ghost">高级选型</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            智能水泵选型系统
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            快速、精准、高效 - 根据您的需求智能匹配最合适的水泵产品
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Link href="/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Database className="h-12 w-12 text-blue-600 mb-2" />
                <CardTitle>产品库管理</CardTitle>
                <CardDescription>
                  管理水泵产品信息，支持批量导入导出
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">进入产品库</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/selection">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <LayoutDashboard className="h-12 w-12 text-cyan-600 mb-2" />
                <CardTitle>高级选型</CardTitle>
                <CardDescription>
                  输入详细参数，智能匹配合适的水泵产品
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">开始选型</Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <Settings className="h-12 w-12 text-purple-600 mb-2" />
              <CardTitle>参数对比</CardTitle>
              <CardDescription>
                对比不同水泵的参数，选择最优方案
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                即将上线
              </Button>
            </CardContent>
          </Card>
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
