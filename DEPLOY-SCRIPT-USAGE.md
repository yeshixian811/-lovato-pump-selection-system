# 🔧 一键部署脚本 - 使用说明

**版本**：v1.0
**最后更新**：2026-02-08

---

## 📋 脚本概览

本项目提供了两个一键部署脚本，用于快速部署洛瓦托水泵选型系统：

| 脚本 | 文件名 | 推荐度 | 适用系统 |
|------|--------|--------|---------|
| PowerShell脚本 | `deploy.ps1` | ⭐⭐⭐⭐⭐ | Windows |
| 批处理脚本 | `deploy.bat` | ⭐⭐⭐⭐ | Windows |

---

## 🚀 deploy.ps1 - PowerShell脚本（推荐）

### 功能特点

- ✅ **功能最强大**：支持参数化配置
- ✅ **彩色输出**：易于阅读和理解
- ✅ **自动生成密钥**：安全的随机密钥
- ✅ **完整错误处理**：详细的错误信息
- ✅ **交互式配置**：友好的用户体验
- ✅ **进度显示**：实时显示部署进度

### 使用方法

#### 方法1：右键运行（最简单）

1. 右键点击 `deploy.ps1` 文件
2. 选择 **"使用PowerShell运行"**
3. 按照提示操作

#### 方法2：PowerShell命令行运行

```powershell
# 基本用法
.\deploy.ps1

# 自动生成密钥
.\deploy.ps1 -PostgresPassword "YourPassword"

# 跳过数据库配置
.\deploy.ps1 -SkipDatabase

# 完整参数
.\deploy.ps1 -PostgresPassword "P@ssw0rd" -JwtSecret "your-jwt-secret-key-at-least-32-characters-long" -EncryptionKey "your-encryption-key-at-least-32-characters-long"
```

### 参数说明

| 参数 | 类型 | 说明 | 必填 | 默认值 |
|------|------|------|------|--------|
| `-PostgresPassword` | String | PostgreSQL数据库密码 | 否 | 交互式输入 |
| `-JwtSecret` | String | JWT密钥（≥32字符） | 否 | 自动生成 |
| `-EncryptionKey` | String | 加密密钥（≥32字符） | 否 | 自动生成 |
| `-SkipDatabase` | Switch | 跳过数据库配置 | 否 | false |

### 使用示例

#### 示例1：快速部署（所有参数自动生成）

```powershell
.\deploy.ps1
```

**输出示例**：
```
====================================
  洛瓦托水泵选型系统 - 一键部署
====================================

[步骤 1/7] 检查 Node.js...
✓ Node.js 已安装: v24.1.0

[步骤 2/7] 检查 pnpm...
✓ pnpm 已安装: 9.15.4

[步骤 3/7] 检查 PostgreSQL...
✓ PostgreSQL 已安装: psql (PostgreSQL) 14.12
✓ PostgreSQL 服务正在运行

[步骤 4/7] 配置部署信息...
请输入 PostgreSQL 密码: ********
是否自动生成 JWT 密钥? (Y/n): Y
✓ JWT 密钥已自动生成
是否自动生成加密密钥? (Y/n): Y
✓ 加密密钥已自动生成

配置信息汇总:
  PostgreSQL 密码: ***
  JWT 密钥: xK9mN2pQ4rT6vY8z...
  加密密钥: aB3dE5fG7hI9jK1l...

[步骤 5/7] 创建配置文件...
✓ .env 文件已创建

[步骤 6/7] 安装项目依赖...
  这可能需要几分钟，请耐心等待...
  Lockfile is up to date, resolution step is skipped
Packages: +673
Packages are hardlinked from the content-addressable store to the virtual store.
  Content-addressable store is at: C:\Users\...\pnpm-store\v3
  Virtual store is at: C:\Users\...\node_modules\.pnpm
  Progress: resolved 673, reused 673, downloaded 0, added 673, done
✓ 依赖安装成功

[步骤 7/7] 配置数据库...
  正在创建数据库...
CREATE DATABASE
✓ 数据库创建成功
  正在运行数据库迁移...
Pushing postgres database changes to lovato_pump
The following migration have been created and applied from new schema changes:
migrations
  └─ 0000_initial.sql
✓ 数据库迁移成功

====================================
  部署完成！
====================================

下一步操作:
  1. 启动应用: pnpm run dev
  2. 访问应用: http://localhost:5000
  3. 默认登录账户: admin / admin123
  4. 访问诊断页面: http://localhost:5000/diagnostic

是否现在启动应用? (Y/n): Y

正在启动应用...
启动后请访问: http://localhost:5000

按 Ctrl + C 停止应用
```

#### 示例2：指定PostgreSQL密码

```powershell
.\deploy.ps1 -PostgresPassword "MyStrongPassword123!"
```

