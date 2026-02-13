'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
 Tooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from "@/components/ui/tooltip";
import Navigation from '@/components/navigation';
import { ArrowLeft, Search, CheckCircle2, XCircle, Loader2, Info, Zap, Droplet, Gauge } from 'lucide-react';
import Link from 'next/link';
import { WechatShareConfig } from '@/components/wechat/initializer';
import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip as RechartsTooltip,
 ResponsiveContainer,
 ReferenceLine,
 ReferenceArea,
 ReferenceDot,
 Legend,
 Scatter,
 ScatterChart,
 ZAxis
} from 'recharts';

// 类型定义
interface Pump {
 id: number;
 model: string;
 name: string;
 brand: string;
 type: string;
 series: string;
 description: string;
 max_flow_rate: number; // 实际最大流量
 min_flow_rate: number; // 最小流量（工作范围下限）
 max_head: number; // 实际最大扬程
 min_head: number; // 最小扬程（工作范围下限）
 rated_power: number; // 额定功率
 rated_speed: number; // 额定转速
 efficiency: number;
 voltage: string;
 frequency: number;
 current: number;
 power_factor: number;
 inlet_diameter: number;
 outlet_diameter: number;
 weight: number;
 dimensions: string;
 casing_material: string;
 impeller_material: string;
 seal_type: string;
 protection_level: string;
 insulation_class: string;
 applications: string[];
 fluid_types: string[];
 max_temperature: number;
 min_temperature: number;
 max_viscosity: number;
 price: number | null;
 currency: string | null;
 in_stock: boolean;
 stock_quantity: number;
 image_url: string;
 spec_sheet_url: string;
 manual_url: string;
 match_score: number;
 performance_curve?: Array<{
 flowRate: number;
 head: number;
 power?: number;
 efficiency?: number;
 }>;
}

interface SelectionParams {
 required_flow_rate: number;
 required_head: number;
 application_type: string;
 fluid_type: string;
 pump_type: string;
}

// 性能曲线组件
interface PumpPerformanceCurveProps {
 pump: Pump;
 requiredFlowRate: number;
 requiredHead: number;
}

