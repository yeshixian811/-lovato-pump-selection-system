"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Image, 
  Palette, 
  Navigation as NavIcon, 
  Settings,
  Users,
  ChevronRight,
  ChevronDown,
  LogOut,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MenuItem {
  icon: any
  label: string
  href: string
  badge?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: '仪表盘',
    href: '/admin'
  },
  {
    icon: Users,
    label: '用户管理',
    href: '/admin/dashboard',
    badge: '会员'
  },
  {
    icon: FileText,
    label: '内容管理',
    href: '/admin/content',
    children: [
      {
        icon: FileText,
        label: '页面内容',
        href: '/admin/content/pages'
      },
      {
        icon: Image,
        label: '图片管理',
        href: '/admin/content/images'
      },
      {
        icon: FileText,
        label: '文本管理',
        href: '/admin/content/text'
      }
    ]
  },
  {
    icon: LayoutDashboard,
    label: '页面管理',
    href: '/admin/pages',
  },
  {
    icon: Palette,
    label: '设计配置',
    href: '/admin/design',
  },
  {
    icon: NavIcon,
    label: '导航管理',
    href: '/admin/navigation',
  },
  {
    icon: Settings,
    label: '系统设置',
    href: '/admin/settings',
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['content'])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async (retryCount = 0) => {
    setIsLoading(true)
    try {
      // 尝试从sessionStorage获取token
      const sessionToken = typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') : null
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // 如果sessionStorage中有token，添加到Authorization header
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`
      }

      const response = await fetch('/api/user/me', {
        headers
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.user?.role === 'admin') {
          setUser(data.user)
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          setTimeout(() => {
            window.location.href = '/admin-login'
          }, 100)
        }
      } else {
        // 如果是第一次失败且是401错误，可能是Cookie还没设置好，重试一次
        if (response.status === 401 && retryCount === 0) {
          console.log('第一次认证失败，1秒后重试...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          return checkAuth(retryCount + 1)
        }
        
        setIsAuthenticated(false)
        setTimeout(() => {
          window.location.href = '/admin-login'
        }, 100)
      }
    } catch (error) {
      console.error('认证检查失败:', error)
      // 如果是第一次失败，重试一次
      if (retryCount === 0) {
        console.log('第一次认证失败，1秒后重试...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        return checkAuth(retryCount + 1)
      }
      
      setIsAuthenticated(false)
      setTimeout(() => {
        window.location.href = '/admin-login'
      }, 100)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setIsAuthenticated(false)
      // 清除sessionStorage中的token
      sessionStorage.removeItem('admin_token')
      window.location.href = '/admin-login'
    } catch (error) {
      console.error('登出失败:', error)
      sessionStorage.removeItem('admin_token')
      window.location.href = '/admin-login'
    }
  }

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.label)
    const isActive = pathname === item.href || (hasChildren && pathname.startsWith(item.href))

    return (
      <div key={item.href}>
        <Link
          href={item.href}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          style={{ paddingLeft: `${level * 16 + 16}px` }}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault()
              toggleExpand(item.label)
            }
          }}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-xs">
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          )}
        </Link>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // 将由重定向处理
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-50">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <img
              src="/luwatto-logo.png"
              alt="LOGO"
              className="h-8 w-auto"
            />
            <span className="font-bold text-gray-900 dark:text-white">
              后台管理
            </span>
          </Link>

          <nav className="space-y-1">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                管理员
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email || 'admin@lovato.com'}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>个人中心</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  个人信息
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
