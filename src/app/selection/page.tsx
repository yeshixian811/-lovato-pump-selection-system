'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

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
  preferred_power: number;
}

const APPLICATION_TYPES = [
  { value: 'water_supply', label: '供水系统' },
  { value: 'drainage', label: '排水系统' },
  { value: 'irrigation', label: '农田灌溉' },
  { value: 'industrial', label: '工业循环' },
  { value: 'fire_protection', label: '消防系统' },
  { value: 'hvac', label: '暖通空调' },
  { value: 'sewage', label: '污水处理' },
  { value: 'mining', label: '矿山排水' },
  { value: 'marine', label: '船舶供水' },
  { value: 'other', label: '其他应用' },
];

const FLUID_TYPES = [
  { value: 'clean_water', label: '清水' },
  { value: 'sewage', label: '污水' },
  { value: 'sea_water', label: '海水' },
  { value: 'oil', label: '油类' },
  { value: 'chemical', label: '化学液体' },
  { value: 'slurry', label: '泥浆' },
];

const PUMP_TYPES = [
  { value: '', label: '全部类型' },
  { value: 'centrifugal', label: '离心泵' },
  { value: 'vertical', label: '立式泵' },
  { value: 'submersible', label: '潜水泵' },
];

export default function PumpSelectionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Pump[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState<SelectionParams>({
    required_flow_rate: 50,
    required_head: 30,
    application_type: 'water_supply',
    fluid_type: 'clean_water',
    pump_type: '',
    preferred_power: 7.5,
  });

  // 处理表单输入
  const handleInputChange = (field: keyof SelectionParams, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生未知错误');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 重置表单
  const handleReset = () => {
    setFormData({
      required_flow_rate: 50,
      required_head: 30,
      application_type: 'water_supply',
      fluid_type: 'clean_water',
      pump_type: '',
      preferred_power: 7.5,
    });
    setShowResults(false);
    setResults([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 选型表单 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                参数输入
              </CardTitle>
              <CardDescription>
                请填写您的使用需求，系统将自动匹配最合适的水泵产品
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 流量需求 */}
                <div className="space-y-2">
                  <Label htmlFor="flow_rate">
                    流量需求: {formData.required_flow_rate} m³/h
                  </Label>
                  <Slider
                    id="flow_rate"
                    min={1}
                    max={500}
                    step={1}
                    value={[formData.required_flow_rate]}
                    onValueChange={(value) =>
                      handleInputChange('required_flow_rate', value[0])
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 m³/h</span>
                    <span>500 m³/h</span>
                  </div>
                </div>

                {/* 扬程需求 */}
                <div className="space-y-2">
                  <Label htmlFor="head">
                    扬程需求: {formData.required_head} m
                  </Label>
                  <Slider
                    id="head"
                    min={1}
                    max={200}
                    step={1}
                    value={[formData.required_head]}
                    onValueChange={(value) =>
                      handleInputChange('required_head', value[0])
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 m</span>
                    <span>200 m</span>
                  </div>
                </div>

                {/* 应用类型 */}
                <div className="space-y-2">
                  <Label htmlFor="application_type">应用类型</Label>
                  <Select
                    value={formData.application_type}
                    onValueChange={(value) =>
                      handleInputChange('application_type', value)
                    }
                  >
                    <SelectTrigger id="application_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 流体类型 */}
                <div className="space-y-2">
                  <Label htmlFor="fluid_type">流体类型</Label>
                  <Select
                    value={formData.fluid_type}
                    onValueChange={(value) =>
                      handleInputChange('fluid_type', value)
                    }
                  >
                    <SelectTrigger id="fluid_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FLUID_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 水泵类型 */}
                <div className="space-y-2">
                  <Label htmlFor="pump_type">水泵类型（可选）</Label>
                  <Select
                    value={formData.pump_type}
                    onValueChange={(value) =>
                      handleInputChange('pump_type', value)
                    }
                  >
                    <SelectTrigger id="pump_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PUMP_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 功率偏好 */}
                <div className="space-y-2">
                  <Label htmlFor="preferred_power">
                    预期功率: {formData.preferred_power} kW
                  </Label>
                  <Slider
                    id="preferred_power"
                    min={0.1}
                    max={100}
                    step={0.1}
                    value={[formData.preferred_power]}
                    onValueChange={(value) =>
                      handleInputChange('preferred_power', value[0])
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0.1 kW</span>
                    <span>100 kW</span>
                  </div>
                </div>

                {/* 按钮 */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
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
                  >
                    重置
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 选型结果 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              选型结果
            </h2>

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
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <XCircle className="w-12 h-12 text-yellow-600 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    未找到匹配的水泵产品
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    请尝试调整参数或联系我们的技术支持
                  </p>
                </CardContent>
              </Card>
            )}

            {showResults && !isSearching && results.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  找到 {results.length} 个匹配结果，按匹配度排序
                </div>

                {results.map((pump, index) => (
                  <Card
                    key={pump.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {pump.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            型号: {pump.model}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {pump.match_score}%
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            匹配度
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            流量范围
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {pump.min_flow_rate} - {pump.max_flow_rate} m³/h
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            扬程范围
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {pump.min_head} - {pump.max_head} m
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            额定功率
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {pump.rated_power} kW
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            效率
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {pump.efficiency}%
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
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
