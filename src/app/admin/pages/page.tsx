"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Save, 
  Eye, 
  Layout, 
  Settings,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Square,
  Type,
  Image as ImageIcon
} from 'lucide-react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const pageComponents = [
  {
    id: 1,
    type: 'hero',
    name: 'Hero区域',
    icon: Layout,
    settings: {
      title: '精准输配 冷暖随心',
      subtitle: '智能水泵选型，一键精准匹配',
      description: '基于AI算法，为您提供最精准的水泵选型方案',
      background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)',
    },
  },
  {
    id: 2,
    type: 'features',
    name: '功能特性',
    icon: Settings,
    settings: {
      items: [
        { icon: 'zap', title: '智能选型', description: 'AI算法精准匹配' },
        { icon: 'database', title: '产品库', description: '丰富的水泵产品' },
        { icon: 'chart', title: '数据分析', description: '可视化选型结果' },
      ],
    },
  },
  {
    id: 3,
    type: 'stats',
    name: '数据统计',
    icon: Type,
    settings: {
      items: [
        { label: '产品数量', value: '500+' },
        { label: '选型次数', value: '10000+' },
        { label: '用户数量', value: '5000+' },
      ],
    },
  },
  {
    id: 4,
    type: 'cta',
    name: '行动呼吁',
    icon: Square,
    settings: {
      title: '开始选型',
      description: '立即体验智能水泵选型服务',
      buttonText: '立即开始',
    },
  },
]

const componentTemplates = [
  { type: 'hero', name: 'Hero区域', icon: Layout },
  { type: 'features', name: '功能特性', icon: Settings },
  { type: 'stats', name: '数据统计', icon: Type },
  { type: 'cta', name: '行动呼吁', icon: Square },
  { type: 'testimonials', name: '用户评价', icon: Type },
  { type: 'faq', name: '常见问题', icon: Type },
  { type: 'banner', name: '横幅广告', icon: ImageIcon },
  { type: 'divider', name: '分割线', icon: Layout },
]

export default function PagesManagementPage() {
  const [selectedComponent, setSelectedComponent] = useState<any>(pageComponents[0])
  const [pageName, setPageName] = useState('首页')
  const [pageSlug, setPageSlug] = useState('home')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            页面管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            设计和配置网站页面布局
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            预览
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      {/* Page Settings */}
      <Card>
        <CardHeader>
          <CardTitle>页面设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>页面名称</Label>
              <Input
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                placeholder="输入页面名称"
              />
            </div>
            <div className="space-y-2">
              <Label>页面路径</Label>
              <Input
                value={pageSlug}
                onChange={(e) => setPageSlug(e.target.value)}
                placeholder="home"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>页面描述</Label>
            <Textarea
              placeholder="输入页面描述，用于SEO优化"
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="components" className="space-y-4">
        <TabsList>
          <TabsTrigger value="components">页面组件</TabsTrigger>
          <TabsTrigger value="settings">页面设置</TabsTrigger>
          <TabsTrigger value="seo">SEO设置</TabsTrigger>
        </TabsList>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Component List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">组件列表</CardTitle>
                <CardDescription>
                  拖拽或点击添加组件到页面
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Select>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="选择模板" />
                    </SelectTrigger>
                    <SelectContent>
                      {componentTemplates.map((template) => (
                        <SelectItem key={template.type} value={template.type}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {pageComponents.map((component, index) => (
                    <div
                      key={component.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedComponent?.id === component.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedComponent(component)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 flex-1">
                          <component.icon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {component.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Component Settings */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">组件配置</CardTitle>
                <CardDescription>
                  配置选中组件的属性和样式
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedComponent && (
                  <>
                    <div className="space-y-2">
                      <Label>组件类型</Label>
                      <Input
                        value={selectedComponent.name}
                        disabled
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    </div>

                    {selectedComponent.type === 'hero' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>主标题</Label>
                          <Input
                            value={selectedComponent.settings.title}
                            onChange={(e) => {
                              const updated = { ...selectedComponent }
                              updated.settings.title = e.target.value
                              setSelectedComponent(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>副标题</Label>
                          <Input
                            value={selectedComponent.settings.subtitle}
                            onChange={(e) => {
                              const updated = { ...selectedComponent }
                              updated.settings.subtitle = e.target.value
                              setSelectedComponent(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>描述</Label>
                          <Textarea
                            value={selectedComponent.settings.description}
                            onChange={(e) => {
                              const updated = { ...selectedComponent }
                              updated.settings.description = e.target.value
                              setSelectedComponent(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>背景颜色</Label>
                          <Input
                            value={selectedComponent.settings.background}
                            onChange={(e) => {
                              const updated = { ...selectedComponent }
                              updated.settings.background = e.target.value
                              setSelectedComponent(updated)
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {selectedComponent.type === 'cta' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>标题</Label>
                          <Input
                            value={selectedComponent.settings.title}
                            onChange={(e) => {
                              const updated = { ...selectedComponent }
                              updated.settings.title = e.target.value
                              setSelectedComponent(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>描述</Label>
                          <Input
                            value={selectedComponent.settings.description}
                            onChange={(e) => {
                              const updated = { ...selectedComponent }
                              updated.settings.description = e.target.value
                              setSelectedComponent(updated)
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>按钮文字</Label>
                          <Input
                            value={selectedComponent.settings.buttonText}
                            onChange={(e) => {
                              const updated = { ...selectedComponent }
                              updated.settings.buttonText = e.target.value
                              setSelectedComponent(updated)
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>页面全局设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>页面宽度</Label>
                <Select defaultValue="container">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">全宽</SelectItem>
                    <SelectItem value="container">容器宽度</SelectItem>
                    <SelectItem value="narrow">窄版</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>页边距</Label>
                <Input type="text" placeholder="1rem" />
              </div>
              <div className="space-y-2">
                <Label>页面背景</Label>
                <Input type="color" defaultValue="#ffffff" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>页面标题（Title）</Label>
                <Input
                  placeholder="洛瓦托水泵选型系统 - 智能选型"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500">
                  建议：50-60个字符
                </p>
              </div>
              <div className="space-y-2">
                <Label>页面描述（Description）</Label>
                <Textarea
                  placeholder="洛瓦托水泵选型系统，提供智能水泵选型服务，支持多种水泵产品..."
                  className="min-h-[100px]"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500">
                  建议：150-160个字符
                </p>
              </div>
              <div className="space-y-2">
                <Label>关键词（Keywords）</Label>
                <Input
                  placeholder="水泵选型, 智能选型, 水泵产品"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
