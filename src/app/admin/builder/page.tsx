"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Save,
  Eye,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Layers,
  Settings,
  Layout,
  Search,
  RefreshCw,
  Smartphone,
  Tablet,
  Monitor,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'

// 积木组件类型
interface Block {
  id: string
  type: string
  name: string
  icon: string
  settings: Record<string, any>
  styles?: Record<string, any>
}

// 积木组件库
const blockLibrary = [
  // 基础组件
  {
    category: '基础组件',
    blocks: [
      { id: 'hero', name: '大屏Banner', icon: '🎪', defaultSettings: { title: '标题', subtitle: '副标题', buttonText: '立即开始', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }},
      { id: 'text', name: '富文本', icon: '📝', defaultSettings: { content: '这里是文本内容...' }},
      { id: 'image', name: '图片', icon: '🖼️', defaultSettings: { url: '', alt: '图片描述', width: '100%' }},
      { id: 'button', name: '按钮', icon: '🔘', defaultSettings: { text: '点击按钮', variant: 'primary', size: 'medium' }},
      { id: 'divider', name: '分割线', icon: '➖', defaultSettings: { style: 'solid', color: '#e5e7eb' }},
      { id: 'space', name: '空白占位', icon: '⬜', defaultSettings: { height: '40px' }},
    ],
  },
  // 布局组件
  {
    category: '布局组件',
    blocks: [
      { id: 'layout-2col', name: '双列布局', icon: '▬▬', defaultSettings: { gap: '20px', ratio: '1:1' }},
      { id: 'layout-3col', name: '三列布局', icon: '▬▬▬', defaultSettings: { gap: '20px', ratio: '1:1:1' }},
      { id: 'tabs', name: '标签页', icon: '📑', defaultSettings: { tabs: [{ title: '标签1', content: '内容1' }, { title: '标签2', content: '内容2' }] }},
      { id: 'accordion', name: '手风琴', icon: '📁', defaultSettings: { items: [{ title: '标题1', content: '内容1' }] }},
    ],
  },
  // 营销组件
  {
    category: '营销组件',
    blocks: [
      { id: 'banner', name: '广告横幅', icon: '🎪', defaultSettings: { title: '促销活动', subtitle: '限时优惠', buttonText: '立即购买' }},
      { id: 'countdown', name: '倒计时', icon: '⏱️', defaultSettings: { title: '活动倒计时', endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }},
      { id: 'coupon', name: '优惠券', icon: '🎫', defaultSettings: { title: '优惠券', discount: '100元', condition: '满500可用' }},
      { id: 'form', name: '表单', icon: '📋', defaultSettings: { title: '联系表单', fields: [{ name: 'name', label: '姓名', type: 'text' }, { name: 'phone', label: '电话', type: 'tel' }] }},
    ],
  },
  // 展示组件
  {
    category: '展示组件',
    blocks: [
      { id: 'gallery', name: '图片轮播', icon: '🖼️', defaultSettings: { images: [], autoPlay: true, interval: 3000 }},
      { id: 'features', name: '核心优势', icon: '✨', defaultSettings: { title: '核心优势', items: [{ icon: '⚡', title: '快速', desc: '快速响应' }] }},
      { id: 'testimonials', name: '用户评价', icon: '⭐', defaultSettings: { title: '用户评价', items: [{ name: '用户A', content: '很好用！', rating: 5 }] }},
      { id: 'timeline', name: '时间轴', icon: '📅', defaultSettings: { title: '发展历程', items: [{ year: '2020', title: '成立', desc: '公司成立' }] }},
    ],
  },
  // 业务组件
  {
    category: '业务组件',
    blocks: [
      { id: 'services', name: '服务项目', icon: '🛠️', defaultSettings: { title: '服务项目', items: [{ title: '服务1', desc: '服务描述' }] }},
      { id: 'cases', name: '成功案例', icon: '🏆', defaultSettings: { title: '成功案例', items: [{ title: '案例1', desc: '案例描述' }] }},
      { id: 'team', name: '团队介绍', icon: '👥', defaultSettings: { title: '团队', members: [{ name: '成员1', role: '职位' }] }},
      { id: 'partners', name: '合作伙伴', icon: '🤝', defaultSettings: { title: '合作伙伴', logos: [] }},
    ],
  },
  // 页面组件
  {
    category: '页面组件',
    blocks: [
      { id: 'header', name: '页头', icon: '📌', defaultSettings: { title: '网站标题', logo: '', showMenu: true }},
      { id: 'navbar', name: '导航栏', icon: '🧭', defaultSettings: { items: [{ text: '首页', link: '/' }, { text: '关于', link: '/about' }] }},
      { id: 'footer', name: '页脚', icon: '📍', defaultSettings: { text: '© 2024 版权所有', links: [] }},
    ],
  },
]

