# ✅ Windows 安装检查清单

## 📋 使用说明

使用此清单逐项检查您的安装状态。
每完成一项，在 `[ ]` 中打钩 `[x]`。

---

## 第1部分: 环境准备

### 系统检查

- [ ] 操作系统是 Windows 10 或 Windows 11
- [ ] 系统是 64 位
- [ ] 可用磁盘空间 > 10GB
- [ ] 可用内存 > 4GB
- [ ] 网络连接正常
- [ ] 已杀毒软件允许安装（如有）

### 工具准备

- [ ] 有管理员权限（可以以管理员身份运行程序）
- [ ] 浏览器可以访问 nodejs.org
- [ ] 浏览器可以访问 postgresql.org
- [ ] 有足够的网络下载带宽

---

## 第2部分: Node.js 安装

### 下载

- [ ] 已访问 https://nodejs.org/
- [ ] 已下载 LTS 版本（当前推荐 v24.x）
- [ ] 下载文件大小约 30-40MB
- [ ] 下载完成，文件完整

### 安装

- [ ] 右键点击安装文件，选择"以管理员身份运行"
- [ ] 安装向导正常启动
- [ ] 选择默认安装路径
- [ ] 添加到 PATH 已勾选
- [ ] 安装过程无错误
- [ ] 安装完成提示出现

### 验证

- [ ] 打开命令提示符（按 Win+R，输入 cmd）
- [ ] 输入 `node --version` 显示版本号
- [ ] 输入 `npm --version` 显示版本号
- [ ] 版本号显示正确（node >= 24, npm >= 10）

---

## 第3部分: pnpm 安装

### 安装

- [ ] 打开命令提示符（管理员）
- [ ] 输入 `npm install -g pnpm`
- [ ] 等待安装完成（1-2分钟）
- [ ] 安装过程无错误

### 验证

- [ ] 输入 `pnpm --version` 显示版本号
- [ ] 版本号 >= 9.0.0

---

## 第4部分: PostgreSQL 安装

### 下载

- [ ] 已访问 https://www.postgresql.org/download/windows/
- [ ] 已下载 PostgreSQL 14.x 或 15.x
- [ ] 下载文件大小约 200-300MB
- [ ] 下载完成，文件完整

### 安装

- [ ] 右键点击安装文件，选择"以管理员身份运行"
- [ ] 安装向导正常启动
- [ ] 组件选择保持默认
- [ ] 安装目录选择（或使用默认）
- [ ] 数据目录选择（推荐 J:\postgresql\data）
- [ ] 密码设置为 `postgres`（记住！）
- [ ] 端口设置为 5432（默认）
- [ ] 区域设置为 C
- [ ] 安装过程无错误
- [ ] 安装完成提示出现

### 配置

- [ ] PostgreSQL 已添加到系统 PATH
- [ ] 已重启命令提示符

### 验证

- [ ] 输入 `psql --version` 显示版本号
- [ ] 输入 `net start postgresql-x64-14` 服务启动成功
- [ ] 或显示"服务已在运行"

---

## 第5部分: 获取项目代码

### 方案 A: Git 克隆

- [ ] 已安装 Git
- [ ] 已克隆项目到本地
- [ ] 可以进入项目目录

### 方案 B: ZIP 下载

- [ ] 已下载项目 ZIP 文件
- [ ] 已解压到目标目录
- [ ] 可以进入项目目录
- [ ] 可以看到 package.json 文件

---

## 第6部分: 项目配置

### 依赖安装

- [ ] 进入项目根目录
- [ ] 输入 `pnpm install`
- [ ] 等待安装完成（3-5分钟）
- [ ] 安装过程无错误
- [ ] node_modules 文件夹已创建

### 环境配置

- [ ] 已复制 .env.example 到 .env
- [ ] 已编辑 .env 文件
- [ ] DATABASE_URL 配置正确
- [ ] POSTGRES_DATA_DIR 配置正确
- [ ] POSTGRES_BACKUP_DIR 配置正确
- [ ] JWT_SECRET 已设置
- [ ] PORT 配置为 5000

---

## 第7部分: 数据库配置

### 创建数据库

- [ ] 输入 `psql -U postgres -c "CREATE DATABASE lovato_pump;"`
- [ ] 提示输入密码时输入 `postgres`
- [ ] 显示 "CREATE DATABASE"

### 运行迁移

- [ ] 输入 `psql -U postgres -d lovato_pump < migrations\001_add_membership_tables.sql`
- [ ] 提示输入密码时输入 `postgres`
- [ ] 迁移脚本执行无错误

