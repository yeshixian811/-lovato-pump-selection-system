import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  Image, 
  LayoutDashboard,
  TrendingUp,
  Activity,
  Clock,
  Settings
} from 'lucide-react'

export default function AdminDashboardPage() {
  const stats = [
    {
      title: '总用户数',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: '页面数量',
      value: '24',
      change: '+2',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: '图片资源',
      value: '156',
      change: '+15',
      icon: Image,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: '今日访问',
      value: '8,432',
      change: '+23%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ]

  const quickActions = [
    {
      title: '新建页面',
      description: '创建新的网站页面',
      icon: FileText,
      href: '/admin/pages/create',
      color: 'bg-blue-600',
    },
    {
      title: '上传图片',
      description: '上传新的图片资源',
      icon: Image,
      href: '/admin/content/images/upload',
      color: 'bg-purple-600',
    },
    {
      title: '主题配置',
      description: '调整网站设计风格',
      icon: LayoutDashboard,
      href: '/admin/design',
      color: 'bg-green-600',
    },
    {
      title: '系统设置',
      description: '配置系统参数',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-600',
    },
  ]

  const recentActivity = [
    {
      action: '创建页面',
      target: '产品详情页',
      time: '5分钟前',
      user: '管理员',
    },
    {
      action: '更新内容',
      target: '首页横幅',
      time: '15分钟前',
      user: '编辑',
    },
    {
      action: '上传图片',
      target: 'banner.jpg',
      time: '1小时前',
      user: '设计师',
    },
    {
      action: '修改主题',
      target: '颜色方案',
      time: '2小时前',
      user: '管理员',
    },
    {
      action: '添加用户',
      target: '新用户注册',
      time: '3小时前',
      user: '系统',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          网站管理后台
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          管理网站内容、页面设计和系统配置
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                较昨日 <span className="text-green-600 font-medium">{stat.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Card 
            key={action.title}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              最近活动
            </CardTitle>
            <CardDescription>
              查看最近的操作记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.user}</span> {activity.action} - {activity.target}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              系统状态
            </CardTitle>
            <CardDescription>
              服务器运行状态
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">服务器状态</span>
                <Badge className="bg-green-600">运行中</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">数据库</span>
                <Badge className="bg-green-600">正常</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">存储空间</span>
                <span className="text-sm text-gray-900 dark:text-white">45GB / 100GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">CPU使用率</span>
                <span className="text-sm text-gray-900 dark:text-white">32%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">内存使用率</span>
                <span className="text-sm text-gray-900 dark:text-white">58%</span>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>上次更新：2分钟前</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
