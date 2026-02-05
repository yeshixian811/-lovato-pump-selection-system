import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Link,
  ExternalLink,
  FileText,
  Home,
  Layout,
  ShoppingCart,
  Settings,
  User,
  LogOut
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
import { Switch } from '@/components/ui/switch'

const navigationMenus = [
  {
    id: 1,
    name: '主导航菜单',
    location: 'header',
    position: 'top',
    isActive: true,
    items: [
      {
        id: 1,
        label: '首页',
        url: '/',
        icon: 'home',
        type: 'internal',
        isOpenInNewTab: false,
        isActive: true,
      },
      {
        id: 2,
        label: '产品库',
        url: '/products',
        icon: 'shopping',
        type: 'internal',
        isOpenInNewTab: false,
        isActive: true,
      },
      {
        id: 3,
        label: '智能选型',
        url: '/selection',
        icon: 'layout',
        type: 'internal',
        isOpenInNewTab: false,
        isActive: true,
      },
      {
        id: 4,
        label: '关于我们',
        url: '/about',
        icon: 'file',
        type: 'internal',
        isOpenInNewTab: false,
        isActive: true,
      },
      {
        id: 5,
        label: '联系我们',
        url: '/contact',
        icon: 'file',
        type: 'internal',
        isOpenInNewTab: false,
        isActive: true,
      },
    ],
  },
  {
    id: 2,
    name: '底部导航菜单',
    location: 'footer',
    position: 'bottom',
    isActive: true,
    items: [
      {
        id: 1,
        label: '隐私政策',
        url: '/privacy',
        icon: 'file',
        type: 'internal',
        isOpenInNewTab: false,
        isActive: true,
      },
      {
        id: 2,
        label: '使用条款',
        url: '/terms',
        icon: 'file',
        type: 'internal',
        isOpenInNewTab: false,
        isActive: true,
      },
      {
        id: 3,
        label: '帮助中心',
        url: '/help',
        icon: 'file',
        type: 'internal',
        isOpenInNewTab: true,
        isActive: true,
      },
    ],
  },
]

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'home':
      return <Home className="h-4 w-4" />
    case 'shopping':
      return <ShoppingCart className="h-4 w-4" />
    case 'layout':
      return <Layout className="h-4 w-4" />
    case 'file':
      return <FileText className="h-4 w-4" />
    case 'settings':
      return <Settings className="h-4 w-4" />
    case 'user':
      return <User className="h-4 w-4" />
    case 'logout':
      return <LogOut className="h-4 w-4" />
    default:
      return <Link className="h-4 w-4" />
  }
}

export default function NavigationManagementPage() {
  const [selectedMenu, setSelectedMenu] = useState<any>(navigationMenus[0])
  const [editingItem, setEditingItem] = useState<any>(null)
  const [editValue, setEditValue] = useState('')

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setEditValue(item.label)
  }

  const handleSave = () => {
    // 保存逻辑
    setEditingItem(null)
    setEditValue('')
  }

  const handleCancel = () => {
    setEditingItem(null)
    setEditValue('')
  }

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newItems = [...selectedMenu.items]
      ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
      setSelectedMenu({ ...selectedMenu, items: newItems })
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < selectedMenu.items.length - 1) {
      const newItems = [...selectedMenu.items]
      ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
      setSelectedMenu({ ...selectedMenu, items: newItems })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            导航管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理网站导航菜单和链接
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          新建菜单
        </Button>
      </div>

      {/* Menu Selector */}
      <Card>
        <CardHeader>
          <CardTitle>选择菜单</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {navigationMenus.map((menu) => (
              <button
                key={menu.id}
                onClick={() => setSelectedMenu(menu)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedMenu?.id === menu.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {menu.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {menu.location === 'header' ? '顶部导航' : '底部导航'}
                    </div>
                  </div>
                  <Badge variant={menu.isActive ? 'default' : 'secondary'}>
                    {menu.isActive ? '启用' : '禁用'}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>菜单项</CardTitle>
              <CardDescription>
                {selectedMenu?.name} - {selectedMenu?.items?.length} 个项目
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="menu-active" className="text-sm">
                  启用菜单
                </Label>
                <Switch id="menu-active" defaultChecked={selectedMenu?.isActive} />
              </div>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                添加菜单项
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>图标</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>链接地址</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>新窗口</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedMenu?.items?.map((item: any, index: number) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === selectedMenu.items.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      {getIcon(item.icon)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingItem?.id === item.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="min-w-[150px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSave}>
                            <Save className="h-3 w-3 mr-1" />
                            保存
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancel}>
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      {item.type === 'external' && <ExternalLink className="h-3 w-3" />}
                      {item.url}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.type === 'internal' ? 'default' : 'secondary'}>
                      {item.type === 'internal' ? '内部' : '外部'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.isOpenInNewTab}
                      onCheckedChange={(checked) => {
                        const updatedItems = [...selectedMenu.items]
                        updatedItems[index] = { ...item, isOpenInNewTab: checked }
                        setSelectedMenu({ ...selectedMenu, items: updatedItems })
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={(checked) => {
                        const updatedItems = [...selectedMenu.items]
                        updatedItems[index] = { ...item, isActive: checked }
                        setSelectedMenu({ ...selectedMenu, items: updatedItems })
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
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

      {/* Menu Settings */}
      <Card>
        <CardHeader>
          <CardTitle>菜单设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>菜单位置</Label>
              <Select defaultValue={selectedMenu?.location}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">顶部导航</SelectItem>
                  <SelectItem value="footer">底部导航</SelectItem>
                  <SelectItem value="sidebar">侧边栏</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>对齐方式</Label>
              <Select defaultValue="left">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">左对齐</SelectItem>
                  <SelectItem value="center">居中</SelectItem>
                  <SelectItem value="right">右对齐</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>显示图标</Label>
              <p className="text-sm text-gray-500">
                在菜单项前显示图标
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>启用下拉菜单</Label>
              <p className="text-sm text-gray-500">
                为有子项的菜单显示下拉效果
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>响应式行为</Label>
              <p className="text-sm text-gray-500">
                在移动端自动转换为汉堡菜单
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
