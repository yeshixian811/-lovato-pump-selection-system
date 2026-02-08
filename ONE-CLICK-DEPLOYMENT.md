# 洛瓦托水泵选型系统 - 一键部署脚本

**版本**：v1.0
**适用系统**：Windows 10/11
**部署时间**：约 10 分钟（自动执行）

---

## ⚡ 一键部署说明

我已经为您创建了两个一键部署脚本：

1. **PowerShell脚本** (`deploy.ps1`) - 推荐，功能更强大
2. **批处理脚本** (`deploy.bat`) - 兼容性更好

---

## 🚀 方法一：使用PowerShell脚本（推荐）

### 步骤：

1. **右键点击** `deploy.ps1` 文件
2. 选择 **"使用PowerShell运行"**
3. 按照提示输入必要信息：
   - PostgreSQL 密码
   - JWT密钥（可选，自动生成）
   - 加密密钥（可选，自动生成）

4. 等待自动完成

5. 脚本执行完成后，自动：
   - ✅ 安装依赖
   - ✅ 配置环境变量
   - ✅ 创建数据库
   - ✅ 运行数据库迁移
   - ✅ 启动应用

---

## 🚀 方法二：使用批处理脚本

### 步骤：

1. **双击运行** `deploy.bat` 文件

2. 按照提示输入必要信息：
   - PostgreSQL 密码
   - JWT密钥（可选，自动生成）
   - 加密密钥（可选，自动生成）

3. 等待自动完成

---

## 📋 一键部署功能

### 自动完成的任务

- ✅ 检查 Node.js 是否安装
- ✅ 检查 pnpm 是否安装
- ✅ 检查 PostgreSQL 是否运行
- ✅ 安装项目依赖
- ✅ 创建 `.env` 配置文件
- ✅ 创建数据库
- ✅ 运行数据库迁移
- ✅ 启动应用
- ✅ 打开浏览器访问应用

---

## ⚠️ 前置条件

在使用一键部署脚本之前，请确保：

1. **已安装 Node.js 24**
   - 下载：https://nodejs.org/
   - 验证：`node --version`

2. **已安装 PostgreSQL 14**
   - 下载：https://www.postgresql.org/download/windows/
   - 验证：`psql --version`

3. **已下载项目代码**
   - 解压到任意目录（如 `C:\LovatoApp`）

---

## 🔧 手动配置（可选）

如果您想自定义配置，可以手动编辑 `.env` 文件：

```env
# 数据库配置
DATABASE_URL=postgresql://postgres:您的密码@localhost:5432/lovato_pump

# JWT配置
JWT_SECRET=您的JWT密钥

# 加密配置
ENCRYPTION_KEY=您的加密密钥

# 应用配置
PORT=5000
```

---

## 🎯 部署完成后

### 1. 访问应用

浏览器自动打开：http://localhost:5000

### 2. 登录系统

- **用户名**：`admin`
- **密码**：`admin123`

⚠️ **重要**：首次登录后立即修改默认密码！

### 3. 验证部署

访问：http://localhost:5000/diagnostic

检查所有状态是否正常。

---

## 🆘 常见问题

### 问题1：PowerShell脚本无法运行

**错误信息**：`无法加载文件，因为在此系统上禁止运行脚本`

**解决方法**：

```powershell
# 以管理员身份运行 PowerShell，执行：
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

然后重新运行脚本。

---

### 问题2：PostgreSQL未启动

**错误信息**：`PostgreSQL connection failed`

**解决方法**：

```powershell
# 启动 PostgreSQL 服务
Start-Service postgresql-x64-14

# 然后重新运行一键部署脚本
```

---

### 问题3：端口被占用

**错误信息**：`Error: listen EADDRINUSE: address already in use :::5000`

**解决方法**：

```powershell
# 查找占用端口的进程
netstat -ano | findstr :5000

# 停止进程
taskkill /PID <进程ID> /F

# 或修改 .env 文件中的 PORT 值
```

---

### 问题4：依赖安装失败

**错误信息**：`npm ERR!` 或 `pnpm ERR!`

**解决方法**：

```powershell
# 清理缓存
pnpm store prune

# 删除 node_modules
Remove-Item -Recurse -Force node_modules

