"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, AlertCircle } from 'lucide-react'
import { setToken } from '@/lib/api'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [token, setToken] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      if (response.ok) {
        const data = await response.json()

        // 检查是否是管理员
        if (data.user?.role === 'admin') {
          // 使用 setToken 工具保存 token（sessionStorage）
          if (data.token) {
            setToken(data.token, 'session')
          }
          // 设置登录成功状态
          setLoginSuccess(true)
          setToken(data.token || '')
        } else {
          setError('您没有管理员权限')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || '登录失败')
      }
    } catch (error) {
      setError('登录失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Logo - 在最左侧 */}
      <div className="w-full border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/luwatto-logo.png"
                alt="洛瓦托LOGO"
                className="h-8 w-auto"
              />
              <div className="text-left">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  洛瓦托
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  后台管理系统
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 登录表单 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>登录</CardTitle>
            <CardDescription>
              请输入管理员账户信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@lovato.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>

            {loginSuccess && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-green-900 dark:text-green-400 font-medium text-center mb-3">
                  ✓ 登录成功！
                </p>
                <Button
                  onClick={() => {
                    window.location.href = '/admin'
                  }}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  进入后台管理
                </Button>
              </div>
            )}

            <div className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="font-medium text-blue-900 dark:text-blue-400 mb-1">
                  测试账户
                </p>
                <p>邮箱：admin@lovato.com</p>
                <p>密码：admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
