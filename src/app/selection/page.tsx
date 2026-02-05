"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Droplets, Search, ArrowLeft } from "lucide-react";

interface Pump {
  id: string;
  name: string;
  model: string;
  brand: string;
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
}

export default function SelectionPage() {
  const [flowRate, setFlowRate] = useState("");
  const [head, setHead] = useState("");
  const [results, setResults] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
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
              <Button variant="default">水泵选型</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-6 w-6" />
                水泵选型
              </CardTitle>
              <CardDescription>
                输入您的流量和扬程需求，系统将智能匹配合适的水泵产品
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="flowRate">流量 (m³/h) *</Label>
                  <Input
                    id="flowRate"
                    type="number"
                    step="0.01"
                    placeholder="例如：100"
                    value={flowRate}
                    onChange={(e) => setFlowRate(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    您需要的每小时流量
                  </p>
                </div>
                <div>
                  <Label htmlFor="head">扬程 (m) *</Label>
                  <Input
                    id="head"
                    type="number"
                    step="0.01"
                    placeholder="例如：50"
                    value={head}
                    onChange={(e) => setHead(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    您需要的扬程高度
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto">
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "搜索中..." : "开始选型"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searched && (
            <Card>
              <CardHeader>
                <CardTitle>选型结果</CardTitle>
                <CardDescription>
                  {results.length === 0
                    ? "未找到匹配的水泵产品，请调整搜索条件"
                    : `找到 ${results.length} 个匹配产品（按匹配度排序）`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">搜索中...</div>
                ) : results.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    未找到匹配的水泵产品，请尝试：
                    <ul className="list-disc list-inside mt-2 text-left inline-block">
                      <li>调整流量和扬程参数</li>
                      <li>前往产品库添加更多产品</li>
                    </ul>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>匹配度</TableHead>
                            <TableHead>产品名称</TableHead>
                            <TableHead>型号</TableHead>
                            <TableHead>品牌</TableHead>
                            <TableHead>流量 (m³/h)</TableHead>
                            <TableHead>扬程 (m)</TableHead>
                            <TableHead>功率 (kW)</TableHead>
                            <TableHead>效率 (%)</TableHead>
                            <TableHead>价格</TableHead>
                            <TableHead>应用类型</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results
                            .sort((a, b) => {
                              const scoreA = parseFloat(calculateMatchScore(a));
                              const scoreB = parseFloat(calculateMatchScore(b));
                              return scoreB - scoreA;
                            })
                            .map((pump) => (
                              <TableRow key={pump.id}>
                                <TableCell>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {calculateMatchScore(pump)}%
                                  </span>
                                </TableCell>
                                <TableCell className="font-medium">{pump.name}</TableCell>
                                <TableCell>{pump.model}</TableCell>
                                <TableCell>{pump.brand}</TableCell>
                                <TableCell>{pump.flowRate}</TableCell>
                                <TableCell>{pump.head}</TableCell>
                                <TableCell>{pump.power}</TableCell>
                                <TableCell>{pump.efficiency || "-"}</TableCell>
                                <TableCell>{pump.price || "-"}</TableCell>
                                <TableCell>{pump.applicationType || "-"}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card className="mt-8 bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-lg">选型说明</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• 系统会根据您的流量和扬程需求，匹配参数相近的水泵产品</li>
                <li>• 匹配度表示产品与您需求的匹配程度，数值越高越合适</li>
                <li>• 系统允许 ±20% 的参数偏差，以确保找到合适的产品</li>
                <li>• 建议选择匹配度较高的产品，并综合考虑价格和效率</li>
                <li>• 如需更精确的选型，请联系专业工程师</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
