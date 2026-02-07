"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Eye,
  Check,
  Layout,
  ShoppingBag,
  Megaphone,
  Building2,
  Briefcase,
  Palette,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

// 模板数据
const pageTemplates = [
  // 企业官网
  {
    id: 'corporate-1',
    name: '现代企业官网',
    category: 'corporate',
    categoryName: '企业官网',
    thumbnail: '/templates/corporate-1.png',
    description: '适合各类企业展示产品与服务',
    tags: ['专业', '简洁', '商务'],
    modules: [
      { type: 'hero', name: '大屏Banner' },
      { type: 'features', name: '核心优势' },
      { type: 'products', name: '产品展示' },
      { type: 'about', name: '关于我们' },
      { type: 'contact', name: '联系方式' },
      { type: 'footer', name: '页脚' },
    ],
  },
  {
    id: 'corporate-2',
    name: '科技创新企业',
    category: 'corporate',
    categoryName: '企业官网',
    thumbnail: '/templates/corporate-2.png',
    description: '突出技术实力与创新理念',
    tags: ['科技', '现代', '创新'],
    modules: [
      { type: 'hero', name: '动态Banner' },
      { type: 'stats', name: '数据展示' },
      { type: 'features', name: '技术优势' },
      { type: 'cases', name: '成功案例' },
      { type: 'team', name: '团队介绍' },
      { type: 'footer', name: '页脚' },
    ],
  },
  {
    id: 'corporate-3',
    name: '传统行业官网',
    category: 'corporate',
    categoryName: '企业官网',
    templateId: 'corporate-3',
    thumbnail: '/templates/corporate-3.png',
    description: '稳重大气，适合制造业等行业',
    tags: ['稳重', '大气', '传统'],
    modules: [
      { type: 'hero', name: '企业Banner' },
      { type: 'products', name: '产品系列' },
      { type: 'services', name: '服务范围' },
      { type: 'news', name: '企业动态' },
      { type: 'contact', name: '联系方式' },
      { type: 'footer', name: '页脚' },
    ],
  },
  // 产品展示
  {
    id: 'product-1',
    name: '电商产品展示',
    category: 'product',
    categoryName: '产品展示',
    thumbnail: '/templates/product-1.png',
    description: '突出产品特色与卖点',
    tags: ['电商', '产品', '营销'],
    modules: [
      { type: 'banner', name: '促销Banner' },
      { type: 'hot-products', name: '热销产品' },
      { type: 'categories', name: '分类导航' },
      { type: 'new-products', name: '新品上市' },
      { type: 'testimonials', name: '用户评价' },
      { type: 'footer', name: '页脚' },
    ],
  },
  {
    id: 'product-2',
    name: '产品详情页',
    category: 'product',
    categoryName: '产品展示',
    thumbnail: '/templates/product-2.png',
    description: '完整的产品信息展示',
    tags: ['详情', '专业', '完整'],
    modules: [
      { type: 'product-info', name: '产品信息' },
      { type: 'product-gallery', name: '产品图片' },
      { type: 'product-specs', name: '技术参数' },
      { type: 'related-products', name: '相关产品' },
      { type: 'faq', name: '常见问题' },
      { type: 'footer', name: '页脚' },
    ],
  },
  // 营销活动
  {
    id: 'marketing-1',
    name: '促销活动页',
    category: 'marketing',
    categoryName: '营销活动',
    thumbnail: '/templates/marketing-1.png',
    description: '吸引眼球的促销活动页面',
    tags: ['促销', '活动', '营销'],
    modules: [
      { type: 'countdown', name: '倒计时Banner' },
      { type: 'coupons', name: '优惠券' },
      { type: 'products', name: '特价商品' },
      { type: 'rules', name: '活动规则' },
      { type: 'contact', name: '客服咨询' },
    ],
  },
  {
    id: 'marketing-2',
    name: '落地页模板',
    category: 'marketing',
    categoryName: '营销活动',
    thumbnail: '/templates/marketing-2.png',
    description: '高转化率的营销落地页',
    tags: ['转化', '营销', '落地页'],
    modules: [
      { type: 'hero', name: '强引导Banner' },
      { type: 'pain-points', name: '痛点分析' },
      { type: 'solution', name: '解决方案' },
      { type: 'testimonials', name: '用户见证' },
      { type: 'cta', name: '行动号召' },
    ],
  },
  // 行业专题
  {
    id: 'industry-1',
    name: '工业设备展示',
    category: 'industry',
    categoryName: '行业专题',
    thumbnail: '/templates/industry-1.png',
    description: '适合工业设备制造商',
    tags: ['工业', '设备', '专业'],
    modules: [
      { type: 'hero', name: '设备展示Banner' },
      { type: 'products', name: '设备列表' },
      { type: 'applications', name: '应用场景' },
      { type: 'cases', name: '应用案例' },
      { type: 'contact', name: '询价联系' },
      { type: 'footer', name: '页脚' },
    ],
  },
  {
    id: 'industry-2',
    name: '建材家居展示',
    category: 'industry',
    categoryName: '行业专题',
    thumbnail: '/templates/industry-2.png',
    description: '建材家居产品展示',
    tags: ['建材', '家居', '装修'],
    modules: [
      { type: 'banner', name: '装修Banner' },
      { type: 'categories', name: '分类展示' },
      { type: 'products', name: '产品推荐' },
      { type: 'showcase', name: '案例展示' },
      { type: 'contact', name: '预约咨询' },
      { type: 'footer', name: '页脚' },
    ],
  },
  // 自定义模板
  {
    id: 'custom-1',
    name: '空白模板',
    category: 'custom',
    categoryName: '自定义',
    thumbnail: '/templates/custom-1.png',
    description: '从零开始构建页面',
    tags: ['自由', '灵活', '自定义'],
    modules: [],
  },
]