function PumpPerformanceCurve({ pump, requiredFlowRate, requiredHead }: PumpPerformanceCurveProps) {
 const [performanceData, setPerformanceData] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [zoomLevel, setZoomLevel] = useState<number>(1);
 const [displayMaxFlow, setDisplayMaxFlow] = useState<number>(0);
 const [displayMaxHead, setDisplayMaxHead] = useState<number>(0);

 useEffect(() => {
 // 优先使用产品库中的真实性能曲线数据
 if (pump.performance_curve && pump.performance_curve.length > 0) {
 // 转换数据格式
 const formattedData = pump.performance_curve.map(point => ({
 flowRate: point.flowRate,
 head: point.head,
 }));
 setPerformanceData(formattedData);
 
 // 根据真实数据更新显示范围（严格对应实际值）
 const maxFlow = Math.max(...formattedData.map(d => d.flowRate));
 const maxHead = Math.max(...formattedData.map(d => d.head));
 setDisplayMaxFlow(maxFlow); // 严格对应实际值
 setDisplayMaxHead(maxHead);
 setZoomLevel(1);
 setLoading(false);
 } else {
 // 如果没有性能曲线数据，生成模拟数据
 const mockData = generateMockPerformanceData(pump.max_flow_rate, pump.max_head);
 setPerformanceData(mockData);
 setDisplayMaxFlow(pump.max_flow_rate);
 setDisplayMaxHead(pump.max_head);
 setLoading(false);
 }
 }, [pump]);

 // 处理鼠标滚轮缩放
 const handleWheel = (event: React.WheelEvent) => {
 event.preventDefault();
 event.stopPropagation();
 
 const zoomFactor = 0.1;
 const direction = event.deltaY > 0 ? 1 : -1; // 向下滚放大，向上滚缩小
 
 const newZoomLevel = Math.max(0.5, Math.min(5, zoomLevel + direction * zoomFactor));
 setZoomLevel(newZoomLevel);
 
 // 根据缩放级别调整显示范围
 const scale = 1 / newZoomLevel;
 const currentMaxFlow = Math.max(...performanceData.map(d => d.flowRate));
 const currentMaxHead = Math.max(...performanceData.map(d => d.head));
 setDisplayMaxFlow(currentMaxFlow * scale);
 setDisplayMaxHead(currentMaxHead * scale);
 };

 // 鼠标进入图表区域，锁定页面滚动
 const handleMouseEnter = () => {
 document.body.style.overflow = 'hidden';
 };

 // 鼠标离开图表区域，解锁页面滚动
 const handleMouseLeave = () => {
 document.body.style.overflow = '';
 };

 // 重置缩放
 const handleResetZoom = () => {
 const currentMaxFlow = Math.max(...performanceData.map(d => d.flowRate));
 const currentMaxHead = Math.max(...performanceData.map(d => d.head));
 setZoomLevel(1);
 setDisplayMaxFlow(currentMaxFlow);
 setDisplayMaxHead(currentMaxHead);
 };

 // 生成模拟性能曲线数据
 const generateMockPerformanceData = (flow: number, head: number) => {
 const data: any[] = [];
 const maxFlow = flow; // 严格对应实际最大流量
 const maxHead = head; // 严格对应实际最大扬程
 const step = maxFlow / 20;

 // 首先添加起点（Q=0, H=maxHead）
 data.push({
 flowRate: 0,
 head: parseFloat(maxHead.toFixed(1)),
 });

 // 然后生成其他点
 for (let i = 1; i <= 20; i++) {
 const currentFlow = Math.round(i * step * 10) / 10;
 // 使用二次曲线模型：H = shutOffHead - k * Q^2
 // 当 Q = maxFlow 时，H = 0
 const k = maxHead / (maxFlow * maxFlow);
 const currentHead = maxHead - k * currentFlow * currentFlow;
 if (currentHead > 0) {
 data.push({
  flowRate: currentFlow,
  head: Math.round(currentHead * 10) / 10,
 });
 }
 }

 return data;
 };

 // 计算需求流量在性能曲线上的扬程（插值）
 const calculateIntersectionHead = (flow: number, data: any[]): number => {
 if (data.length === 0) return 0;
 
 // 找到包含需求流量的两点
 for (let i = 0; i < data.length - 1; i++) {
 const p1 = data[i];
 const p2 = data[i + 1];
 
 if (flow >= p1.flowRate && flow <= p2.flowRate) {
 // 线性插值
 const ratio = (flow - p1.flowRate) / (p2.flowRate - p1.flowRate);
 return p1.head + ratio * (p2.head - p1.head);
 }
 }
 
 // 如果超出范围，返回最近点的扬程
 if (flow < data[0].flowRate) return data[0].head;
 return data[data.length - 1].head;
 };

 // 获取交叉点数据
 const intersectionHead = calculateIntersectionHead(requiredFlowRate, performanceData);
 const flowError = requiredFlowRate > 0 ? ((performanceData.length > 0 ? (requiredFlowRate / Math.max(...performanceData.map(d => d.flowRate))) * 100 : 0) - 100) : 0;
 const headError = requiredHead > 0 ? ((intersectionHead / requiredHead) * 100) - 100 : 0;

 if (loading) {
 return (
 <div className="flex items-center justify-center h-full">
 <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
 </div>
 );
 }

 return (
 <div 
 className="relative w-full h-full" 
 onWheel={handleWheel}
 onMouseEnter={handleMouseEnter}
 onMouseLeave={handleMouseLeave}
 >
 {/* 重置按钮 */}
 {zoomLevel !== 1 && (
 <button
  onClick={handleResetZoom}
  className="absolute top-2 right-2 z-10 px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
 >
  重置缩放 ({(zoomLevel * 100).toFixed(0)}%)
 </button>
 )}
 
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={performanceData} margin={{ top: 0, right: 0, left: 10, bottom: 10 }}>
  <CartesianGrid strokeDasharray="3 3" vertical={false} />
  <XAxis
  dataKey="flowRate"
  type="number"
  domain={[0, displayMaxFlow]}
  ticks={[0, displayMaxFlow * 0.25, displayMaxFlow * 0.5, displayMaxFlow * 0.75, displayMaxFlow].filter(t => t <= displayMaxFlow && t >= 0)}
  tick={{ fontSize: 10 }}
  tickFormatter={(value: any) => {
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(numValue) ? value : numValue.toFixed(1);
  }}
  label={{ value: '流量 (m³/h)', position: 'insideBottom', offset: -5, fontSize: 10 }}
  />
  <YAxis
  dataKey="head"
  domain={[0, displayMaxHead]}
  ticks={[0, displayMaxHead * 0.25, displayMaxHead * 0.5, displayMaxHead * 0.75, displayMaxHead].filter(t => t <= displayMaxHead && t >= 0)}
  tick={{ fontSize: 10 }}
  tickFormatter={(value: any) => {
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(numValue) ? value : numValue.toFixed(1);
  }}
  label={{ value: '扬程 (m)', angle: -90, position: 'insideLeft', offset: -5, fontSize: 10 }}
  />
  <RechartsTooltip
  formatter={(value: any, name: string) => {
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  return [isNaN(numValue) ? value : numValue.toFixed(1), name === 'flowRate' ? '流量 (m³/h)' : '扬程 (m)'];
  }}
  labelFormatter={(label) => {
  const numValue = typeof label === 'number' ? label : parseFloat(label);
  return `流量: ${isNaN(numValue) ? label : numValue.toFixed(1)} m³/h`;
  }}
  />
  <Legend wrapperStyle={{ fontSize: '10px' }} />
  <Line
  type="monotone"
  dataKey="head"
  stroke="#2563eb"
  strokeWidth={1}
  dot={{ r: 1 }}
  activeDot={{ r: 3 }}
  name="性能曲线"
  isAnimationActive={false}
  />
  {/* 用户需求点 - 使用实线参考线 */}
  <ReferenceLine
  x={Number(requiredFlowRate)}
  stroke="#ef4444"
  strokeWidth={1}
  label="需求点"
  />
  <ReferenceLine
  y={Number(requiredHead)}
  stroke="#ef4444"
  strokeWidth={1}
  />
  {/* 产品最高扬程和最大流量 - 蓝色参考线 */}
  <ReferenceLine
  x={Number(pump.max_flow_rate)}
  stroke="#2563eb"
  strokeWidth={1}
  label="最大流量"
  />
  <ReferenceLine
  y={Number(pump.max_head)}
  stroke="#2563eb"
  strokeWidth={1}
  label="最高扬程"
  />
  
  {/* 交叉点标记 - 重点显示 */}
  <ReferenceDot
  x={Number(requiredFlowRate)}
  y={Number(intersectionHead)}
  r={6}
  fill="#ef4444"
  stroke="#ffffff"
  strokeWidth={2}
  isFront
  />
  
  {/* 需求点标记 */}
  <ReferenceDot
  x={Number(requiredFlowRate)}
  y={Number(requiredHead)}
  r={4}
  fill="#f97316"
  stroke="#ffffff"
  strokeWidth={1}
  isFront
  />
 </LineChart>
 </ResponsiveContainer>
 
 {/* 交叉点信息显示 */}
 <div className="absolute top-2 left-2 z-10 bg-white dark:bg-gray-800 border-2 border-red-500 rounded-lg p-3 text-xs shadow-lg max-w-[180px]">
 <div className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1">
  <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-white inline-block"></span>
  工作点
 </div>
 <div className="space-y-1 text-gray-700 dark:text-gray-300">
  <div className="flex justify-between">
  <span>流量:</span>
  <span className="font-semibold">{requiredFlowRate.toFixed(1)} m³/h</span>
  </div>
  <div className="flex justify-between">
  <span>扬程:</span>
  <span className="font-semibold">{intersectionHead.toFixed(1)} m</span>
  </div>
  <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
  <div className="flex justify-between">
  <span>需求:</span>
  <span className="font-semibold text-orange-600 dark:text-orange-400">{requiredHead.toFixed(1)} m</span>
  </div>
  <div className="flex justify-between">
  <span>误差:</span>
  <span className={`font-semibold ${headError >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
  {headError >= 0 ? '+' : ''}{headError.toFixed(1)}%
  </span>
  </div>
  </div>
 </div>
 </div>
 </div>
 );
}

const APPLICATION_TYPES = [
 { value: '暖通空调', label: '暖通空调' },
 { value: '供水系统', label: '供水系统' },
 { value: '排水系统', label: '排水系统' },
 { value: '农田灌溉', label: '农田灌溉' },
 { value: '工业循环', label: '工业循环' },
 { value: '消防系统', label: '消防系统' },
 { value: '污水处理', label: '污水处理' },
 { value: '矿山排水', label: '矿山排水' },
 { value: '船舶供水', label: '船舶供水' },
 { value: '其他应用', label: '其他应用' },
];

const FLUID_TYPES = [
 { value: '清水', label: '清水' },
 { value: '饮用水', label: '饮用水' },
 { value: '冷却水', label: '冷却水' },
 { value: '热水', label: '热水' },
 { value: '软水', label: '软水' },
 { value: '硬水', label: '硬水' },
 { value: '地下水', label: '地下水' },
 { value: '雨水', label: '雨水' },
 { value: '污水', label: '污水' },
 { value: '工业废水', label: '工业废水' },
 { value: '海水', label: '海水' },
 { value: '油类', label: '油类' },
 { value: '燃油', label: '燃油' },
 { value: '润滑油', label: '润滑油' },
 { value: '化学液体', label: '化学液体' },
 { value: '酸性液体', label: '酸性液体' },
 { value: '碱性液体', label: '碱性液体' },
 { value: '腐蚀性液体', label: '腐蚀性液体' },
 { value: '泥浆', label: '泥浆' },
 { value: '粘性液体', label: '粘性液体' },
 { value: '气液混合物', label: '气液混合物' },
];

const PUMP_TYPES = [
 { value: 'all', label: '全部类型' },
 { value: 'centrifugal', label: '离心泵' },
 { value: 'vertical', label: '立式泵' },
 { value: 'submersible', label: '潜水泵' },
];

export default function PumpSelectionPage() {
 const [isLoading, setIsLoading] = useState(false);
 const [isSearching, setIsSearching] = useState(false);
 const [results, setResults] = useState<Pump[]>([]);
 const [recommendedProducts, setRecommendedProducts] = useState<Pump[]>([]);
 const [error, setError] = useState<string | null>(null);
 const [showResults, setShowResults] = useState(false);

 // 表单状态
 const [formData, setFormData] = useState<SelectionParams>({
 required_flow_rate: 0,
 required_head: 0,
 application_type: '暖通空调',
 fluid_type: '清水',
 pump_type: 'all',
 });

 // 使用 useMemo 缓存选项数组，避免重新渲染
 const applicationOptions = useMemo(() => APPLICATION_TYPES, []);
 const fluidOptions = useMemo(() => FLUID_TYPES, []);
 const pumpOptions = useMemo(() => PUMP_TYPES, []);

 // 使用 useCallback 缓存处理函数，避免不必要的重新创建
 const handleInputChange = useCallback((field: keyof SelectionParams, value: any) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 }, []);

 const handleSelectChange = useCallback((field: keyof SelectionParams, value: string) => {
 setFormData(prev => ({ ...prev, [field]: value }));
 }, []);

 const handleNumberInput = useCallback((field: keyof SelectionParams, value: string) => {
 if (value === '') {
 handleInputChange(field, 0);
 return;
 }

 const numValue = parseFloat(value);
 if (!isNaN(numValue)) {
 handleInputChange(field, numValue);
 }
 }, [handleInputChange]);

 const handleSubmit = useCallback(async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSearching(true);
 setError(null);
 setShowResults(true);

 try {
 const response = await fetch('/api/pump/match', {
 method: 'POST',
 headers: {
  'Content-Type': 'application/json',
 },
 body: JSON.stringify(formData),
 });

 if (!response.ok) {
 throw new Error('选型请求失败');
 }

 const data = await response.json();
 setResults(data.pumps || []);

 if (!data.pumps || data.pumps.length === 0) {
 try {
  const recommendResponse = await fetch('/api/pumps?limit=6');
  if (recommendResponse.ok) {
  const recommendData = await recommendResponse.json();
  setRecommendedProducts(recommendData.pumps || []);
  }
 } catch (err) {
  console.error('获取推荐产品失败:', err);
 }
 } else {
 setRecommendedProducts([]);
 }
 } catch (err) {
 setError(err instanceof Error ? err.message : '发生未知错误');
 setResults([]);
 setRecommendedProducts([]);
 } finally {
 setIsSearching(false);
 }
 }, [formData]);

 const handleReset = useCallback(() => {
 setFormData({
 required_flow_rate: 0,
 required_head: 0,
 application_type: '暖通空调',
 fluid_type: '清水',
 pump_type: 'all',
 });
 setShowResults(false);
 setResults([]);
 setRecommendedProducts([]);
 setError(null);
 }, []);

 return (
 <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
 {/* 微信分享配置 */}
 <WechatShareConfig
 title="洛瓦托智能水泵选型"
 desc="快速、精准、高效 - 根据您的需求智能匹配最合适的水泵产品"
 />

 {/* Navigation */}
 <Navigation />

 <div className="container mx-auto px-4 py-6 md:py-8 ">
 <div className="grid md:grid-cols-3 gap-6 md:gap-8 ">
  {/* 左侧：参数输入 + 选型说明 */}
  <div className="md:col-span-1 space-y-6">
  {/* 参数输入 */}
  <Card>
  <CardHeader className="pb-4">
  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
   <Search className="w-5 h-5 text-blue-600" />
   参数输入
  </CardTitle>
  </CardHeader>
  <CardContent className="">
  <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
   {/* 流量需求和扬程需求 - 并列显示 */}
   <div className="grid grid-cols-2 gap-4">
   <div className="space-y-2">
   <Label htmlFor="flow_rate" className="text-sm md:text-base">流量需求 (m³/h)</Label>
   <Input
   id="flow_rate_input"
   type="number"
   min="1"
   max="500"
   step="0.1"
   placeholder="请输入流量"
   value={formData.required_flow_rate === 0 ? '' : formData.required_flow_rate}
   onChange={(e) => handleNumberInput('required_flow_rate', e.target.value)}
   className="w-full text-sm md:text-base"
   />
   </div>

   <div className="space-y-2">
   <Label htmlFor="head" className="text-sm md:text-base">扬程需求 (m)</Label>
   <Input
   id="head_input"
   type="number"
   min="1"
   max="200"
   step="0.1"
   placeholder="请输入扬程"
   value={formData.required_head === 0 ? '' : formData.required_head}
   onChange={(e) => handleNumberInput('required_head', e.target.value)}
   className="w-full text-sm md:text-base"
   />
   </div>
   </div>

   {/* 应用类型和流体类型 - 并列显示 */}
   <div className="grid grid-cols-2 gap-4">
   {/* 应用类型 */}
   <div className="space-y-2">
   <Label htmlFor="application_type" className="text-sm md:text-base">应用类型</Label>
   <Select
   value={String(formData.application_type || '')}
   onValueChange={(value) =>
    handleSelectChange('application_type', value)
   }
   >
   <SelectTrigger id="application_type" className="text-sm md:text-base">
    <SelectValue placeholder="请选择应用类型" />
   </SelectTrigger>
   <SelectContent>
    {applicationOptions.map((type) => (
    <SelectItem key={type.value} value={String(type.value)} className="text-sm md:text-base">
    {type.label}
    </SelectItem>
    ))}
   </SelectContent>
   </Select>
   </div>

   {/* 流体类型 */}
   <div className="space-y-2">
   <Label htmlFor="fluid_type" className="text-sm md:text-base">流体类型</Label>
   <Select
   value={String(formData.fluid_type || '')}
   onValueChange={(value) =>
    handleSelectChange('fluid_type', value)
   }
   >
   <SelectTrigger id="fluid_type" className="text-sm md:text-base">
    <SelectValue placeholder="请选择流体类型" />
   </SelectTrigger>
   <SelectContent>
    {fluidOptions.map((type) => (
    <SelectItem key={type.value} value={String(type.value)} className="text-sm md:text-base">
    {type.label}
    </SelectItem>
    ))}
   </SelectContent>
   </Select>
   </div>
   </div>

   {/* 水泵类型 */}
   <div className="space-y-2">
   <Label htmlFor="pump_type" className="text-sm md:text-base">水泵类型（可选）</Label>
   <Select
   value={String(formData.pump_type || '')}
   onValueChange={(value) =>
   handleSelectChange('pump_type', value)
   }
   >
   <SelectTrigger id="pump_type" className="text-sm md:text-base">
   <SelectValue placeholder="请选择水泵类型" />
   </SelectTrigger>
   <SelectContent>
   {pumpOptions.map((type) => (
    <SelectItem key={type.value} value={String(type.value)} className="text-sm md:text-base">
    {type.label}
    </SelectItem>
   ))}
   </SelectContent>
   </Select>
   </div>

   {/* 按钮 */}
   <div className="flex gap-3 pt-4">
   <Button
   type="submit"
   className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-sm md:text-base h-10 md:h-11"
   disabled={isSearching}
   >
   {isSearching ? (
   <>
    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
    正在匹配...
   </>
   ) : (
   <>
    <Search className="w-4 h-4 mr-2" />
    开始选型
   </>
   )}
   </Button>
   <Button
   type="button"
   variant="outline"
   onClick={handleReset}
   disabled={isSearching}
   className="text-sm md:text-base h-10 md:h-11"
   >
   重置
   </Button>
   </div>
  </form>
  </CardContent>
  </Card>

  {/* 选型说明 */}
  <Card>
  <CardHeader>
  <CardTitle className="flex items-center gap-2">
   <Info className="w-5 h-5 text-blue-600" />
   选型说明
  </CardTitle>
  </CardHeader>
  <CardContent className="">
  <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
   <div className="flex items-start gap-3">
   <Droplet className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
   <div>
   <strong className="text-gray-900 dark:text-white">流量需求</strong>
   <p className="mt-1">水泵每小时需要输送的液体体积，单位：m³/h。例如：50 m³/h 表示每小时输送50立方米液体。</p>
   </div>
   </div>
   <div className="flex items-start gap-3">
   <Gauge className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
   <div>
   <strong className="text-gray-900 dark:text-white">扬程需求</strong>
   <p className="mt-1">水泵能够提升液体的高度，单位：m。例如：30 m 表示可以将液体提升30米高。</p>
   </div>
   </div>
   <div className="flex items-start gap-3">
   <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
   <div>
   <strong className="text-gray-900 dark:text-white">功率偏好</strong>
   <p className="mt-1">水泵的额定功率，单位：kW。功率越大，流量和扬程能力越强。</p>
   </div>
   </div>
   <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
   <strong className="text-gray-900 dark:text-white">💡 匹配度说明：</strong>
   <p className="mt-2 text-xs">系统根据您的参数，综合考虑流量、扬程、功率等因素计算匹配度（0-100%），分数越高表示越适合您的需求。</p>
   </div>

   <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
   <strong className="text-gray-900 dark:text-white">✅ 选型原则：</strong>
   <ul className="mt-2 text-xs space-y-1 list-disc list-inside">
   <li>只显示<strong>大于等于需求值</strong>的产品型号</li>
   <li>优先推荐余量适中（流量5%-20%，扬程5%-15%）的产品</li>
   <li>综合考虑效率、BEP匹配度和性能曲线</li>
   <li>遵循"选大不选小"原则，确保满足使用需求</li>
   </ul>
   </div>
  </div>
  </CardContent>
  </Card>
  </div>

  {/* 右侧：选型结果 */}
  <div className="md:col-span-2 ">

  {isSearching && (
  <Card>
  <CardContent className="py-12 flex flex-col items-center justify-center text-center">
   <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
   <p className="text-gray-600 dark:text-gray-400">
   正在根据您的需求匹配最合适的水泵...
   </p>
  </CardContent>
  </Card>
  )}

  {error && (
  <Card className="border-red-200 dark:border-red-900">
  <CardContent className="py-12 flex flex-col items-center justify-center text-center">
   <XCircle className="w-12 h-12 text-red-600 mb-4" />
   <p className="text-red-600 dark:text-red-400 font-medium">
   {error}
   </p>
   <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
   请检查数据库连接或联系管理员
   </p>
  </CardContent>
  </Card>
  )}

  {!showResults && !isSearching && (
  <Card>
  <CardContent className="py-12 flex flex-col items-center justify-center text-center">
   <Search className="w-12 h-12 text-gray-400 mb-4" />
   <p className="text-gray-600 dark:text-gray-400">
   请在左侧填写参数后点击"开始选型"
   </p>
  </CardContent>
  </Card>
  )}

  {showResults && !isSearching && results.length === 0 && !error && (
  <div>
  <Card className="mb-4">
   <CardContent className="py-8 flex flex-col items-center justify-center text-center">
   <XCircle className="w-12 h-12 text-yellow-600 mb-4" />
   <p className="text-gray-600 dark:text-gray-400">
   未找到匹配的水泵产品
   </p>
   <p className="text-sm text-gray-500 mt-2">
   以下为您推荐的热门产品
   </p>
   </CardContent>
  </Card>

  {recommendedProducts.length > 0 && (
   <div className="space-y-3 md:space-y-4">
   <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
   推荐产品
   </div>
   {recommendedProducts.slice(0, 6).map((pump) => (
   <Card
   key={pump.id}
   className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300"
   >
   <CardContent className="p-4 md:p-6">
    {/* 产品名称、型号 */}
    <div className="mb-3">
    <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
    {pump.name}
    </h3>
    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
    型号: {pump.model}
    </p>
    </div>

    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3 mb-4">
    <div>
    <div className="text-xs text-gray-600 dark:text-gray-400">
    流量范围
    </div>
    <div className="text-xs font-medium text-gray-900 dark:text-white">
    {typeof pump.min_flow_rate === 'number' ? pump.min_flow_rate.toFixed(1) : pump.min_flow_rate} - {typeof pump.max_flow_rate === 'number' ? pump.max_flow_rate.toFixed(1) : pump.max_flow_rate} m³/h
    </div>
    </div>
    <div>
    <div className="text-xs text-gray-600 dark:text-gray-400">
    扬程范围
    </div>
    <div className="text-xs font-medium text-gray-900 dark:text-white">
    {typeof pump.min_head === 'number' ? pump.min_head.toFixed(1) : pump.min_head} - {typeof pump.max_head === 'number' ? pump.max_head.toFixed(1) : pump.max_head} m
    </div>
    </div>
    <div>
    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
    最大流量
    <TooltipProvider delayDuration={0}>
     <Tooltip>
     <TooltipTrigger asChild>
     <Info className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
     </TooltipTrigger>
     <TooltipContent>
     <p className="text-xs">水泵的最大流量能力</p>
     </TooltipContent>
     </Tooltip>
    </TooltipProvider>
    </div>
    <div className="text-xs font-medium text-gray-900 dark:text-white">
    {typeof pump.max_flow_rate === 'number' ? pump.max_flow_rate.toFixed(1) : pump.max_flow_rate} m³/h
    </div>
    </div>
    <div>
    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
    最大扬程
    <TooltipProvider delayDuration={0}>
     <Tooltip>
     <TooltipTrigger asChild>
     <Info className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
     </TooltipTrigger>
     <TooltipContent>
     <p className="text-xs">水泵的最大扬程能力</p>
     </TooltipContent>
     </Tooltip>
    </TooltipProvider>
    </div>
    <div className="text-xs font-medium text-gray-900 dark:text-white">
    {typeof pump.max_head === 'number' ? pump.max_head.toFixed(1) : pump.max_head} m
    </div>
    </div>
    <div>
    <div className="text-xs text-gray-600 dark:text-gray-400">
    额定功率
    </div>
    <div className="text-xs font-medium text-gray-900 dark:text-white">
    {typeof pump.rated_power === 'number' ? pump.rated_power.toFixed(2) : pump.rated_power} kW
    </div>
    </div>
    <div>
    <div className="text-xs text-gray-600 dark:text-gray-400">
    效率
    </div>
    <div className="text-xs font-medium text-gray-900 dark:text-white">
    {typeof pump.efficiency === 'number' ? pump.efficiency.toFixed(1) : pump.efficiency}%
    </div>
    </div>
    </div>

    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
    <div className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
    {pump.price ? `¥${pump.price.toLocaleString()}` : '价格待定'}
    </div>
    <div className="flex gap-2">
    {pump.in_stock ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
     <CheckCircle2 className="w-3 h-3 mr-1" />
     有货
    </span>
    ) : (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
     <XCircle className="w-3 h-3 mr-1" />
     无货
    </span>
    )}
    </div>
    </div>
   </CardContent>
   </Card>
   ))}
   </div>
  )}
  </div>
  )}

  {showResults && !isSearching && results.length > 0 && (
  <div className="space-y-3 md:space-y-4">
  {results.map((pump, index) => (
   <Card
   key={pump.id}
   className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300"
   >
   <CardContent className="p-4 md:p-6">
   {/* 产品名称、型号和匹配度 - 同一行显示 */}
   <div className="flex justify-between items-start mb-4">
   <div className="flex-1">
    <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
    {pump.name}
    </h3>
    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
    型号: {pump.model}
    </p>
   </div>
   </div>

   <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3 mb-4">
   <div>
    <div className="text-xs text-gray-600 dark:text-gray-400">
    流量范围
    </div>
    <div className="text-xs font-medium text-gray-900 dark:text-white">
    {typeof pump.min_flow_rate === 'number' ? pump.min_flow_rate.toFixed(1) : pump.min_flow_rate} - {typeof pump.max_flow_rate === 'number' ? pump.max_flow_rate.toFixed(1) : pump.max_flow_rate} m³/h
    </div>
   </div>
   <div>
    <div className="text-xs text-gray-600 dark:text-gray-400">
    扬程范围
    </div>
    <div className="text-xs font-medium text-gray-900 dark:text-white">
    {typeof pump.min_head === 'number' ? pump.min_head.toFixed(1) : pump.min_head} - {typeof pump.max_head === 'number' ? pump.max_head.toFixed(1) : pump.max_head} m
    </div>
   </div>
   <div>
    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
    最大流量
    <TooltipProvider delayDuration={0}>
    <Tooltip>
    <TooltipTrigger asChild>
     <Info className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
    </TooltipTrigger>
    <TooltipContent>
     <p className="text-xs">水泵的最大流量能力</p>
    </TooltipContent>
    </Tooltip>
    </TooltipProvider>
    </div>
    <div className="text-xs font-medium text-gray-900 dark:text-white">
    {typeof pump.max_flow_rate === 'number' ? pump.max_flow_rate.toFixed(1) : pump.max_flow_rate} m³/h
    </div>
   </div>
   <div>
    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
    最大扬程
    <TooltipProvider delayDuration={0}>
    <Tooltip>
    <TooltipTrigger asChild>
     <Info className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
    </TooltipTrigger>
    <TooltipContent>
     <p className="text-xs">水泵的最大流量能力</p>
    </TooltipContent>
    </Tooltip>
    </TooltipProvider>
    </div>
    <div className="text-xs font-medium text-gray-900 dark:text-white">
    {typeof pump.max_head === 'number' ? pump.max_head.toFixed(1) : pump.max_head} m
    </div>
   </div>
   <div>
    <div className="text-xs text-gray-600 dark:text-gray-400">
    额定功率
    </div>
    <div className="text-xs font-medium text-gray-900 dark:text-white">
    {typeof pump.rated_power === 'number' ? pump.rated_power.toFixed(2) : pump.rated_power} kW
    </div>
   </div>
   <div>
    <div className="text-xs text-gray-600 dark:text-gray-400">
    效率
    </div>
    <div className="text-xs font-medium text-gray-900 dark:text-white">
    {typeof pump.efficiency === 'number' ? pump.efficiency.toFixed(1) : pump.efficiency}%
    </div>
   </div>
   </div>

   {/* H-Q 性能曲线图 */}
   <div className="bg-gray-50 dark:bg-gray-800 p-3 md:p-4 rounded-lg mb-4">
   <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
    H-Q 性能曲线
   </div>
   <div className="h-72 w-full">
    <PumpPerformanceCurve
    pump={pump}
    requiredFlowRate={formData.required_flow_rate}
    requiredHead={formData.required_head}
    />
   </div>
   </div>

   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
   <div className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
    {pump.price ? `¥${pump.price.toLocaleString()}` : '价格待定'}
   </div>
   <div className="flex gap-2">
    {pump.in_stock ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
    <CheckCircle2 className="w-3 h-3 mr-1" />
    有货
    </span>
    ) : (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
    <XCircle className="w-3 h-3 mr-1" />
    无货
    </span>
    )}
   </div>
   </div>
   </CardContent>
   </Card>
  ))}
  </div>
  )}
  </div>
 </div>
 </div>
 </div>
 );
}
