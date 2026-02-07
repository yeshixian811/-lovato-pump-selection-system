# 💻 洛瓦托智能水泵选型系统 - Windows 本地安装指南

## 📋 系统要求

### 最低配置
- **操作系统**: Windows 10 或 Windows 11
- **处理器**: Intel Core i3 或同等性能处理器
- **内存**: 4GB RAM
- **磁盘空间**: 10GB 可用空间
- **网络**: 稳定的互联网连接（用于下载安装包）

### 推荐配置
- **操作系统**: Windows 11 (64位)
- **处理器**: Intel Core i5 或更高
- **内存**: 8GB RAM 或更高
- **磁盘空间**: 20GB 或更高（推荐使用 SSD）
- **网络**: 宽带网络

---

## 🚀 快速安装（5步完成）

### 预计总时间: 15-20分钟

---

## 第一步：安装 Node.js (3分钟)

### 1.1 下载 Node.js

1. 打开浏览器，访问: **https://nodejs.org/**

2. 下载 **LTS 版本**（当前推荐: v24.x LTS）
   - 点击 "Download Node.js (LTS)" 按钮
   - 或选择 "Windows Installer (.msi) 64-bit"

3. 保存文件到桌面或下载文件夹

### 1.2 安装 Node.js

1. 找到下载的安装文件（如：`node-v24.13.0-x64.msi`）
2. **右键点击**安装文件，选择"以管理员身份运行"
3. 按照安装向导操作：
   - 点击 **Next** 接受许可协议
   - 选择安装路径（默认即可）
   - 点击 **Next** 继续安装
   - 点击 **Install** 开始安装
   - 等待安装完成
   - 点击 **Finish** 完成安装

### 1.3 验证安装

1. 按 `Win + R` 键，输入 `cmd`，按 Enter
2. 在命令提示符中输入：
   ```batch
   node --version
   ```
   应该显示: `v24.13.0` 或类似版本

3. 输入：
   ```batch
   npm --version
   ```
   应该显示: `10.x.x` 或类似版本

**如果命令不识别**:
- 关闭命令提示符，重新打开
- 或重启电脑

---

## 第二步：安装 pnpm (1分钟)

### 2.1 安装 pnpm

1. 在命令提示符中输入：
   ```batch
   npm install -g pnpm
   ```

2. 等待安装完成（可能需要1-2分钟）

### 2.2 验证安装

输入：
```batch
pnpm --version
```

应该显示: `9.0.0` 或更高版本

**如果安装失败**:
- 确保以管理员身份运行命令提示符
- 检查网络连接

---

## 第三步：安装 PostgreSQL (5分钟)

### 3.1 下载 PostgreSQL

1. 打开浏览器，访问: **https://www.postgresql.org/download/windows/**

2. 选择下载 PostgreSQL 14.x 或 15.x
   - 点击 "Download the installer" 链接
   - 选择 "Windows x86-64" 版本

3. 下载完整的安装程序（约200-300MB）

### 3.2 安装 PostgreSQL

1. 找到下载的安装文件（如：`postgresql-14.x-1-windows-x64.exe`）
2. **右键点击**，选择"以管理员身份运行"

3. 按照安装向导操作：

   **步骤 1 - 组件选择**:
   - 保留默认选择
   - 点击 **Next**

   **步骤 2 - 安装目录**:
   - 默认: `C:\Program Files\PostgreSQL\14`
   - 如果有J盘，可以改为: `J:\Program Files\PostgreSQL\14`
   - 点击 **Next**

   **步骤 3 - 数据目录**:
   - 默认: `C:\Program Files\PostgreSQL\14\data`
   - 如果有J盘，强烈推荐改为: `J:\postgresql\data`
   - 点击 **Next**

   **步骤 4 - 密码设置**:
   - 输入密码: **`postgres`** （请记住这个密码！）
   - 确认密码: **`postgres`**
   - 点击 **Next**

   **步骤 5 - 端口设置**:
   - 默认端口: `5432`
   - 保持不变
   - 点击 **Next**

   **步骤 6 - 区域设置**:
   - 选择: **C** 或默认区域
   - 点击 **Next**

   **步骤 7 - 准备安装**:
   - 检查配置
   - 点击 **Next** 开始安装

