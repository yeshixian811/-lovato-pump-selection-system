# 🚀 本地部署快速指南

**版本**：v1.0
**适用系统**：Windows 10/11
**部署时间**：约 30 分钟

---

## 📋 部署清单

在开始之前，请确保您有：

- [ ] Windows 10/11 电脑
- [ ] 管理员权限
- [ ] 至少 20GB 可用磁盘空间
- [ ] 稳定的网络连接

---

## 🚀 快速部署（10步完成）

### 第1步：下载必需软件 ⏱️ 5分钟

1. **下载 Node.js 24 LTS**
   - 访问：https://nodejs.org/
   - 下载 Windows Installer (.msi) 64-bit
   - 运行安装程序，一路"下一步"

2. **下载 PostgreSQL 14**
   - 访问：https://www.postgresql.org/download/windows/
   - 下载 Windows x86-64 安装包
   - 运行安装程序，设置密码（**务必记住！**）

3. **下载项目代码**
   - 下载项目压缩包或使用 Git 克隆
   - 解压到 `C:\LovatoApp` 目录

---

### 第2步：安装工具 ⏱️ 3分钟

打开命令提示符（CMD）或 PowerShell，执行：

```powershell
# 安装 pnpm
npm install -g pnpm@latest

# 验证安装
pnpm --version
```

预期输出：`9.x.x`

---

### 第3步：进入项目目录 ⏱️ 1分钟

```powershell
cd C:\LovatoApp
```

---

### 第4步：安装依赖 ⏱️ 5-10分钟

```powershell
pnpm install
```

等待安装完成（可能需要 5-10 分钟，取决于网络速度）。

---

### 第5步：配置环境变量 ⏱️ 2分钟

创建 `.env` 文件（如果不存在）：

```powershell
notepad .env
```

复制以下内容（**请修改密码！**）：

```env
# ============================================
# 洛瓦托水泵选型系统 - 环境变量配置
# ============================================

# JWT 认证配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
JWT_ACCESS_TOKEN_EXPIRY=3600
JWT_REFRESH_TOKEN_EXPIRY=604800

# 数据加密配置
ENCRYPTION_KEY=your-super-secret-encryption-key-minimum-32-characters-change-in-production
ENCRYPTION_ALGORITHM=aes-256-gcm

# 数据库配置
# ⚠️ 重要：请将 YourPassword123 替换为实际的 PostgreSQL 密码
DATABASE_URL=postgresql://postgres:YourPassword123@localhost:5432/lovato_pump

# CORS 配置
ALLOWED_ORIGINS=http://localhost:5000,http://localhost:3000

# 应用配置
NODE_ENV=development
PORT=5000

# 日志配置
LOG_LEVEL=info
LOG_VERBOSE=true
```

**⚠️ 重要**：将 `YourPassword123` 替换为您在第1步设置的 PostgreSQL 密码。

保存并关闭文件。

---

### 第6步：创建数据库 ⏱️ 1分钟

```powershell
psql -U postgres -c "CREATE DATABASE lovato_pump;"
```

系统会提示输入密码（第1步设置的 PostgreSQL 密码）。

---

### 第7步：运行数据库迁移 ⏱️ 1分钟

```powershell
pnpm run db:push
```

---

### 第8步：启动应用 ⏱️ 2分钟

```powershell
pnpm run dev
```

看到以下输出表示启动成功：

```
✓ Ready in 3.2s
○ Local:        http://localhost:5000
```

---

### 第9步：访问应用 ⏱️ 1分钟

打开浏览器，访问：

```
http://localhost:5000
```

---

### 第10步：登录系统 ⏱️ 1分钟

**默认管理员账户**：
- 用户名：`admin`
- 密码：`admin123`

⚠️ **重要**：首次登录后请立即修改默认密码！

---

## ✅ 验证部署

### 1. 检查应用是否运行

访问：http://localhost:5000

应该能看到洛瓦托水泵选型系统的首页。

### 2. 检查数据库连接

访问：http://localhost:5000/diagnostic

