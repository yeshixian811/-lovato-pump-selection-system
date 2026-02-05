// 选型功能权限检查组件
"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Crown, AlertCircle, Loader2 } from "lucide-react";

interface SubscriptionInfo {
  tier: string;
  status: string;
  endDate: Date | null;
  features: {
    maxSelections: number | null;
    historyRetention: number | null;
    exportFormats: string[];
    supportPriority: string;
    apiAccess: boolean;
    maxUsers: number;
  };
}

interface UsageStats {
  selectionsThisMonth: number;
  maxSelections: number;
  lastResetDate: Date;
}

interface SelectionPermissionCheckProps {
  onPermissionChecked?: (allowed: boolean, info?: { canSelect: boolean; limitReached: boolean; remaining: number }) => void;
  showUpgradePrompt?: boolean;
}

export function SelectionPermissionCheck({ 
  onPermissionChecked, 
  showUpgradePrompt = true 
}: SelectionPermissionCheckProps) {
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取用户订阅信息
      const subscriptionRes = await fetch('/api/subscription/status');
      const subscriptionData = await subscriptionRes.json();

      // 获取使用统计
      const usageRes = await fetch('/api/usage/stats');
      const usageData = await usageRes.json();

      if (subscriptionData.success) {
        setSubscriptionInfo(subscriptionData.subscription);
      }

      if (usageData.success) {
        setUsageStats(usageData.stats);
      }

      // 检查权限
      const maxSelections = subscriptionData.subscription.features.maxSelections;
      const currentSelections = usageData.stats.selectionsThisMonth;

      if (maxSelections === null) {
        // 无限次选型
        onPermissionChecked?.(true, { canSelect: true, limitReached: false, remaining: Infinity });
      } else if (currentSelections >= maxSelections) {
        // 达到限制
        onPermissionChecked?.(false, { canSelect: false, limitReached: true, remaining: 0 });
      } else {
        // 还可以使用
        const remaining = maxSelections - currentSelections;
        onPermissionChecked?.(true, { canSelect: true, limitReached: false, remaining });
      }
    } catch (err) {
      console.error('权限检查失败:', err);
      setError('无法验证会员状态');
      
      // 出错时允许使用（用于测试）
      onPermissionChecked?.(true, { canSelect: true, limitReached: false, remaining: 10 });
    } finally {
      setLoading(false);
    }
  };

  // 加载中
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">验证会员状态...</span>
      </div>
    );
  }

  // 出错
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}，请刷新页面重试
        </AlertDescription>
      </Alert>
    );
  }

  // 免费会员达到限制
  if (subscriptionInfo?.tier === 'free' && usageStats && usageStats.selectionsThisMonth >= 10) {
    if (!showUpgradePrompt) {
      return null;
    }

    return (
      <div className="space-y-4">
        <Alert className="border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <Crown className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900 dark:text-yellow-100">
            <div className="space-y-2">
              <p className="font-semibold">
                本月选型次数已用完
              </p>
              <p className="text-sm">
                免费会员每月限制10次选型，升级会员即可享受无限次选型
              </p>
              <div className="flex gap-2 mt-2">
                <Link href="/pricing">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    立即升级
                  </Button>
                </Link>
                <Button size="sm" variant="outline">
                  了解更多
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // 显示使用统计
  if (subscriptionInfo?.tier === 'free' && usageStats) {
    const remaining = 10 - usageStats.selectionsThisMonth;
    const percentage = (usageStats.selectionsThisMonth / 10) * 100;

    return (
      <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              本月已使用 <strong>{usageStats.selectionsThisMonth}</strong> / 10 次选型，
              剩余 <strong>{remaining}</strong> 次
            </div>
            {remaining <= 2 && (
              <Link href="/pricing">
                <Button size="sm" variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400">
                  升级解锁无限次 <Crown className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            )}
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // 付费会员
  if (subscriptionInfo?.tier === 'basic' || subscriptionInfo?.tier === 'pro') {
    return (
      <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <Crown className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-900 dark:text-green-100 text-sm">
          {subscriptionInfo.tier === 'basic' ? '基础会员' : '高级会员'} - 享受无限次选型
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

// 导出权限检查
export function ExportPermissionCheck({ format }: { format: string }) {
  const [loading, setLoading] = useState(true);
  const [canExport, setCanExport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkExportPermission();
  }, [format]);

  const checkExportPermission = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/subscription/can-export?format=${format}`);
      const data = await response.json();

      if (data.success) {
        setCanExport(data.canExport);
      }
    } catch (err) {
      console.error('导出权限检查失败:', err);
      setError('无法验证导出权限');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (error) {
    return null;
  }

  if (!canExport) {
    return (
      <Alert variant="destructive">
        <Crown className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold">
              升级会员以使用此功能
            </p>
            <p className="text-sm">
              导出{format.toUpperCase()}格式需要{format === 'excel' ? '高级会员' : '基础会员'}或以上
            </p>
            <Link href="/pricing">
              <Button size="sm" variant="outline">
                查看定价
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
