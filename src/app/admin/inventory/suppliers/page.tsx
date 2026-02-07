"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  Phone,
  Mail,
  MapPin,
  Building2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Supplier {
  id: number
  code: string
  name: string
  contact_person: string
  phone: string
  email: string
  address: string
  status: string
  created_at: string
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    status: 'active'
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/inventory/suppliers')
      const result = await response.json()
      if (result.success) {
        setSuppliers(result.data)
      }
    } catch (error) {
      console.error('获取供应商失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/inventory/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const result = await response.json()
      if (result.success) {
        setShowCreateDialog(false)
        resetForm()
        fetchSuppliers()
      }
    } catch (error) {
      console.error('创建供应商失败:', error)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplier) return
    
    try {
      const response = await fetch(`/api/inventory/suppliers/${selectedSupplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const result = await response.json()
      if (result.success) {
        setShowEditDialog(false)
        setSelectedSupplier(null)
        resetForm()
        fetchSuppliers()
      }
    } catch (error) {
      console.error('更新供应商失败:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此供应商吗？')) return
    
    try {
      const response = await fetch(`/api/inventory/suppliers/${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.success) {
        fetchSuppliers()
      }
    } catch (error) {
      console.error('删除供应商失败:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      status: 'active'
    })
  }

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setFormData({
      code: supplier.code,
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      status: supplier.status
    })
    setShowEditDialog(true)
  }

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            供应商管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理供应商信息，建立采购合作关系
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加供应商
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加供应商</DialogTitle>
              <DialogDescription>
                填写供应商基本信息
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>供应商编码 *</Label>
                <Input
                  placeholder="例如: SUP001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>供应商名称 *</Label>
                <Input
                  placeholder="输入供应商名称"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>联系人</Label>
                <Input
                  placeholder="输入联系人姓名"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>联系电话</Label>
                <Input
                  placeholder="输入联系电话"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>邮箱</Label>
                <Input
                  type="email"
                  placeholder="输入邮箱地址"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>地址</Label>
                <Input
                  placeholder="输入地址"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索供应商..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                供应商总数
              </CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                启用中
              </CardTitle>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {suppliers.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                已停用
              </CardTitle>
              <Badge className="bg-red-100 text-red-800">Inactive</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {suppliers.filter(s => s.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Grid */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无供应商数据</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuppliers.map((supplier) => (
                <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{supplier.code}</Badge>
                          <Badge className={
                            supplier.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }>
                            {supplier.status === 'active' ? '启用' : '停用'}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {supplier.contact_person && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-4 w-4" />
                        {supplier.contact_person}
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {supplier.phone}
                      </div>
                    )}
                    {supplier.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {supplier.email}
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span className="line-clamp-2">{supplier.address}</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditDialog(supplier)}>
                        <Edit className="h-4 w-4 mr-1" />
                        编辑
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(supplier.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑供应商</DialogTitle>
            <DialogDescription>
              修改供应商信息
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>供应商名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>联系人</Label>
              <Input
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>联系电话</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>邮箱</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>地址</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">启用</option>
                <option value="inactive">停用</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