查看"数据库连接"状态，应该显示：
- ✅ 状态：正常
- ✅ 消息：Database connection successful

### 3. 检查功能

- ✅ 可以访问首页
- ✅ 可以访问选型页面
- ✅ 可以登录管理后台

---

## 🎯 常用命令

```powershell
# 启动应用
pnpm run dev

# 停止应用
按 Ctrl + C

# 查看日志
tail -f logs/app.log

# 检查健康状态
curl http://localhost:5000/api/health

# 运行数据库迁移
pnpm run db:push

# 构建生产版本
pnpm run build

# 启动生产版本
pnpm run start
```

---

## 🆘 常见问题

### 问题1：端口被占用

**错误信息**：`Error: listen EADDRINUSE: address already in use :::5000`

**解决方法**：
```powershell
# 查找占用端口的进程
netstat -ano | findstr :5000

# 停止进程
taskkill /PID <进程ID> /F

# 或修改端口（在 .env 文件中修改 PORT 值）
```

---

### 问题2：数据库连接失败

**错误信息**：`Database connection failed`

**解决方法**：

1. 检查 PostgreSQL 服务是否运行：
```powershell
Get-Service postgresql-x64-14
```

2. 如果服务未运行，启动服务：
```powershell
Start-Service postgresql-x64-14
```

3. 检查 `.env` 文件中的 `DATABASE_URL` 配置是否正确。

---

### 问题3：依赖安装失败

**错误信息**：`npm ERR!` 或 `pnpm ERR!`

**解决方法**：

```powershell
# 清理缓存
pnpm store prune

# 删除 node_modules 文件夹
rmdir /S /Q node_modules

# 重新安装
pnpm install
```

---

### 问题4：密码认证失败

**错误信息**：`password authentication failed`

**解决方法**：

1. 确认 PostgreSQL 密码是否正确
2. 修改 `.env` 文件中的 `DATABASE_URL`
3. 重启应用

---

### 问题5：页面显示异常

**错误信息**：页面无法正常显示或功能异常

**解决方法**：

1. 访问系统诊断页面：http://localhost:5000/diagnostic
2. 查看错误信息和解决方案
3. 参考 [问题诊断文档](TROUBLESHOOTING.md)

---

## 📚 详细文档

如果遇到问题或需要更详细的说明，请查看：

| 文档 | 说明 |
|------|------|
| [📘 完整部署流程](LOCAL-DEPLOYMENT-FLOW.md) | 详细的部署步骤 |
| [📙 问题诊断和解决方案](TROUBLESHOOTING.md) | 故障排查指南 |
| [📕 快速开始指南](QUICK-START-GUIDE.md) | 快速上手指南 |
| [📖 Windows服务器部署](WINDOWS-SERVER-DEPLOYMENT-GUIDE.md) | 生产环境部署 |

---

## 🎓 下一步

部署成功后，您可以：

1. **体验功能**
   - 访问选型页面：http://localhost:5000/selection
   - 测试水泵选型功能

2. **管理数据**
   - 登录管理后台：http://localhost:5000/admin
   - 添加产品数据
   - 管理库存

3. **查看文档**
   - API文档：[docs/API.md](docs/API.md)
   - 安全指南：[docs/SECURITY.md](docs/SECURITY.md)

---

## 💡 提示

- 📝 **记录密码**：请妥善记录 PostgreSQL 密码和账户信息
- 🔒 **修改默认密码**：首次登录后立即修改 admin/admin123
- 💾 **定期备份**：建议定期备份数据库
- 🔄 **保持更新**：定期更新依赖包和系统补丁

---

## 🆘 获取帮助

如果遇到问题：

1. **查看日志**
   ```powershell
   tail -f logs/app.log
   ```

2. **访问诊断页面**
   - http://localhost:5000/diagnostic

3. **查看完整文档**
   - [本地部署流程](LOCAL-DEPLOYMENT-FLOW.md)
   - [问题诊断](TROUBLESHOOTING.md)

---

**快速部署指南版本**：v1.0
**最后更新**：2026-02-08
**预计部署时间**：30 分钟

祝您部署顺利！🎉