**输出**：
```
[步骤 4/7] 配置部署信息...
配置信息汇总:
  PostgreSQL 密码: ***
  JWT 密钥: (自动生成)
  加密密钥: (自动生成)
```

#### 示例3：跳过数据库配置

```powershell
.\deploy.ps1 -SkipDatabase
```

**输出**：
```
[步骤 4/7] 配置部署信息...
[步骤 5/7] 创建配置文件...
[步骤 6/7] 安装项目依赖...

[步骤 7/7] 配置数据库...
  跳过数据库配置

====================================
  部署完成！
====================================
```

#### 示例4：完全手动配置

```powershell
.\deploy.ps1 -PostgresPassword "MyPassword123!" -JwtSecret "my-jwt-secret-key-at-least-32-characters-long" -EncryptionKey "my-encryption-key-at-least-32-characters-long"
```

**输出**：
```
[步骤 4/7] 配置部署信息...
配置信息汇总:
  PostgreSQL 密码: ***
  JWT 密钥: my-jwt-secret-key...
  加密密钥: my-encryption-key...
```

### 执行流程

```
开始
  ↓
检查管理员权限
  ↓
检查 Node.js
  ↓
检查 pnpm（未安装则自动安装）
  ↓
检查 PostgreSQL（未运行则自动启动）
  ↓
收集配置信息
  ├─ PostgreSQL 密码
  ├─ JWT 密钥（可选自动生成）
  └─ 加密密钥（可选自动生成）
  ↓
创建 .env 文件
  ↓
安装依赖（5-10分钟）
  ↓
创建数据库（可选）
  ↓
运行数据库迁移（可选）
  ↓
完成！
  ↓
提示启动应用
```

### 错误处理

#### 错误1：Node.js未安装

```
[步骤 1/7] 检查 Node.js...
✗ Node.js 未安装
  请从 https://nodejs.org/ 下载并安装 Node.js 24 LTS
```

**解决方案**：
- 访问 https://nodejs.org/
- 下载并安装 Node.js 24 LTS
- 重新运行脚本

#### 错误2：PostgreSQL未运行

```
[步骤 3/7] 检查 PostgreSQL...
✓ PostgreSQL 已安装: psql (PostgreSQL) 14.12
⚠️  PostgreSQL 服务已停止，正在启动...
✓ PostgreSQL 服务已启动
```

**自动修复**：脚本会自动尝试启动PostgreSQL服务

#### 错误3：JWT密钥长度不足

```
⚠️  JWT 密钥长度不足32字符，请重新输入
请输入 JWT 密钥（至少32字符）:
```

**解决方案**：
- 输入至少32个字符的密钥
- 或选择自动生成

---

## 🚀 deploy.bat - 批处理脚本

### 功能特点

- ✅ **兼容性最好**：所有Windows系统都可以运行
- ✅ **无需权限**：不需要PowerShell执行权限
- ✅ **简单直接**：双击即可运行
- ✅ **自动化**：完整的自动化流程

### 使用方法

#### 方法1：双击运行（最简单）

1. 双击 `deploy.bat` 文件
2. 按照提示操作

#### 方法2：命令行运行

```batch
C:\> deploy.bat
```

### 输出示例

```
===================================
  洛瓦托水泵选型系统 - 一键部署
===================================

[步骤 1/7] 检查 Node.js...
✓ Node.js 已安装: v24.1.0

[步骤 2/7] 检查 pnpm...
✓ pnpm 已安装: 9.15.4

[步骤 3/7] 检查 PostgreSQL...
✓ PostgreSQL 已安装: psql (PostgreSQL) 14.12
  PostgreSQL 服务状态: RUNNING

[步骤 4/7] 配置部署信息...
请输入 PostgreSQL 密码: ********
是否自动生成 JWT 密钥? (Y/n): Y
✓ JWT 密钥将自动生成
是否自动生成加密密钥? (Y/n): Y
✓ 加密密钥将自动生成

配置信息汇总:
  PostgreSQL 密码: ***

[步骤 5/7] 创建配置文件...
✓ .env 文件已创建

[步骤 6/7] 安装项目依赖...
  这可能需要几分钟，请耐心等待...
  Lockfile is up to date, resolution step is skipped
Packages: +673
Packages are hardlinked from the content-addressable store to the virtual store.
  Content-addressable store is at: C:\Users\...\pnpm-store\v3
  Virtual store is at: C:\Users\...\node_modules\.pnpm
  Progress: resolved 673, reused 673, downloaded 0, added 673, done
✓ 依赖安装成功

[步骤 7/7] 配置数据库...
  正在创建数据库...
CREATE DATABASE
✓ 数据库创建成功
  正在运行数据库迁移...
Pushing postgres database changes to lovato_pump
The following migration have been created and applied from new schema changes:
migrations
  └─ 0000_initial.sql
✓ 数据库迁移成功

===================================
  部署完成！
===================================

下一步操作:
  1. 启动应用: pnpm run dev
  2. 访问应用: http://localhost:5000
  3. 默认登录账户: admin / admin123
  4. 访问诊断页面: http://localhost:5000/diagnostic

是否现在启动应用? (Y/n): Y

正在启动应用...
启动后请访问: http://localhost:5000

按 Ctrl + C 停止应用

部署脚本执行完成！

请按任意键继续. . .
```

