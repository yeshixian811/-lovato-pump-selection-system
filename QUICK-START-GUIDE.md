# 洛瓦托水泵选型系统 - 快速开始指南

**版本**：v1.0.0
**最后更新**：2026-02-08

---

## 🚀 快速开始

### 前置要求

- Node.js 24.x LTS
- pnpm 9.x
- PostgreSQL 14.x
- Windows Server 2019/2022 或 Windows 10/11

### 安装步骤

#### 1. 克隆项目

```bash
git clone <your-repo-url> lovato-pump-selection
cd lovato-pump-selection
```

#### 2. 安装依赖

```bash
pnpm install
```

#### 3. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下关键参数：

```env
# JWT 认证配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
JWT_ACCESS_TOKEN_EXPIRY=3600
JWT_REFRESH_TOKEN_EXPIRY=604800

# 数据加密配置
ENCRYPTION_KEY=your-super-secret-encryption-key-minimum-32-characters-change-in-production
ENCRYPTION_ALGORITHM=aes-256-gcm

# 数据库配置
DATABASE_URL=postgresql://lovato_user:StrongPassword123!@localhost:5432/lovato_pump

# CORS 配置
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,http://localhost:5000

# 应用配置
NODE_ENV=production
PORT=5000
```

#### 4. 初始化数据库

```bash
# 创建数据库
psql -U postgres -c "CREATE DATABASE lovato_pump;"

# 创建用户
psql -U postgres -c "CREATE USER lovato_user WITH PASSWORD 'StrongPassword123!';"

# 授予权限
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE lovato_pump TO lovato_user;"

# 运行数据库迁移
pnpm run db:push
```

#### 5. 构建应用

```bash
pnpm run build
```

#### 6. 启动应用

**开发模式**：
```bash
pnpm run dev
```

**生产模式**：
```bash
pnpm run start
```

**使用PM2启动**：
```bash
pnpm add -g pm2
pm2 start ecosystem.config.js
```

应用将在 `http://localhost:5000` 启动。

---

## 📚 核心功能

### 1. 水泵选型

访问 `http://localhost:5000/pump-selection`

输入流量和扬程需求，系统将自动匹配最合适的水泵产品。

### 2. 产品管理

访问 `http://localhost:5000/admin`（需要登录）

管理水泵产品库，包括性能曲线数据。

### 3. 用户管理

访问 `http://localhost:5000/admin/users`

管理用户账户和权限。

### 4. 进销存管理

访问 `http://localhost:5000/admin/inventory`

管理库存、采购、销售、供应商和客户。

---

## 🔐 默认账户

### 管理员账户

```
用户名：admin
密码：admin123（首次登录后请立即修改）
权限：admin
```

### 测试账户

```
用户名：user
密码：user123
权限：user
```

**⚠️ 重要**：在生产环境中，请立即修改默认密码！

---

## 🛡️ 安全检查

### 运行安全审计

```bash
# 运行完整安全审计
node scripts/security-audit.js

# 运行加密测试
node scripts/test-encryption.js

# 运行安全测试
node scripts/test-security.js
```

### 运行自动化测试

```bash
# 运行所有测试
pnpm run test

# 运行单元测试
pnpm run test:unit

# 运行集成测试
pnpm run test:integration

# 运行性能测试
node scripts/run-performance-tests.js
```

---

## 📊 监控和日志

### 查看应用日志

```bash
# 查看PM2日志
pm2 logs lovato-app

# 查看错误日志
pm2 logs lovato-app --err

# 查看应用日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log
```

### 监控应用状态

```bash
# 查看PM2监控
pm2 monit

# 查看进程状态
pm2 status

# 查看健康状态
curl http://localhost:5000/api/health
```

---

## 🔄 备份和恢复

### 数据库备份

```bash
# 备份数据库
pg_dump -U lovato_user -h localhost lovato_pump > backup.sql

# 恢复数据库
psql -U lovato_user -h localhost lovato_pump < backup.sql
```

### 应用文件备份

```bash
# 备份应用文件
tar -czf app-backup.tar.gz src/ package.json ecosystem.config.js

# 恢复应用文件
tar -xzf app-backup.tar.gz
```

---

## 🌐 内网穿透（Cloudflare Tunnel）

### 安装 Cloudflared

```bash
# 下载 Cloudflared
# 访问：https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# Windows
winget install --id Cloudflare.cloudflared
```

### 配置 Tunnel

```bash
# 登录 Cloudflare
cloudflared tunnel login

# 创建 Tunnel
cloudflared tunnel create lovato-app

# 配置 Tunnel
cloudflared tunnel route dns lovato-app your-domain.com

# 创建配置文件
cloudflared tunnel token lovato-app > tunnel-token.txt
```

### 启动 Tunnel

```bash
# 启动 Tunnel
cloudflared tunnel --config tunnel.yml run lovato-app

# 或使用服务模式（Windows）
cloudflared service install
net start cloudflared
```

---

## 📝 常见问题

### 问题1：数据库连接失败

**解决方案**：
1. 检查 PostgreSQL 服务是否运行
2. 检查 `.env` 文件中的 `DATABASE_URL` 配置
3. 检查防火墙规则

```bash
# 检查 PostgreSQL 服务
Get-Service postgresql-x64-14

# 测试连接
psql -U lovato_user -h localhost -d lovato_pump
```

### 问题2：端口被占用

**解决方案**：
1. 查找占用端口的进程
2. 停止该进程或修改应用端口

```bash
# 查找占用端口的进程
netstat -ano | findstr :5000

# 停止进程
taskkill /PID <PID> /F
```

### 问题3：依赖安装失败

**解决方案**：
1. 清理缓存
2. 重新安装依赖

```bash
# 清理缓存
pnpm store prune

# 重新安装
rm -rf node_modules
pnpm install
```

### 问题4：构建失败

**解决方案**：
1. 检查 TypeScript 类型错误
2. 清理构建缓存

```bash
# 类型检查
npx tsc --noEmit

# 清理构建缓存
rm -rf .next
pnpm run build
```

---

## 🔧 维护命令

### 更新依赖

```bash
# 检查过时的依赖
pnpm outdated

# 更新依赖
pnpm update

# 审计安全问题
pnpm audit --fix
```

### 重启应用

```bash
# 使用PM2重启
pm2 restart lovato-app

# 重启 PostgreSQL
Restart-Service postgresql-x64-14
```

### 查看日志

```bash
# PM2 日志
pm2 logs

# 应用日志
Get-Content logs/app.log -Tail 50
```

---

## 📞 技术支持

如有问题，请联系：

- **技术支持**：tech@example.com
- **文档网站**：https://docs.example.com
- **项目仓库**：https://github.com/your-repo/lovato-pump-selection

---

## 📚 完整文档

- [Windows服务器部署指南](WINDOWS-SERVER-DEPLOYMENT-GUIDE.md)
- [完整安全审计报告](COMPLETE-SECURITY-AUDIT-REPORT.md)
- [项目交付报告](PROJECT-DELIVERY-REPORT.md)
- [API文档](docs/API.md)
- [安全指南](docs/SECURITY.md)
- [部署指南](docs/DEPLOYMENT.md)
- [用户指南](docs/USER-GUIDE.md)

---

**快速开始指南版本**：v1.0.0
**最后更新**：2026-02-08