4. 等待安装完成（2-3分钟）

5. 安装完成：
   - 取消勾选 "Launch Stack Builder"（不需要）
   - 点击 **Finish**

### 3.3 将 PostgreSQL 添加到 PATH

**如果安装时没有自动添加到 PATH**:

1. 右键点击"此电脑" → "属性"
2. 点击"高级系统设置"
3. 点击"环境变量"
4. 在"系统变量"中找到 `Path`
5. 点击"编辑"
6. 点击"新建"，添加：
   ```
   C:\Program Files\PostgreSQL\14\bin
   ```
   （如果安装在其他位置，请修改为实际路径）

7. 点击"确定"保存
8. **重启命令提示符**

### 3.4 验证安装

在新的命令提示符中输入：

```batch
psql --version
```

应该显示: `psql (PostgreSQL) 14.x` 或类似版本

### 3.5 启动 PostgreSQL 服务

```batch
net start postgresql-x64-14
```

如果显示"服务已启动"或"服务已经在运行"，说明安装成功

---

## 第四步：获取项目代码 (2分钟)

### 方案 A: 使用 Git 克隆（推荐）

如果您已安装 Git：

1. 打开命令提示符，进入您想要安装项目的目录
   ```batch
   cd Desktop
   ```

2. 克隆项目（替换为实际的仓库地址）：
   ```batch
   git clone https://github.com/your-username/lovato-pump-selection.git
   ```

3. 进入项目目录：
   ```batch
   cd lovato-pump-selection
   ```

### 方案 B: 直接下载 ZIP

1. 访问项目仓库页面
2. 点击绿色的 **Code** 按钮
3. 选择 **Download ZIP**
4. 等待下载完成
5. 解压 ZIP 文件到您想要的位置（如桌面）
6. 进入解压后的文件夹

---

## 第五步：配置和启动 (5分钟)

### 5.1 安装项目依赖

1. 确保在项目根目录下（有 `package.json` 文件）
2. 在命令提示符中输入：
   ```batch
   pnpm install
   ```

3. 等待安装完成（3-5分钟）

### 5.2 创建 .env 配置文件

1. 在项目根目录下，找到 `.env.example` 文件
2. 复制该文件并重命名为 `.env`：
   ```batch
   copy .env.example .env
   ```

3. 编辑 `.env` 文件（右键 → 打开方式 → 记事本）：
   ```env
   # 数据库配置
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump

   # 数据目录配置
   # 如果使用默认 C 盘:
   POSTGRES_DATA_DIR=C:\Program Files\PostgreSQL\14\data
   POSTGRES_BACKUP_DIR=C:\Program Files\PostgreSQL\14\backups

   # 如果使用 J 盘:
   # POSTGRES_DATA_DIR=J:\postgresql\data
   # POSTGRES_BACKUP_DIR=J:\postgresql\backups

   # JWT 配置
   JWT_SECRET=lovato-secret-key-change-this-in-production-2026

   # 应用配置
   NODE_ENV=development
   PORT=5000

   # URL 配置
   NEXT_PUBLIC_APP_URL=http://localhost:5000
   ```

4. 保存文件

### 5.3 创建数据库

```batch
psql -U postgres -c "CREATE DATABASE lovato_pump;"
```

如果提示输入密码，输入: `postgres`

### 5.4 运行数据库迁移

```batch
psql -U postgres -d lovato_pump < migrations\001_add_membership_tables.sql
```

如果提示输入密码，输入: `postgres`

### 5.5 验证数据库

```batch
psql -U postgres -d lovato_pump -c "\dt"
```

应该显示所有创建的表：
```
              List of relations
 Schema |         Name          | Type  |  Owner
--------+-----------------------+-------+----------
 public | email_verifications   | table | postgres
 public | password_resets       | table | postgres
 public | selection_history     | table | postgres
 public | subscriptions         | table | postgres
 public | subscription_plans    | table | postgres
 public | usage_stats           | table | postgres
 public | users                 | table | postgres
```

### 5.6 启动开发服务器

```batch
pnpm run dev
```

