"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Package,
  Users,
  FileText,
  TrendingUp,
  Clock,
  Palette,
  Layers,
  ArrowRight,
  ShoppingCart,
  Database,
  Settings,
  LayoutDashboard,
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">欢迎回来，管理员</h1>
        <p className="text-white/80">今天也是充满活力的一天！</p>
      </div>

      {/* 管理功能导航 */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">管理功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 用户管理 */}
          <Link href="/admin/dashboard" className="group">
            <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg">用户管理</CardTitle>
                </div>
                <CardDescription>
                  查看和管理用户信息、权限和订阅
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2" variant="outline">
                  进入管理
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* 产品管理（选型系统） */}
          <Link href="/admin/products" className="group">
            <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">产品管理</CardTitle>
                </div>
                <CardDescription>
                  管理产品库、性能曲线和选型参数
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2" variant="outline">
                  进入管理
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* 进销存管理 */}
          <Link href="/admin/inventory" className="group">
            <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">进销存管理</CardTitle>
                </div>
                <CardDescription>
                  库存、采购、销售、供应商和客户管理
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2" variant="outline">
                  进入管理
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* 内容管理 */}
          <Link href="/admin/content" className="group">
            <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <LayoutDashboard className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-lg">内容管理</CardTitle>
                </div>
                <CardDescription>
                  图片、页面、文本内容管理
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2" variant="outline">
                  进入管理
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* 版本管理 */}
          <Link href="/versions" className="group">
            <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                    <Layers className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <CardTitle className="text-lg">版本管理</CardTitle>
                </div>
                <CardDescription>
                  代码备份、版本回滚和在线编辑
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2" variant="outline">
                  进入管理
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* 系统设置 */}
          <Link href="/admin/settings" className="group">
            <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <CardTitle className="text-lg">系统设置</CardTitle>
                </div>
                <CardDescription>
                  配置系统参数和基本设置
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2" variant="outline">
                  进入设置
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">数据概览</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">产品总数</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12</span> 本月新增
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">用户总数</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,456</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+86</span> 本月新增
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">选型次数</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+28</span> 较上周
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">访问量</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,542</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+156</span> 较上周
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">用户张三完成了水泵选型</p>
                <p className="text-sm text-gray-500">2分钟前</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">新增产品"LS系列水泵"</p>
                <p className="text-sm text-gray-500">15分钟前</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">新用户"李四"注册账号</p>
                <p className="text-sm text-gray-500">1小时前</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 系统诊断 */}
      <Card>
        <CardHeader>
          <CardTitle>系统诊断</CardTitle>
          <CardDescription>
            检查系统状态和配置
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/diagnostic">
            <Button className="w-full gap-2">
              <Database className="h-4 w-4" />
              运行系统诊断
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
