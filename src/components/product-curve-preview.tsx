"use client"

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceDot } from "recharts"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"

// 定义一个通用的 Pump 接口，兼容产品库管理页面的 Pump 类型
interface Pump {
  id: string
  flowRate: string | number
  head: string | number
  max_flow_rate?: number
  max_head?: number
  performance_curve?: Array<{
    flowRate: number
    head: number
  }>
}

interface ProductCurvePreviewProps {
  pump: Pump
}

export default function ProductCurvePreview({ pump }: ProductCurvePreviewProps) {
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [displayMaxFlow, setDisplayMaxFlow] = useState<number>(0)
  const [displayMaxHead, setDisplayMaxHead] = useState<number>(0)

  // 解析最大流量和最大扬程
  // 优先使用 flowRate 和 head 字段（实际最大值），忽略废弃的 maxFlow 和 maxHead 字段
  const maxFlowRate = typeof pump.flowRate === 'number' ? pump.flowRate : parseFloat(pump.flowRate || '0')
  const maxHead = typeof pump.head === 'number' ? pump.head : parseFloat(pump.head || '0')

  useEffect(() => {
    // 优先使用产品库中的真实性能曲线数据
    if (pump.performance_curve && pump.performance_curve.length > 0) {
      const formattedData = pump.performance_curve.map(point => ({
        flowRate: point.flowRate,
        head: point.head,
      }))
      setPerformanceData(formattedData)

      // 根据真实数据更新显示范围（严格对应实际值）
      const maxFlow = Math.max(...formattedData.map(d => d.flowRate))
      const maxHead = Math.max(...formattedData.map(d => d.head))
      setDisplayMaxFlow(maxFlow)
      setDisplayMaxHead(maxHead) // 使用实际数据中的最大扬程
      setLoading(false)
    } else {
      // 如果没有性能曲线数据，生成模拟数据
      const mockData = generateMockPerformanceData(maxFlowRate, maxHead)
      setPerformanceData(mockData)
      setDisplayMaxFlow(maxFlowRate)
      setDisplayMaxHead(maxHead) // 使用实际的最大扬程
      setLoading(false)
    }
  }, [pump, maxFlowRate, maxHead])

  // 生成模拟性能曲线数据
  const generateMockPerformanceData = (flow: number, head: number) => {
    const data: any[] = []
    const maxFlow = flow
    const maxHead = head
    const step = maxFlow / 20

    // 首先添加起点（Q=0, H=maxHead）
    data.push({
      flowRate: 0,
      head: parseFloat(maxHead.toFixed(1)),
    })

    // 然后生成其他点
    for (let i = 1; i <= 20; i++) {
      const currentFlow = Math.round(i * step * 10) / 10
      const k = maxHead / (maxFlow * maxFlow)
      const currentHead = maxHead - k * currentFlow * currentFlow
      if (currentHead > 0) {
        data.push({
          flowRate: currentFlow,
          head: parseFloat(currentHead.toFixed(1)),
        })
      }
    }

    return data
  }

  if (loading) {
    return <Button variant="ghost" size="sm" disabled>加载中...</Button>
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
          <TrendingUp className="w-4 h-4 mr-1" />
          查看性能曲线
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px]" align="end" side="top">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">H-Q 性能曲线</h4>
            <div className="text-xs text-gray-500">
              最大流量: {displayMaxFlow.toFixed(1)} m³/h | 最大扬程: {displayMaxHead.toFixed(1)} m
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={performanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="flowRate"
                  label={{ value: "流量 (m³/h)", position: "insideBottom", offset: -5 }}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => Number(value).toFixed(1)}
                />
                <YAxis
                  label={{ value: "扬程 (m)", angle: -90, position: "insideLeft" }}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => Number(value).toFixed(1)}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [Number(value).toFixed(1), name === "head" ? "扬程 (m)" : name]}
                  labelFormatter={(label) => `流量: ${Number(label).toFixed(1)} m³/h`}
                />
                <Legend />

                {/* 水泵 Q-H 曲线 */}
                <Line
                  type="monotone"
                  dataKey="head"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  name="性能曲线"
                />

                {/* 最大流量参考线 */}
                <ReferenceLine
                  x={displayMaxFlow}
                  stroke="#16a34a"
                  strokeWidth={1}
                  label={{ value: "最大流量", position: "top", fontSize: 10, fill: "#16a34a" }}
                />

                {/* 最大扬程参考线 */}
                <ReferenceLine
                  y={displayMaxHead}
                  stroke="#16a34a"
                  strokeWidth={1}
                  label={{ value: "最大扬程", position: "right", fontSize: 10, fill: "#16a34a" }}
                />

                {/* 最大点标记 */}
                <ReferenceDot
                  x={displayMaxFlow}
                  y={0}
                  r={4}
                  fill="#16a34a"
                  stroke="white"
                  strokeWidth={1}
                  label={{ value: "最大点", position: "top", offset: 5, fontSize: 10, fill: "#16a34a" }}
                  isFront={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-gray-500 text-center">
            * 曲线基于产品的最大流量和最大扬程参数生成
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
