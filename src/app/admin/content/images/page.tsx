"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Upload, 
  Download, 
  Trash2, 
  Image as ImageIcon,
  Grid,
  List,
  Filter,
  Folder,
  Star,
  Clock
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const images = [
  {
    id: 1,
    name: 'banner-home.jpg',
    url: 'https://via.placeholder.com/400x300',
    size: '2.4 MB',
    dimensions: '1920x600',
    type: 'banner',
    uploadedAt: '2024-01-15',
    views: 1234,
  },
  {
    id: 2,
    name: 'pump-001.jpg',
    url: 'https://via.placeholder.com/400x300',
    size: '1.8 MB',
    dimensions: '800x600',
    type: 'product',
    uploadedAt: '2024-01-14',
    views: 856,
  },
  {
    id: 3,
    name: 'logo-white.png',
    url: 'https://via.placeholder.com/400x300',
    size: '45 KB',
    dimensions: '200x80',
    type: 'logo',
    uploadedAt: '2024-01-13',
    views: 3421,
  },
  {
    id: 4,
    name: 'team-01.jpg',
    url: 'https://via.placeholder.com/400x300',
    size: '2.1 MB',
    dimensions: '600x800',
    type: 'team',
    uploadedAt: '2024-01-12',
    views: 567,
  },
  {
    id: 5,
    name: 'background-01.jpg',
    url: 'https://via.placeholder.com/400x300',
    size: '3.2 MB',
    dimensions: '3840x2160',
    type: 'background',
    uploadedAt: '2024-01-10',
    views: 2341,
  },
  {
    id: 6,
    name: 'pump-002.jpg',
    url: 'https://via.placeholder.com/400x300',
    size: '1.9 MB',
    dimensions: '800x600',
    type: 'product',
    uploadedAt: '2024-01-08',
    views: 678,
  },
]

const folders = [
  { name: '全部图片', count: 156, icon: Grid },
  { name: 'Banner图片', count: 12, icon: ImageIcon },
  { name: '产品图片', count: 45, icon: ImageIcon },
  { name: 'Logo', count: 8, icon: ImageIcon },
  { name: '团队照片', count: 15, icon: ImageIcon },
  { name: '背景图', count: 20, icon: ImageIcon },
  { name: '收藏', count: 23, icon: Star },
  { name: '最近上传', count: 33, icon: Clock },
]

export default function ContentImagesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFolder, setSelectedFolder] = useState('全部图片')

  const filteredImages = images.filter(image =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            图片管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理网站所有图片资源
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Upload className="h-4 w-4 mr-2" />
          上传图片
        </Button>
      </div>

      {/* Folders */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {folders.map((folder) => (
          <button
            key={folder.name}
            onClick={() => setSelectedFolder(folder.name)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg whitespace-nowrap transition-colors ${
              selectedFolder === folder.name
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <folder.icon className="h-4 w-4" />
            <span className="font-medium">{folder.name}</span>
            <Badge variant="secondary" className="text-xs">
              {folder.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              总图片数
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              156
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              总大小
            </div>
            <div className="text-2xl font-bold text-blue-600">
              2.4 GB
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              本月上传
            </div>
            <div className="text-2xl font-bold text-green-600">
              23
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              总访问量
            </div>
            <div className="text-2xl font-bold text-purple-600">
              45.2K
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索图片..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>按日期排序</DropdownMenuItem>
              <DropdownMenuItem>按大小排序</DropdownMenuItem>
              <DropdownMenuItem>按名称排序</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredImages.map((image) => (
          <Card key={image.id} className="overflow-hidden group">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {image.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {image.size} • {image.dimensions}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Upload Card */}
        <Card className="border-dashed border-2 flex items-center justify-center min-h-[200px] hover:border-blue-500 transition-colors cursor-pointer">
          <CardContent className="p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              拖拽上传
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              或点击选择文件
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
