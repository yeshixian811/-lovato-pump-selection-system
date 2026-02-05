import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { 
  Palette, 
  Type, 
  Layout, 
  Save,
  RefreshCw,
  Download,
  Sun,
  Moon,
  Monitor
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
import { Switch } from '@/components/ui/switch'

const colorPresets = [
  {
    name: '蓝紫渐变',
    primary: '#2563eb',
    secondary: '#9333ea',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)',
  },
  {
    name: '绿色主题',
    primary: '#10b981',
    secondary: '#059669',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  {
    name: '橙色主题',
    primary: '#f97316',
    secondary: '#ea580c',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  },
  {
    name: '红色主题',
    primary: '#ef4444',
    secondary: '#dc2626',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
  {
    name: '深蓝主题',
    primary: '#1e40af',
    secondary: '#1e3a8a',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
  },
  {
    name: '灰色主题',
    primary: '#4b5563',
    secondary: '#374151',
    gradient: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)',
  },
]

const fontFamilies = [
  { name: '默认字体', value: 'system-ui', preview: '中文默认字体' },
  { name: '思源黑体', value: 'Noto Sans SC', preview: '思源黑体中文' },
  { name: '阿里巴巴普惠体', value: 'Alibaba PuHuiTi', preview: '阿里巴巴普惠体' },
  { name: '思源宋体', value: 'Noto Serif SC', preview: '思源宋体中文' },
]

export default function DesignConfigPage() {
  const [selectedPreset, setSelectedPreset] = useState(colorPresets[0])
  const [primaryColor, setPrimaryColor] = useState('#2563eb')
  const [secondaryColor, setSecondaryColor] = useState('#9333ea')
  const [borderRadius, setBorderRadius] = useState([8])
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            设计配置
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            自定义网站的主题、颜色和样式
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            颜色主题
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            字体排版
          </TabsTrigger>
          <TabsTrigger value="spacing">
            <Layout className="h-4 w-4 mr-2" />
            间距布局
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Monitor className="h-4 w-4 mr-2" />
            外观设置
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          {/* Color Presets */}
          <Card>
            <CardHeader>
              <CardTitle>颜色预设</CardTitle>
              <CardDescription>
                选择预设主题快速应用配色方案
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setSelectedPreset(preset)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      selectedPreset.name === preset.name
                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div
                      className="h-16 rounded mb-2"
                      style={{ background: preset.gradient }}
                    />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {preset.name}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Colors */}
          <Card>
            <CardHeader>
              <CardTitle>自定义颜色</CardTitle>
              <CardDescription>
                精确调整网站颜色
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>主色调（Primary）</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-0 border-0"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>辅助色（Secondary）</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-10 p-0 border-0"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Color Palette Preview */}
              <div className="space-y-2">
                <Label>颜色预览</Label>
                <div className="grid grid-cols-10 gap-1 h-12 rounded-lg overflow-hidden">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor} ${i * 10}%, ${secondaryColor} ${100 - i * 10}%)`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Component Preview */}
              <div className="space-y-2">
                <Label>组件预览</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                    主按钮样式
                  </Button>
                  <Button variant="outline">
                    次要按钮样式
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>字体设置</CardTitle>
              <CardDescription>
                配置网站字体和排版
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>字体家族</Label>
                <Select defaultValue="system-ui">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>基础字号</Label>
                  <Input type="number" defaultValue={16} />
                </div>
                <div className="space-y-2">
                  <Label>行高</Label>
                  <Input type="number" step="0.1" defaultValue={1.6} />
                </div>
              </div>

              <div className="space-y-4">
                <Label>字体预览</Label>
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <h1 className="text-4xl font-bold">一级标题 Heading 1</h1>
                  <h2 className="text-3xl font-semibold">二级标题 Heading 2</h2>
                  <h3 className="text-2xl font-medium">三级标题 Heading 3</h3>
                  <p className="text-lg">正文文本示例，这是一段普通的正文内容，用于展示字体的实际效果。</p>
                  <p className="text-sm text-gray-500">
                    小字文本示例，用于辅助说明或次要信息。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spacing Tab */}
        <TabsContent value="spacing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>间距设置</CardTitle>
              <CardDescription>
                配置元素的间距和边距
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>圆角大小: {borderRadius}px</Label>
                <Slider
                  value={borderRadius}
                  onValueChange={setBorderRadius}
                  min={0}
                  max={24}
                  step={1}
                  className="w-full"
                />
                <div className="grid grid-cols-4 gap-4">
                  {[0, 4, 8, 12, 16, 20, 24].map((size) => (
                    <button
                      key={size}
                      onClick={() => setBorderRadius([size])}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        borderRadius[0] === size
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      style={{ borderRadius: `${size}px` }}
                    >
                      <div className="text-sm text-gray-900 dark:text-white">
                        {size}px
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>组件预览</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                    style={{ borderRadius: `${borderRadius[0]}px` }}
                  >
                    圆角 {borderRadius[0]}px
                  </Button>
                  <div
                    className="p-4 border-2 border-gray-200 dark:border-gray-700"
                    style={{ borderRadius: `${borderRadius[0]}px` }}
                  >
                    卡片组件
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>外观设置</CardTitle>
              <CardDescription>
                配置网站的外观模式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>主题模式</Label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setDarkMode(false)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      !darkMode
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Sun className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      浅色模式
                    </div>
                  </button>
                  <button
                    onClick={() => setDarkMode(true)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      darkMode
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Moon className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      深色模式
                    </div>
                  </button>
                  <button
                    className={`p-6 rounded-lg border-2 transition-all ${
                      false
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Monitor className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      自动跟随
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用动画效果</Label>
                  <p className="text-sm text-gray-500">
                    页面切换和交互时的动画
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>显示返回顶部按钮</Label>
                  <p className="text-sm text-gray-500">
                    当页面滚动到底部时显示
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用加载动画</Label>
                  <p className="text-sm text-gray-500">
                    页面加载时的过渡效果
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
