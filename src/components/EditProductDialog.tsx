'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Upload } from 'lucide-react'
import dynamic from 'next/dynamic'

const PumpCurveChart = dynamic(() => import('./pump-curve-chart'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">加载图表...</div>
})

interface Specs {
  流量?: string
  扬程?: string
  功率?: string
  效率?: string
  转速?: string
  进口直径?: string
  出口直径?: string
  最高温度?: string
  最高压力?: string
  最大固体颗粒?: string
  [key: string]: any
}

interface Product {
  id: number
  name: string
  category: string
  description: string
  specifications: string
  image_url: string | null
  featured: boolean
  display_order: number
}

interface EditProductDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function EditProductDialog({ product, open, onOpenChange, onSave }: EditProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    specifications: {} as Specs,
    image_url: '',
    featured: false,
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const categories = ['变频水泵', '离心泵', '消防泵', '供水设备']

  useEffect(() => {
    if (product) {
      try {
        const specs = JSON.parse(product.specifications)
        setFormData({
          name: product.name,
          category: product.category,
          description: product.description,
          specifications: specs,
          image_url: product.image_url || '',
          featured: product.featured,
        })
        setImagePreview(product.image_url || '')
      } catch {
        setFormData({
          name: product.name,
          category: product.category,
          description: product.description,
          specifications: {},
          image_url: product.image_url || '',
          featured: product.featured,
        })
      }
    }
  }, [product])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSpecChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }))
  }

  const handleSave = async () => {
    if (!product) return

    setLoading(true)
    try {
      // 上传图片（如果有）
      let imageUrl = formData.image_url
      if (imageFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', imageFile)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          imageUrl = uploadData.url
        }
      }

      // 保存产品数据
      const res = await fetch(`/api/website/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          specifications: JSON.stringify(formData.specifications),
          image_url: imageUrl,
          featured: formData.featured,
        }),
      })

      if (res.ok) {
        onSave()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑产品</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">产品名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入产品名称"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">分类 *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述 *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="请输入产品描述"
              rows={3}
            />
          </div>

          {/* 性能参数 */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">性能参数</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flow">流量 (m³/h)</Label>
                <Input
                  id="flow"
                  value={formData.specifications['流量'] || ''}
                  onChange={(e) => handleSpecChange('流量', e.target.value)}
                  placeholder="例如: 100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="head">扬程 (m)</Label>
                <Input
                  id="head"
                  value={formData.specifications['扬程'] || ''}
                  onChange={(e) => handleSpecChange('扬程', e.target.value)}
                  placeholder="例如: 50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="power">功率 (kW)</Label>
                <Input
                  id="power"
                  value={formData.specifications['功率'] || ''}
                  onChange={(e) => handleSpecChange('功率', e.target.value)}
                  placeholder="例如: 15"
                />
              </div>


            </div>
          </div>

          {/* 性能曲线图表 */}
          {(formData.specifications['流量'] && formData.specifications['扬程']) && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">性能曲线预览</h3>
              <PumpCurveChart
                pumpFlow={formData.specifications['流量']}
                pumpHead={formData.specifications['扬程']}
                userFlow={null}
                userHead={null}
              />
            </div>
          )}

          {/* 图片上传 */}
          <div className="space-y-2">
            <Label>产品图片</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              {imagePreview ? (
                <div className="space-y-4">
                  <img src={imagePreview} alt="预览" className="w-full h-48 object-cover rounded" />
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <Button variant="outline" className="w-full" asChild>
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          更换图片
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        上传图片
                      </span>
                    </Button>
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* 其他设置 */}
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
            />
            <Label htmlFor="featured">推荐产品</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
