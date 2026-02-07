"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Download, Filter, RefreshCw, Crown, Shield, UserCheck, UserX, Calendar } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  subscriptionTier: string
  subscriptionStatus: string
  subscriptionStartDate: string | null
  subscriptionEndDate: string | null
  emailVerified: boolean
  createdAt: string
}

interface SubscriptionStats {
  totalUsers: number
  activeSubscriptions: number
  monthlyRevenue: number
  tierDistribution: {
    free: number
    basic: number
    pro: number
    enterprise: number
  }
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  const handleSearch = () => {
    // 客户端过滤
    const filtered = users.filter(user => {
      const matchSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchTier = filterTier === 'all' || user.subscriptionTier === filterTier
      const matchStatus = filterStatus === 'all' || user.subscriptionStatus === filterStatus
      
      return matchSearch && matchTier && matchStatus
    })
    return filtered
  }

  const filteredUsers = handleSearch()

  const getTierBadge = (tier: string) => {
    const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; gradient?: boolean }> = {
      free: { label: '免费会员', variant: 'secondary' },
      basic: { label: '基础会员', variant: 'default' },
      pro: { label: '高级会员', variant: 'default', gradient: true },
      enterprise: { label: '企业会员', variant: 'outline' },
    }
    return badges[tier] || badges.free
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color?: string }> = {
      active: { label: '正常', variant: 'default', color: 'bg-green-600' },
      expired: { label: '已过期', variant: 'destructive' },
      canceled: { label: '已取消', variant: 'secondary' },
      past_due: { label: '逾期', variant: 'destructive' },
    }
    return badges[status] || badges.active
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const handleUpgradeUser = async (userId: string, newTier: string) => {
    if (!confirm(`确定要将用户升级到${newTier}吗？`)) return
    
    try {
      const response = await fetch(`/api/admin/users/${userId}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: newTier }),
      })

      if (response.ok) {
        alert('升级成功')
        fetchUsers()
        fetchStats()
      } else {
        const data = await response.json()
        alert(data.error || '升级失败')
      }
    } catch (error) {
      alert('升级失败')
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'expired' : 'active'
    const action = newStatus === 'active' ? '激活' : '停用'
    
    if (!confirm(`确定要${action}该用户吗？`)) return
    
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        alert(`${action}成功`)
        fetchUsers()
        fetchStats()
      } else {
        alert('操作失败')
      }
    } catch (error) {
      alert('操作失败')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            管理员后台
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            会员管理与系统统计
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="users">会员管理</TabsTrigger>
            <TabsTrigger value="stats">数据统计</TabsTrigger>
          </TabsList>

          {/* 会员管理标签页 */}
          <TabsContent value="users" className="space-y-6">
            {/* 搜索和过滤 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  筛选和搜索
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="search">搜索</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="邮箱或姓名"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="filter-tier">会员等级</Label>
                    <Select value={filterTier} onValueChange={setFilterTier}>
                      <SelectTrigger id="filter-tier">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="free">免费会员</SelectItem>
                        <SelectItem value="basic">基础会员</SelectItem>
                        <SelectItem value="pro">高级会员</SelectItem>
                        <SelectItem value="enterprise">企业会员</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="filter-status">订阅状态</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger id="filter-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="active">正常</SelectItem>
                        <SelectItem value="expired">已过期</SelectItem>
                        <SelectItem value="canceled">已取消</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={fetchUsers} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    导出数据
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 用户列表 */}
            <Card>
              <CardHeader>
                <CardTitle>用户列表</CardTitle>
                <CardDescription>
                  共 {filteredUsers.length} 位用户
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600 dark:text-gray-400">加载中...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>用户</TableHead>
                          <TableHead>会员等级</TableHead>
                          <TableHead>订阅状态</TableHead>
                          <TableHead>订阅时间</TableHead>
                          <TableHead>到期时间</TableHead>
                          <TableHead>注册时间</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => {
                          const tierBadge = getTierBadge(user.subscriptionTier)
                          const statusBadge = getStatusBadge(user.subscriptionStatus)

                          return (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{user.name || '未设置'}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                  {!user.emailVerified && (
                                    <Badge variant="outline" className="text-xs mt-1">
                                      未验证邮箱
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={tierBadge.gradient ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''} variant={tierBadge.variant}>
                                  {tierBadge.gradient === true && <Crown className="w-3 h-3 mr-1" />}
                                  {tierBadge.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={statusBadge.variant} className={statusBadge.color || ''}>
                                  {statusBadge.label}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(user.subscriptionStartDate)}</TableCell>
                              <TableCell>{formatDate(user.subscriptionEndDate)}</TableCell>
                              <TableCell>{formatDate(user.createdAt)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Select onValueChange={(value) => handleUpgradeUser(user.id, value)}>
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue placeholder="升级" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="free">免费</SelectItem>
                                      <SelectItem value="basic">基础</SelectItem>
                                      <SelectItem value="pro">高级</SelectItem>
                                      <SelectItem value="enterprise">企业</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleToggleUserStatus(user.id, user.subscriptionStatus)}
                                  >
                                    {user.subscriptionStatus === 'active' ? (
                                      <UserX className="h-4 w-4" />
                                    ) : (
                                      <UserCheck className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>

                    {filteredUsers.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">没有找到符合条件的用户</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据统计标签页 */}
          <TabsContent value="stats" className="space-y-6">
            {stats ? (
              <>
                {/* 核心指标 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        总用户数
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stats.totalUsers}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        活跃订阅
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">{stats.activeSubscriptions}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        月收入
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">¥{stats.monthlyRevenue}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        付费率
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600">
                        {((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 会员分布 */}
                <Card>
                  <CardHeader>
                    <CardTitle>会员等级分布</CardTitle>
                    <CardDescription>各等级会员数量统计</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">免费会员</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold">{stats.tierDistribution.free}</div>
                          <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gray-500 h-2 rounded-full"
                              style={{ width: `${(stats.tierDistribution.free / stats.totalUsers) * 100}%` }}
                            />
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {((stats.tierDistribution.free / stats.totalUsers) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge>基础会员</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold">{stats.tierDistribution.basic}</div>
                          <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(stats.tierDistribution.basic / stats.totalUsers) * 100}%` }}
                            />
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {((stats.tierDistribution.basic / stats.totalUsers) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                            <Crown className="w-3 h-3 mr-1" />
                            高级会员
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold">{stats.tierDistribution.pro}</div>
                          <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                              style={{ width: `${(stats.tierDistribution.pro / stats.totalUsers) * 100}%` }}
                            />
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {((stats.tierDistribution.pro / stats.totalUsers) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">企业会员</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold">{stats.tierDistribution.enterprise}</div>
                          <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${(stats.tierDistribution.enterprise / stats.totalUsers) * 100}%` }}
                            />
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {((stats.tierDistribution.enterprise / stats.totalUsers) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600 dark:text-gray-400">加载统计数据...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
