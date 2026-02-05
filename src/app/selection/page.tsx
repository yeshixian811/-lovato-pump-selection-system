"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, Search, ArrowLeft, Check, ChevronRight, Filter, X, Heart, Share2 } from "lucide-react";
import PumpCurveChart from "@/components/pump-curve-chart";

interface Pump {
  id: string;
  name: string;
  model: string;
  brand: string;
  pumpType: string | null;
  material: string | null;
  flowRate: string;
  head: string;
  maxFlow: string | null;
  maxHead: string | null;
  power: string;
  efficiency: string | null;
  speed: number | null;
  inletDiameter: number | null;
  outletDiameter: number | null;
  applicationType: string | null;
  description: string | null;
  price: string | null;
  imageUrl: string | null;
}

export default function AdvancedSelectionPage() {
  const [flowRate, setFlowRate] = useState("");
  const [head, setHead] = useState("");
  const [pumpType, setPumpType] = useState<string>("");
  const [material, setMaterial] = useState<string>("");
  const [applicationType, setApplicationType] = useState<string>("");
  const [results, setResults] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedPumps, setSelectedPumps] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [highlightedPump, setHighlightedPump] = useState<Pump | null>(null);

  const pumpTypes = [
    "自适应变频屏蔽泵",
    "卧式多级离心泵",
    "立式多级离心泵",
    "立式单级管道泵",
    "卧式单级端吸泵",
    "卧式多级离心增压泵",
    "立式多级离心增压泵",
    "立式单级管道增压泵",
    "卧式单级端吸增压泵",
    "卧式多级离心变频增压泵",
    "立式多级离心变频增压泵",
    "立式单级管道变频增压泵",
    "卧式单级端吸变频增压泵",
    "家用变频增压泵",
    "工频屏蔽泵",
  ];

  const materials = [
    "不锈钢",
    "铸铁",
    "塑料",
  ];

  const applicationTypes = [
    "暖通空调",
    "供水系统",
    "建筑供水",
    "市政供水",
    "消防系统",
    "工业循环",
    "化工流程",
    "污水处理",
    "污水提升",
    "农业灌溉",
    "深井取水",
    "地下水抽取",
    "锅炉给水",
    "冷却循环",
    "泳池循环",
    "园林喷灌",
    "水产养殖",
    "船舶",
    "其他",
  ];

  const handleSearch = async () => {
    if (!flowRate || !head) {
      alert("请输入流量和扬程");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch("/api/pumps/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flowRate: parseFloat(flowRate),
          head: parseFloat(head),
          pumpType: pumpType && pumpType !== "all" ? pumpType : undefined,
          material: material && material !== "all" ? material : undefined,
          applicationType: applicationType && applicationType !== "all" ? applicationType : undefined,
        }),
      });

      const data = await response.json();
      setResults(data);
      // 自动选中匹配度最高的水泵
      if (data && data.length > 0) {
        setHighlightedPump(data[0]);
      } else {
        setHighlightedPump(null);
      }
    } catch (error) {
      console.error("Error searching pumps:", error);
      alert("搜索失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (pump: Pump) => {
    const targetFlow = parseFloat(flowRate);
    const targetHead = parseFloat(head);
    const pumpFlow = parseFloat(pump.flowRate);
    const pumpHead = parseFloat(pump.head);

    const flowDiff = Math.abs(pumpFlow - targetFlow) / targetFlow;
    const headDiff = Math.abs(pumpHead - targetHead) / targetHead;

    const score = (1 - (flowDiff + headDiff) / 2) * 100;
    return Math.max(0, Math.min(100, score)).toFixed(1);
  };

  const calculateError = (pump: Pump) => {
    const targetFlow = parseFloat(flowRate);
    const targetHead = parseFloat(head);
    const pumpFlow = parseFloat(pump.flowRate);
    const pumpHead = parseFloat(pump.head);

    // 计算正向余量（水泵参数超出需求参数的百分比）
    // 遵循"选大不选小"原则
    const flowMargin = (pumpFlow - targetFlow) / targetFlow * 100;
    const headMargin = (pumpHead - targetHead) / targetHead * 100;

    return {
      flow: flowMargin.toFixed(1),
      head: headMargin.toFixed(1),
      max: Math.max(flowMargin, headMargin).toFixed(1)
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return "bg-green-600";
    if (score >= 90) return "bg-blue-600";
    return "bg-yellow-600";
  };

  const togglePumpSelection = (id: string) => {
    const newSelected = new Set(selectedPumps);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPumps(newSelected);
  };

  const clearFilters = () => {
    setPumpType("all");
    setMaterial("all");
    setApplicationType("all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/luwatto-logo.png"
              alt="洛瓦托LOGO"
              className="h-8 sm:h-10 w-auto"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              洛瓦托水泵选型系统
            </h1>
          </Link>
          <nav className="flex gap-2 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
            <Link href="/products">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                产品库
              </Button>
            </Link>
            <Link href="/selection">
              <Button variant="default" size="sm" className="w-full sm:w-auto">
                高级选型
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">首页</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">高级选型</span>
        </div>

        <div className="grid xl:grid-cols-[380px_1fr] lg:grid-cols-[350px_1fr] gap-6">
          {/* Left Sidebar - Search Form */}
          <div className="space-y-5">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5" />
                  选型参数
                </CardTitle>
                <CardDescription className="text-blue-100 text-sm">
                  输入您的需求，智能匹配最合适的产品
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* 流量和扬程 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="flowRate">
                      流量 <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="flowRate"
                        type="number"
                        step="0.01"
                        placeholder="100"
                        value={flowRate}
                        onChange={(e) => setFlowRate(e.target.value)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        m³/h
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="head">
                      扬程 <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="head"
                        type="number"
                        step="0.01"
                        placeholder="50"
                        value={head}
                        onChange={(e) => setHead(e.target.value)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        m
                      </span>
                    </div>
                  </div>
                </div>

                {/* 筛选条件 */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      筛选条件
                    </Label>
                    {(pumpType !== "all" || material !== "all" || applicationType !== "all") && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
                        <X className="h-3 w-3 mr-1" />
                        清空
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label>泵类型</Label>
                    <Select value={pumpType} onValueChange={setPumpType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="全部类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部类型</SelectItem>
                        {pumpTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>材质</Label>
                    <Select value={material} onValueChange={setMaterial}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="全部材质" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部材质</SelectItem>
                        {materials.map((mat) => (
                          <SelectItem key={mat} value={mat}>
                            {mat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>应用场景</Label>
                    <Select value={applicationType} onValueChange={setApplicationType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="全部场景" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部场景</SelectItem>
                        {applicationTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "搜索中..." : "开始选型"}
                </Button>
              </CardContent>
            </Card>

            {/* 已选产品 */}
            {selectedPumps.size > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">已选产品 ({selectedPumps.size})</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button className="w-full" variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    对比已选产品
                  </Button>
                </CardContent>
              </Card>
            )}


          </div>

          {/* Right Content - Results */}
          <div className="space-y-5">
            {searched && (
              <>
                {/* 右上角展示框 - 固定显示选型水泵 */}
                {highlightedPump && (
                  <Card className="sticky top-4 z-10 border-2 border-blue-500 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                    <CardHeader className="pb-3 px-5 py-4">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-600" />
                        当前选型
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* 水泵信息 */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {highlightedPump.model}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {highlightedPump.brand} · {highlightedPump.name}
                          </p>
                        </div>

                        {/* 流量和扬程定位 */}
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-muted-foreground">性能曲线</span>
                            <Badge className="bg-blue-600">
                              匹配度 {calculateMatchScore(highlightedPump)}%
                            </Badge>
                          </div>

                          {/* Q-H 曲线图 */}
                          <PumpCurveChart
                            pumpFlow={highlightedPump.flowRate}
                            pumpHead={highlightedPump.head}
                            pumpMaxFlow={highlightedPump.maxFlow}
                            pumpMaxHead={highlightedPump.maxHead}
                            userFlow={flowRate}
                            userHead={head}
                          />
                        </div>

                        {/* 参数余量信息 */}
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
                          <div className="text-sm font-medium text-muted-foreground mb-3">
                            参数余量（遵循选大不选小原则，余量≤5%）
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">流量余量</div>
                              <div className={`text-xl font-bold ${parseFloat(calculateError(highlightedPump).flow) <= 5 ? 'text-green-600' : 'text-red-600'}`}>
                                {calculateError(highlightedPump).flow}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">扬程余量</div>
                              <div className={`text-xl font-bold ${parseFloat(calculateError(highlightedPump).head) <= 5 ? 'text-green-600' : 'text-red-600'}`}>
                                {calculateError(highlightedPump).head}%
                              </div>
                            </div>
                          </div>
                          {parseFloat(calculateError(highlightedPump).max) > 5 && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="text-xs text-red-600 font-medium">
                                ⚠️ 余量超过5%，建议重新选型
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 其他参数 */}
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center p-2 bg-white dark:bg-gray-900 rounded border">
                            <div className="text-xs text-muted-foreground">功率</div>
                            <div className="font-semibold">{highlightedPump.power}</div>
                            <div className="text-xs text-muted-foreground">kW</div>
                          </div>
                          <div className="text-center p-2 bg-white dark:bg-gray-900 rounded border">
                            <div className="text-xs text-muted-foreground">类型</div>
                            <div className="font-semibold text-xs truncate">
                              {highlightedPump.pumpType || "-"}
                            </div>
                          </div>
                          <div className="text-center p-2 bg-white dark:bg-gray-900 rounded border">
                            <div className="text-xs text-muted-foreground">材质</div>
                            <div className="font-semibold text-xs truncate">
                              {highlightedPump.material || "-"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Results Header */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      选型结果
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {results.length === 0
                        ? "未找到匹配的产品"
                        : `找到 ${results.length} 个匹配产品`}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant={viewMode === "grid" ? "default" : "outline"}
                      onClick={() => setViewMode("grid")}
                    >
                      网格
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === "list" ? "default" : "outline"}
                      onClick={() => setViewMode("list")}
                    >
                      列表
                    </Button>
                  </div>
                </div>

                {/* Results Grid */}
                {loading ? (
                  <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-muted-foreground">搜索中...</p>
                  </div>
                ) : results.length === 0 ? (
                  <Card className="text-center py-16">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">未找到匹配的产品</h3>
                    <p className="text-muted-foreground mb-4">
                      请尝试调整搜索条件或联系客服
                    </p>
                    <Link href="/products">
                      <Button variant="outline">
                        前往产品库
                      </Button>
                    </Link>
                  </Card>
                ) : (
                  <div className={
                    viewMode === "grid"
                      ? "grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4"
                      : "space-y-4"
                  }>
                    {results
                      .sort((a, b) => {
                        const scoreA = parseFloat(calculateMatchScore(a));
                        const scoreB = parseFloat(calculateMatchScore(b));
                        return scoreB - scoreA;
                      })
                      .map((pump) => (
                        <Card
                          key={pump.id}
                          className={`overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
                            selectedPumps.has(pump.id)
                              ? "ring-2 ring-blue-600 shadow-lg"
                              : ""
                          } ${highlightedPump?.id === pump.id ? "ring-2 ring-green-500 shadow-xl" : ""}`}
                          onClick={() => setHighlightedPump(pump)}
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {highlightedPump?.id === pump.id && (
                                    <Badge className="bg-green-600">
                                      当前展示
                                    </Badge>
                                  )}
                                  <Badge className={getScoreColor(parseFloat(calculateMatchScore(pump)))}>
                                    匹配度 {calculateMatchScore(pump)}%
                                  </Badge>
                                </div>
                                <CardTitle className="text-lg">{pump.name}</CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {pump.brand} · {pump.model}
                                </CardDescription>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePumpSelection(pump.id);
                                }}
                              >
                                {selectedPumps.has(pump.id) ? (
                                  <Check className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <div className="h-4 w-4 border-2 border-gray-300 rounded" />
                                )}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 pt-4">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <div className="text-muted-foreground">流量</div>
                                <div className="font-semibold text-blue-600">{pump.flowRate}</div>
                                <div className="text-xs text-muted-foreground">m³/h</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">扬程</div>
                                <div className="font-semibold text-blue-600">{pump.head}</div>
                                <div className="text-xs text-muted-foreground">m</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">功率</div>
                                <div className="font-semibold text-blue-600">{pump.power}</div>
                                <div className="text-xs text-muted-foreground">kW</div>
                              </div>
                            </div>

                            {/* 参数余量信息 */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
                              <div className="text-xs text-muted-foreground mb-1">
                                参数余量（遵循选大不选小原则，余量≤5%）
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">流量余量：</span>
                                  <span className={`font-semibold ${parseFloat(calculateError(pump).flow) <= 5 ? 'text-green-600' : 'text-red-600'}`}>
                                    {calculateError(pump).flow}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">扬程余量：</span>
                                  <span className={`font-semibold ${parseFloat(calculateError(pump).head) <= 5 ? 'text-green-600' : 'text-red-600'}`}>
                                    {calculateError(pump).head}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {pump.pumpType && (
                                <Badge variant="outline" className="text-xs">
                                  {pump.pumpType}
                                </Badge>
                              )}
                              {pump.material && (
                                <Badge variant="outline" className="text-xs">
                                  {pump.material}
                                </Badge>
                              )}
                              {pump.applicationType && (
                                <Badge variant="outline" className="text-xs">
                                  {pump.applicationType}
                                </Badge>
                              )}
                            </div>

                            {pump.price && (
                              <div className="pt-2 border-t">
                                <div className="text-sm text-muted-foreground">价格</div>
                                <div className="text-xl font-bold text-red-600">
                                  ¥{parseFloat(pump.price).toLocaleString()}
                                </div>
                              </div>
                            )}

                            <div className="pt-2 flex gap-2">
                              <Button size="sm" className="flex-1">
                                查看详情
                              </Button>
                              <Button size="sm" variant="outline">
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </>
            )}

            {/* Default View - Before Search */}
            {!searched && (
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <Droplets className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                      <h3 className="text-2xl font-bold mb-2">开始您的选型之旅</h3>
                      <p className="text-muted-foreground">
                        输入流量和扬程参数，系统将智能匹配最合适的水泵产品
                      </p>
                    </div>

                    {/* 选型指导 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border text-left mb-6">
                      <div className="space-y-5">
                        {/* 一次系统选型指导 */}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <span className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                            一次系统选型
                          </h4>
                          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 mb-3 border-l-4 border-blue-600">
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              <strong>假设：</strong>套房150m²，20KW主机，主机水压降40Kpa，流量3.6吨，系统主管道最不利点单程20米，来回40米
                            </p>
                          </div>
                          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <p className="flex items-center gap-3">
                              <span className="text-muted-foreground">主管道扬程</span>
                              <span className="font-semibold">2.4米</span>
                            </p>
                            <p className="flex items-center gap-3">
                              <span className="text-muted-foreground">主机水压降</span>
                              <span className="font-semibold">4米</span>
                            </p>
                            <p className="flex items-center gap-3">
                              <span className="text-muted-foreground">风机盘管</span>
                              <span className="font-semibold">4米</span>
                            </p>
                            <p className="flex items-center gap-3 pt-1 border-t border-gray-200 dark:border-gray-700">
                              <span className="text-muted-foreground">总扬程</span>
                              <span className="font-bold text-blue-600">10.4米</span>
                            </p>
                          </div>
                        </div>

                        {/* 二次系统选型指导 */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <span className="h-6 w-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                            二次系统选型
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <div className="space-y-1.5">
                              <p className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span>主机侧：参考主机流量及水压降+1米</span>
                              </p>
                              <p className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span>二次侧流量：参考主机流量</span>
                              </p>
                              <p className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span>二次侧扬程：主管道阻力(600pa/m)+末端阻力(≤4米)</span>
                              </p>
                            </div>
                            <div className="space-y-1.5">
                              <p className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span>匹配水泵时，考虑冷热源侧和二次侧流量平衡</span>
                              </p>
                              <p className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span>多层分层输配时，考虑区域同开系数</span>
                              </p>
                              <p className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span>避免流量扬程过大，防止室内水流噪音</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Link href="/products">
                        <Button variant="outline" size="sm">
                          浏览全部产品
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-3">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">智能匹配</h4>
                      <p className="text-xs text-muted-foreground">
                        基于需求参数，智能推荐最合适的产品
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">精准选型</h4>
                      <p className="text-xs text-muted-foreground">
                        考虑多种因素，提供专业的选型建议
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-semibold text-sm mb-1">产品对比</h4>
                      <p className="text-xs text-muted-foreground">
                        支持多产品对比，轻松找到最优方案
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
