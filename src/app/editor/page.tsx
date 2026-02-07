'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  FileCode,
  Eye,
  FolderTree,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

// 常用文件列表
const COMMON_FILES = [
  { path: 'src/app/page.tsx', label: '首页' },
  { path: 'src/app/selection/page.tsx', label: '选型页面' },
  { path: 'src/app/api/pump/match/route.ts', label: '匹配 API' },
  { path: 'src/app/globals.css', label: '全局样式' },
  { path: 'src/app/layout.tsx', label: '布局文件' },
];

export default function EditorPage() {
  const [filePath, setFilePath] = useState('');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isModified, setIsModified] = useState(false);

  const loadFile = async (path: string) => {
    if (!path.trim()) {
      setError('请输入文件路径');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await fetch(`/api/editor?path=${encodeURIComponent(path)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '读取文件失败');
      }

      setFilePath(path);
      setContent(data.content);
      setOriginalContent(data.content);
      setIsModified(false);
    } catch (err: any) {
      setError(err.message || '读取文件失败');
    } finally {
      setLoading(false);
    }
  };

  const saveFile = async () => {
    if (!filePath.trim()) {
      setError('请先选择文件');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const response = await fetch('/api/editor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: filePath,
          content,
          createBackup: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '保存文件失败');
      }

      setOriginalContent(content);
      setIsModified(false);
      setMessage('文件保存成功！已创建自动备份。');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || '保存文件失败');
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsModified(newContent !== originalContent);
  };

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
              <FileCode className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                在线编辑器
              </h1>
            </div>
            <Button
              onClick={() => window.open('/', '_blank')}
              variant="outline"
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              预览
            </Button>
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

        {message && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Selector */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5" />
                  文件选择
                </CardTitle>
                <CardDescription>选择要编辑的文件</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">常用文件</label>
                    <div className="space-y-2">
                      {COMMON_FILES.map((file) => (
                        <Button
                          key={file.path}
                          variant="outline"
                          className="w-full justify-start text-left"
                          onClick={() => loadFile(file.path)}
                          disabled={loading}
                        >
                          <FileCode className="w-4 h-4 mr-2 text-blue-600" />
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">{file.label}</span>
                            <span className="text-xs text-gray-500">{file.path}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <label className="text-sm font-medium mb-2 block">自定义路径</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="src/app/page.tsx"
                        value={filePath}
                        onChange={(e) => setFilePath(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            loadFile(filePath);
                          }
                        }}
                      />
                      <Button
                        onClick={() => loadFile(filePath)}
                        disabled={loading}
                      >
                        加载
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      只允许编辑 src/app/、src/components/、src/lib/、src/storage/ 目录下的文件
                    </p>
                  </div>

                  {isModified && (
                    <Alert className="bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        文件已修改，记得保存
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileCode className="w-5 h-5" />
                      {filePath || '未选择文件'}
                    </CardTitle>
                    {filePath && (
                      <CardDescription>{filePath}</CardDescription>
                    )}
                  </div>
                  <Button
                    onClick={saveFile}
                    disabled={saving || !isModified || !filePath}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '保存中...' : '保存'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">加载文件...</p>
                    </div>
                  </div>
                ) : !filePath ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center text-gray-500">
                      <FileCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">未选择文件</p>
                      <p className="text-sm">从左侧选择一个文件开始编辑</p>
                    </div>
                  </div>
                ) : (
                  <Textarea
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="font-mono text-sm min-h-[600px] resize-none"
                    placeholder="// 文件内容将在这里显示..."
                    spellCheck={false}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