等待几秒，看到类似输出：
```
   ▲ Next.js 16.1.1
   - Local:        http://localhost:5000
   - Ready in 2.5s
```

### 5.7 访问应用

打开浏览器，访问: **http://localhost:5000**

---

## ✅ 验证安装

检查以下项确保安装成功：

### 系统组件

- [ ] Node.js 已安装 (`node --version`)
- [ ] npm 已安装 (`npm --version`)
- [ ] pnpm 已安装 (`pnpm --version`)
- [ ] PostgreSQL 已安装 (`psql --version`)

### 服务状态

- [ ] PostgreSQL 服务运行中 (`net start postgresql-x64-14`)

### 数据库

- [ ] lovato_pump 数据库已创建
- [ ] 所有表已创建 (`psql -U postgres -d lovato_pump -c "\dt"`)

### 应用程序

- [ ] 依赖已安装 (node_modules 文件夹存在)
- [ ] .env 文件已配置
- [ ] 开发服务器已启动
- [ ] 可以访问 http://localhost:5000

### 功能测试

- [ ] 主页可以正常打开
- [ ] 页面显示正常
- [ ] 无控制台错误

---

## 🛠️ 常用命令

### 开发命令

```batch
# 启动开发服务器
pnpm run dev

# 停止服务器（在运行的服务器窗口中按 Ctrl+C）

# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start

# 类型检查
pnpm run ts-check

# 代码检查
pnpm run lint
```

### PostgreSQL 命令

```batch
# 启动服务
net start postgresql-x64-14

# 停止服务
net stop postgresql-x64-14

# 查看服务状态
sc query postgresql-x64-14

# 连接数据库
psql -U postgres -d lovato_pump

# 查看数据库列表
psql -U postgres -l

# 备份数据库
pg_dump -U postgres lovato_pump > backup.sql

# 恢复数据库
psql -U postgres -d lovato_pump < backup.sql

# 查看数据库表
psql -U postgres -d lovato_pump -c "\dt"

# 查看表结构
psql -U postgres -d lovato_pump -c "\d users"
```

### psql 交互式命令

在 `psql` 命令行中：

```sql
-- 查看所有数据库
\l

-- 连接到数据库
\c lovato_pump

-- 查看所有表
\dt

-- 查看表结构
\d users

-- 查看数据
SELECT * FROM users LIMIT 10;

-- 退出
\q
```

---

## 🔧 管理员权限

某些操作需要管理员权限：

### 以管理员身份打开命令提示符

1. 按 `Win + X` 键
2. 选择"终端管理员"或"命令提示符(管理员)"
3. 点击"是"确认

### 需要管理员权限的操作

- 启动/停止 PostgreSQL 服务
- 安装全局 npm 包
- 某些系统级配置

---

## ❓ 常见问题

### 问题 1: Node.js 安装后命令不识别

**症状**: `node --version` 显示"不是内部或外部命令"

**解决方案**:
1. 关闭所有命令提示符窗口
2. 重新打开命令提示符
3. 或重启电脑
4. 检查环境变量是否包含 Node.js 路径

---

### 问题 2: pnpm 安装失败

**症状**: `npm install -g pnpm` 失败

**解决方案**:
1. 确保以管理员身份运行命令提示符
2. 检查网络连接
3. 尝试清除 npm 缓存：
   ```batch
   npm cache clean --force
   npm install -g pnpm
   ```

---

### 问题 3: PostgreSQL 连接失败

**症状**: `psql` 提示"连接被拒绝"或"无法连接"

**解决方案**:
1. 检查服务是否运行：
   ```batch
   sc query postgresql-x64-14
   ```
2. 如果未运行，启动服务：
   ```batch
   net start postgresql-x64-14
   ```
3. 检查端口是否被占用：
   ```batch
   netstat -ano | findstr :5432
   ```

---

### 问题 4: pnpm install 失败

**症状**: `pnpm install` 过程中出错

**解决方案**:
1. 删除 node_modules 文件夹：
   ```batch
   rmdir /s /q node_modules
   ```
2. 清除 pnpm 缓存：
   ```batch
   pnpm store prune
   ```
