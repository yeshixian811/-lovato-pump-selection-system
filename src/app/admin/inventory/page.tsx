"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Search,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Edit,
  RefreshCw,
  Warehouse,
  Box,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface InventoryItem {
  id: number
  product_id: number
  product_code: string
  product_name: string
  quantity: number
  unit: string
  warehouse: string
  min_stock: number
  max_stock: number
}

export default function InventoryManagementPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    const filtered = inventory.filter(item =>
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredInventory(filtered)
  }, [searchTerm, inventory])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory/stock')
      const result = await response.json()
      if (result.success) {
        setInventory(result.data)
      }
    } catch (error) {
      console.error('获取库存失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStock = async (item: InventoryItem) => {
    try {
      const response = await fetch('/api/inventory/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          quantity: item.quantity,
          unit: item.unit,
          warehouse: item.warehouse,
          min_stock: item.min_stock,
          max_stock: item.max_stock
        })
      })
      const result = await response.json()
      if (result.success) {
        setEditingItem(null)
        fetchInventory()
      }
    } catch (error) {
      console.error('更新库存失败:', error)
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= item.min_stock) {
      return { label: '库存不足', color: 'bg-red-100 text-red-800' }
    } else if (item.max_stock && item.quantity >= item.max_stock) {
      return { label: '库存过多', color: 'bg-yellow-100 text-yellow-800' }
    }
    return { label: '正常', color: 'bg-green-100 text-green-800' }
  }

  const stats = {
    total: inventory.length,
    lowStock: inventory.filter(i => i.quantity <= i.min_stock).length,
    highStock: inventory.filter(i => i.max_stock && i.quantity >= i.max_stock).length,
    totalQuantity: inventory.reduce((sum, i) => sum + Number(i.quantity), 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            库存管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            实时监控产品库存，管理仓库进出
          </p>
        </div>
        <Button onClick={fetchInventory}>
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                产品总数
              </CardTitle>
              <Box className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                库存不足
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                库存过多
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.highStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                库存总量
              </CardTitle>
              <Warehouse className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuantity.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>库存列表</CardTitle>
          <CardDescription>
            查看和管理所有产品的库存信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索产品名称或编码..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">产品编码</th>
                  <th className="text-left p-4 font-medium">产品名称</th>
                  <th className="text-left p-4 font-medium">仓库</th>
                  <th className="text-left p-4 font-medium">当前库存</th>
                  <th className="text-left p-4 font-medium">最小库存</th>
                  <th className="text-left p-4 font-medium">最大库存</th>
                  <th className="text-left p-4 font-medium">状态</th>
                  <th className="text-left p-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8">
                      加载中...
                    </td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8">
                      暂无库存数据
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-4">
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {item.product_code}
                        </code>
                      </td>
                      <td className="p-4 font-medium">{item.product_name}</td>
                      <td className="p-4">{item.warehouse || '-'}</td>
                      <td className="p-4">
                        {editingItem?.id === item.id ? (
                          <Input
                            type="number"
                            value={editingItem.quantity}
                            onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                            className="w-24"
                          />
                        ) : (
                          <span className="font-bold">{item.quantity}</span>
                        )}
                      </td>
                      <td className="p-4">{item.min_stock}</td>
                      <td className="p-4">{item.max_stock || '-'}</td>
                      <td className="p-4">
                        <Badge className={getStockStatus(item).color}>
                          {getStockStatus(item).label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {editingItem?.id === item.id ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleUpdateStock(editingItem)}>
                              保存
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                              取消
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setEditingItem(item)}>
                            <Edit className="h-4 w-4 mr-1" />
                            调整
                          </Button>
                        )}
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
