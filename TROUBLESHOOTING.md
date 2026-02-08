# 项目显示异常 - 问题诊断和解决方案

## 问题描述

项目无法正常显示或功能异常，主要原因是**数据库连接失败**。

## 🔍 问题诊断

### 当前系统状态

根据系统诊断，发现以下问题：

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 数据库连接 | ❌ 失败 | PostgreSQL未连接 |
| 内存使用 | ✅ 正常 | 83.46% 使用率 |
| 应用服务 | ✅ 运行中 | 端口5000监听正常 |
| 环境变量 | ✅ 已配置 | .env文件已创建 |

### 受影响的功能

由于数据库连接失败，以下功能可能无法正常使用：

- ❌ 用户登录/注册
- ❌ 产品管理（产品库）
- ❌ 智能选型（依赖数据库产品数据）
- ❌ 进销存管理
- ❌ 版本管理

✅ **仍可正常使用的功能**：

- ✅ 首页显示
- ✅ 导航栏
- ✅ 系统诊断页面
- ✅ 静态页面

---

## 🛠️ 解决方案

### 方案一：本地部署（推荐）

如果需要在本地Windows环境完整部署项目，请按照以下步骤操作：

#### 1. 安装 PostgreSQL

**Windows 安装步骤**：

1. 下载 PostgreSQL 14：https://www.postgresql.org/download/windows/
2. 运行安装程序
3. 设置超级用户密码（例如：`YourPassword123!`）
4. 完成安装

#### 2. 修改 .env 文件

编辑项目根目录下的 `.env` 文件，修改数据库配置：

```env
# 修改为实际的PostgreSQL密码
DATABASE_URL=postgresql://postgres:YourPassword123@localhost:5432/lovato_pump
```

#### 3. 创建数据库

打开命令提示符（CMD），执行：

```powershell
psql -U postgres -c "CREATE DATABASE lovato_pump;"
```

输入第1步设置的密码。

#### 4. 运行数据库迁移

```powershell
cd C:\LovatoApp
pnpm run db:push
```

#### 5. 启动应用

```powershell
pnpm run dev
```

#### 6. 访问应用

打开浏览器访问：http://localhost:5000

详细步骤请参考：[本地部署流程](LOCAL-DEPLOYMENT-FLOW.md)

---

### 方案二：使用在线数据库（临时方案）

如果暂时不想本地安装PostgreSQL，可以使用在线PostgreSQL服务：

#### 推荐的在线数据库服务：

1. **Neon** (推荐) - https://neon.tech/
   - 免费套餐：0.5GB存储
   - 无需信用卡
   - 即开即用

2. **Supabase** - https://supabase.com/
   - 免费套餐：500MB存储
   - 提供数据库管理界面

3. **ElephantSQL** - https://www.elephantsql.com/
   - 免费套餐：20MB存储
   - 适合测试

#### 使用Neon的步骤：

1. 注册Neon账号：https://neon.tech/
2. 创建新项目
3. 复制连接字符串
4. 修改 `.env` 文件：

```env
DATABASE_URL=postgresql://your_username:your_password@ep-cool-xxx.us-east-2.aws.neon.tech/your_database?sslmode=require
```

5. 运行数据库迁移：

```powershell
pnpm run db:push
```

6. 重启应用：

```powershell
pnpm run dev
```

---

### 方案三：使用演示数据（仅查看UI）

如果只想查看UI效果，不使用数据库功能，可以：

1. 访问首页：http://localhost:5000
2. 查看静态页面
3. 使用系统诊断页面：http://localhost:5000/diagnostic

⚠️ **注意**：此方案下，选型、登录等功能无法使用。

---

## 📊 验证修复

修复后，请访问系统诊断页面验证：

**诊断页面**：http://localhost:5000/diagnostic

### 预期结果：

```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "pass",
      "message": "Database connection successful"
    }
  }
}
```

### 使用命令行验证：

```powershell
curl http://localhost:5000/api/health
```

---

## 🆘 常见问题

### Q1: 数据库连接超时

**原因**：PostgreSQL未启动或端口配置错误

**解决方法**：

1. 检查PostgreSQL服务：

```powershell
Get-Service postgresql-x64-14
```

2. 如果服务未运行，启动服务：

```powershell
Start-Service postgresql-x64-14
```

3. 检查 `.env` 文件中的 `DATABASE_URL` 配置

---

### Q2: 密码认证失败

**原因**：密码不正确

**解决方法**：

1. 确认PostgreSQL密码
2. 修改 `.env` 文件中的 `DATABASE_URL`
3. 重启应用

---

### Q3: 数据库不存在

**原因**：数据库未创建

**解决方法**：

```powershell
psql -U postgres -c "CREATE DATABASE lovato_pump;"
```

---

### Q4: 端口5000被占用

**原因**：其他程序使用了5000端口

**解决方法**：

```powershell
# 查找占用端口的进程
netstat -ano | findstr :5000

# 停止进程
taskkill /PID <进程ID> /F
```

或修改 `.env` 文件中的 `PORT` 值

---

### Q5: 依赖安装失败

**原因**：网络问题或依赖冲突

**解决方法**：

```powershell
# 清理缓存
pnpm store prune

# 删除node_modules
rmdir /S /Q node_modules

# 重新安装
pnpm install
```

---

## 📚 相关文档

- [本地部署流程](LOCAL-DEPLOYMENT-FLOW.md) - 完整的本地部署步骤
- [快速开始指南](QUICK-START-GUIDE.md) - 快速上手指南
- [Windows服务器部署指南](WINDOWS-SERVER-DEPLOYMENT-GUIDE.md) - 生产环境部署
- [完整安全审计报告](COMPLETE-SECURITY-AUDIT-REPORT.md) - 安全审计详情
- [项目交付报告](PROJECT-DELIVERY-REPORT.md) - 项目完成情况

---

## 🚀 快速命令参考

```powershell
# 检查健康状态
curl http://localhost:5000/api/health

# 访问系统诊断
# 浏览器打开：http://localhost:5000/diagnostic

# 查看日志
Get-Content logs/app.log -Tail 50

# 重启应用
# 在运行应用的终端按 Ctrl+C，然后重新运行：
pnpm run dev

# 测试数据库连接
psql -U postgres -d lovato_pump -c "SELECT NOW();"
```

---

## 💡 推荐的下一步

1. **立即修复**：按照方案一或方案二修复数据库连接
2. **验证功能**：访问系统诊断页面确认修复成功
3. **添加数据**：在管理后台添加产品数据
4. **测试选型**：使用选型功能测试完整流程

---

## 📞 获取帮助

如果问题仍未解决：

1. 查看完整日志：
   ```powershell
   tail -f logs/app.log
   ```

2. 访问系统诊断页面：
   http://localhost:5000/diagnostic

3. 参考完整文档：
   - [本地部署流程](LOCAL-DEPLOYMENT-FLOW.md)
   - [快速开始指南](QUICK-START-GUIDE.md)

---

**问题诊断文档版本**：v1.0
**最后更新**：2026-02-08
