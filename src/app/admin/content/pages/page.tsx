"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  Layout,
  Home,
  ShoppingCart,
  FileText,
  Info,
  Save,
  X
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const pages = [
  {
    id: 1,
    name: '首页',
    slug: 'home',
    type: 'home',
    status: 'published',
    views: 12543,
    lastModified: '2024-01-15',
  },
  {
    id: 2,
    name: '产品库',
    slug: 'products',
    type: 'products',
    status: 'published',
    views: 8932,
    lastModified: '2024-01-14',
  },
  {
    id: 3,
    name: '智能选型',
    slug: 'selection',
    type: 'selection',
    status: 'published',
    views: 15234,
    lastModified: '2024-01-13',
  },
  {
    id: 4,
    name: '关于我们',
    slug: 'about',
    type: 'info',
    status: 'published',
    views: 3421,
    lastModified: '2024-01-12',
  },
  {
    id: 5,
    name: '联系方式',
    slug: 'contact',
    type: 'info',
    status: 'published',
    views: 2156,
    lastModified: '2024-01-10',
  },
  {
    id: 6,
    name: '会员订阅',
    slug: 'pricing',
    type: 'pricing',
    status: 'published',
    views: 5678,
    lastModified: '2024-01-08',
  },
]

const getPageIcon = (type: string) => {
  switch (type) {
    case 'home':
      return <Home className="h-4 w-4" />
    case 'products':
      return <ShoppingCart className="h-4 w-4" />
    case 'selection':
      return <Layout className="h-4 w-4" />
    case 'info':
      return <Info className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'published':
      return <Badge className="bg-green-600">已发布</Badge>
    case 'draft':
      return <Badge variant="secondary">草稿</Badge>
    case 'archived':
      return <Badge variant="outline">已归档</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export default function ContentPagesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<any>(null)
  const [editedName, setEditedName] = useState('')
  const [editedSlug, setEditedSlug] = useState('')
  const [editedStatus, setEditedStatus] = useState('')

  const handleEdit = (page: any) => {
    setEditingPage(page)
    setEditedName(page.name)
    setEditedSlug(page.slug)
    setEditedStatus(page.status)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    // 更新页面数据
    const pageIndex = pages.findIndex(p => p.id === editingPage.id)
    if (pageIndex !== -1) {
      pages[pageIndex] = {
        ...pages[pageIndex],
        name: editedName,
        slug: editedSlug,
        status: editedStatus,
        lastModified: new Date().toISOString().split('T')[0]
      }
    }
    setIsEditDialogOpen(false)
    setEditingPage(null)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('确定要删除此页面吗？')) {
      const index = pages.findIndex(p => p.id === id)
      if (index !== -1) {
        pages.splice(index, 1)
      }
    }
  }

  const filteredPages = pages.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            页面内容管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理网站所有页面的内容和布局
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          新建页面
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              总页面数
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              24
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              已发布
            </div>
            <div className="text-2xl font-bold text-green-600">
              18
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              草稿
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              4
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              已归档
            </div>
            <div className="text-2xl font-bold text-gray-600">
              2
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>页面列表</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索页面..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>页面名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>访问量</TableHead>
                <TableHead>最后修改</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        {getPageIcon(page.type)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {page.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          /{page.slug}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{page.type}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(page.status)}</TableCell>
                  <TableCell className="text-gray-900 dark:text-white">
                    {page.views.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {page.lastModified}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          预览
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(page)}>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑页面</DialogTitle>
            <DialogDescription>
              修改页面的基本信息和状态
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">页面名称</Label>
              <Input
                id="name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="输入页面名称"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">URL路径</Label>
              <Input
                id="slug"
                value={editedSlug}
                onChange={(e) => setEditedSlug(e.target.value)}
                placeholder="输入URL路径"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">状态</Label>
              <Select value={editedStatus} onValueChange={setEditedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="archived">已归档</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
