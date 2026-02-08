# 洛瓦托水泵选型系统 - 本地部署流程

**适用系统**：Windows 10/11 专业版或家庭版
**部署时间**：约 30-45 分钟
**最后更新**：2026-02-08

---

## 📋 部署前准备

### 系统要求

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| 操作系统 | Windows 10 64位 | Windows 11 64位 |
| CPU | 双核 2.0GHz | 四核 3.0GHz+ |
| 内存 | 8GB | 16GB+ |
| 存储 | 20GB 可用空间 | 50GB 可用空间（含数据库） |

### 需要下载的软件

1. **Node.js 24 LTS**
   - 下载地址：https://nodejs.org/
   - 选择：Windows Installer (.msi) 64-bit

2. **PostgreSQL 14**
   - 下载地址：https://www.postgresql.org/download/windows/
   - 选择：Windows x86-64

3. **Git（可选）**
   - 下载地址：https://git-scm.com/download/win
   - 用于克隆项目代码

---

## 🚀 部署步骤

### 第一步：安装 Node.js

1. 下载 Node.js 24 LTS 安装包
2. 双击运行安装程序
3. 接受许可协议
4. 选择安装路径（默认即可）
5. 确保勾选 "Add to PATH" 选项
6. 点击 Install 开始安装
7. 安装完成后，打开命令提示符（CMD）或 PowerShell，验证安装：

```powershell
node --version
npm --version
```

预期输出：
```
v24.x.x
10.x.x
```

### 第二步：安装 pnpm

在命令提示符中执行：

```powershell
npm install -g pnpm@latest
```

验证安装：

```powershell
pnpm --version
```

预期输出：
```
9.x.x
```

### 第三步：安装 PostgreSQL

#### 方式一：使用安装包（推荐新手）

1. 下载 PostgreSQL 14 安装包
2. 双击运行安装程序
3. 选择安装路径（建议使用默认路径）
4. 设置超级用户密码（**重要**：请妥善保管）
   - 示例：`YourStrongPassword123!`
5. 设置端口（默认 5432）
6. 选择区域（默认 "C"）
7. 勾选 "Stack Builder"（可选）
8. 点击 Finish 完成安装

#### 方式二：使用 Chocolatey（推荐高级用户）

1. 以管理员身份打开 PowerShell
2. 安装 Chocolatey（如果未安装）：

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

3. 安装 PostgreSQL：

```powershell
choco install postgresql -y
```

4. 启动 PostgreSQL 服务：

```powershell
Start-Service postgresql-x64-14
```

#### 验证 PostgreSQL 安装

打开命令提示符，执行：

```powershell
psql --version
```

预期输出：
```
psql (PostgreSQL) 14.x
```

### 第四步：获取项目代码

#### 方式一：使用 Git 克隆（推荐）

1. 如果已安装 Git，打开命令提示符
2. 进入项目目录：

```powershell
cd C:\
cd LovatoApp
```

3. 克隆项目（替换为实际仓库地址）：

```powershell
git clone <your-repo-url> .
```

#### 方式二：手动下载

1. 从 GitHub 或其他平台下载项目压缩包
2. 解压到 `C:\LovatoApp` 目录

### 第五步：安装项目依赖

1. 打开命令提示符，进入项目目录：

```powershell
cd C:\LovatoApp
```

2. 安装依赖：

```powershell
pnpm install
```

等待安装完成（可能需要 5-10 分钟）。

### 第六步：配置环境变量

1. 在项目根目录下创建 `.env` 文件：

```powershell
cd C:\LovatoApp
notepad .env
```

2. 复制以下内容到 `.env` 文件：

