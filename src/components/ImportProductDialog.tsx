'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ImportProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (products: any[]) => void
}

export function ImportProductDialog({ open, onOpenChange, onImport }: ImportProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseFile(selectedFile)
    }
  }

  const parseFile = async (file: File) => {
    setLoading(true)
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      setPreview(jsonData.slice(0, 10)) // 只显示前10条预览
    } catch (error) {
      console.error('解析文件失败:', error)
      alert('解析文件失败，请确保文件格式正确')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!file || preview.length === 0) return

    setLoading(true)
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // 转换数据格式
      const products = jsonData.map((row: any) => ({
        name: row['产品名称'] || row['name'] || '',
        category: row['分类'] || row['category'] || '变频水泵',
        description: row['描述'] || row['description'] || '',
        specifications: JSON.stringify({
          流量: row['流量'] || row['flow'] || '',
          扬程: row['扬程'] || row['head'] || '',
          功率: row['功率'] || row['power'] || '',
          效率: row['效率'] || row['efficiency'] || '',
          转速: row['转速'] || row['speed'] || '',
          进口直径: row['进口直径'] || row['inlet_diameter'] || '',
          出口直径: row['出口直径'] || row['outlet_diameter'] || '',
          最高温度: row['最高温度'] || row['max_temperature'] || '',
          最高压力: row['最高压力'] || row['max_pressure'] || '',
          最大固体颗粒: row['最大固体颗粒'] || row['max_solid_size'] || '',
        }),
        image_url: row['图片'] || row['image_url'] || null,
        featured: row['推荐'] || row['featured'] || false,
        display_order: 0,
      }))

      onImport(products)
      onOpenChange(false)
      setFile(null)
      setPreview([])
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        '产品名称': '示例产品',
        '分类': '变频水泵',
        '描述': '这是一个示例产品',
        '流量': '100',
        '扬程': '50',
        '功率': '15',
        '效率': '80',
        '转速': '2900',
        '进口直径': '100',
        '出口直径': '80',
        '最高温度': '80',
        '最高压力': '16',
        '图片': '',
        '推荐': 'false'
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(template)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '产品模板')
    XLSX.writeFile(workbook, '产品导入模板.xlsx')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>导入产品</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 文件上传 */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <FileSpreadsheet className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      选择文件
                    </span>
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  支持 .xlsx, .xls, .csv 格式
                </p>
              </div>
            </Label>
            {file && (
              <p className="mt-4 text-sm text-green-600">
                已选择: {file.name}
              </p>
            )}
          </div>

          {/* 下载模板 */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={downloadTemplate}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              下载导入模板
            </Button>
          </div>

          {/* 数据预览 */}
          {preview.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">数据预览（前10条）</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(preview[0]).map(key => (
                          <th key={key} className="px-4 py-2 text-left font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, index) => (
                        <tr key={index} className="border-t">
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2">
                              {String(value || '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                共 {preview.length} 条预览，将导入全部数据
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleImport} disabled={loading || !file}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            导入
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