---

## 🎯 两个脚本的对比

| 特性 | deploy.ps1 | deploy.bat |
|------|-----------|-----------|
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 彩色输出 | ✅ | ❌ |
| 参数支持 | ✅ | ❌ |
| 自动生成密钥 | ✅ | ✅ |
| 错误处理 | ✅ | ✅ |
| 兼容性 | Windows 10/11 | 所有Windows |
| 进度显示 | ✅ | ✅ |
| 启动服务 | ✅ | ✅ |

---

## 💡 使用建议

### 新手用户

**推荐**：使用 `deploy.bat`

**理由**：
- 双击即可运行，最简单
- 不需要任何配置

### 有基础用户

**推荐**：使用 `deploy.ps1`

**理由**：
- 功能更强大
- 彩色输出更易读
- 支持参数化配置

### 高级用户

**推荐**：使用 `deploy.ps1` 配合参数

**理由**：
- 可以自动化部署流程
- 可以集成到CI/CD流程

---

## 🔧 高级用法

### 集成到自动化流程

#### PowerShell脚本

```powershell
# 自动化部署脚本
$env:PG_PASSWORD = "YourPassword"
$env:JWT_SECRET = "your-jwt-secret-key-at-least-32-characters-long"
$env:ENCRYPTION_KEY = "your-encryption-key-at-least-32-characters-long"

.\deploy.ps1 -PostgresPassword $env:PG_PASSWORD -JwtSecret $env:JWT_SECRET -EncryptionKey $env:ENCRYPTION_KEY

# 启动应用
Start-Process powershell -ArgumentList "pnpm run dev"
```

#### 批处理脚本

```batch
@echo off
set POSTGRES_PASS=YourPassword
set JWT_SECRET=generated_jwt_secret_key_minimum_32_characters
set ENCRYPTION_KEY=generated_encryption_key_minimum_32_characters

echo %POSTGRES_PASS% | deploy.bat

start pnpm run dev
```

### 集成到CI/CD

#### GitHub Actions

```yaml
name: Deploy Lovato Pump System

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '24'
      - name: Install PostgreSQL
        run: |
          choco install postgresql
      - name: Run deployment script
        env:
          POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          ENCRYPTION_KEY: ${{ secrets.ENCRYPTION_KEY }}
        run: |
          .\deploy.ps1 -PostgresPassword $env:POSTGRES_PASSWORD -JwtSecret $env:JWT_SECRET -EncryptionKey $env:ENCRYPTION_KEY -SkipDatabase
      - name: Start application
        run: |
          pnpm run dev
```

---

## 🆘 常见问题

### 问题1：PowerShell脚本无法运行

**错误**：
```
无法加载文件，因为在此系统上禁止运行脚本
```

**解决方案**：

```powershell
# 以管理员身份运行 PowerShell，执行：
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# 重新运行脚本
```

---

### 问题2：PostgreSQL密码错误

**错误**：
```
psql: FATAL: password authentication failed for user "postgres"
```

**解决方案**：

1. 确认密码输入正确
2. 检查PostgreSQL服务是否运行
3. 重启PostgreSQL服务

```powershell
# 重启PostgreSQL服务
Restart-Service postgresql-x64-14

# 重新运行脚本
```

---

### 问题3：依赖安装失败

**错误**：
```
pnpm install failed
```

**解决方案**：

```powershell
# 清理缓存
pnpm store prune

# 删除 node_modules
Remove-Item -Recurse -Force node_modules

# 重新运行脚本
.\deploy.ps1
```

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| [⚡ 超级简单部署](SUPER-SIMPLE-DEPLOY.md) | 3步完成部署 |
| [⚡ 快速部署指南](LOCAL-DEPLOYMENT-QUICK-START.md) | 10步快速部署 |
| [📘 完整部署流程](LOCAL-DEPLOYMENT-FLOW.md) | 详细部署步骤 |
| [📕 故障排查](TROUBLESHOOTING.md) | 问题诊断和解决方案 |

---

## 🎉 开始部署

现在就开始吧！

1. **双击** `deploy.bat` 或 **右键** `deploy.ps1` 选择"使用PowerShell运行"
2. 输入PostgreSQL密码
3. 选择自动生成密钥（推荐）
4. 等待自动完成
5. 访问 http://localhost:5000

**一键部署脚本使用说明版本**：v1.0
**最后更新**：2026-02-08

祝您部署顺利！🚀
