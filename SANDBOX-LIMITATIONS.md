# 沙箱环境限制说明

## 📝 当前状态

### ✅ 正常运行的部分

| 功能 | 状态 | 说明 |
|------|------|------|
| 应用服务 | ✅ 正常 | 端口5000运行正常 |
| 首页显示 | ✅ 正常 | 可以访问 http://localhost:5000 |
| 导航栏 | ✅ 正常 | 导航功能正常 |
| 静态页面 | ✅ 正常 | 所有非数据库页面可用 |
| 系统诊断 | ✅ 正常 | 可访问 /diagnostic 查看状态 |

### ❌ 受限制的部分

| 功能 | 状态 | 原因 |
|------|------|------|
| 数据库连接 | ❌ 不可用 | 沙箱未安装PostgreSQL |
| 用户登录/注册 | ❌ 不可用 | 需要数据库支持 |
| 产品管理 | ❌ 不可用 | 需要数据库存储 |
| 智能选型 | ❌ 不可用 | 需要读取产品数据 |
| 进销存管理 | ❌ 不可用 | 需要数据库支持 |

---

## 🔍 沙箱环境限制说明

### 什么是沙箱环境？

当前运行的是一个**开发测试沙箱环境**，用于：
- ✅ 预览UI界面效果
- ✅ 测试前端交互
- ✅ 验证页面布局
- ❌ 不提供完整的数据库服务

### 为什么数据库不可用？

沙箱环境是一个简化的开发环境，**不包含PostgreSQL数据库服务**，因此：
- 无法连接到PostgreSQL数据库
- 需要数据库的功能无法使用
- 但**前端UI和交互完全正常**

---

## 🎯 当前可以做的事情

### 1. ✅ 查看UI效果

访问以下页面查看完整的UI设计：

- **首页**：http://localhost:5000
- **系统诊断**：http://localhost:5000/diagnostic
- **选型页面（UI）**：http://localhost:5000/selection
- **管理后台（UI）**：http://localhost:5000/admin

### 2. ✅ 测试前端交互

- 导航菜单切换
- 响应式布局
- 移动端适配
- 主题切换（如果有）

### 3. ✅ 查看系统状态

访问诊断页面可以实时查看：
- 数据库连接状态
- 内存使用情况
- 系统运行时间
- 环境配置信息

---

## 🚀 如何使用完整功能

### 方案一：本地Windows部署（推荐）

如果您需要使用完整功能（包括数据库），请在本地Windows环境部署：

#### 快速步骤：

1. **安装Node.js和pnpm**
   ```powershell
   # 下载安装：https://nodejs.org/
   npm install -g pnpm
   ```

2. **安装PostgreSQL**
   ```powershell
   # 下载安装：https://www.postgresql.org/download/windows/
   # 安装时设置密码（例如：YourPassword123!）
   ```

3. **克隆或下载项目**

4. **安装依赖**
   ```powershell
   cd LovatoApp
   pnpm install
   ```

5. **配置环境变量**
   ```powershell
   # 创建 .env 文件，填写：
   DATABASE_URL=postgresql://postgres:YourPassword123@localhost:5432/lovato_pump
   JWT_SECRET=your-secret-key-minimum-32-characters
   ENCRYPTION_KEY=your-encryption-key-minimum-32-characters
   ```

6. **创建数据库**
   ```powershell
   psql -U postgres -c "CREATE DATABASE lovato_pump;"
   ```

7. **运行数据库迁移**
   ```powershell
   pnpm run db:push
   ```

8. **启动应用**
   ```powershell
   pnpm run dev
   ```

9. **访问应用**
   - 打开浏览器：http://localhost:5000
   - 默认账户：admin / admin123

详细步骤请参考：[本地部署流程](LOCAL-DEPLOYMENT-FLOW.md)

### 方案二：使用在线数据库

如果不想安装PostgreSQL，可以使用免费的在线数据库：

#### 使用Neon（推荐）：

1. 注册：https://neon.tech/
2. 创建项目并复制连接字符串
3. 修改 `.env` 文件：
   ```env
   DATABASE_URL=postgresql://username:password@xxx.us-east-2.aws.neon.tech/database?sslmode=require
   ```
4. 运行迁移：`pnpm run db:push`
5. 启动应用：`pnpm run dev`

---

## 💡 沙箱环境 vs 本地环境对比

| 特性 | 沙箱环境 | 本地环境 |
|------|----------|----------|
| UI预览 | ✅ 完全支持 | ✅ 完全支持 |
| 数据库 | ❌ 不支持 | ✅ 完整支持 |
| 用户认证 | ❌ 不可用 | ✅ 完整支持 |
| 产品管理 | ❌ 不可用 | ✅ 完整支持 |
| 智能选型 | ❌ 不可用 | ✅ 完整支持 |
| 进销存管理 | ❌ 不可用 | ✅ 完整支持 |
| 部署方式 | 自动启动 | 手动配置 |
| 适用场景 | UI预览、前端测试 | 完整功能测试、生产使用 |

---

## 📚 相关文档

| 文档 | 用途 |
|------|------|
| [本地部署流程](LOCAL-DEPLOYMENT-FLOW.md) | 完整的本地部署步骤 |
| [问题诊断和解决方案](TROUBLESHOOTING.md) | 故障排查指南 |
| [快速开始指南](QUICK-START-GUIDE.md) | 快速上手 |
| [Windows服务器部署指南](WINDOWS-SERVER-DEPLOYMENT-GUIDE.md) | 生产环境部署 |
| [完整安全审计报告](COMPLETE-SECURITY-AUDIT-REPORT.md) | 安全审计详情 |
| [项目交付报告](PROJECT-DELIVERY-REPORT.md) | 项目完成情况 |

---

## 🔧 常见问题

### Q1: 为什么数据库连接失败？

**答**：沙箱环境没有安装PostgreSQL数据库服务。如需使用完整功能，请在本地Windows环境部署。

### Q2: 如何查看UI效果？

**答**：直接访问 http://localhost:5000 即可查看完整的UI效果。所有前端页面都可以正常访问。

### Q3: 测试选型功能需要什么？

**答**：选型功能需要从数据库读取产品数据，因此需要先配置数据库。建议在本地环境部署。

### Q4: 沙箱环境有什么用？

**答**：沙箱环境用于：
- 快速预览UI设计
- 测试前端交互
- 验证响应式布局
- 查看页面效果

### Q5: 如何在本地部署？

**答**：参考 [本地部署流程](LOCAL-DEPLOYMENT-FLOW.md)，按照步骤操作即可。

---

## 📞 获取帮助

### 当前可用功能

- ✅ 查看所有页面UI
- ✅ 测试前端交互
- ✅ 访问系统诊断页面
- ✅ 查看项目文档

### 需要数据库的功能

以下功能需要在本地部署后使用：
- 用户登录/注册
- 产品管理
- 智能选型
- 进销存管理
- 版本管理

---

## 🎓 学习建议

如果您只是想了解项目的UI设计和功能，可以：

1. **浏览页面**：访问各个页面查看效果
2. **查看文档**：阅读技术文档了解功能
3. **本地部署**：按照文档在本地部署，体验完整功能

如果您需要实际使用项目，建议：

1. **本地部署**：在Windows环境完整部署
2. **配置数据库**：安装PostgreSQL或使用在线数据库
3. **添加数据**：在管理后台添加产品数据
4. **测试功能**：体验完整的选型和管理功能

---

**沙箱环境说明版本**：v1.0
**最后更新**：2026-02-08
**适用环境**：Coze开发沙箱