```env
# ============================================
# 洛瓦托水泵选型系统 - 环境变量配置
# ============================================

# ============================================
# JWT 认证配置
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
JWT_ACCESS_TOKEN_EXPIRY=3600
JWT_REFRESH_TOKEN_EXPIRY=604800

# ============================================
# 数据加密配置
# ============================================
ENCRYPTION_KEY=your-super-secret-encryption-key-minimum-32-characters-change-in-production
ENCRYPTION_ALGORITHM=aes-256-gcm

# ============================================
# 数据库配置
# ============================================
# 请替换为实际的用户名和密码
DATABASE_URL=postgresql://postgres:YourPassword123@localhost:5432/lovato_pump

# ============================================
# CORS 配置
# ============================================
ALLOWED_ORIGINS=http://localhost:5000

# ============================================
# 应用配置
# ============================================
NODE_ENV=development
PORT=5000

# ============================================
# 日志配置
# ============================================
LOG_LEVEL=info
LOG_VERBOSE=false
```

**重要提示**：
- 将 `JWT_SECRET` 和 `ENCRYPTION_KEY` 替换为强随机密钥
- 将 `DATABASE_URL` 中的 `YourPassword123` 替换为实际设置的 PostgreSQL 密码

3. 保存并关闭文件。

### 第七步：初始化数据库

1. 打开命令提示符，进入项目目录：

```powershell
cd C:\LovatoApp
```

2. 创建数据库：

```powershell
psql -U postgres -c "CREATE DATABASE lovato_pump;"
```

系统会提示输入 PostgreSQL 密码（第三步中设置的密码）。

3. 运行数据库迁移：

```powershell
pnpm run db:push
```

### 第八步：启动应用

#### 开发模式（推荐用于测试）

```powershell
pnpm run dev
```

或使用 Coze CLI：

```powershell
coze dev
```

应用将在 `http://localhost:5000` 启动。

#### 生产模式

1. 构建应用：

```powershell
pnpm run build
```

2. 启动应用：

```powershell
pnpm run start
```

### 第九步：访问应用

打开浏览器，访问：

```
http://localhost:5000
```

### 第十步：登录系统

#### 默认管理员账户

- 用户名：`admin`
- 密码：`admin123`

⚠️ **重要**：首次登录后，请立即修改默认密码！

#### 默认测试账户

- 用户名：`user`
- 密码：`user123`

---

## 🔧 常见问题和解决方法

### 问题1：端口 5000 被占用

**症状**：启动应用时提示端口已被占用。

**解决方法**：

1. 查找占用端口的进程：

```powershell
netstat -ano | findstr :5000
```

2. 记录进程ID（PID）

3. 停止该进程：

```powershell
taskkill /PID <进程ID> /F
```

或修改应用端口（在 `.env` 文件中修改 `PORT` 值）。

### 问题2：PostgreSQL 服务未启动

**症状**：无法连接到数据库。

**解决方法**：

1. 检查 PostgreSQL 服务状态：

```powershell
Get-Service postgresql-x64-14
```

2. 如果服务未运行，启动服务：

```powershell
Start-Service postgresql-x64-14
```

3. 如果启动失败，检查 PostgreSQL 日志文件。

### 问题3：依赖安装失败

**症状**：`pnpm install` 命令失败。

**解决方法**：

1. 清理 pnpm 缓存：

```powershell
pnpm store prune
```

2. 删除 node_modules 文件夹：

```powershell
rmdir /S /Q node_modules
```

3. 重新安装依赖：

```powershell
pnpm install
```

### 问题4：数据库连接失败

**症状**：应用启动时提示数据库连接失败。

**解决方法**：

1. 检查 `.env` 文件中的 `DATABASE_URL` 配置
2. 确保 PostgreSQL 服务正在运行
3. 验证用户名和密码是否正确
4. 测试数据库连接：

```powershell
psql -U postgres -d lovato_pump
```

### 问题5：构建失败

**症状**：`pnpm run build` 命令失败。

**解决方法**：

1. 检查 TypeScript 类型错误：

```powershell
npx tsc --noEmit
```

2. 清理构建缓存：

```powershell
rmdir /S /Q .next
```

3. 重新构建：

```powershell
pnpm run build
```

---

## 📊 验证部署

### 1. 检查应用状态

