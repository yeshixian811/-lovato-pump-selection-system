# 洛瓦托水泵选型系统 - 快速一键部署

**版本**：v1.0
**适用系统**：Windows 10/11
**部署时间**：约 5-10 分钟

---

## ⚡ 超级简单的一键部署！

### 🚀 方法一：双击运行（最简单）

1. **双击** `deploy.bat` 文件
2. 输入 PostgreSQL 密码
3. 等待自动完成

就这么简单！🎉

---

### 🚀 方法二：右键运行（推荐）

1. **右键点击** `deploy.ps1` 文件
2. 选择 **"使用PowerShell运行"**
3. 输入 PostgreSQL 密码
4. 等待自动完成

---

## 📋 部署前准备

### 必须安装的软件

1. **Node.js 24** ⚠️ **必须**
   - 下载：https://nodejs.org/
   - 验证：打开CMD，输入 `node --version`

2. **PostgreSQL 14** ⚠️ **必须**
   - 下载：https://www.postgresql.org/download/windows/
   - 验证：打开CMD，输入 `psql --version`

3. **项目代码** ⚠️ **必须**
   - 下载或克隆到任意目录

---

## 🎯 一键部署自动完成什么？

- ✅ 检查 Node.js 是否安装
- ✅ 检查 pnpm 是否安装（自动安装）
- ✅ 检查 PostgreSQL 是否运行（自动启动）
- ✅ 安装项目依赖
- ✅ 创建 `.env` 配置文件
- ✅ 自动生成密钥（JWT和加密密钥）
- ✅ 创建数据库
- ✅ 运行数据库迁移
- ✅ 提示启动应用

---

## 📝 部署过程

### 运行脚本后，您只需要：

1. **输入 PostgreSQL 密码**
   - 这是您安装 PostgreSQL 时设置的密码
   - 例如：`YourStrongPassword123!`

2. **选择是否自动生成密钥**
   - 输入 `Y` 或直接回车（推荐）
   - 脚本会自动生成安全的密钥

3. **等待自动完成**
   - 安装依赖可能需要 5-10 分钟
   - 请耐心等待

4. **选择是否启动应用**
   - 输入 `Y` 或直接回车
   - 脚本会自动启动应用并打开浏览器

---

## ✅ 部署完成后的操作

### 1. 访问应用

浏览器自动打开：**http://localhost:5000**

### 2. 登录系统

- **用户名**：`admin`
- **密码**：`admin123`

⚠️ **重要**：首次登录后立即修改默认密码！

### 3. 验证部署

访问：http://localhost:5000/diagnostic

检查所有状态是否正常：
- ✅ 应用服务：正常
- ✅ 数据库连接：正常
- ✅ 内存使用：正常

---

## 🆘 常见问题

### 问题1：PowerShell脚本无法运行

**错误**：`无法加载文件，因为在此系统上禁止运行脚本`

**解决**：

```powershell
# 以管理员身份运行 PowerShell，执行：
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

然后重新运行脚本。

---

### 问题2：PostgreSQL未启动

**错误**：`PostgreSQL connection failed`

**解决**：

```powershell
# 启动 PostgreSQL 服务
Start-Service postgresql-x64-14

# 然后重新运行一键部署脚本
```

---

### 问题3：端口被占用

**错误**：`Error: listen EADDRINUSE: address already in use :::5000`

**解决**：

```powershell
# 查找占用端口的进程
netstat -ano | findstr :5000

# 停止进程
taskkill /PID <进程ID> /F
```

---

### 问题4：忘记PostgreSQL密码

**解决**：

1. 打开 PostgreSQL 安装目录
2. 找到 `data/pg_hba.conf` 文件
3. 修改认证方式为 `trust`
4. 重启 PostgreSQL 服务
5. 重新设置密码

---

## 🎓 脚本说明

### deploy.ps1（PowerShell脚本）⭐ 推荐

**优点**：
- 功能更强大
- 错误处理更好
- 彩色输出，更易读
- 自动生成随机密钥

**使用方法**：
1. 右键点击文件
2. 选择"使用PowerShell运行"

---

### deploy.bat（批处理脚本）

**优点**：
- 兼容性更好
- 所有Windows系统都可以运行
- 不需要PowerShell权限

**使用方法**：
1. 双击文件

---

## 💡 提示

1. **首次运行**：建议使用 `deploy.ps1`（PowerShell脚本）
2. **记住密码**：请妥善记录 PostgreSQL 密码
3. **自动生成**：推荐自动生成密钥，更安全
4. **耐心等待**：依赖安装可能需要几分钟

---

## 🔐 安全建议

1. **修改默认密码**：首次登录后立即修改
2. **保护密钥**：`.env` 文件包含敏感信息，请妥善保管
3. **定期更新**：定期更新系统和依赖包
4. **备份数据**：定期备份数据库

---

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| [⚡ 快速部署指南](LOCAL-DEPLOYMENT-QUICK-START.md) | 10步手动部署 |
| [📘 完整部署流程](LOCAL-DEPLOYMENT-FLOW.md) | 详细部署步骤 |
| [📙 问题诊断](TROUBLESHOOTING.md) | 故障排查指南 |
| [📕 快速开始](QUICK-START-GUIDE.md) | 快速上手指南 |

---

## 🎯 部署流程图

```
开始
  ↓
检查 Node.js → 未安装? → 提示安装
  ↓ 已安装
检查 pnpm → 未安装? → 自动安装
  ↓ 已安装
检查 PostgreSQL → 未运行? → 自动启动
  ↓ 已运行
输入 PostgreSQL 密码
  ↓
选择自动生成密钥
  ↓
安装依赖 (5-10分钟)
  ↓
创建 .env 文件
  ↓
创建数据库
  ↓
运行数据库迁移
  ↓
完成！
  ↓
启动应用? Y → pnpm run dev
  ↓
访问 http://localhost:5000
```

---

## 🎉 开始部署

现在就开始吧！

1. **双击** `deploy.bat` 或 **右键** `deploy.ps1` 选择"使用PowerShell运行"
2. 输入 PostgreSQL 密码
3. 等待自动完成
4. 享受您的洛瓦托水泵选型系统！

---

**一键部署文档版本**：v1.0
**最后更新**：2026-02-08
**预计部署时间**：5-10 分钟

祝您部署顺利！🚀
