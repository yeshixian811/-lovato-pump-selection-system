'use client';

import { useState, useEffect } from 'react';
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
  Legend
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
  max_flow_rate: number;
  min_flow_rate: number;
  max_head: number;
  min_head: number;
  rated_flow_rate: number;
  rated_head: number;
  rated_power: number;
  rated_speed: number;
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
  price: number;
  currency: string;
  in_stock: boolean;
  stock_quantity: number;
  image_url: string;
  spec_sheet_url: string;
  manual_url: string;
  match_score: number;
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
  pumpId: string | number;
  requiredFlowRate: number;
  requiredHead: number;
}

function PumpPerformanceCurve({ pumpId, requiredFlowRate, requiredHead }: PumpPerformanceCurveProps) {
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [maxFlow, setMaxFlow] = useState<number>(0);
  const [maxHead, setMaxHead] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await fetch(`/api/pumps/${pumpId}/performance`);
        if (response.ok) {
          const data = await response.json();
          if (data.performancePoints && data.performancePoints.length > 0) {
            setPerformanceData(data.performancePoints);
            
            // 计算最大流量和最大扬程
            const maxF = Math.max(
              ...data.performancePoints.map((p: any) => p.flowRate),
              requiredFlowRate
            );
            const maxH = Math.max(
              ...data.performancePoints.map((p: any) => p.head),
              requiredHead
            );
            setMaxFlow(maxF);
            setMaxHead(maxH);
          } else {
            // 如果没有性能曲线数据，生成模拟数据
            const mockData = generateMockPerformanceData(requiredFlowRate, requiredHead);
            setPerformanceData(mockData);
            
            // 计算模拟数据的最大值
            const maxF = Math.max(
              ...mockData.map(p => p.flowRate),
              requiredFlowRate
            );
            const maxH = Math.max(
              ...mockData.map(p => p.head),
              requiredHead
            );
            setMaxFlow(maxF);
            setMaxHead(maxH);
          }
        } else {
          // API 调用失败，生成模拟数据
          const mockData = generateMockPerformanceData(requiredFlowRate, requiredHead);
          setPerformanceData(mockData);
          
          // 计算模拟数据的最大值
          const maxF = Math.max(
            ...mockData.map(p => p.flowRate),
            requiredFlowRate
          );
          const maxH = Math.max(
            ...mockData.map(p => p.head),
            requiredHead
          );
          setMaxFlow(maxF);
          setMaxHead(maxH);
        }
      } catch (error) {
        console.error('Failed to fetch performance data:', error);
        // 生成模拟数据
        const mockData = generateMockPerformanceData(requiredFlowRate, requiredHead);
        setPerformanceData(mockData);
        
        // 计算模拟数据的最大值
        const maxF = Math.max(
          ...mockData.map(p => p.flowRate),
          requiredFlowRate
        );
        const maxH = Math.max(
          ...mockData.map(p => p.head),
          requiredHead
        );
        setMaxFlow(maxF);
        setMaxHead(maxH);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [pumpId, requiredFlowRate, requiredHead]);

  // 生成模拟性能曲线数据
  const generateMockPerformanceData = (flow: number, head: number) => {
    const data: any[] = [];
    const maxFlow = flow * 2;
    const maxHead = head * 1.5;
    const step = maxFlow / 20;

    for (let i = 0; i <= 20; i++) {
      const currentFlow = Math.round(i * step * 10) / 10;
      // 简单的二次曲线模型
      const currentHead = maxHead * (1 - Math.pow(currentFlow / maxFlow, 2));
      if (currentHead >= 0) {
        data.push({
          flowRate: currentFlow,
          head: Math.round(currentHead * 10) / 10,
        });
      }
    }

    return data;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 45, bottom: 15 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="flowRate"
          type="number"
          domain={[0, maxFlow]}
          ticks={[0, maxFlow * 0.25, maxFlow * 0.5, maxFlow * 0.75, maxFlow].filter(t => t <= maxFlow && t >= 0)}
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => value.toFixed(1)}
          label={{ value: '流量 (m³/h)', position: 'insideBottom', offset: -5, fontSize: 10 }}
        />
        <YAxis
          dataKey="head"
          domain={[0, maxHead]}
          ticks={[0, maxHead * 0.25, maxHead * 0.5, maxHead * 0.75, maxHead].filter(t => t <= maxHead && t >= 0)}
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => value.toFixed(1)}
          label={{ value: '扬程 (m)', angle: -90, position: 'insideLeft', fontSize: 10 }}
        />
        <RechartsTooltip
          formatter={(value: number, name: string) => [value.toFixed(1), name === 'flowRate' ? '流量 (m³/h)' : '扬程 (m)']}
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
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 4 }}
          name="性能曲线"
        />
        {/* 用户需求流量参考线 */}
        <ReferenceLine
          x={requiredFlowRate}
          stroke="#ef4444"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          label={{ value: `需求流量: ${requiredFlowRate.toFixed(1)}`, position: 'top', fill: '#ef4444', fontSize: 10 }}
        />
        {/* 用户需求扬程参考线 */}
        <ReferenceLine
          y={requiredHead}
          stroke="#ef4444"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          label={{ value: `需求扬程: ${requiredHead.toFixed(1)}`, position: 'right', fill: '#ef4444', fontSize: 10 }}
        />
        {/* 标注需求点区域 */}
        <ReferenceArea
          x1={requiredFlowRate - 0.5}
          x2={requiredFlowRate + 0.5}
          y1={requiredHead - 0.5}
          y2={requiredHead + 0.5}
          fill="#ef4444"
          fillOpacity={0.2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const APPLICATION_TYPES = [
  { value: '供水系统', label: '供水系统' },
  { value: '排水系统', label: '排水系统' },
  { value: '农田灌溉', label: '农田灌溉' },
  { value: '工业循环', label: '工业循环' },
  { value: '消防系统', label: '消防系统' },
  { value: '暖通空调', label: '暖通空调' },
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
    required_flow_rate: 50,
    required_head: 30,
    application_type: '供水系统',
    fluid_type: '清水',
    pump_type: 'all',
  });

  // 处理表单输入
  const handleInputChange = (field: keyof SelectionParams, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 处理键盘输入
  const handleNumberInput = (field: keyof SelectionParams, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      handleInputChange(field, numValue);
    }
  };

  // 提交选型
  const handleSubmit = async (e: React.FormEvent) => {
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

      // 如果没有匹配结果，获取推荐产品
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
  };

  // 重置表单
  const handleReset = () => {
    setFormData({
      required_flow_rate: 50,
      required_head: 30,
      application_type: '供水系统',
      fluid_type: '清水',
      pump_type: 'all',
    });
    setShowResults(false);
    setResults([]);
    setRecommendedProducts([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      {/* 微信分享配置 */}
      <WechatShareConfig
        title="洛瓦托智能水泵选型"
        desc="快速、精准、高效 - 根据您的需求智能匹配最合适的水泵产品"
      />

      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              智能选型系统
            </h1>
            <div className="w-24" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 overflow-hidden">
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 overflow-hidden">
          {/* 左侧：参数输入 + 选型说明 */}
          <div className="md:col-span-1 space-y-6">
            {/* 参数输入 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Search className="w-5 h-5 text-blue-600" />
                  参数输入
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  请填写您的使用需求，系统将自动匹配最合适的水泵产品
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden">
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
                        value={formData.required_flow_rate}
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
                        value={formData.required_head}
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
                        value={formData.application_type}
                        onValueChange={(value) =>
                          handleInputChange('application_type', value)
                        }
                      >
                        <SelectTrigger id="application_type" className="text-sm md:text-base">
                          <SelectValue placeholder="请选择应用类型" />
                        </SelectTrigger>
                        <SelectContent>
                          {APPLICATION_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="text-sm md:text-base">
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
                        value={formData.fluid_type}
                        onValueChange={(value) =>
                          handleInputChange('fluid_type', value)
                        }
                      >
                        <SelectTrigger id="fluid_type" className="text-sm md:text-base">
                          <SelectValue placeholder="请选择流体类型" />
                        </SelectTrigger>
                        <SelectContent>
                          {FLUID_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="text-sm md:text-base">
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
                      value={formData.pump_type}
                      onValueChange={(value) =>
                        handleInputChange('pump_type', value)
                      }
                    >
                      <SelectTrigger id="pump_type" className="text-sm md:text-base">
                        <SelectValue placeholder="请选择水泵类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {PUMP_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-sm md:text-base">
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
              <CardContent className="overflow-hidden">
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：选型结果 */}
          <div className="md:col-span-2 overflow-hidden">

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
                                额定流量
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">性能参数图形的参考点</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <div className="text-xs font-medium text-gray-900 dark:text-white">
                                {typeof pump.rated_flow_rate === 'number' ? pump.rated_flow_rate.toFixed(1) : pump.rated_flow_rate} m³/h
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                                额定扬程
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">性能参数图形的参考点</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <div className="text-xs font-medium text-gray-900 dark:text-white">
                                {typeof pump.rated_head === 'number' ? pump.rated_head.toFixed(1) : pump.rated_head} m
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                额定功率
                              </div>
                              <div className="text-xs font-medium text-gray-900 dark:text-white">
                                {typeof pump.rated_power === 'number' ? pump.rated_power.toFixed(1) : pump.rated_power} kW
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
                              ¥{pump.price.toLocaleString()}
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
                        <div className="text-right">
                          <div className="text-xl md:text-2xl font-bold text-blue-600">
                            {pump.match_score}%
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            匹配度
                          </div>
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
                            额定流量
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">性能参数图形的参考点</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="text-xs font-medium text-gray-900 dark:text-white">
                            {typeof pump.rated_flow_rate === 'number' ? pump.rated_flow_rate.toFixed(1) : pump.rated_flow_rate} m³/h
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                            额定扬程
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3 ml-1 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">性能参数图形的参考点</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="text-xs font-medium text-gray-900 dark:text-white">
                            {typeof pump.rated_head === 'number' ? pump.rated_head.toFixed(1) : pump.rated_head} m
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            额定功率
                          </div>
                          <div className="text-xs font-medium text-gray-900 dark:text-white">
                            {typeof pump.rated_power === 'number' ? pump.rated_power.toFixed(1) : pump.rated_power} kW
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
                            pumpId={pump.id}
                            requiredFlowRate={formData.required_flow_rate}
                            requiredHead={formData.required_head}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                          ¥{pump.price.toLocaleString()}
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
