'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Activity,
  Database,
  Box,
  Server,
  RefreshCw,
  Play,
  Square,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HardDrive,
  Cpu,
  MemoryStick,
  Clock,
  Globe,
} from 'lucide-react';

interface Container {
  ID: string;
  Names: string[];
  Image: string;
  State: string;
  Status: string;
  Ports: string;
}

interface SystemStats {
  system: {
    cpu: {
      usage: number;
      cores: number;
    };
    memory: {
      total: number;
      used: number;
      free: number;
      usage: number;
    };
    disk: {
      total: string;
      used: string;
      usage: number;
    };
    load: number[];
    uptime: number;
    uptimeFormatted: string;
  };
  docker: Array<{
    name: string;
    cpu: string;
    memory: string;
    memoryPercent: string;
  }>;
}

interface DatabaseStatus {
  host: string;
  port: number;
  user: string;
  database: string;
  status: string;
  portOpen: boolean;
  tableCount: number;
  connectionTime: number;
  containerStatus: string;
}

export default function AdminPanel() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 刷新所有数据
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchContainers(),
        fetchSystemStats(),
        fetchDatabaseStatus(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // 获取容器状态
  const fetchContainers = async () => {
    try {
      const res = await fetch('/api/admin/docker/ps');
      const data = await res.json();
      if (data.success) {
        setContainers(data.all || []);
      }
    } catch (error) {
      console.error('获取容器状态失败:', error);
    }
  };

  // 获取系统统计
  const fetchSystemStats = async () => {
    try {
      const res = await fetch('/api/admin/system/stats');
      const data = await res.json();
      if (data.success) {
        setSystemStats(data);
      }
    } catch (error) {
      console.error('获取系统统计失败:', error);
    }
  };

  // 获取数据库状态
  const fetchDatabaseStatus = async () => {
    try {
      const res = await fetch('/api/admin/database/status');
      const data = await res.json();
      if (data.success) {
        setDatabaseStatus(data.database);
      }
    } catch (error) {
      console.error('获取数据库状态失败:', error);
    }
  };

  // 获取容器日志
  const fetchLogs = async (container: string) => {
    try {
      const res = await fetch(`/api/admin/docker/logs?container=${container}&tail=100`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('获取日志失败:', error);
    }
  };

  // 重启容器
  const restartContainer = async (container: string) => {
    if (!confirm(`确定要重启容器 ${container} 吗？`)) return;

    try {
      const res = await fetch('/api/admin/docker/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ container }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        refreshData();
      } else {
        alert('重启失败: ' + data.error);
      }
    } catch (error) {
      console.error('重启容器失败:', error);
      alert('重启失败');
    }
  };

  // 初始化
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    init();

    // 自动刷新（每30秒）
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 选择容器查看日志
  useEffect(() => {
    if (selectedContainer) {
      fetchLogs(selectedContainer);
    }
  }, [selectedContainer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* 头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                部署管理面板
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                洛瓦托水泵选型系统 - 服务器监控与管理
              </p>
            </div>
            <Button
              onClick={refreshData}
              disabled={refreshing}
              size="lg"
              className="gap-2"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              刷新数据
            </Button>
          </div>
        </div>

        {/* 系统概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU 使用率</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStats?.system.cpu.usage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {systemStats?.system.cpu.cores} 核心
              </p>
              <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${systemStats?.system.cpu.usage || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">内存使用</CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStats?.system.memory.usage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {systemStats?.system.memory.used.toFixed(1)} / {systemStats?.system.memory.total.toFixed(1)} GB
              </p>
              <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${systemStats?.system.memory.usage || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">磁盘使用</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStats?.system.disk.usage}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {systemStats?.system.disk.used} / {systemStats?.system.disk.total}
              </p>
              <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${systemStats?.system.disk.usage > 80 ? 'bg-red-500' : 'bg-purple-500'}`}
                  style={{ width: `${systemStats?.system.disk.usage || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">运行时间</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStats?.system.uptimeFormatted}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                负载: {systemStats?.system.load[0].toFixed(2)}, {systemStats?.system.load[1].toFixed(2)}, {systemStats?.system.load[2].toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容 */}
        <Tabs defaultValue="containers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="containers" className="gap-2">
              <Box className="h-4 w-4" />
              容器管理
            </TabsTrigger>
            <TabsTrigger value="database" className="gap-2">
              <Database className="h-4 w-4" />
              数据库状态
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Server className="h-4 w-4" />
              系统监控
            </TabsTrigger>
          </TabsList>

          {/* 容器管理 */}
          <TabsContent value="containers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 容器列表 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    容器列表
                  </CardTitle>
                  <CardDescription>
                    共 {containers.length} 个容器，{containers.filter((c) => c.State === 'running').length} 个运行中
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {containers.map((container) => (
                      <div
                        key={container.ID}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedContainer === container.Names[0]
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedContainer(container.Names[0])}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {container.State === 'running' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="font-semibold">{container.Names[0].replace('/', '')}</span>
                          </div>
                          <Badge
                            variant={container.State === 'running' ? 'default' : 'destructive'}
                          >
                            {container.State}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>镜像: {container.Image}</div>
                          <div>状态: {container.Status}</div>
                          {container.Ports && <div>端口: {container.Ports}</div>}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            restartContainer(container.Names[0].replace('/', ''));
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          重启
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 容器日志 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    容器日志
                  </CardTitle>
                  <CardDescription>
                    {selectedContainer
                      ? `查看 ${selectedContainer} 的日志`
                      : '选择一个容器查看日志'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedContainer ? (
                    <ScrollArea className="h-[500px] w-full rounded-lg bg-slate-950 p-4">
                      <div className="space-y-2 font-mono text-sm">
                        {logs.map((log, index) => (
                          <div
                            key={index}
                            className="text-slate-300 whitespace-pre-wrap break-all"
                          >
                            {log}
                          </div>
                        ))}
                        {logs.length === 0 && (
                          <div className="text-slate-500 text-center py-8">
                            暂无日志
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                      请选择一个容器查看日志
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 数据库状态 */}
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  PostgreSQL 数据库状态
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">连接地址</div>
                    <div className="text-lg font-semibold">
                      {databaseStatus?.host}:{databaseStatus?.port}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">数据库</div>
                    <div className="text-lg font-semibold">{databaseStatus?.database}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">用户</div>
                    <div className="text-lg font-semibold">{databaseStatus?.user}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">连接状态</div>
                    <div className="flex items-center gap-2">
                      {databaseStatus?.status === 'connected' ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-lg font-semibold text-green-500">已连接</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="text-lg font-semibold text-red-500">未连接</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">端口状态</div>
                    <div className="flex items-center gap-2">
                      {databaseStatus?.portOpen ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-lg font-semibold text-green-500">开放</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="text-lg font-semibold text-red-500">关闭</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">数据表数量</div>
                    <div className="text-lg font-semibold">{databaseStatus?.tableCount}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">连接延迟</div>
                    <div className="text-lg font-semibold">{databaseStatus?.connectionTime} ms</div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="text-sm font-medium text-muted-foreground">容器状态</div>
                    <div className="text-lg font-semibold">{databaseStatus?.containerStatus}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 系统监控 */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  系统资源监控
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Docker 容器资源使用 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Docker 容器资源使用</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {systemStats?.docker.map((container, index) => (
                        <div key={index} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold">{container.name}</span>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">CPU</span>
                                <span>{container.cpu}%</span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500"
                                  style={{ width: container.cpu }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">内存</span>
                                <span>{container.memory}</span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500"
                                  style={{ width: container.memoryPercent }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
