# 洛瓦托水泵选型系统 - 本地部署指南

## 系统概述

洛瓦托水泵选型系统是一个基于 Next.js 16 + PostgreSQL 的全栈 Web 应用，提供水泵选型、产品管理、性能曲线展示等功能。

## 系统要求

### 软件要求
- **操作系统**: Windows 10/11 (推荐) 或 Windows Server 2016+
- **Node.js**: 24.x (必须)
- **包管理器**: pnpm (必须)
- **数据库**: PostgreSQL 14 或更高版本
- **Web 浏览器**: Chrome/Edge (最新版本)

### 硬件要求
- **CPU**: 2 核心及以上
- **内存**: 4GB 及以上（推荐 8GB）
- **磁盘空间**: 10GB 可用空间
- **网络**: 支持外网访问（用于微信小程序）

## 部署步骤

### 步骤 1: 安装依赖软件

#### 1.1 安装 Node.js 24
1. 下载 Node.js 24.x: https://nodejs.org/
2. 安装完成后，验证安装：
   ```bash
   node --version  # 应显示 v24.x.x
   ```

#### 1.2 安装 pnpm
```bash
npm install -g pnpm
pnpm --version  # 应显示版本号
```

#### 1.3 安装 PostgreSQL 14

**Windows 环境**:
1. 下载 PostgreSQL 14: https://www.postgresql.org/download/windows/
2. 运行安装程序，按照向导完成安装
3. 记住安装时设置的密码（默认用户名：postgres）
4. 确保 PostgreSQL 服务已启动

### 步骤 2: 配置数据库

#### 2.1 创建数据库
1. 打开 pgAdmin（PostgreSQL 管理工具）
2. 右键点击 "Databases" → "Create" → "Database"
3. 数据库名称：`lovato_pump`
4. 点击 "Save"

#### 2.2 配置数据存储位置（可选）

如果需要将数据库数据存储到 J 盘或其他位置：

1. **方法一：使用迁移脚本**（推荐）
   ```bash
   # 以管理员身份运行 PowerShell
   cd scripts\windows
   .\migrate-database-to-j-drive.bat
   ```

2. **方法二：手动配置**
   - 停止 PostgreSQL 服务
   - 将数据目录移动到目标位置（如 `J:/postgresql/data`）
   - 修改 PostgreSQL 配置文件 `postgresql.conf` 中的 `data_directory`
   - 重新启动 PostgreSQL 服务

### 步骤 3: 配置环境变量

1. 在项目根目录创建 `.env` 文件（如果不存在）
2. 复制 `.env.example` 的内容到 `.env`
3. 根据实际情况修改 `.env` 文件：

```env
# 数据库配置
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/lovato_pump

# 对象存储配置（可选）
COZE_BUCKET_ENDPOINT_URL=https://your-endpoint.com
COZE_BUCKET_NAME=your-bucket-name
COZE_BUCKET_ACCESS_KEY=your-access-key
COZE_BUCKET_SECRET_KEY=your-secret-key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# 微信小程序配置（可选）
NEXT_PUBLIC_WECHAT_APPID=your-wechat-appid
```

### 步骤 4: 安装项目依赖

```bash
# 进入项目目录
cd /path/to/project

# 安装依赖
pnpm install
```

### 步骤 5: 初始化数据库

```bash
# 运行数据库迁移和种子数据
pnpm run db:setup
```

或者使用管理脚本：
```bash
# Windows
scripts\windows\verify-migration.bat
```

### 步骤 6: 启动服务

#### 6.1 开发模式
```bash
pnpm run dev
```

服务将在 http://localhost:5000 启动

#### 6.2 生产模式
```bash
# 构建项目
pnpm run build

# 启动生产服务
pnpm run start
```

### 步骤 7: 配置内网穿透（可选）

如果需要外网访问（微信小程序需要），可以选择以下方案之一：

#### 方案一：Cloudflare Tunnel（推荐）

**Windows 环境**:
```bash
cd scripts\windows
.\install-cloudflared.bat
.\setup-cloudflare.bat
.\cloudflare-start.bat
```

**配置说明**:
1. 安装 Cloudflare Tunnel
2. 登录 Cloudflare 账号并授权
3. 创建隧道，映射到本地 5000 端口
4. 获取公网域名

#### 方案二：ngrok（临时测试）

```bash
cd scripts
.\ngrok-start.bat
```

## 验证部署

### 1. 检查服务状态
打开浏览器访问：http://localhost:5000

应该能看到洛瓦托水泵选型系统的首页。

### 2. 测试选型功能
1. 点击"智能选型"
2. 输入流量和扬程参数
3. 点击"开始选型"
4. 查看选型结果和性能曲线

### 3. 测试产品管理
1. 访问：http://localhost:5000/admin/products
2. 尝试添加新产品
3. 上传产品图片
4. 保存并查看结果

### 4. 检查数据库连接
查看控制台日志，确认没有数据库连接错误。

## 常见问题

### 问题 1: 端口 5000 被占用
**解决方案**:
```bash
# Windows - 查找占用端口的进程
netstat -ano | findstr :5000

# 终止进程（替换 PID 为实际的进程 ID）
taskkill /PID <PID> /F
```

### 问题 2: 数据库连接失败
**可能原因**:
- PostgreSQL 服务未启动
- 数据库配置错误（用户名/密码/数据库名）
- 防火墙阻止连接

**解决方案**:
1. 检查 PostgreSQL 服务状态
2. 验证 `.env` 文件中的数据库配置
3. 检查防火墙设置

### 问题 3: pnpm install 失败
**解决方案**:
```bash
# 清除缓存
pnpm store prune

# 重新安装
rm -rf node_modules
rm -rf .next
pnpm install
```

### 问题 4: 文件上传功能不工作
**解决方案**:
1. 检查 `.env` 文件中的对象存储配置
2. 确保已配置正确的 `COZE_BUCKET_ACCESS_KEY` 和 `COZE_BUCKET_SECRET_KEY`
3. 如果不需要文件上传功能，可以忽略此问题

## 性能优化

### 数据库优化
1. 定期运行 `VACUUM ANALYZE` 优化数据库
2. 创建适当的索引（已在 schema 中定义）
3. 监控数据库性能指标

### 应用优化
1. 启用 CDN（如果有）
2. 配置缓存策略
3. 使用生产模式构建

## 安全建议

1. **修改默认密码**: 修改 PostgreSQL 的默认密码
2. **配置防火墙**: 只开放必要的端口（5000）
3. **使用 HTTPS**: 配置 SSL 证书（Cloudflare Tunnel 自动提供）
4. **定期备份**: 定期备份数据库数据
5. **更新依赖**: 定期更新 Node.js 和依赖包

## 监控和维护

### 查看日志
```bash
# 查看应用日志
pnpm run logs

# Windows
scripts\windows\service-manager.bat logs
```

### 重启服务
```bash
# Windows
scripts\windows\service-manager.bat restart
```

### 备份数据库
```bash
# 使用 pg_dump 备份数据库
pg_dump -U postgres lovato_pump > backup.sql
```

## 联系支持

如果遇到部署问题，请：
1. 查看本文档的"常见问题"部分
2. 检查控制台日志
3. 联系技术支持团队

---

**版本**: 1.0.0  
**更新日期**: 2024-02-08
