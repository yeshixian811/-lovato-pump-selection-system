"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus,
  Trash2,
  Search,
  ShoppingBag,
  Package,
  DollarSign,
  Calendar,
  ArrowUp,
  Check,
  X,
  Eye,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Supplier {
  id: number
  code: string
  name: string
  contact_person: string
  phone: string
}

interface PurchaseOrder {
  id: number
  order_no: string
  supplier_id: number
  supplier_name: string
  order_date: string
  total_amount: number
  status: string
  remark: string
  created_at: string
}

interface OrderItem {
  product_id: number
  product_code: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export default function PurchaseManagementPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  
  // 表单状态
  const [formData, setFormData] = useState({
    supplier_id: '',
    remark: '',
  })
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [newItem, setNewItem] = useState<OrderItem>({
    product_id: 0,
    product_code: '',
    product_name: '',
    quantity: 1,
    unit_price: 0,
    total_price: 0,
  })

  useEffect(() => {
    fetchOrders()
    fetchSuppliers()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/inventory/purchase')
      const result = await response.json()
      if (result.success) {
        setOrders(result.data)
      }
    } catch (error) {
      console.error('获取采购订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/inventory/suppliers?status=active')
      const result = await response.json()
      if (result.success) {
        setSuppliers(result.data)
      }
    } catch (error) {
      console.error('获取供应商失败:', error)
    }
  }

  const handleAddItem = () => {
    if (newItem.product_name && newItem.quantity > 0 && newItem.unit_price > 0) {
      setOrderItems([...orderItems, {
        ...newItem,
        total_price: newItem.quantity * newItem.unit_price
      }])
      setNewItem({
        product_id: 0,
        product_code: '',
        product_name: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      })
    }
  }

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/inventory/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: formData.supplier_id,
          items: orderItems,
          remark: formData.remark,
        })
      })
      const result = await response.json()
      if (result.success) {
        setShowCreateDialog(false)
        setFormData({ supplier_id: '', remark: '' })
        setOrderItems([])
        fetchOrders()
      }
    } catch (error) {
      console.error('创建采购订单失败:', error)
    }
  }

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      // 这里需要实现更新状态的API
      console.log('更新订单状态:', orderId, status)
    } catch (error) {
      console.error('更新状态失败:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: '待处理' },
      processing: { color: 'bg-blue-100 text-blue-800', label: '处理中' },
      completed: { color: 'bg-green-100 text-green-800', label: '已完成' },
      cancelled: { color: 'bg-red-100 text-red-800', label: '已取消' },
    }
    const statusInfo = statusMap[status] || statusMap.pending
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + item.total_price, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            采购管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理采购订单，跟踪供应商采购流程
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              创建采购订单
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>创建采购订单</DialogTitle>
              <DialogDescription>
                填写采购订单信息，选择供应商和产品
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* 供应商选择 */}
              <div className="space-y-2">
                <Label>供应商 *</Label>
                <Select value={formData.supplier_id} onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择供应商" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name} ({supplier.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 订单明细 */}
              <div className="space-y-2">
                <Label>订单明细 *</Label>
                <div className="border rounded-lg p-4 space-y-3">
                  {/* 添加产品 */}
                  <div className="grid grid-cols-4 gap-2">
                    <Input
                      placeholder="产品编码"
                      value={newItem.product_code}
                      onChange={(e) => setNewItem({ ...newItem, product_code: e.target.value })}
                    />
                    <Input
                      placeholder="产品名称"
                      value={newItem.product_name}
                      onChange={(e) => setNewItem({ ...newItem, product_name: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="数量"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      placeholder="单价"
                      value={newItem.unit_price}
                      onChange={(e) => setNewItem({ ...newItem, unit_price: Number(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handleAddItem} className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    添加产品
                  </Button>

                  {/* 已添加的产品列表 */}
                  {orderItems.length > 0 && (
                    <div className="space-y-2">
                      {orderItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <span className="font-medium">{item.product_name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              数量: {item.quantity} × 单价: ¥{item.unit_price}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">¥{item.total_price.toFixed(2)}</span>
                            <Button size="sm" variant="ghost" onClick={() => handleRemoveItem(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 总金额 */}
                  {orderItems.length > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium">总金额:</span>
                      <span className="text-xl font-bold text-blue-600">¥{totalAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 备注 */}
              <div className="space-y-2">
                <Label>备注</Label>
                <Textarea
                  placeholder="输入备注信息..."
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.supplier_id || orderItems.length === 0}>
                创建订单
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                订单总数
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                待处理
              </CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                进行中
              </CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'processing').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                已完成
              </CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>采购订单列表</CardTitle>
          <CardDescription>
            查看和管理所有采购订单
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">订单号</th>
                  <th className="text-left p-4 font-medium">供应商</th>
                  <th className="text-left p-4 font-medium">订单日期</th>
                  <th className="text-left p-4 font-medium">总金额</th>
                  <th className="text-left p-4 font-medium">状态</th>
                  <th className="text-left p-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8">
                      加载中...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8">
                      暂无采购订单
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="p-4">
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {order.order_no}
                        </code>
                      </td>
                      <td className="p-4">{order.supplier_name}</td>
                      <td className="p-4">{order.order_date}</td>
                      <td className="p-4 font-bold">¥{order.total_amount.toFixed(2)}</td>
                      <td className="p-4">{getStatusBadge(order.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                          {order.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateStatus(order.id, 'processing')}
                              >
                                <ArrowUp className="h-4 w-4 mr-1" />
                                处理
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                取消
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
