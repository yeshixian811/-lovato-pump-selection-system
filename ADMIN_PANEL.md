# 部署管理面板使用指南

## 🎯 功能介绍

部署管理面板是一个可视化的管理界面，用于监控和管理洛瓦托水泵选型系统的部署状态。

### 主要功能

1. **容器管理**
   - 查看所有 Docker 容器状态
   - 实时查看容器日志
   - 重启容器

2. **数据库监控**
   - PostgreSQL 连接状态
   - 数据库表数量
   - 连接延迟监控

3. **系统监控**
   - CPU 使用率
   - 内存使用情况
   - 磁盘使用情况
   - 系统负载
   - 运行时间
   - Docker 容器资源使用

---

## 🚀 访问面板

### 方式 1：直接访问

部署完成后，访问：

```
http://122.51.22.101/admin
```

### 方式 2：通过主页面导航

在主页面点击"管理面板"链接。

---

## 🔒 安全建议

### 1. 添加访问控制

部署面板应该添加认证保护，防止未授权访问。

#### 方式 1：使用环境变量

```bash
# 在 .env.production 中添加
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

#### 方式 2：使用 JWT 认证

在页面中添加登录验证：

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const router = useRouter();

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
    }
  }, [router]);

  // ... 其余代码
}
```

### 2. 限制访问 IP

在 Nginx 配置中限制访问：

```nginx
location /admin {
    allow 123.123.123.123;  # 替换为您的 IP
    deny all;

    proxy_pass http://127.0.0.1:5000;
    # ... 其余配置
}
```

---

## 📊 API 接口

### 1. 获取容器状态

```bash
GET /api/admin/docker/ps
```

响应：
```json
{
  "success": true,
  "running": [...],
  "all": [...],
  "total": 2,
  "runningCount": 2,
  "stoppedCount": 0
}
```

### 2. 获取容器日志

```bash
GET /api/admin/docker/logs?container=lovato-pump-app&tail=100
```

响应：
```json
{
  "success": true,
  "container": "lovato-pump-app",
  "logs": [...],
  "count": 100
}
```

### 3. 重启容器

```bash
POST /api/admin/docker/restart
Content-Type: application/json

{
  "container": "lovato-pump-app"
}
```

响应：
```json
{
  "success": true,
  "message": "容器 lovato-pump-app 重启成功"
}
```

### 4. 获取系统统计

```bash
GET /api/admin/system/stats
```

响应：
```json
{
  "success": true,
  "system": {
    "cpu": { "usage": 15.2, "cores": 2 },
    "memory": { "total": 2, "used": 0.8, "usage": 40 },
    "disk": { "total": "50G", "used": "20G", "usage": 40 },
    "load": [0.5, 0.3, 0.2],
    "uptime": 3600,
    "uptimeFormatted": "1小时 0分钟"
  },
  "docker": [...]
}
```

### 5. 获取数据库状态

```bash
GET /api/admin/database/status
```

响应：
```json
{
  "success": true,
  "database": {
    "host": "122.51.22.101",
    "port": 5433,
    "status": "connected",
    "portOpen": true,
    "tableCount": 10,
    "connectionTime": 15
  }
}
```

---

## 🔧 故障排查

### 1. 无法访问面板

**可能原因：**
- 面板未部署
- 端口未开放
- Nginx 配置错误

**解决方案：**
```bash
# 检查容器是否运行
docker ps | grep lovato-pump

# 检查 Nginx 配置
sudo nginx -t

# 检查日志
docker logs lovato-pump-app
```

### 2. 无法查看容器日志

**可能原因：**
- 权限不足
- 容器不存在

**解决方案：**
```bash
# 直接使用 docker 命令查看
docker logs -f lovato-pump-app
```

### 3. 系统统计数据不更新

**可能原因：**
- API 请求失败
- 命令执行超时

**解决方案：**
```bash
# 手动测试 API
curl http://localhost:5000/api/admin/system/stats
```

---

## 📝 自定义配置

### 1. 修改刷新频率

在 `src/app/admin/page.tsx` 中修改：

```typescript
// 当前设置为 30 秒
const interval = setInterval(() => {
  refreshData();
}, 30000);  // 修改这里的值
```

### 2. 添加更多监控指标

在 `src/app/api/admin/system/stats/route.ts` 中添加：

```typescript
// 示例：添加网络流量统计
const networkStats = {
  in: ...,  // 接收流量
  out: ...,  // 发送流量
};
```

### 3. 自定义告警

在页面中添加告警逻辑：

```typescript
// 当 CPU 使用率超过 80% 时显示警告
if (systemStats.system.cpu.usage > 80) {
  // 发送告警通知
}
```

---

## 🔐 生产环境部署注意事项

1. **添加认证**：不要在生产环境开放无认证的管理面板
2. **HTTPS**：使用 HTTPS 协议访问
3. **IP 白名单**：限制访问 IP
4. **日志记录**：记录所有管理操作
5. **定期更新**：及时更新依赖和安全补丁

---

## 📞 技术支持

如有问题，请查看：
- 完整部署文档：`DEPLOYMENT.md`
- 快速开始指南：`QUICK_START.md`

---

**部署面板已集成到项目中，部署后即可使用！** 🎉
