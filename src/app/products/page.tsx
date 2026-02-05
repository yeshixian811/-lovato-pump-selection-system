"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Download, Edit, Trash2, Search, Droplets } from "lucide-react";

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
  createdAt: string;
}

export default function ProductsPage() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPump, setEditingPump] = useState<Pump | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    brand: "",
    pumpType: "",
    material: "",
    flowRate: "",
    head: "",
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
      pumpType: pump.pumpType || "",
      material: pump.material || "",
      flowRate: pump.flowRate,
      head: pump.head,
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

  const resetForm = () => {
    setFormData({
      name: "",
      model: "",
      brand: "",
      pumpType: "",
      material: "",
      flowRate: "",
      head: "",
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
              <Button variant="default">产品库</Button>
            </Link>
            <Link href="/selection">
              <Button variant="ghost">高级选型</Button>
            </Link>
          </nav>
        </div>
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPump ? "编辑产品" : "添加产品"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="name">产品名称 *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="model">产品型号 *</Label>
                        <Input
                          id="model"
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="brand">品牌 *</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="pumpType">泵类型</Label>
                        <Select value={formData.pumpType} onValueChange={(value) => setFormData({ ...formData, pumpType: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">无</SelectItem>
                            <SelectItem value="离心泵">离心泵</SelectItem>
                            <SelectItem value="潜水泵">潜水泵</SelectItem>
                            <SelectItem value="螺杆泵">螺杆泵</SelectItem>
                            <SelectItem value="往复泵">往复泵</SelectItem>
                            <SelectItem value="齿轮泵">齿轮泵</SelectItem>
                            <SelectItem value="轴流泵">轴流泵</SelectItem>
                            <SelectItem value="混流泵">混流泵</SelectItem>
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
                            <SelectItem value="">无</SelectItem>
                            <SelectItem value="铸铁">铸铁</SelectItem>
                            <SelectItem value="不锈钢">不锈钢</SelectItem>
                            <SelectItem value="塑料">塑料</SelectItem>
                            <SelectItem value="铸钢">铸钢</SelectItem>
                            <SelectItem value="青铜">青铜</SelectItem>
                            <SelectItem value="合金">合金</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="applicationType">应用类型</Label>
                        <Input
                          id="applicationType"
                          value={formData.applicationType}
                          onChange={(e) => setFormData({ ...formData, applicationType: e.target.value })}
                          placeholder="如：工业、民用、农业"
                        />
                      </div>
                      <div>
                        <Label htmlFor="flowRate">流量 (m³/h) *</Label>
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
                        <Label htmlFor="head">扬程 (m) *</Label>
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
                        <TableHead>产品名称</TableHead>
                        <TableHead>型号</TableHead>
                        <TableHead>品牌</TableHead>
                        <TableHead>泵类型</TableHead>
                        <TableHead>材质</TableHead>
                        <TableHead>流量 (m³/h)</TableHead>
                        <TableHead>扬程 (m)</TableHead>
                        <TableHead>功率 (kW)</TableHead>
                        <TableHead>应用类型</TableHead>
                        <TableHead>价格</TableHead>
                        <TableHead className="text-right">操作</TableHead>
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
                            <TableCell className="font-medium">{pump.name}</TableCell>
                            <TableCell>{pump.model}</TableCell>
                            <TableCell>{pump.brand}</TableCell>
                            <TableCell>{pump.pumpType || "-"}</TableCell>
                            <TableCell>{pump.material || "-"}</TableCell>
                            <TableCell>{pump.flowRate}</TableCell>
                            <TableCell>{pump.head}</TableCell>
                            <TableCell>{pump.power}</TableCell>
                            <TableCell>{pump.applicationType || "-"}</TableCell>
                            <TableCell>{pump.price || "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(pump)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(pump.id)}
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
  );
}