# 重新运行一键部署脚本
```

---

## 📋 脚本详细说明

### deploy.ps1 - PowerShell脚本 ⭐ 推荐

**完整脚本功能**：

```powershell
# 参数支持
deploy.ps1 [-PostgresPassword] <string>
           [-JwtSecret] <string>
           [-EncryptionKey] <string>
           [-SkipDatabase] <switch>

# 示例用法
.\deploy.ps1 -PostgresPassword "MyPassword123!"
.\deploy.ps1 -SkipDatabase  # 跳过数据库配置
.\deploy.ps1 -PostgresPassword "xxx" -JwtSecret "xxx" -EncryptionKey "xxx"
```

**执行流程**：

1. 检查 Node.js（未安装则提示）
2. 检查 pnpm（未安装则自动安装）
3. 检查 PostgreSQL（未运行则自动启动）
4. 收集配置信息
5. 创建 .env 文件
6. 安装依赖（约5-10分钟）
7. 创建数据库
8. 运行数据库迁移
9. 提示启动应用

**输出示例**：

```
====================================
  洛瓦托水泵选型系统 - 一键部署
====================================

[步骤 1/7] 检查 Node.js...
✓ Node.js 已安装: v24.x.x

[步骤 2/7] 检查 pnpm...
✓ pnpm 已安装: 9.x.x

[步骤 3/7] 检查 PostgreSQL...
✓ PostgreSQL 已安装: psql (PostgreSQL) 14.x
✓ PostgreSQL 服务正在运行

[步骤 4/7] 配置部署信息...
请输入 PostgreSQL 密码: ********
是否自动生成 JWT 密钥? (Y/n): Y
是否自动生成加密密钥? (Y/n): Y

配置信息汇总:
  PostgreSQL 密码: ***
  JWT 密钥: abc1234567...
  加密密钥: xyz9876543...

[步骤 5/7] 创建配置文件...
✓ .env 文件已创建

[步骤 6/7] 安装项目依赖...
  这可能需要几分钟，请耐心等待...
... (依赖安装输出)
✓ 依赖安装成功

[步骤 7/7] 配置数据库...
  正在创建数据库...
✓ 数据库创建成功
  正在运行数据库迁移...
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

---

### deploy.bat - 批处理脚本

**功能**：
- 兼容所有Windows系统
- 不需要PowerShell权限
- 自动化部署流程

**使用方法**：

```batch
# 双击运行
deploy.bat

# 命令行运行
C:\> deploy.bat
```

**输出示例**：

```
===================================
  洛瓦托水泵选型系统 - 一键部署
===================================

[步骤 1/7] 检查 Node.js...
✓ Node.js 已安装: v24.x.x

[步骤 2/7] 检查 pnpm...
✓ pnpm 已安装: 9.x.x

[步骤 3/7] 检查 PostgreSQL...
✓ PostgreSQL 已安装: psql (PostgreSQL) 14.x
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
... (依赖安装输出)
✓ 依赖安装成功

[步骤 7/7] 配置数据库...
  正在创建数据库...
✓ 数据库创建成功
  正在运行数据库迁移...
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

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| [⚡ 快速部署指南](LOCAL-DEPLOYMENT-QUICK-START.md) | 10步快速部署 |
| [📘 完整部署流程](LOCAL-DEPLOYMENT-FLOW.md) | 详细部署步骤 |
| [📙 问题诊断](TROUBLESHOOTING.md) | 故障排查指南 |
| [📕 快速开始](QUICK-START-GUIDE.md) | 快速上手指南 |

---

## 💡 提示

1. **首次运行**：建议先使用一键部署脚本
2. **自定义配置**：可以手动编辑 `.env` 文件
3. **定期备份**：建议定期备份数据库
4. **保持更新**：定期更新依赖包

---

## 🎓 下一步

部署成功后：

1. **体验功能**：http://localhost:5000/selection
2. **管理数据**：http://localhost:5000/admin
3. **查看状态**：http://localhost:5000/diagnostic

---

## 🔐 安全建议

1. **修改默认密码**：首次登录后立即修改
2. **保护密钥**：妥善保管 JWT_SECRET 和 ENCRYPTION_KEY
3. **定期更新**：定期更新系统和依赖包
4. **备份数据**：定期备份数据库

---

**一键部署脚本版本**：v1.0
**最后更新**：2026-02-08
**预计部署时间**：10 分钟

祝您部署顺利！🎉
