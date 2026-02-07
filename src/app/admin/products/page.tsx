"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Plus, Edit, Trash2, Search, RefreshCw, Package } from 'lucide-react'

interface Pump {
  id: string
  model: string
  name: string
  brand: string
  pumpType: string
  material: string
  flowRate: string
  head: string
  power: string
  efficiency: string | null
  price: string | null
  imageUrl: string | null
  applicationType: string
  description: string
  createdAt: string
  updatedAt: string
}

interface PumpFormData {
  model: string
  name: string
  brand: string
  pumpType: string
  material: string
  flowRate: string
  head: string
  maxFlow: string
  maxHead: string
  power: string
  efficiency: string
  price: string
  applicationType: string
  description: string
  imageUrl: string
  maxTemperature: string
  maxPressure: string
}

export default function ProductsPage() {
  const [pumps, setPumps] = useState<Pump[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPump, setEditingPump] = useState<Pump | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<PumpFormData>({
    model: '',
    name: '',
    brand: '洛瓦托',
    pumpType: '离心泵',
    material: '不锈钢',
    flowRate: '',
    head: '',
    maxFlow: '',
    maxHead: '',
    power: '',
    efficiency: '',
    price: '',
    applicationType: '供水系统',
    description: '',
    imageUrl: '',
    maxTemperature: '',
    maxPressure: '',
  })

  useEffect(() => {
    fetchPumps()
  }, [])

  const fetchPumps = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pumps?limit=100')
      if (response.ok) {
        const data = await response.json()
        setPumps(data.pumps || [])
      }
    } catch (error) {
      console.error('获取产品列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)

      // 使用对象存储上传图片
      const formData = new FormData()
      formData.append('file', file)

      // 这里假设有一个对象存储的 API
      // 如果没有，可以使用本地存储或者其他方案
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, imageUrl: data.url }))
      } else {
        // 如果上传失败，使用 base64 作为临时方案
        const reader = new FileReader()
        reader.onload = (e) => {
          setFormData(prev => ({ ...prev, imageUrl: e.target?.result as string }))
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      // 降级方案：使用 base64
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, imageUrl: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      const url = editingPump ? `/api/pumps/${editingPump.id}` : '/api/pumps'
      const method = editingPump ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        fetchPumps()
        // 重置表单
        setFormData({
          model: '',
          name: '',
          brand: '洛瓦托',
          pumpType: '离心泵',
          material: '不锈钢',
          flowRate: '',
          head: '',
          maxFlow: '',
          maxHead: '',
          power: '',
          efficiency: '',
          price: '',
          applicationType: '供水系统',
          description: '',
          imageUrl: '',
          maxTemperature: '',
          maxPressure: '',
        })
        setEditingPump(null)
      }
    } catch (error) {
      console.error('保存产品失败:', error)
    }
  }

  const handleEdit = (pump: Pump) => {
    setEditingPump(pump)
    setFormData({
      model: pump.model,
      name: pump.name,
      brand: pump.brand,
      pumpType: pump.pumpType,
      material: pump.material,
      flowRate: pump.flowRate,
      head: pump.head,
      maxFlow: '',
      maxHead: '',
      power: pump.power,
      efficiency: pump.efficiency || '',
      price: pump.price || '',
      applicationType: pump.applicationType,
      description: pump.description,
      imageUrl: pump.imageUrl || '',
      maxTemperature: '',
      maxPressure: '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个产品吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/pumps/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPumps()
      }
    } catch (error) {
      console.error('删除产品失败:', error)
    }
  }

  const handleAddNew = () => {
    setEditingPump(null)
    setFormData({
      model: '',
      name: '',
      brand: '洛瓦托',
      pumpType: '离心泵',
      material: '不锈钢',
      flowRate: '',
      head: '',
      maxFlow: '',
      maxHead: '',
      power: '',
      efficiency: '',
      price: '',
      applicationType: '供水系统',
      description: '',
      imageUrl: '',
      maxTemperature: '',
      maxPressure: '',
    })
    setIsDialogOpen(true)
  }

  const filteredPumps = pumps.filter(pump => {
    const matchSearch = pump.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       pump.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = filterType === 'all' || pump.pumpType === filterType
    return matchSearch && matchType
  })

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">产品管理</h1>
          <p className="text-gray-600 dark:text-gray-400">管理水泵产品库</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPumps} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            添加产品
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>产品列表</CardTitle>
              <CardDescription>
                共 {filteredPumps.length} 个产品
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="搜索产品..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="筛选类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="离心泵">离心泵</SelectItem>
                  <SelectItem value="屏蔽泵">屏蔽泵</SelectItem>
                  <SelectItem value="管道泵">管道泵</SelectItem>
                  <SelectItem value="变频泵">变频泵</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-auto max-h-[calc(100vh-300px)] custom-scrollbar relative">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>图片</TableHead>
                    <TableHead>型号</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>流量</TableHead>
                    <TableHead>扬程</TableHead>
                    <TableHead>功率</TableHead>
                    <TableHead>价格</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPumps.map((pump) => (
                    <TableRow key={pump.id}>
                      <TableCell>
                        {pump.imageUrl ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={pump.imageUrl}
                              alt={pump.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{pump.model}</TableCell>
                      <TableCell>{pump.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{pump.pumpType}</Badge>
                      </TableCell>
                      <TableCell>{pump.flowRate} m³/h</TableCell>
                      <TableCell>{pump.head} m</TableCell>
                      <TableCell>{pump.power} kW</TableCell>
                      <TableCell>
                        {pump.price ? `¥${parseFloat(pump.price).toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(pump)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(pump.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加/编辑产品对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPump ? '编辑产品' : '添加产品'}
            </DialogTitle>
            <DialogDescription>
              {editingPump ? '修改产品信息' : '添加新的水泵产品'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* 产品图片 */}
            <div className="col-span-2">
              <Label htmlFor="image">产品图片</Label>
              <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                {formData.imageUrl ? (
                  <div className="relative">
                    <img
                      src={formData.imageUrl}
                      alt="产品图片"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    >
                      删除
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleImageUpload(file)
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="image"
                      className="cursor-pointer inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <div>点击上传图片</div>
                      <div className="text-xs text-gray-400">
                        支持 JPG、PNG、GIF 格式
                      </div>
                    </label>
                  </div>
                )}
                {uploading && (
                  <div className="mt-2 text-sm text-blue-600">
                    上传中...
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="model">型号 *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="例如: AMT750"
              />
            </div>

            <div>
              <Label htmlFor="name">产品名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例如: 自适应变频屏蔽泵"
              />
            </div>

            <div>
              <Label htmlFor="brand">品牌</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="pumpType">泵类型</Label>
              <Select
                value={formData.pumpType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, pumpType: value }))}
              >
                <SelectTrigger id="pumpType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="离心泵">离心泵</SelectItem>
                  <SelectItem value="屏蔽泵">屏蔽泵</SelectItem>
                  <SelectItem value="管道泵">管道泵</SelectItem>
                  <SelectItem value="变频泵">变频泵</SelectItem>
                  <SelectItem value="排污泵">排污泵</SelectItem>
                  <SelectItem value="潜水泵">潜水泵</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="material">材质</Label>
              <Input
                id="material"
                value={formData.material}
                onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="flowRate">流量 (m³/h) *</Label>
              <Input
                id="flowRate"
                type="number"
                step="0.1"
                value={formData.flowRate}
                onChange={(e) => setFormData(prev => ({ ...prev, flowRate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="head">扬程 (m) *</Label>
              <Input
                id="head"
                type="number"
                step="0.1"
                value={formData.head}
                onChange={(e) => setFormData(prev => ({ ...prev, head: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="power">功率 (kW) *</Label>
              <Input
                id="power"
                type="number"
                step="0.1"
                value={formData.power}
                onChange={(e) => setFormData(prev => ({ ...prev, power: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="maxFlow">最大流量 (m³/h)</Label>
              <Input
                id="maxFlow"
                type="number"
                step="0.1"
                value={formData.maxFlow}
                onChange={(e) => setFormData(prev => ({ ...prev, maxFlow: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="maxHead">最大扬程 (m)</Label>
              <Input
                id="maxHead"
                type="number"
                step="0.1"
                value={formData.maxHead}
                onChange={(e) => setFormData(prev => ({ ...prev, maxHead: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="efficiency">效率 (%)</Label>
              <Input
                id="efficiency"
                type="number"
                step="0.1"
                value={formData.efficiency}
                onChange={(e) => setFormData(prev => ({ ...prev, efficiency: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="price">价格 (元)</Label>
              <Input
                id="price"
                type="number"
                step="100"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="applicationType">应用场景</Label>
              <Select
                value={formData.applicationType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, applicationType: value }))}
              >
                <SelectTrigger id="applicationType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="供水系统">供水系统</SelectItem>
                  <SelectItem value="暖通空调">暖通空调</SelectItem>
                  <SelectItem value="污水处理">污水处理</SelectItem>
                  <SelectItem value="工业循环">工业循环</SelectItem>
                  <SelectItem value="消防供水">消防供水</SelectItem>
                  <SelectItem value="农田灌溉">农田灌溉</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">产品描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="输入产品描述..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
