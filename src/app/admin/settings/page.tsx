import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { 
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  User,
  Shield,
  Bell,
  Database,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            系统设置
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            配置系统参数和功能
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">基本设置</TabsTrigger>
          <TabsTrigger value="contact">联系方式</TabsTrigger>
          <TabsTrigger value="security">安全设置</TabsTrigger>
          <TabsTrigger value="notifications">通知设置</TabsTrigger>
          <TabsTrigger value="backup">备份与恢复</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>网站信息</CardTitle>
              <CardDescription>
                配置网站的基本信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>网站名称</Label>
                  <Input
                    defaultValue="洛瓦托水泵选型系统"
                  />
                </div>
                <div className="space-y-2">
                  <Label>网站URL</Label>
                  <Input
                    defaultValue="https://lovato.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>网站描述</Label>
                <Textarea
                  defaultValue="洛瓦托水泵选型系统，提供智能水泵选型、产品库管理等服务"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>网站关键词</Label>
                <Input
                  defaultValue="水泵选型, 智能选型, 水泵产品"
                />
              </div>
              <div className="space-y-2">
                <Label>默认语言</Label>
                <Select defaultValue="zh-CN">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">中文（简体）</SelectItem>
                    <SelectItem value="en-US">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>系统功能</CardTitle>
              <CardDescription>
                启用或禁用系统功能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用用户注册</Label>
                  <p className="text-sm text-gray-500">
                    允许新用户注册账户
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用邮箱验证</Label>
                  <p className="text-sm text-gray-500">
                    用户注册后需要验证邮箱
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用选型功能</Label>
                  <p className="text-sm text-gray-500">
                    开启智能选型功能
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用会员订阅</Label>
                  <p className="text-sm text-gray-500">
                    开启会员订阅功能
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                联系信息
              </CardTitle>
              <CardDescription>
                配置公司的联系信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  联系邮箱
                </Label>
                <Input
                  type="email"
                  defaultValue="support@lovato.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  联系电话
                </Label>
                <Input
                  type="tel"
                  defaultValue="400-888-8888"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  公司地址
                </Label>
                <Input
                  defaultValue="北京市朝阳区xxx大厦"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  联系人
                </Label>
                <Input
                  defaultValue="张经理"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                安全设置
              </CardTitle>
              <CardDescription>
                配置系统安全参数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>会话超时时间（分钟）</Label>
                <Input
                  type="number"
                  defaultValue={30}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>强制HTTPS</Label>
                  <p className="text-sm text-gray-500">
                    强制使用HTTPS协议
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用双因素认证</Label>
                  <p className="text-sm text-gray-500">
                    为管理员账户启用2FA
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>登录失败锁定</Label>
                  <p className="text-sm text-gray-500">
                    多次登录失败后锁定账户
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>最大登录失败次数</Label>
                <Input
                  type="number"
                  defaultValue={5}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                通知设置
              </CardTitle>
              <CardDescription>
                配置系统通知和提醒
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>新用户注册通知</Label>
                  <p className="text-sm text-gray-500">
                    有新用户注册时发送通知
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>新订单通知</Label>
                  <p className="text-sm text-gray-500">
                    有新订单时发送通知
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>系统错误通知</Label>
                  <p className="text-sm text-gray-500">
                    系统出现错误时发送通知
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label>通知邮箱</Label>
                <Input
                  type="email"
                  defaultValue="admin@lovato.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup & Restore */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                数据备份
              </CardTitle>
              <CardDescription>
                备份和恢复系统数据
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      最后备份
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      2小时前
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      备份大小
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      1.2 GB
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      备份数量
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      30
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-4">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Download className="h-4 w-4 mr-2" />
                  立即备份
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  恢复备份
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自动备份</Label>
                  <p className="text-sm text-gray-500">
                    定期自动备份数据
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>备份频率</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">每小时</SelectItem>
                    <SelectItem value="daily">每天</SelectItem>
                    <SelectItem value="weekly">每周</SelectItem>
                    <SelectItem value="monthly">每月</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>保留备份数量</Label>
                <Input
                  type="number"
                  defaultValue={30}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