3. 重新安装：
   ```batch
   pnpm install
   ```

---

### 问题 5: 端口 5000 被占用

**症状**: `pnpm run dev` 提示端口 5000 已被占用

**解决方案**:
1. 查看占用端口的进程：
   ```batch
   netstat -ano | findstr :5000
   ```
2. 结束进程（替换 PID 为实际进程ID）：
   ```batch
   taskkill /PID <PID> /F
   ```
3. 或使用其他端口（修改 .env）：
   ```env
   PORT=3000
   ```

---

### 问题 6: 数据库迁移失败

**症状**: 运行迁移脚本时出错

**解决方案**:
1. 确保数据库已创建：
   ```batch
   psql -U postgres -l
   ```
2. 检查密码是否正确（应该为 postgres）
3. 检查迁移文件路径是否正确
4. 查看错误详细信息

---

## 📁 项目结构

```
lovato-pump-selection/
├── src/                      # 源代码目录
│   ├── app/                 # Next.js App Router 页面
│   │   ├── api/            # API 路由
│   │   ├── (auth)/         # 认证相关页面
│   │   ├── (pump)/         # 水泵选型页面
│   │   └── page.tsx        # 首页
│   ├── components/         # React 组件
│   │   ├── ui/            # shadcn/ui 组件
│   │   ├── pump/          # 水泵相关组件
│   │   └── auth/          # 认证相关组件
│   ├── lib/              # 工具函数
│   └── storage/          # 数据存储
│       └── database/     # 数据库相关
├── public/               # 静态文件
├── migrations/           # 数据库迁移文件
│   └── 001_add_membership_tables.sql
├── .env                 # 环境配置
├── .env.example         # 环境配置示例
├── package.json         # 项目配置
├── next.config.ts       # Next.js 配置
├── tsconfig.json        # TypeScript 配置
├── install-local.bat    # 自动安装脚本
└── start.bat           # 快速启动脚本
```

---

## 🎯 下一步

### 1. 测试功能

安装完成后，测试以下功能：

- [ ] 打开主页 http://localhost:5000
- [ ] 测试水泵选型功能
- [ ] 测试用户注册
- [ ] 测试用户登录
- [ ] 测试会员功能

### 2. 查看文档

- **README.md**: 项目介绍和功能说明
- **APP_README.md**: 应用功能详细说明
- **MEMBERSHIP_GUIDE.md**: 会员功能使用指南

### 3. 自定义配置

- **.env**: 修改数据库配置、API密钥等
- **next.config.ts**: 自定义 Next.js 配置
- **tailwind.config.ts**: 自定义样式配置

### 4. 开发和定制

- 修改源代码实现自定义功能
- 添加新的水泵型号
- 调整界面样式
- 集成第三方服务

---

## 📞 获取帮助

如果遇到问题：

### 1. 检查日志

- 控制台输出：查看开发服务器的错误信息
- 浏览器控制台：按 F12 查看 JavaScript 错误

### 2. 验证环境

```batch
# 检查所有组件
node --version
pnpm --version
psql --version

# 检查服务
sc query postgresql-x64-14

# 检查数据库
psql -U postgres -d lovato_pump -c "\dt"
```

### 3. 查看文档

- **LOCAL_PC_INSTALLATION_GUIDE.md** - 完整安装指南
- **QUICK_START.md** - 快速开始指南
- **FILES_CHECKLIST.md** - 文件清单

### 4. 常见问题

参考本指南的"常见问题"部分

---

## 🎉 恭喜！

您已经成功在 Windows 本地电脑上安装了洛瓦托智能水泵选型系统！

### 您现在可以：

✅ 使用水泵智能选型功能
✅ 管理用户和会员
✅ 查询和分析数据
✅ 自定义和扩展功能
✅ 部署到生产环境

### 启动应用

每次使用时：

```batch
# 1. 确保服务运行
net start postgresql-x64-14

# 2. 进入项目目录
cd lovato-pump-selection

# 3. 启动应用
pnpm run dev
```

或直接运行：
```batch
start.bat
```

### 访问系统

打开浏览器: **http://localhost:5000**

---

**祝您使用愉快！** 🚀
