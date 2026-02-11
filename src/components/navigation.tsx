"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Menu,
  X,
  Home,
  ShoppingCart,
  Layout,
  FileCode,
  Settings,
} from 'lucide-react'
import { isWechatMiniProgram } from '@/lib/wechat'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMiniProgram, setIsMiniProgram] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMiniProgram(isWechatMiniProgram())
  }, [])

  const navItems = [
    { href: '/products', label: '产品库', icon: ShoppingCart },
    { href: '/selection', label: '智能选型', icon: Layout },
  ]

  const diagnosticItem = { href: '/diagnostic', label: '系统诊断', icon: FileCode }

  // 管理面板（仅在开发环境或特定条件显示）
  const showAdminPanel = process.env.NODE_ENV === 'development' || process.env.SHOW_ADMIN_PANEL === 'true'
  const adminItem = { href: '/admin', label: '管理面板', icon: Settings }

  // 在微信小程序中隐藏导航栏
  if (isMiniProgram) {
    return null
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Slogan */}
          <Link href="/" className="flex items-end gap-3">
            <img
              src="/luwatto-logo.png"
              alt="洛瓦托LOGO"
              className="h-8 w-auto"
            />
            <span className="text-gray-900 dark:text-white font-medium text-sm hidden sm:block">
              精准输配 冷暖随心
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  pathname === item.href
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}

            {/* 管理面板 */}
            {showAdminPanel && (
              <Link
                href={adminItem.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  pathname === adminItem.href
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <adminItem.icon className="h-4 w-4" />
                {adminItem.label}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {/* Logo and Slogan in Mobile */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <Link href="/" className="flex items-end gap-3" onClick={() => setIsMenuOpen(false)}>
                <img
                  src="/luwatto-logo.png"
                  alt="洛瓦托LOGO"
                  className="h-8 w-auto"
                />
                <span className="text-gray-900 dark:text-white font-medium text-sm">
                  精准输配 冷暖随心
                </span>
              </Link>
            </div>

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  pathname === item.href
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}

            {/* 管理面板 */}
            {showAdminPanel && (
              <Link
                href={adminItem.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  pathname === adminItem.href
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <adminItem.icon className="h-4 w-4" />
                {adminItem.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