访问 `http://localhost:5000/api/health`，应返回类似以下内容：

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-02-08T12:00:00.000Z"
}
```

### 2. 检查数据库连接

```powershell
psql -U postgres -d lovato_pump -c "\dt"
```

应列出所有数据库表。

### 3. 运行安全测试

```powershell
node scripts/test-encryption.js
node scripts/test-security.js
```

所有测试应通过。

---

## 🔄 日常维护

### 启动应用

```powershell
cd C:\LovatoApp
pnpm run dev
```

### 停止应用

在命令提示符中按 `Ctrl + C`

### 备份数据库

```powershell
pg_dump -U postgres lovato_pump > C:\LovatoApp\backups\backup_%date:~0,4%%date:~5,2%%date:~8,2%.sql
```

### 查看日志

```powershell
type C:\LovatoApp\logs\app.log
```

### 更新依赖

```powershell
pnpm update
```

---

## 🌐 配置外网访问（可选）

如果需要从外网访问应用，可以使用 Cloudflare Tunnel 进行内网穿透。

### 步骤：

1. 注册 Cloudflare 账号：https://dash.cloudflare.com/

2. 下载 Cloudflared：
   - 下载地址：https://github.com/cloudflare/cloudflared/releases/latest
   - 下载 Windows 64-bit 版本

3. 安装和配置：

```powershell
# 解压 cloudflared
cd C:\Program Files\cloudflared
cloudflared.exe tunnel login
```

4. 创建 Tunnel：

```powershell
cloudflared.exe tunnel create lovato-app
```

5. 配置路由：

```powershell
cloudflared.exe tunnel route dns lovato-app your-domain.com
```

6. 创建配置文件 `tunnel.yml`：

```yaml
tunnel: <your-tunnel-id>
credentials-file: C:\Users\<username>\.cloudflared\<tunnel-id>.json

ingress:
  - hostname: your-domain.com
    service: http://localhost:5000
  - service: http_status:404
```

7. 启动 Tunnel：

```powershell
cloudflared.exe tunnel --config tunnel.yml run lovato-app
```

详细配置请参考 [Cloudflare Tunnel 配置指南](CLOUDFLARE-TUNNEL-GUIDE.md)。

---

## 📚 相关文档

- [快速开始指南](QUICK-START-GUIDE.md)
- [Windows服务器部署指南](WINDOWS-SERVER-DEPLOYMENT-GUIDE.md)
- [完整安全审计报告](COMPLETE-SECURITY-AUDIT-REPORT.md)
- [项目交付报告](PROJECT-DELIVERY-REPORT.md)
- [API文档](docs/API.md)
- [安全指南](docs/SECURITY.md)

---

## 💡 部署清单

在完成部署后，请检查以下清单：

- [ ] Node.js 24 已安装并验证
- [ ] pnpm 已安装并验证
- [ ] PostgreSQL 14 已安装并启动
- [ ] 项目代码已下载
- [ ] 依赖已安装
- [ ] 环境变量已配置
- [ ] 数据库已创建并迁移
- [ ] 应用已成功启动
- [ ] 可以访问 http://localhost:5000
- [ ] 可以使用默认账户登录
- [ ] 已修改默认密码
- [ ] 安全测试已通过

---

## 🆘 获取帮助

如果遇到问题，请参考以下资源：

1. **查看日志**：
   ```powershell
   type C:\LovatoApp\logs\app.log
   ```

2. **检查服务状态**：
   ```powershell
   Get-Service postgresql-x64-14
   Get-Process node
   ```

3. **查看完整文档**：
   - [Windows服务器部署指南](WINDOWS-SERVER-DEPLOYMENT-GUIDE.md)
   - [快速开始指南](QUICK-START-GUIDE.md)

4. **联系技术支持**：
   - 邮箱：tech@example.com
   - 项目仓库：https://github.com/your-repo/lovato-pump-selection

---

**本地部署流程版本**：v1.0
**最后更新**：2026-02-08
**适用系统**：Windows 10/11
