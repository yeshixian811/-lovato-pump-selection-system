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

interface Pump {
  id: string;
  name: string;
  model: string;
  brand: string;
  pumpType: string | null;
  material: string | null;
  flowRate: string;
  head: string;
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

  const pumpTypes = [
    "离心泵",
    "潜水泵",
    "螺杆泵",
    "往复泵",
    "齿轮泵",
    "轴流泵",
    "混流泵",
  ];

  const materials = [
    "铸铁",
    "不锈钢",
    "塑料",
    "铸钢",
    "青铜",
    "合金",
  ];

  const applicationTypes = [
    "工业",
    "民用",
    "农业",
    "消防",
    "市政",
    "给排水",
    "暖通",
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-blue-100 text-blue-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Droplets className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              水泵选型系统
            </h1>
          </Link>
          <nav className="flex gap-4">
            <Link href="/products">
              <Button variant="ghost">产品库</Button>
            </Link>
            <Link href="/selection">
              <Button variant="default">高级选型</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">首页</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">高级选型</span>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          {/* Left Sidebar - Search Form */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  选型参数
                </CardTitle>
                <CardDescription className="text-blue-100">
                  输入您的需求，智能匹配最合适的产品
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
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
                <CardHeader>
                  <CardTitle className="text-base">已选产品 ({selectedPumps.size})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    对比已选产品
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Content - Results */}
          <div className="space-y-6">
            {searched && (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between">
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
                  <div className="flex gap-2">
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
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-muted-foreground">搜索中...</p>
                  </div>
                ) : results.length === 0 ? (
                  <Card className="text-center py-12">
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
                      ? "grid md:grid-cols-2 xl:grid-cols-3 gap-4"
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
                          className={`overflow-hidden transition-all hover:shadow-lg ${
                            selectedPumps.has(pump.id)
                              ? "ring-2 ring-blue-600 shadow-lg"
                              : ""
                          }`}
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
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
                                onClick={() => togglePumpSelection(pump.id)}
                              >
                                {selectedPumps.has(pump.id) ? (
                                  <Check className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <div className="h-4 w-4 border-2 border-gray-300 rounded" />
                                )}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
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
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Droplets className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">开始您的选型之旅</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        输入流量和扬程参数，系统将智能匹配最合适的水泵产品
                      </p>
                      <div className="flex justify-center gap-4">
                        <Link href="/products">
                          <Button variant="outline">
                            浏览全部产品
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-semibold mb-2">智能匹配</h4>
                      <p className="text-sm text-muted-foreground">
                        基于您的需求参数，智能推荐最合适的产品
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold mb-2">精准选型</h4>
                      <p className="text-sm text-muted-foreground">
                        考虑多种因素，提供专业的选型建议
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-semibold mb-2">产品对比</h4>
                      <p className="text-sm text-muted-foreground">
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
