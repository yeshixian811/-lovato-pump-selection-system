'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  GitBranch,
  ArrowLeft,
  Plus,
  RotateCcw,
  Eye,
  FileCode,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface Version {
  id: string;
  versionNumber: number;
  name: string;
  description: string | null;
  createdBy: string | null;
  status: string;
  isCurrent: boolean;
  createdAt: string;
}

interface VersionFile {
  id: string;
  versionId: string;
  filePath: string;
  fileContent: string;
  fileType: string;
  createdAt: string;
}

interface VersionChange {
  id: string;
  versionId: string;
  action: string;
  targetPath: string;
  changeDescription: string | null;
  createdAt: string;
}

export default function VersionManagementPage() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [selectedVersionData, setSelectedVersionData] = useState<{
    version: Version;
    files: VersionFile[];
    changes: VersionChange[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/versions');
      const data = await response.json();
      setVersions(data.versions || []);
      setCurrentVersion(data.currentVersion);
    } catch (err: any) {
      setError(err.message || '加载版本列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadVersionDetail = async (versionId: string) => {
    try {
      const response = await fetch(`/api/versions/${versionId}`);
      const data = await response.json();
      setSelectedVersionData(data);
    } catch (err: any) {
      setError(err.message || '加载版本详情失败');
    }
  };

  const handleCreateVersion = async () => {
    if (!newVersionName.trim()) {
      setError('请输入版本名称');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newVersionName,
          description: newVersionDesc,
          files: [
            'src/app/selection/page.tsx',
            'src/app/page.tsx',
            'src/app/api/pump/match/route.ts',
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '创建版本失败');
      }

      setShowCreateDialog(false);
      setNewVersionName('');
      setNewVersionDesc('');
      await loadVersions();
      setError('');
    } catch (err: any) {
      setError(err.message || '创建版本失败');
    } finally {
      setCreating(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!confirm('确定要回滚到这个版本吗？这将创建一个新的回滚版本。')) {
      return;
    }

    try {
      setRollingBack(true);
      const response = await fetch(`/api/versions/${versionId}/rollback`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '回滚失败');
      }

      await loadVersions();
      setError('');
      alert('回滚成功！');
    } catch (err: any) {
      setError(err.message || '回滚失败');
    } finally {
      setRollingBack(false);
    }
  };

  const handleSetCurrent = async (versionId: string) => {
    try {
      const response = await fetch(`/api/versions/${versionId}/set-current`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '设置失败');
      }

      await loadVersions();
      setError('');
    } catch (err: any) {
      setError(err.message || '设置失败');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载版本列表...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <GitBranch className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                版本管理
              </h1>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  创建版本
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新版本</DialogTitle>
                  <DialogDescription>
                    为当前系统状态创建一个快照版本
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">版本名称 *</label>
                    <Input
                      placeholder="例如：v1.0.0 - 选型功能优化"
                      value={newVersionName}
                      onChange={(e) => setNewVersionName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">版本描述</label>
                    <Textarea
                      placeholder="描述此次版本的主要变更..."
                      value={newVersionDesc}
                      onChange={(e) => setNewVersionDesc(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleCreateVersion}
                    disabled={creating}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {creating ? '创建中...' : '创建'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Version List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  版本历史
                </CardTitle>
                <CardDescription>
                  共 {versions.length} 个版本
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-blue-300 ${
                        selectedVersion?.id === version.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      } ${version.isCurrent ? 'ring-2 ring-green-500' : ''}`}
                      onClick={() => {
                        setSelectedVersion(version);
                        loadVersionDetail(version.id);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={version.isCurrent ? 'default' : 'secondary'}>
                            v{version.versionNumber}
                          </Badge>
                          {version.isCurrent && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              当前
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(version.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {version.name}
                      </h3>
                      {version.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {version.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>创建者: {version.createdBy || '系统'}</span>
                        <span>•</span>
                        <span>{version.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Version Detail */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  版本详情
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedVersionData ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {selectedVersionData.version.name}
                      </h3>
                      <Badge variant="outline">v{selectedVersionData.version.versionNumber}</Badge>
                    </div>

                    {selectedVersionData.version.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          描述
                        </label>
                        <p className="text-sm mt-1">
                          {selectedVersionData.version.description}
                        </p>
                      </div>
                    )}

                    <Tabs defaultValue="files" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="files">文件</TabsTrigger>
                        <TabsTrigger value="changes">变更</TabsTrigger>
                      </TabsList>
                      <TabsContent value="files" className="mt-4">
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {selectedVersionData.files.map((file) => (
                            <div
                              key={file.id}
                              className="p-2 rounded bg-gray-50 dark:bg-gray-800 flex items-center gap-2 text-sm"
                            >
                              <FileCode className="w-4 h-4 text-blue-600" />
                              <span className="flex-1 truncate">{file.filePath}</span>
                              <Badge variant="outline" className="text-xs">
                                {file.fileType}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="changes" className="mt-4">
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {selectedVersionData.changes.map((change) => (
                            <div
                              key={change.id}
                              className="p-2 rounded bg-gray-50 dark:bg-gray-800 text-sm"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant={
                                    change.action === 'create'
                                      ? 'default'
                                      : change.action === 'update'
                                      ? 'secondary'
                                      : 'destructive'
                                  }
                                  className="text-xs"
                                >
                                  {change.action}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {change.targetPath}
                              </p>
                              {change.changeDescription && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {change.changeDescription}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex gap-2 pt-4 border-t">
                      {!selectedVersionData.version.isCurrent && (
                        <>
                          <Button
                            onClick={() => handleSetCurrent(selectedVersionData.version.id)}
                            variant="outline"
                            className="flex-1"
                          >
                            设为当前
                          </Button>
                          <Button
                            onClick={() => handleRollback(selectedVersionData.version.id)}
                            className="flex-1"
                            disabled={rollingBack}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            {rollingBack ? '回滚中...' : '回滚'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>请选择一个版本查看详情</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
