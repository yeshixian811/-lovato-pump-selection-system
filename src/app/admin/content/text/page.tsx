"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  MoreHorizontal,
  FileText,
  Code,
  Type,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const textContents = [
  {
    id: 1,
    key: 'site.title',
    label: '网站标题',
    value: '洛瓦托水泵选型系统',
    type: 'text',
    device: 'all',
    lastModified: '2024-01-15',
  },
  {
    id: 2,
    key: 'site.description',
    label: '网站描述',
    value: '专业的水泵选型系统，提供智能选型、产品库管理等服务',
    type: 'textarea',
    device: 'all',
    lastModified: '2024-01-15',
  },
  {
    id: 3,
    key: 'home.hero.title',
    label: '首页主标题',
    value: '精准输配 冷暖随心',
    type: 'text',
    device: 'all',
    lastModified: '2024-01-14',
  },
  {
    id: 4,
    key: 'home.hero.subtitle',
    label: '首页副标题',
    value: '智能水泵选型，一键精准匹配',
    type: 'text',
    device: 'all',
    lastModified: '2024-01-14',
  },
  {
    id: 5,
    key: 'home.hero.description',
    label: '首页描述',
    value: '基于AI算法，为您提供最精准的水泵选型方案',
    type: 'textarea',
    device: 'all',
    lastModified: '2024-01-14',
  },
  {
    id: 6,
    key: 'contact.email',
    label: '联系邮箱',
    value: 'support@lovato.com',
    type: 'email',
    device: 'all',
    lastModified: '2024-01-12',
  },
  {
    id: 7,
    key: 'contact.phone',
    label: '联系电话',
    value: '400-888-8888',
    type: 'text',
    device: 'all',
    lastModified: '2024-01-12',
  },
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'text':
      return <Type className="h-4 w-4" />
    case 'textarea':
      return <FileText className="h-4 w-4" />
    case 'code':
      return <Code className="h-4 w-4" />
    case 'email':
      return <Type className="h-4 w-4" />
    default:
      return <Type className="h-4 w-4" />
  }
}

const getDeviceIcon = (device: string) => {
  switch (device) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />
    case 'desktop':
      return <Monitor className="h-4 w-4" />
    case 'all':
      return <Globe className="h-4 w-4" />
    default:
      return <Globe className="h-4 w-4" />
  }
}

export default function ContentTextPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingText, setEditingText] = useState<any>(null)
  const [editValue, setEditValue] = useState('')

  const filteredTexts = textContents.filter(text =>
    text.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    text.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    text.value.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (text: any) => {
    setEditingText(text)
    setEditValue(text.value)
    setIsEditDialogOpen(true)
  }

  const handleSave = () => {
    // 更新文本内容
    const index = textContents.findIndex(t => t.id === editingText.id)
    if (index !== -1) {
      textContents[index] = {
        ...textContents[index],
        value: editValue,
        lastModified: new Date().toISOString().split('T')[0]
      }
    }
    setIsEditDialogOpen(false)
    setEditingText(null)
  }

  const handleCancel = () => {
    setIsEditDialogOpen(false)
    setEditingText(null)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('确定要删除此文本内容吗？')) {
      const index = textContents.findIndex(t => t.id === id)
      if (index !== -1) {
        textContents.splice(index, 1)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            文本管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理网站所有文本内容和多语言
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          新增文本
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              总文本数
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              48
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              中文文本
            </div>
            <div className="text-2xl font-bold text-blue-600">
              32
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              英文文本
            </div>
            <div className="text-2xl font-bold text-green-600">
              16
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              待翻译
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              8
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索文本..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="设备类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部设备</SelectItem>
            <SelectItem value="desktop">桌面端</SelectItem>
            <SelectItem value="mobile">移动端</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Text Table */}
      <Card>
        <CardHeader>
          <CardTitle>文本列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>文本键</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>设备</TableHead>
                <TableHead>内容</TableHead>
                <TableHead>最后修改</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTexts.map((text) => (
                <TableRow key={text.id}>
                  <TableCell>
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {text.key}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-white">
                    {text.label}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(text.type)}
                      <Badge variant="outline">{text.type}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(text.device)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {text.device === 'all' ? '全部' : text.device}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-700 dark:text-gray-300 max-w-[300px] truncate">
                      {text.value}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {text.lastModified}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(text)}>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Code className="h-4 w-4 mr-2" />
                          查看代码
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(text.id)}>
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>编辑文本内容</DialogTitle>
            <DialogDescription>
              {editingText?.label} ({editingText?.key})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="value">文本内容</Label>
              {editingText?.type === 'textarea' ? (
                <Textarea
                  id="value"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="输入文本内容"
                  rows={6}
                />
              ) : (
                <Input
                  id="value"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="输入文本内容"
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label>当前设备类型</Label>
              <Badge variant="outline">
                {getDeviceIcon(editingText?.device)}
                <span className="ml-2">{editingText?.device}</span>
              </Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
