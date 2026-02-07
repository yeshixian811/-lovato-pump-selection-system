"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  Calendar,
  Palette,
  Layout,
  FileText,
  ChevronRight,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

// 模拟页面数据
const pages = [
  {
    id: 1,
    title: '首页',
    slug: '/',
    template: 'corporate-1',
    templateName: '现代企业官网',
    status: 'published',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    views: 15420,
  },
  {
    id: 2,
    title: '产品中心',
    slug: '/products',
    template: 'product-1',
    templateName: '电商产品展示',
    status: 'published',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-18',
    views: 8920,
  },
  {
    id: 3,
    title: '关于我们',
    slug: '/about',
    template: 'corporate-2',
    templateName: '科技创新企业',
    status: 'published',
    createdAt: '2024-01-17',
    updatedAt: '2024-01-19',
    views: 5640,
  },
  {
    id: 4,
    title: '联系我们',
    slug: '/contact',
    template: 'corporate-1',
    templateName: '现代企业官网',
    status: 'published',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18',
    views: 3210,
  },
  {
    id: 5,
    title: '活动页面',
    slug: '/campaign',
    template: 'marketing-1',
    templateName: '促销活动页',
    status: 'draft',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
    views: 0,
  },
]

export default function PagesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPages, setSelectedPages] = useState<number[]>([])

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectAll = () => {
    if (selectedPages.length === filteredPages.length) {
      setSelectedPages([])
    } else {
      setSelectedPages(filteredPages.map(p => p.id))
    }
  }

  const handleSelect = (id: number) => {
    if (selectedPages.includes(id)) {
      setSelectedPages(selectedPages.filter(p => p !== id))
    } else {
      setSelectedPages([...selectedPages, id])
    }
  }

  const handleDelete = (id: number) => {
    // TODO: 实现删除功能
    console.log('删除页面:', id)
  }

  const handleBatchDelete = () => {
    // TODO: 实现批量删除功能
    console.log('批量删除页面:', selectedPages)
    setSelectedPages([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            页面管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理所有页面，使用积木式编辑器自定义设计
          </p>
        </div>
        <Link href="/admin/templates">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            创建页面
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                页面总数
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                已发布
              </CardTitle>
              <Layout className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages.filter(p => p.status === 'published').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                草稿
              </CardTitle>
              <Palette className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages.filter(p => p.status === 'draft').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                总访问量
              </CardTitle>
              <Eye className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages.reduce((sum, p) => sum + p.views, 0).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索页面..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>
        {selectedPages.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              已选择 {selectedPages.length} 个页面
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              批量删除
            </Button>
          </div>
        )}
      </div>

      {/* Pages List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="w-12 p-4">
                    <input
                      type="checkbox"
                      checked={selectedPages.length === filteredPages.length && filteredPages.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left p-4 font-medium">页面标题</th>
                  <th className="text-left p-4 font-medium">路径</th>
                  <th className="text-left p-4 font-medium">模板</th>
                  <th className="text-left p-4 font-medium">状态</th>
                  <th className="text-left p-4 font-medium">更新时间</th>
                  <th className="text-left p-4 font-medium">访问量</th>
                  <th className="w-12 p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page) => (
                  <tr key={page.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(page.id)}
                        onChange={() => handleSelect(page.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {page.title}
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {page.slug}
                      </code>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Palette className="h-4 w-4" />
                        {page.templateName}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        page.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {page.status === 'published' ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {page.updatedAt}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Eye className="h-4 w-4" />
                        {page.views.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/?preview=${page.id}`} target="_blank">
                              <Eye className="h-4 w-4 mr-2" />
                              预览
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/builder?page=${page.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              编辑
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            复制
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(page.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPages.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">没有找到匹配的页面</p>
              <Link href="/admin/templates" className="inline-block mt-4">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  创建第一个页面
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-blue-600" />
            如何创建页面？
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium">选择模板</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  从模板中心选择合适的页面模板，包括企业官网、产品展示、营销活动等
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium">使用积木组件</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  拖拽积木组件到页面，自由组合，快速设计专业页面
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium">发布页面</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  预览页面效果，满意后一键发布到线上
                </p>
              </div>
            </li>
          </ol>
          <div className="mt-4">
            <Link href="/admin/templates">
              <Button className="gap-2">
                前往模板中心
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
