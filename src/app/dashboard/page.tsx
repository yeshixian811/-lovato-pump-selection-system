"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Crown, 
  TrendingUp, 
  Clock, 
  Download, 
  Settings, 
  User,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

const PLAN_INFO = {
  free: { name: '免费会员', color: 'default' },
  basic: { name: '基础会员', color: 'secondary' },
  pro: { name: '高级会员', color: 'default' },
  enterprise: { name: '企业会员', color: 'outline' },
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 这里应该从API获取用户数据
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/me')
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 模拟数据（实际应该从API获取）
  const mockData = {
    name: '张三',
    email: 'zhangsan@example.com',
    subscriptionTier: 'free',
    subscriptionStatus: 'active',
    subscriptionEndDate: null,
    usage: {
      selectionsThisMonth: 3,
      maxSelections: 10,
      savedHistory: 0,
    },
    recentSelections: [],
  }

  const displayData = userData || mockData
  const tierInfo = PLAN_INFO[displayData.subscriptionTier as keyof typeof PLAN_INFO]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            用户中心
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            欢迎回来，{displayData.name}
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="history">历史记录</TabsTrigger>
            <TabsTrigger value="subscription">订阅管理</TabsTrigger>
            <TabsTrigger value="settings">设置</TabsTrigger>
          </TabsList>

          {/* 概览标签页 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 订阅状态卡片 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      当前订阅
                    </CardTitle>
                    <CardDescription>
                      您的会员状态和使用情况
                    </CardDescription>
                  </div>
                  <Badge variant={tierInfo.color as any} className="text-lg">
                    {tierInfo.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      本月选型次数
                    </div>
                    <div className="text-2xl font-bold">
                      {displayData.usage.selectionsThisMonth} / {displayData.usage.maxSelections}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      保存的历史记录
                    </div>
                    <div className="text-2xl font-bold">
                      {displayData.usage.savedHistory}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      订阅状态
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {displayData.subscriptionStatus === 'active' ? '正常' : '已过期'}
                    </div>
                  </div>
                </div>

                {displayData.subscriptionTier === 'free' && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg mb-2">
                          升级到高级会员，解锁更多功能
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          无限选型、永久保存历史、导出Excel格式...
                        </p>
                      </div>
                      <Link href="/pricing">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          立即升级
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 快捷操作 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/selection">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
                    <CardTitle className="text-lg">开始选型</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      使用智能选型工具
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <Clock className="w-8 h-8 text-purple-500 mb-2" />
                  <CardTitle className="text-lg">历史记录</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    查看选型历史
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <Download className="w-8 h-8 text-green-500 mb-2" />
                  <CardTitle className="text-lg">导出数据</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    导出产品数据
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 历史记录标签页 */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>选型历史</CardTitle>
                <CardDescription>
                  您的选型记录
                </CardDescription>
              </CardHeader>
              <CardContent>
                {displayData.recentSelections.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">暂无选型历史记录</p>
                    <Link href="/selection" className="inline-block mt-4">
                      <Button>
                        开始选型
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 这里应该渲染历史记录列表 */}
                    <p className="text-gray-500">历史记录功能即将上线</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 订阅管理标签页 */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>订阅管理</CardTitle>
                <CardDescription>
                  管理您的订阅计划和付款信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 当前订阅 */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">当前订阅</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-lg font-bold">{tierInfo.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        状态: {displayData.subscriptionStatus === 'active' ? '正常' : '已过期'}
                      </div>
                    </div>
                    <Badge variant={tierInfo.color as any}>
                      {displayData.subscriptionTier.toUpperCase()}
                    </Badge>
                  </div>

                  {displayData.subscriptionTier !== 'enterprise' && (
                    <div className="space-y-2">
                      <Link href="/pricing">
                        <Button variant="outline" className="w-full">
                          升级订阅
                        </Button>
                      </Link>
                      {displayData.subscriptionTier !== 'free' && (
                        <Button variant="ghost" className="w-full">
                          取消订阅
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* 付款历史 */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">付款历史</h3>
                  <p className="text-gray-500">暂无付款记录</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 设置标签页 */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>账户设置</CardTitle>
                <CardDescription>
                  管理您的账户信息和偏好设置
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 基本信息 */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    基本信息
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">姓名</label>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                        {displayData.name}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">邮箱</label>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                        {displayData.email}
                      </div>
                    </div>
                    <Button variant="outline">
                      编辑信息
                    </Button>
                  </div>
                </div>

                {/* 安全设置 */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    安全设置
                  </h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      修改密码
                    </Button>
                    <Button variant="outline" className="w-full">
                      启用两步验证
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
