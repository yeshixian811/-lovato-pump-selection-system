'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Database, Settings, Link as LinkIcon } from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'pass' | 'fail';
      responseTime?: number;
      message?: string;
    };
    memory: {
      status: 'pass' | 'fail';
      usage: {
        used: number;
        total: number;
        percentage: number;
      };
    };
  };
}

export default function DiagnosticPage() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      console.error('健康检查失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // 每30秒自动检查一次
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !healthStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">正在检查系统状态...</p>
        </div>
      </div>
    );
  }

  const isHealthy = healthStatus?.status === 'healthy';
  const isUnhealthy = healthStatus?.status === 'unhealthy';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            系统诊断
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            检查系统运行状态和配置
          </p>
        </div>

        {/* 总体状态 */}
        <Card className={`mb-6 ${isUnhealthy ? 'border-red-500' : isHealthy ? 'border-green-500' : 'border-yellow-500'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isUnhealthy && <XCircle className="h-8 w-8 text-red-600" />}
                {isHealthy && <CheckCircle2 className="h-8 w-8 text-green-600" />}
                {healthStatus?.status === 'degraded' && <AlertCircle className="h-8 w-8 text-yellow-600" />}
                <div>
                  <CardTitle>
                    {isUnhealthy && '系统不健康'}
                    {isHealthy && '系统运行正常'}
                    {healthStatus?.status === 'degraded' && '系统性能降级'}
                  </CardTitle>
                  <CardDescription>
                    最后检查时间: {healthStatus?.timestamp}
                  </CardDescription>
                </div>
              </div>
              <Button onClick={checkHealth} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* 数据库状态 */}
        <Card className={`mb-6 ${healthStatus?.checks.database.status === 'fail' ? 'border-red-500' : 'border-green-500'}`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className={`h-6 w-6 ${healthStatus?.checks.database.status === 'fail' ? 'text-red-600' : 'text-green-600'}`} />
              <div>
                <CardTitle>数据库连接</CardTitle>
                <CardDescription>PostgreSQL 数据库状态</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">状态:</span>
                <span className={`text-sm ${healthStatus?.checks.database.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                  {healthStatus?.checks.database.status === 'pass' ? '✓ 正常' : '✗ 失败'}
                </span>
              </div>
              {healthStatus?.checks.database.responseTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">响应时间:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {healthStatus.checks.database.responseTime}ms
                  </span>
                </div>
              )}
              {healthStatus?.checks.database.message && (
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {healthStatus.checks.database.message}
                  </p>
                </div>
              )}

              {/* 数据库连接失败的解决方案 */}
              {healthStatus?.checks.database.status === 'fail' && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-semibold text-red-900 dark:text-red-400 mb-2">解决方案:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-red-800 dark:text-red-300">
                    <li>确保 PostgreSQL 已安装并运行</li>
                    <li>检查 <code className="bg-red-100 dark:bg-red-900 px-1 rounded">.env</code> 文件中的数据库配置</li>
                    <li>确认数据库用户名和密码正确</li>
                    <li>运行数据库迁移: <code className="bg-red-100 dark:bg-red-900 px-1 rounded">pnpm run db:push</code></li>
                  </ol>
                  <div className="mt-4">
                    <a href="/local-deployment-flow" className="text-blue-600 hover:underline text-sm">
                      查看详细部署流程 →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 内存状态 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>内存使用</CardTitle>
            <CardDescription>Node.js 进程内存使用情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">已使用:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {healthStatus?.checks.memory.usage.used} MB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">总计:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {healthStatus?.checks.memory.usage.total} MB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">使用率:</span>
                <span className={`text-sm ${healthStatus?.checks.memory.usage.percentage > 90 ? 'text-red-600' : 'text-green-600'}`}>
                  {healthStatus?.checks.memory.usage.percentage}%
                </span>
              </div>
              {/* 进度条 */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    healthStatus?.checks.memory.usage.percentage > 90
                      ? 'bg-red-600'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${healthStatus?.checks.memory.usage.percentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 系统信息 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-gray-600" />
              <div>
                <CardTitle>系统信息</CardTitle>
                <CardDescription>应用配置和版本信息</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">版本:</span>
                <span className="font-medium">{healthStatus?.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">环境:</span>
                <span className="font-medium">{healthStatus?.environment}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">运行时间:</span>
                <span className="font-medium">{Math.floor(healthStatus?.uptime || 0 / 60)} 分钟</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 快速链接 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <LinkIcon className="h-6 w-6 text-gray-600" />
              <CardTitle>快速链接</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a href="/" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  返回首页
                </Button>
              </a>
              <a href="/selection" className="block">
                <Button variant="outline" className="w-full justify-start">
                  开始选型
                </Button>
              </a>
              <a href="/admin" className="block">
                <Button variant="outline" className="w-full justify-start">
                  管理后台
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
