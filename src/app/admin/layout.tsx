"use client"

import { useState } from 'react'
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
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
    href: '/admin/users',
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
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['content'])

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
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