### 验证数据库

- [ ] 输入 `psql -U postgres -d lovato_pump -c "\dt"`
- [ ] 显示 7 个表：
  - [ ] users
  - [ ] email_verifications
  - [ ] password_resets
  - [ ] subscription_plans
  - [ ] subscriptions
  - [ ] selection_history
  - [ ] usage_stats

---

## 第8部分: 启动应用

### 启动开发服务器

- [ ] 确保在项目根目录
- [ ] 输入 `pnpm run dev`
- [ ] 或运行 `start.bat`
- [ ] 等待编译完成
- [ ] 显示 "Ready in Xs"
- [ ] 显示 "Local: http://localhost:5000"

### 访问应用

- [ ] 打开浏览器
- [ ] 访问 http://localhost:5000
- [ ] 页面正常加载
- [ ] 无明显错误

---

## 第9部分: 功能测试

### 基础功能

- [ ] 首页可以正常显示
- [ ] 导航菜单可以点击
- [ ] 页面跳转正常
- [ ] 无控制台错误

### 水泵选型

- [ ] 可以打开水泵选型页面
- [ ] 可以输入参数
- [ ] 可以提交查询
- [ ] 可以看到结果

### 用户功能

- [ ] 可以打开注册页面
- [ ] 可以输入注册信息
- [ ] 可以提交注册
- [ ] 可以打开登录页面
- [ ] 可以输入登录信息
- [ ] 可以登录成功

---

## 第10部分: 服务管理

### 服务状态

- [ ] PostgreSQL 服务正常运行
- [ ] 可以使用 `sc query postgresql-x64-14` 查看
- [ ] 状态显示为 RUNNING

### 服务控制

- [ ] 可以使用 `net start postgresql-x64-14` 启动
- [ ] 可以使用 `net stop postgresql-x64-14` 停止
- [ ] 重启后可以正常启动

---

## 📊 完成度统计

### 当前完成度

- 第1部分: 环境准备 - `/8`
- 第2部分: Node.js - `/8`
- 第3部分: pnpm - `/2`
- 第4部分: PostgreSQL - `/11`
- 第5部分: 获取代码 - `/4`
- 第6部分: 项目配置 - `/8`
- 第7部分: 数据库 - `/9`
- 第8部分: 启动 - `/5`
- 第9部分: 功能测试 - `/12`
- 第10部分: 服务管理 - `/4`

**总计**: `/71`

完成度: `(已勾选项 / 71) * 100%`

---

## ✅ 最终验证

### 完整验证命令

打开命令提示符，依次运行以下命令：

```batch
echo 验证 Node.js...
node --version
echo.

echo 验证 pnpm...
pnpm --version
echo.

echo 验证 PostgreSQL...
psql --version
echo.

echo 验证服务状态...
sc query postgresql-x64-14
echo.

echo 验证数据库...
psql -U postgres -d lovato_pump -c "\dt"
echo.

echo 验证应用启动...
echo 请在另一个窗口运行: pnpm run dev
echo 然后访问: http://localhost:5000
```

### 成功标志

- [ ] 所有命令都执行成功
- [ ] 所有版本号显示正确
- [ ] 服务状态为 RUNNING
- [ ] 数据库表完整
- [ ] 应用可以访问
- [ ] 基本功能正常

---

## 🎯 完成标准

### 最低要求（60%）

至少完成：
- 所有软件已安装（Node.js, pnpm, PostgreSQL）
- 数据库已创建和迁移
- 应用可以启动和访问

### 标准要求（80%）

满足最低要求，并且：
- 所有基础功能可以正常使用
- 用户注册/登录功能正常
- 服务可以正常启动和停止

### 完美安装（100%）

满足标准要求，并且：
- 所有高级功能正常
- 自定义配置完成
- 了解所有常用命令
- 可以独立解决问题

---

## 📞 需要帮助？

如果遇到问题：

1. **查看文档**: WINDOWS_INSTALLATION_GUIDE.md
2. **检查错误**: 查看控制台输出的错误信息
3. **验证环境**: 运行验证命令
4. **重新安装**: 重新执行失败的步骤

---

## 🎉 恭喜完成！

当所有检查项都勾选后，您就成功完成了 Windows 本地安装！

现在可以：
- ✅ 正常使用系统功能
- ✅ 进行开发和定制
- ✅ 部署到生产环境

**开始使用吧！** 🚀

访问: http://localhost:5000