// 积木组件库
const blockCategories = [
  {
    id: 'basic',
    name: '基础组件',
    icon: Layout,
    blocks: [
      { id: 'text', name: '富文本', icon: '📝', desc: '添加文本内容' },
      { id: 'image', name: '图片', icon: '🖼️', desc: '添加图片' },
      { id: 'button', name: '按钮', icon: '🔘', desc: '添加按钮' },
      { id: 'divider', name: '分割线', icon: '➖', desc: '添加分割线' },
      { id: 'space', name: '空白占位', icon: '⬜', desc: '添加空白间距' },
    ],
  },
  {
    id: 'layout',
    name: '布局组件',
    icon: Layout,
    blocks: [
      { id: 'layout-1col', name: '单列布局', icon: '▭', desc: '单列内容' },
      { id: 'layout-2col', name: '双列布局', icon: '▬▬', desc: '左右两列' },
      { id: 'layout-3col', name: '三列布局', icon: '▬▬▬', desc: '三列内容' },
      { id: 'layout-4col', name: '四列布局', icon: '▬▬▬▬', desc: '四列内容' },
      { id: 'tabs', name: '标签页', icon: '📑', desc: '标签切换' },
    ],
  },
  {
    id: 'marketing',
    name: '营销组件',
    icon: Megaphone,
    blocks: [
      { id: 'banner', name: '广告横幅', icon: '🎪', desc: '广告Banner' },
      { id: 'coupon', name: '优惠券', icon: '🎫', desc: '优惠券展示' },
      { id: 'countdown', name: '倒计时', icon: '⏱️', desc: '活动倒计时' },
      { id: 'form', name: '表单', icon: '📋', desc: '收集表单' },
      { id: 'live-chat', name: '在线客服', icon: '💬', desc: '客服悬浮窗' },
    ],
  },
  {
    id: 'display',
    name: '展示组件',
    icon: Sparkles,
    blocks: [
      { id: 'gallery', name: '图片轮播', icon: '🖼️', desc: '轮播图' },
      { id: 'product-list', name: '产品列表', icon: '📦', desc: '产品展示' },
      { id: 'text-image', name: '图文混排', icon: '📷', desc: '图文混排' },
      { id: 'timeline', name: '时间轴', icon: '📅', desc: '发展历程' },
      { id: 'testimonials', name: '用户评价', icon: '⭐', desc: '客户评价' },
    ],
  },
  {
    id: 'business',
    name: '业务组件',
    icon: Briefcase,
    blocks: [
      { id: 'features', name: '核心优势', icon: '✨', desc: '展示优势' },
      { id: 'services', name: '服务项目', icon: '🛠️', desc: '服务列表' },
      { id: 'cases', name: '成功案例', icon: '🏆', desc: '案例展示' },
      { id: 'team', name: '团队介绍', icon: '👥', desc: '团队成员' },
      { id: 'partners', name: '合作伙伴', icon: '🤝', desc: '合作伙伴' },
    ],
  },
  {
    id: 'page',
    name: '页面组件',
    icon: Layout,
    blocks: [
      { id: 'header', name: '页头', icon: '📌', desc: '页面头部' },
      { id: 'navbar', name: '导航栏', icon: '🧭', desc: '顶部导航' },
      { id: 'sidebar', name: '侧边栏', icon: '📋', desc: '侧边菜单' },
      { id: 'footer', name: '页脚', icon: '📍', desc: '页面底部' },
      { id: 'breadcrumb', name: '面包屑', icon: '🔙', desc: '当前位置' },
    ],
  },
]

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const categories = [
    { id: 'all', name: '全部模板', icon: Palette, count: pageTemplates.length },
    { id: 'corporate', name: '企业官网', icon: Building2, count: 3 },
    { id: 'product', name: '产品展示', icon: ShoppingBag, count: 2 },
    { id: 'marketing', name: '营销活动', icon: Megaphone, count: 2 },
    { id: 'industry', name: '行业专题', icon: Briefcase, count: 2 },
    { id: 'custom', name: '自定义', icon: Sparkles, count: 1 },
  ]

  const filteredTemplates = pageTemplates.filter(template => {
    const matchCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchCategory && matchSearch
  })

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    // 这里跳转到编辑页面，携带选中的模板ID
    window.location.href = `/admin/builder?template=${templateId}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          模板中心
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          选择精美模板，快速搭建页面
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索模板..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="templates">模板选择</TabsTrigger>
          <TabsTrigger value="blocks">积木组件</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="gap-2"
              >
                <cat.icon className="h-4 w-4" />
                {cat.name}
                <Badge variant="secondary" className="text-xs">
                  {cat.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="group cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleSelectTemplate(template.id)}
              >
                <CardHeader className="p-0">
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center relative">
                    <div className="text-center">
                      <Layout className="h-16 w-16 mx-auto text-blue-600 dark:text-blue-400 opacity-50" />
                      <p className="text-sm text-gray-500 mt-2">模板预览</p>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-5 w-5 bg-white rounded-full p-1 shadow" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {template.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 mb-2">包含模块:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.modules.map((mod) => (
                        <Badge key={mod.type} variant="outline" className="text-xs">
                          {mod.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full gap-2">
                    {selectedTemplate === template.id ? (
                      <>
                        <Check className="h-4 w-4" />
                        已选择
                      </>
                    ) : (
                      <>
                        使用此模板
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Layout className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">没有找到匹配的模板</p>
            </div>
          )}
        </TabsContent>

        {/* Blocks Tab */}
        <TabsContent value="blocks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {blockCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <category.icon className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.blocks.map((block) => (
                      <div
                        key={block.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <div className="text-2xl">{block.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{block.name}</p>
                          <p className="text-xs text-gray-500">{block.desc}</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          添加
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
