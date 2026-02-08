"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface CheckResult {
  name: string
  status: 'success' | 'error' | 'loading' | 'pending'
  message: string
  details?: string
}

export default function AdminCheckPage() {
  const [checks, setChecks] = useState<CheckResult[]>([
    { name: '用户认证', status: 'pending', message: '等待检查' },
    { name: '管理员权限', status: 'pending', message: '等待检查' },
    { name: '用户管理API', status: 'pending', message: '等待检查' },
    { name: '产品管理API', status: 'pending', message: '等待检查' },
  ])

  const [isChecking, setIsChecking] = useState(false)

  const runChecks = async () => {
    setIsChecking(true)
    const newChecks = [...checks]

    // 检查1: 用户认证
    newChecks[0] = { name: '用户认证', status: 'loading', message: '正在检查...' }
    setChecks([...newChecks])

    try {
      const response = await fetch('/api/user/me')

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          newChecks[0] = {
            name: '用户认证',
            status: 'success',
            message: '已登录',
            details: `用户: ${data.user.email || data.user.name}, 角色: ${data.user.role}`
          }
        } else {
          newChecks[0] = {
            name: '用户认证',
            status: 'error',
            message: '未登录',
            details: '请先登录账号'
          }
        }
      } else {
        newChecks[0] = {
          name: '用户认证',
          status: 'error',
          message: '认证失败',
          details: '请重新登录'
        }
      }
    } catch (error) {
      newChecks[0] = {
        name: '用户认证',
        status: 'error',
        message: '检查失败',
        details: '网络错误或API不可用'
      }
    }

    setChecks([...newChecks])

    // 检查2: 管理员权限
    newChecks[1] = { name: '管理员权限', status: 'loading', message: '正在检查...' }
    setChecks([...newChecks])

    if (newChecks[0].status === 'success') {
      const roleMatch = newChecks[0].details?.includes('admin')
      if (roleMatch) {
        newChecks[1] = {
          name: '管理员权限',
          status: 'success',
          message: '有管理员权限',
          details: '可以访问所有后台功能'
        }
      } else {
        newChecks[1] = {
          name: '管理员权限',
          status: 'error',
          message: '没有管理员权限',
          details: '当前角色不是admin，无法访问用户管理等功能'
        }
      }
    } else {
      newChecks[1] = {
        name: '管理员权限',
        status: 'error',
        message: '无法检查',
        details: '需要先登录'
      }
    }

    setChecks([...newChecks])

    // 检查3: 用户管理API
    newChecks[2] = { name: '用户管理API', status: 'loading', message: '正在检查...' }
    setChecks([...newChecks])

    try {
      const response = await fetch('/api/admin/users')

      if (response.status === 401) {
        newChecks[2] = {
          name: '用户管理API',
          status: 'error',
          message: '未授权',
          details: '需要登录'
        }
      } else if (response.status === 403) {
        newChecks[2] = {
          name: '用户管理API',
          status: 'error',
          message: '权限不足',
          details: '需要管理员权限'
        }
      } else if (response.ok) {
        const data = await response.json()
        newChecks[2] = {
          name: '用户管理API',
          status: 'success',
          message: 'API正常',
          details: `找到 ${data.users?.length || 0} 个用户`
        }
      } else {
        newChecks[2] = {
          name: '用户管理API',
          status: 'error',
          message: 'API错误',
          details: `HTTP ${response.status}`
        }
      }
    } catch (error) {
      newChecks[2] = {
        name: '用户管理API',
        status: 'error',
        message: '检查失败',
        details: '网络错误或API不可用'
      }
    }

    setChecks([...newChecks])

    // 检查4: 产品管理API
    newChecks[3] = { name: '产品管理API', status: 'loading', message: '正在检查...' }
    setChecks([...newChecks])

    try {
      const response = await fetch('/api/pumps?limit=10')

      if (response.ok) {
        const data = await response.json()
        newChecks[3] = {
          name: '产品管理API',
          status: 'success',
          message: 'API正常',
          details: `找到 ${data.pumps?.length || 0} 个产品`
        }
      } else {
        newChecks[3] = {
          name: '产品管理API',
          status: 'error',
          message: 'API错误',
          details: `HTTP ${response.status}`
        }
      }
    } catch (error) {
      newChecks[3] = {
        name: '产品管理API',
        status: 'error',
        message: '检查失败',
        details: '网络错误或API不可用'
      }
    }

    setChecks([...newChecks])
    setIsChecking(false)
  }

  useEffect(() => {
    runChecks()
  }, [])

  const getStatusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'loading':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: CheckResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-600">通过</Badge>
      case 'error':
        return <Badge variant="destructive">失败</Badge>
      case 'loading':
        return <Badge className="bg-blue-600">检查中...</Badge>
      case 'pending':
        return <Badge variant="secondary">等待</Badge>
    }
  }

  const allPassed = checks.every(c => c.status === 'success')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">后台功能检查</h1>
          <p className="text-gray-600 dark:text-gray-400">
            检查后台管理系统的各个功能是否正常工作
          </p>
        </div>

        {/* 结果概览 */}
        <Card>
          <CardHeader>
            <CardTitle>检查结果</CardTitle>
            <CardDescription>
              {allPassed ? '✅ 所有功能正常！' : '⚠️ 部分功能需要修复'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checks.map((check, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(check.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{check.name}</h3>
                      {getStatusBadge(check.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {check.message}
                    </p>
                    {check.details && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {check.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 操作建议 */}
        <Card>
          <CardHeader>
            <CardTitle>操作建议</CardTitle>
          </CardHeader>
          <CardContent>
            {!allPassed && (
              <div className="space-y-3">
                {checks.filter(c => c.status === 'error').map((check, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{check.name} 异常</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {check.message}
                      </p>
                      {check.name === '用户认证' && (
                        <Link href="/auth">
                          <Button size="sm" className="mt-2">
                            前往登录
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {allPassed && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">所有检查通过！</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      您可以正常使用后台管理功能
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/admin/dashboard" className="flex-1">
                    <Button className="w-full">
                      前往用户管理
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/admin/products" className="flex-1">
                    <Button variant="outline" className="w-full">
                      前往产品管理
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 重新检查按钮 */}
        <div className="flex justify-center">
          <Button
            onClick={runChecks}
            disabled={isChecking}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            重新检查
          </Button>
        </div>

        {/* 帮助链接 */}
        <Card>
          <CardHeader>
            <CardTitle>需要帮助？</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/diagnostic">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  运行系统诊断
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/ADMIN-SYSTEM-GUIDE">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  查看使用指南
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