// 预设模板
const templates = {
  'corporate-1': [
    { id: 'hero-1', type: 'hero', name: '大屏Banner', icon: '🎪', settings: { title: '洛瓦托水泵', subtitle: '精准输配 冷暖随心', buttonText: '立即选型', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }},
    { id: 'features-1', type: 'features', name: '核心优势', icon: '✨', settings: { title: '核心优势', items: [{ icon: '⚡', title: '智能选型', desc: 'AI算法精准匹配' }, { icon: '📊', title: '数据丰富', desc: '500+产品数据' }, { icon: '🎯', title: '专业可靠', desc: '专业团队支持' }] }},
    { id: 'products-1', type: 'layout-3col', name: '产品展示', icon: '📦', settings: { gap: '20px', ratio: '1:1:1' }},
    { id: 'contact-1', type: 'form', name: '联系表单', icon: '📋', settings: { title: '联系我们', fields: [{ name: 'name', label: '姓名', type: 'text' }, { name: 'phone', label: '电话', type: 'tel' }, { name: 'message', label: '留言', type: 'textarea' }] }},
    { id: 'footer-1', type: 'footer', name: '页脚', icon: '📍', settings: { text: '© 2024 洛瓦托水泵', links: [] }},
  ],
}

export default function PageBuilderPage() {
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [previewMode, setPreviewMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (templateId && templates[templateId as keyof typeof templates]) {
      setBlocks(templates[templateId as keyof typeof templates])
    }
  }, [templateId])

  const addBlock = (block: any) => {
    const newBlock: Block = {
      id: `${block.id}-${Date.now()}`,
      type: block.id,
      name: block.name,
      icon: block.icon,
      settings: { ...block.defaultSettings },
    }
    setBlocks([...blocks, newBlock])
  }

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId))
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null)
    }
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks]
    if (direction === 'up' && index > 0) {
      [newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]]
    } else if (direction === 'down' && index < newBlocks.length - 1) {
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]]
    }
    setBlocks(newBlocks)
  }

  const duplicateBlock = (block: Block) => {
    const newBlock: Block = {
      ...block,
      id: `${block.type}-${Date.now()}`,
    }
    const index = blocks.findIndex(b => b.id === block.id)
    setBlocks([...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)])
  }

  const updateBlockSetting = (blockId: string, key: string, value: any) => {
    setBlocks(blocks.map(block => 
      block.id === blockId 
        ? { ...block, settings: { ...block.settings, [key]: value } }
        : block
    ))
    if (selectedBlock?.id === blockId) {
      setSelectedBlock({
        ...selectedBlock,
        settings: { ...selectedBlock.settings, [key]: value }
      })
    }
  }

  const filteredBlocks = blockLibrary.map(category => ({
    ...category,
    blocks: category.blocks.filter(block =>
      block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.blocks.length > 0)

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">页面编辑器</h1>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                onClick={() => setViewMode('desktop')}
                className="gap-2"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                onClick={() => setViewMode('tablet')}
                className="gap-2"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                onClick={() => setViewMode('mobile')}
                className="gap-2"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? '编辑' : '预览'}
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Block Library */}
        {!previewMode && (
          <div className="w-80 border-r bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold">积木组件</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索组件..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredBlocks.map((category) => (
                <div key={category.category}>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{category.category}</h3>
                  <div className="space-y-2">
                    {category.blocks.map((block) => (
                      <div
                        key={block.id}
                        onClick={() => addBlock(block)}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <div className="text-2xl">{block.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{block.name}</p>
                        </div>
                        <Plus className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Center - Canvas */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 overflow-y-auto p-6">
          <div className={`mx-auto transition-all ${
            viewMode === 'desktop' ? 'max-w-5xl' :
            viewMode === 'tablet' ? 'max-w-2xl' :
            'max-w-sm'
          }`}>
            <div className="bg-white dark:bg-gray-900 min-h-screen shadow-lg">
              {blocks.length === 0 ? (
                <div className="flex items-center justify-center h-96 border-2 border-dashed">
                  <div className="text-center">
                    <Layout className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">从左侧添加积木组件开始设计页面</p>
                  </div>
                </div>
              ) : (
                blocks.map((block, index) => (
                  <div
                    key={block.id}
                    onClick={() => !previewMode && setSelectedBlock(block)}
                    className={`p-4 border-b hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                      selectedBlock?.id === block.id && !previewMode ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{block.icon}</span>
                        <span className="font-medium text-sm">{block.name}</span>
                      </div>
                      {!previewMode && (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up') }}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down') }}
                            disabled={index === blocks.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => { e.stopPropagation(); duplicateBlock(block) }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-600"
                            onClick={(e) => { e.stopPropagation(); removeBlock(block.id) }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Block Preview */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      {block.type === 'hero' && (
                        <div style={{ background: block.settings.background, padding: '40px', textAlign: 'center', borderRadius: '8px' }}>
                          <h2 className="text-3xl font-bold text-white mb-2">{block.settings.title}</h2>
                          <p className="text-white/80 mb-4">{block.settings.subtitle}</p>
                          <Button className="bg-white text-gray-900 hover:bg-gray-100">
                            {block.settings.buttonText}
                          </Button>
                        </div>
                      )}
                      {block.type === 'features' && (
                        <div>
                          <h3 className="text-xl font-bold mb-4">{block.settings.title}</h3>
                          <div className="grid grid-cols-3 gap-4">
                            {block.settings.items?.map((item: any, i: number) => (
                              <div key={i} className="text-center p-4 border rounded-lg">
                                <div className="text-3xl mb-2">{item.icon}</div>
                                <h4 className="font-medium">{item.title}</h4>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {block.type === 'text' && (
                        <div>{block.settings.content}</div>
                      )}
                      {block.type === 'image' && (
                        <div className="text-center p-8 border-2 border-dashed rounded-lg">
                          <p className="text-gray-400">图片区域</p>
                        </div>
                      )}
                      {block.type === 'button' && (
                        <Button variant={block.settings.variant === 'primary' ? 'default' : 'outline'}>
                          {block.settings.text}
                        </Button>
                      )}
                      {block.type === 'form' && (
                        <div>
                          <h3 className="text-xl font-bold mb-4">{block.settings.title}</h3>
                          <div className="space-y-3">
                            {block.settings.fields?.map((field: any, i: number) => (
                              <div key={i}>
                                <Label>{field.label}</Label>
                                <Input type={field.type} placeholder={`请输入${field.label}`} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {block.type === 'footer' && (
                        <div className="text-center py-4 border-t">
                          <p className="text-sm text-gray-500">{block.settings.text}</p>
                        </div>
                      )}
                      {block.type === 'layout-2col' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 border-2 border-dashed rounded-lg text-center text-gray-400">左侧内容</div>
                          <div className="p-4 border-2 border-dashed rounded-lg text-center text-gray-400">右侧内容</div>
                        </div>
                      )}
                      {block.type === 'layout-3col' && (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 border-2 border-dashed rounded-lg text-center text-gray-400">列1</div>
                          <div className="p-4 border-2 border-dashed rounded-lg text-center text-gray-400">列2</div>
                          <div className="p-4 border-2 border-dashed rounded-lg text-center text-gray-400">列3</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Settings */}
        {!previewMode && selectedBlock && (
          <div className="w-80 border-l bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold">组件设置</h2>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">{selectedBlock.icon}</span>
                    {selectedBlock.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(selectedBlock.settings).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize">{key}</Label>
                      {typeof value === 'string' && value.length > 100 ? (
                        <Textarea
                          value={value}
                          onChange={(e) => updateBlockSetting(selectedBlock.id, key, e.target.value)}
                          rows={3}
                        />
                      ) : typeof value === 'string' ? (
                        <Input
                          value={value}
                          onChange={(e) => updateBlockSetting(selectedBlock.id, key, e.target.value)}
                        />
                      ) : typeof value === 'number' ? (
                        <Input
                          type="number"
                          value={value}
                          onChange={(e) => updateBlockSetting(selectedBlock.id, key, parseFloat(e.target.value))}
                        />
                      ) : typeof value === 'boolean' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => updateBlockSetting(selectedBlock.id, key, e.target.checked)}
                          />
                          <span className="text-sm">启用</span>
                        </div>
                      ) : Array.isArray(value) ? (
                        <Textarea
                          value={JSON.stringify(value, null, 2)}
                          onChange={(e) => {
                            try {
                              updateBlockSetting(selectedBlock.id, key, JSON.parse(e.target.value))
                            } catch (err) {
                              console.error('Invalid JSON:', err)
                            }
                          }}
                          rows={4}
                          className="font-mono text-xs"
                        />
                      ) : (
                        <Input
                          value={String(value)}
                          onChange={(e) => updateBlockSetting(selectedBlock.id, key, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
