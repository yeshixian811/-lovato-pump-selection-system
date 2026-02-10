'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Edit, Plus, Upload, Download, ZoomIn, Menu, X } from 'lucide-react'
import { EditProductDialog } from '@/components/EditProductDialog'
import { ImportProductDialog } from '@/components/ImportProductDialog'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import dynamic from 'next/dynamic'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { usePathname } from 'next/navigation'

const PumpCurveChart = dynamic(() => import('@/components/pump-curve-chart'), {
  ssr: false,
  loading: () => <div className="h-16 flex items-center justify-center text-gray-400 text-xs">...</div>
})

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

export default function ProductsPage() {
  const pathname = usePathname()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [curveProduct, setCurveProduct] = useState<Product | null>(null)
  const [curveDialogOpen, setCurveDialogOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/website/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('获取产品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseSpecifications = (specs: string): Specs => {
    try {
      return JSON.parse(specs)
    } catch {
      return {}
    }
  }

  const filteredProducts = products

  const handleRowClick = (product: Product) => {
    setEditProduct(product)
    setEditDialogOpen(true)
  }

  const handleSave = () => {
    fetchProducts()
  }

  const handleImport = async (importedProducts: any[]) => {
    try {
      const res = await fetch('/api/website/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: importedProducts }),
      })

      if (res.ok) {
        fetchProducts()
      } else {
        alert('导入失败')
      }
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败')
    }
  }

  const generatePDF = (product: Product) => {
    const specs = parseSpecifications(product.specifications)
    const doc = new jsPDF()

    // 标题
    doc.setFontSize(20)
    doc.text('洛瓦托水泵选型系统', 105, 20, { align: 'center' })
    doc.setFontSize(16)
    doc.text('产品说明书', 105, 35, { align: 'center' })

    // 产品信息
    doc.setFontSize(14)
    doc.text('产品信息', 20, 55)

    const productInfo = [
      ['产品名称', product.name],
      ['分类', product.category],
      ['描述', product.description],
    ]

    const table1 = autoTable(doc, {
      startY: 60,
      head: [['项目', '内容']],
      body: productInfo,
      theme: 'grid',
    })

    // 性能参数
    doc.setFontSize(14)
    const lastY = (doc as any).lastAutoTable?.finalY || 90
    doc.text('性能参数', 20, lastY + 20)

    const performanceData = [
      ['流量 (m³/h)', specs['流量'] || '-'],
      ['扬程 (m)', specs['扬程'] || '-'],
      ['功率 (kW)', specs['功率'] || '-'],
      ['效率 (%)', specs['效率'] || '-'],
      ['转速', specs['转速'] || '-'],
      ['进口直径 (mm)', specs['进口直径'] || '-'],
      ['出口直径 (mm)', specs['出口直径'] || '-'],
      ['最高温度 (°C)', specs['最高温度'] || '-'],
      ['最高压力 (bar)', specs['最高压力'] || '-'],
    ]

    autoTable(doc, {
      startY: lastY + 25,
      head: [['参数', '数值']],
      body: performanceData,
      theme: 'grid',
    })

    // 页脚
    const pageCount = doc.getNumberOfPages()
    doc.setFontSize(10)
    doc.text(
      `洛瓦托水泵选型系统 - 第 ${pageCount} 页`,
      105,
      280,
      { align: 'center' }
    )

    // 下载PDF
    doc.save(`${product.name}_产品说明书.pdf`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Slogan */}
            <a href="/" className="flex items-end gap-3">
              <img
                src="/luwatto-logo.png"
                alt="洛瓦托LOGO"
                className="h-8 w-auto"
              />
              <span className="text-gray-900 font-medium text-sm hidden sm:block">
                精准输配 冷暖随心
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <a
                href="/selection"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              >
                智能选型
              </a>
              <a
                href="/products"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 bg-blue-100 text-blue-600"
              >
                产品库
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-gray-200">
              <a
                href="/selection"
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  pathname === '/selection' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                智能选型
              </a>
              <a
                href="/products"
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  pathname === '/products' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                产品库
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 py-2 flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold text-gray-900 mb-0">产品库</h1>
              <p className="text-xs text-gray-600">水泵产品性能曲线参数列表</p>
            </div>
            <div>
              <Button onClick={() => {
                setEditProduct(null)
                setEditDialogOpen(true)
              }}>
                <Plus className="mr-2 h-4 w-4" />
                添加产品
              </Button>
              <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                导入产品
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex-1 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              暂无产品
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full">
            <CardContent className="p-0 h-full overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-[80px]">图片</TableHead>
                    <TableHead className="w-[150px]">产品名称</TableHead>
                    <TableHead className="w-[100px]">分类</TableHead>
                    <TableHead className="w-[100px]">流量 (m³/h)</TableHead>
                    <TableHead className="w-[100px]">扬程 (m)</TableHead>
                    <TableHead className="w-[100px]">功率 (kW)</TableHead>
                    <TableHead className="w-[120px]">性能曲线</TableHead>
                    <TableHead className="w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProducts.map((product) => {
                      const specs = parseSpecifications(product.specifications)
                      return (
                        <TableRow
                          key={product.id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell>
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-gray-400 text-xs">无图片</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span>{product.name}</span>
                              {product.featured && <span className="text-yellow-500">★</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {product.category}
                            </span>
                          </TableCell>
                          <TableCell>{specs['流量'] || '-'}</TableCell>
                          <TableCell>{specs['扬程'] || '-'}</TableCell>
                          <TableCell>{specs['功率'] || '-'}</TableCell>
                          <TableCell>
                            {specs['流量'] && specs['扬程'] ? (
                              <div
                                className="flex items-center justify-center gap-3 cursor-pointer hover:text-blue-600 transition-colors text-gray-600"
                                onClick={() => {
                                  setCurveProduct(product)
                                  setCurveDialogOpen(true)
                                }}
                              >
                                {/* 性能曲线图标 */}
                                <div className="flex flex-col items-center gap-1">
                                  <svg
                                    width="60"
                                    height="40"
                                    viewBox="0 0 60 40"
                                    className="border border-gray-200 rounded bg-gray-50"
                                  >
                                    <path
                                      d="M 5 35 Q 15 35, 20 20 Q 25 5, 35 8 Q 45 11, 55 12"
                                      fill="none"
                                      stroke="#3b82f6"
                                      strokeWidth="2"
                                    />
                                    <line x1="5" y1="5" x2="5" y2="35" stroke="#9ca3af" strokeWidth="1" />
                                    <line x1="5" y1="35" x2="55" y2="35" stroke="#9ca3af" strokeWidth="1" />
                                  </svg>
                                  <span className="text-xs text-gray-500">查看曲线</span>
                                </div>
                                <ZoomIn className="h-4 w-4 text-gray-400" />
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRowClick(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => generatePDF(product)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <EditProductDialog
        product={editProduct}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSave}
      />
      <ImportProductDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
      />
      <Dialog open={curveDialogOpen} onOpenChange={setCurveDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {curveProduct?.name} - 性能曲线
            </DialogTitle>
          </DialogHeader>
          {curveProduct && (
            <div className="py-4">
              <PumpCurveChart
                pumpFlow={parseSpecifications(curveProduct.specifications)['流量'] || ''}
                pumpHead={parseSpecifications(curveProduct.specifications)['扬程'] || ''}
                userFlow={null}
                userHead={null}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
