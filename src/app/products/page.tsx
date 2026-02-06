"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { PasswordProtect } from "@/components/password-protect";
import { Plus, Upload, Download, Edit, Trash2, Search, Droplets, TrendingUp } from "lucide-react";
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
  createdAt: string;
}

interface PerformanceData {
  pump: Pump;
  performancePoints: Array<{
    flowRate: number;
    head: number;
    power: number;
    efficiency: number | null;
  }>;
}

export default function ProductsPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPump, setEditingPump] = useState<Pump | null>(null);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    brand: "",
    pumpType: "",
    material: "",
    flowRate: "",
    head: "",
    maxFlow: "",
    maxHead: "",
    power: "",
    efficiency: "",
    speed: "",
    inletDiameter: "",
    outletDiameter: "",
    applicationType: "",
    description: "",
    price: "",
    maxTemperature: "",
    maxPressure: "",
  });

  useEffect(() => {
    fetchPumps();
  }, []);

  // 提取唯一的产品名称、型号、品牌列表
  const uniqueNames = useMemo(() => {
    return [...new Set(pumps.map((p) => p.name).filter(Boolean))].sort();
  }, [pumps]);

  const uniqueModels = useMemo(() => {
    return [...new Set(pumps.map((p) => p.model).filter(Boolean))].sort();
  }, [pumps]);

  const uniqueBrands = useMemo(() => {
    return [...new Set(pumps.map((p) => p.brand).filter(Boolean))].sort();
  }, [pumps]);

  const fetchPumps = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pumps");
      const data = await response.json();
      setPumps(data.pumps);
    } catch (error) {
      console.error("Error fetching pumps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/pumps", window.location.origin);
      if (searchTerm) {
        url.searchParams.set("model", searchTerm);
        url.searchParams.set("brand", searchTerm);
      }
      const response = await fetch(url.toString());
      const data = await response.json();
      setPumps(data.pumps);
    } catch (error) {
      console.error("Error searching pumps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        pumpType: formData.pumpType === "none" ? null : formData.pumpType,
        material: formData.material === "none" ? null : formData.material,
        flowRate: parseFloat(formData.flowRate),
        head: parseFloat(formData.head),
        power: parseFloat(formData.power),
        efficiency: formData.efficiency ? parseFloat(formData.efficiency) : null,
        speed: formData.speed ? parseInt(formData.speed) : null,
        inletDiameter: formData.inletDiameter ? parseInt(formData.inletDiameter) : null,
        outletDiameter: formData.outletDiameter ? parseInt(formData.outletDiameter) : null,
        price: formData.price ? parseFloat(formData.price) : null,
        maxTemperature: formData.maxTemperature ? parseFloat(formData.maxTemperature) : null,
        maxPressure: formData.maxPressure ? parseFloat(formData.maxPressure) : null,
      };

      if (editingPump) {
        await fetch(`/api/pumps/${editingPump.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/pumps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setIsDialogOpen(false);
      setEditingPump(null);
      resetForm();
      fetchPumps();
    } catch (error) {
      console.error("Error saving pump:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个产品吗？")) return;

    try {
      await fetch(`/api/pumps/${id}`, { method: "DELETE" });
      fetchPumps();
    } catch (error) {
      console.error("Error deleting pump:", error);
    }
  };

  const handleEdit = (pump: Pump) => {
    setEditingPump(pump);
    setFormData({
      name: pump.name,
      model: pump.model,
      brand: pump.brand,
      pumpType: pump.pumpType || "none",
      material: pump.material || "none",
      flowRate: pump.flowRate,
      head: pump.head,
      maxFlow: pump.maxFlow || "",
      maxHead: pump.maxHead || "",
      power: pump.power,
      efficiency: pump.efficiency || "",
      speed: pump.speed?.toString() || "",
      inletDiameter: pump.inletDiameter?.toString() || "",
      outletDiameter: pump.outletDiameter?.toString() || "",
      applicationType: pump.applicationType || "",
      description: pump.description || "",
      price: pump.price || "",
      maxTemperature: "",
      maxPressure: "",
    });
    setIsDialogOpen(true);
  };

  const handleViewPerformance = async (pump: Pump) => {
    try {
      setPerformanceLoading(true);
      setIsPerformanceOpen(true);

      const response = await fetch(`/api/pumps/${pump.id}/performance`);
      if (!response.ok) {
        throw new Error("Failed to fetch performance data");
      }

      const data = await response.json();
      setPerformanceData(data);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      alert("加载性能曲线失败，请稍后重试");
      setIsPerformanceOpen(false);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      model: "",
      brand: "",
      pumpType: "none",
      material: "none",
      flowRate: "",
      head: "",
      maxFlow: "",
      maxHead: "",
      power: "",
      efficiency: "",
      speed: "",
      inletDiameter: "",
      outletDiameter: "",
      applicationType: "",
      description: "",
      price: "",
      maxTemperature: "",
      maxPressure: "",
    });
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/pumps/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pump-products-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting pumps:", error);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/pumps/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      alert(`导入成功：${result.success} 条\n导入失败：${result.failed} 条`);
      fetchPumps();
    } catch (error) {
      console.error("Error importing pumps:", error);
      alert("导入失败，请检查文件格式");
    }

    e.target.value = "";
  };

  return (
    <PasswordProtect correctPassword="yezi100243">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4"></div>
        </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>产品库管理</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Actions */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="搜索产品型号或品牌..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  搜索
                </Button>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingPump(null); resetForm(); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加产品
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPump ? "编辑产品" : "添加产品"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="name">产品名称 *</Label>
                        <Combobox
                          options={uniqueNames}
                          value={formData.name}
                          onValueChange={(value) => setFormData({ ...formData, name: value })}
                          placeholder="选择或输入产品名称"
                          allowCustom={true}
                        />
                      </div>
                      <div>
                        <Label htmlFor="model">产品型号 *</Label>
                        <Combobox
                          options={uniqueModels}
                          value={formData.model}
                          onValueChange={(value) => setFormData({ ...formData, model: value })}
                          placeholder="选择或输入产品型号"
                          allowCustom={true}
                        />
                      </div>
                      <div>
                        <Label htmlFor="brand">品牌 *</Label>
                        <Combobox
                          options={uniqueBrands}
                          value={formData.brand}
                          onValueChange={(value) => setFormData({ ...formData, brand: value })}
                          placeholder="选择或输入品牌"
                          allowCustom={true}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pumpType">泵类型</Label>
                        <Select value={formData.pumpType} onValueChange={(value) => setFormData({ ...formData, pumpType: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">无</SelectItem>
                            <SelectItem value="自适应变频屏蔽泵">自适应变频屏蔽泵</SelectItem>
                            <SelectItem value="卧式多级离心泵">卧式多级离心泵</SelectItem>
                            <SelectItem value="立式多级离心泵">立式多级离心泵</SelectItem>
                            <SelectItem value="立式单级管道泵">立式单级管道泵</SelectItem>
                            <SelectItem value="卧式单级端吸泵">卧式单级端吸泵</SelectItem>
                            <SelectItem value="卧式多级离心增压泵">卧式多级离心增压泵</SelectItem>
                            <SelectItem value="立式多级离心增压泵">立式多级离心增压泵</SelectItem>
                            <SelectItem value="立式单级管道增压泵">立式单级管道增压泵</SelectItem>
                            <SelectItem value="卧式单级端吸增压泵">卧式单级端吸增压泵</SelectItem>
                            <SelectItem value="卧式多级离心变频增压泵">卧式多级离心变频增压泵</SelectItem>
                            <SelectItem value="立式多级离心变频增压泵">立式多级离心变频增压泵</SelectItem>
                            <SelectItem value="立式单级管道变频增压泵">立式单级管道变频增压泵</SelectItem>
                            <SelectItem value="卧式单级端吸变频增压泵">卧式单级端吸变频增压泵</SelectItem>
                            <SelectItem value="家用变频增压泵">家用变频增压泵</SelectItem>
                            <SelectItem value="工频屏蔽泵">工频屏蔽泵</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="material">材质</Label>
                        <Select value={formData.material} onValueChange={(value) => setFormData({ ...formData, material: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择材质" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">无</SelectItem>
                            <SelectItem value="不锈钢">不锈钢</SelectItem>
                            <SelectItem value="铸铁">铸铁</SelectItem>
                            <SelectItem value="塑料">塑料</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="applicationType">应用场景</Label>
                        <Select value={formData.applicationType} onValueChange={(value) => setFormData({ ...formData, applicationType: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择应用场景" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="供水系统">供水系统</SelectItem>
                            <SelectItem value="建筑供水">建筑供水</SelectItem>
                            <SelectItem value="市政供水">市政供水</SelectItem>
                            <SelectItem value="消防系统">消防系统</SelectItem>
                            <SelectItem value="暖通空调">暖通空调</SelectItem>
                            <SelectItem value="工业循环">工业循环</SelectItem>
                            <SelectItem value="化工流程">化工流程</SelectItem>
                            <SelectItem value="污水处理">污水处理</SelectItem>
                            <SelectItem value="污水提升">污水提升</SelectItem>
                            <SelectItem value="农业灌溉">农业灌溉</SelectItem>
                            <SelectItem value="深井取水">深井取水</SelectItem>
                            <SelectItem value="地下水抽取">地下水抽取</SelectItem>
                            <SelectItem value="锅炉给水">锅炉给水</SelectItem>
                            <SelectItem value="冷却循环">冷却循环</SelectItem>
                            <SelectItem value="泳池循环">泳池循环</SelectItem>
                            <SelectItem value="园林喷灌">园林喷灌</SelectItem>
                            <SelectItem value="水产养殖">水产养殖</SelectItem>
                            <SelectItem value="船舶">船舶</SelectItem>
                            <SelectItem value="其他">其他</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="flowRate">额定流量 (m³/h) *</Label>
                        <Input
                          id="flowRate"
                          type="number"
                          step="0.01"
                          value={formData.flowRate}
                          onChange={(e) => setFormData({ ...formData, flowRate: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="head">额定扬程 (m) *</Label>
                        <Input
                          id="head"
                          type="number"
                          step="0.01"
                          value={formData.head}
                          onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxFlow">最大流量 (m³/h)</Label>
                        <Input
                          id="maxFlow"
                          type="number"
                          step="0.01"
                          value={formData.maxFlow}
                          onChange={(e) => setFormData({ ...formData, maxFlow: e.target.value })}
                          placeholder="可选"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxHead">最大扬程 (m)</Label>
                        <Input
                          id="maxHead"
                          type="number"
                          step="0.01"
                          value={formData.maxHead}
                          onChange={(e) => setFormData({ ...formData, maxHead: e.target.value })}
                          placeholder="可选"
                        />
                      </div>
                      <div>
                        <Label htmlFor="power">功率 (kW) *</Label>
                        <Input
                          id="power"
                          type="number"
                          step="0.01"
                          value={formData.power}
                          onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="efficiency">效率 (%)</Label>
                        <Input
                          id="efficiency"
                          type="number"
                          step="0.01"
                          value={formData.efficiency}
                          onChange={(e) => setFormData({ ...formData, efficiency: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="speed">转速 (rpm)</Label>
                        <Input
                          id="speed"
                          type="number"
                          value={formData.speed}
                          onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">价格</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="inletDiameter">进口直径 (mm)</Label>
                        <Input
                          id="inletDiameter"
                          type="number"
                          value={formData.inletDiameter}
                          onChange={(e) => setFormData({ ...formData, inletDiameter: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="outletDiameter">出口直径 (mm)</Label>
                        <Input
                          id="outletDiameter"
                          type="number"
                          value={formData.outletDiameter}
                          onChange={(e) => setFormData({ ...formData, outletDiameter: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxTemperature">最高温度 (°C)</Label>
                        <Input
                          id="maxTemperature"
                          type="number"
                          step="0.01"
                          value={formData.maxTemperature}
                          onChange={(e) => setFormData({ ...formData, maxTemperature: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxPressure">最高压力 (bar)</Label>
                        <Input
                          id="maxPressure"
                          type="number"
                          step="0.01"
                          value={formData.maxPressure}
                          onChange={(e) => setFormData({ ...formData, maxPressure: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">描述</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        取消
                      </Button>
                      <Button type="submit">{editingPump ? "更新" : "添加"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>

              <div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      导入
                    </span>
                  </Button>
                </label>
              </div>

              <Button variant="outline" onClick={() => window.open('/pump-import-template.txt', '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                模板
              </Button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-8">加载中...</div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">产品名称</TableHead>
                        <TableHead className="whitespace-nowrap">型号</TableHead>
                        <TableHead className="whitespace-nowrap">品牌</TableHead>
                        <TableHead className="whitespace-nowrap">泵类型</TableHead>
                        <TableHead className="whitespace-nowrap">材质</TableHead>
                        <TableHead className="whitespace-nowrap">额定流量 (m³/h)</TableHead>
                        <TableHead className="whitespace-nowrap">额定扬程 (m)</TableHead>
                        <TableHead className="whitespace-nowrap">功率 (kW)</TableHead>
                        <TableHead className="whitespace-nowrap">应用场景</TableHead>
                        <TableHead className="whitespace-nowrap">价格</TableHead>
                        <TableHead className="text-right whitespace-nowrap">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pumps.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-8">
                            暂无产品数据，请添加产品或导入数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        pumps.map((pump) => (
                          <TableRow key={pump.id}>
                            <TableCell className="font-medium whitespace-nowrap">{pump.name}</TableCell>
                            <TableCell className="whitespace-nowrap">{pump.model}</TableCell>
                            <TableCell className="whitespace-nowrap">{pump.brand}</TableCell>
                            <TableCell className="whitespace-nowrap">{pump.pumpType || "-"}</TableCell>
                            <TableCell className="whitespace-nowrap">{pump.material || "-"}</TableCell>
                            <TableCell className="whitespace-nowrap">{pump.flowRate}</TableCell>
                            <TableCell className="whitespace-nowrap">{pump.head}</TableCell>
                            <TableCell className="whitespace-nowrap">{pump.power}</TableCell>
                            <TableCell className="whitespace-nowrap">{pump.applicationType || "-"}</TableCell>
                            <TableCell className="whitespace-nowrap">{pump.price || "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewPerformance(pump)}
                                  title="查看性能曲线"
                                >
                                  <TrendingUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(pump)}
                                  title="编辑"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(pump.id)}
                                  title="删除"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>

    {/* 性能曲线查看弹窗 */}
    <Dialog open={isPerformanceOpen} onOpenChange={setIsPerformanceOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>性能曲线查看</DialogTitle>
        </DialogHeader>
        {performanceLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-muted-foreground">加载中...</p>
          </div>
        ) : performanceData ? (
          <div className="space-y-4">
            {/* 水泵基本信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">型号</Label>
                <div className="font-semibold">{performanceData.pump.model}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">额定流量</Label>
                <div className="font-semibold">{performanceData.pump.flowRate} m³/h</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">额定扬程</Label>
                <div className="font-semibold">{performanceData.pump.head} m</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">功率</Label>
                <div className="font-semibold">{performanceData.pump.power} kW</div>
              </div>
            </div>

            {/* 性能曲线图 */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
              <Label className="mb-2 block">Q-H 性能曲线</Label>
              <PumpCurveChart
                pumpFlow={performanceData.pump.flowRate}
                pumpHead={performanceData.pump.head}
                pumpMaxFlow={performanceData.pump.maxFlow}
                pumpMaxHead={performanceData.pump.maxHead}
                userFlow={null}
                userHead={null}
              />
            </div>

            {/* 性能数据统计 */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <Label className="mb-2 block">性能数据统计</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">数据点数量：</span>
                  <span className="font-semibold ml-1">{performanceData.performancePoints.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">流量范围：</span>
                  <span className="font-semibold ml-1">
                    {performanceData.performancePoints[0]?.flowRate.toFixed(1)} - {performanceData.performancePoints[performanceData.performancePoints.length - 1]?.flowRate.toFixed(1)} m³/h
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">最大扬程：</span>
                  <span className="font-semibold ml-1">
                    {Math.max(...performanceData.performancePoints.map(p => p.head)).toFixed(1)} m
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">最大功率：</span>
                  <span className="font-semibold ml-1">
                    {Math.max(...performanceData.performancePoints.map(p => p.power)).toFixed(2)} kW
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
    </PasswordProtect>
  );
}
