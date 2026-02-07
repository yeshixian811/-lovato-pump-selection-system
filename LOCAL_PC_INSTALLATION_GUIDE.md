# 💻 洛瓦托智能水泵选型系统 - 本地电脑安装指南

## 📋 系统要求

### Windows 用户
- **操作系统**: Windows 10/11 或 Windows Server 2016/2019/2022
- **内存**: 最低 4GB，推荐 8GB+
- **磁盘空间**: 最低 10GB（推荐 20GB+）
- **处理器**: 支持 64 位系统

### macOS 用户
- **操作系统**: macOS 11 (Big Sur) 或更高版本
- **内存**: 最低 4GB，推荐 8GB+
- **磁盘空间**: 最低 10GB（推荐 20GB+）

### Linux 用户
- **操作系统**: Ubuntu 20.04/22.04/24.04 LTS 或其他主流发行版
- **内存**: 最低 4GB，推荐 8GB+
- **磁盘空间**: 最低 10GB（推荐 20GB+）

---

## 🚀 快速开始（5步安装）

### Windows 用户 - 快速安装

#### 步骤 1: 安装 Node.js (2分钟)

1. **下载 Node.js**:
   - 访问: https://nodejs.org/
   - 下载 **LTS 版本** (当前: v24.x)
   - 选择 Windows Installer (.msi)

2. **安装**:
   - 双击下载的安装文件
   - 点击 "Next" 接受默认设置
   - 完成安装

3. **验证安装**:
   ```batch
   # 打开命令提示符（CMD）或 PowerShell
   node --version
   npm --version
   ```

#### 步骤 2: 安装 pnpm (1分钟)

```batch
# 打开 PowerShell（推荐管理员权限）
npm install -g pnpm

# 验证安装
pnpm --version
```

#### 步骤 3: 安装 PostgreSQL (5分钟)

**选项 A: 使用官方安装程序** (推荐)

1. **下载 PostgreSQL**:
   - 访问: https://www.postgresql.org/download/windows/
   - 下载 PostgreSQL 14.x 或 15.x
   - 选择 Windows x86-64

2. **安装**:
   - 双击下载的安装文件
   - 安装设置:
     - 密码: `postgres` (记住这个密码)
     - 端口: `5432` (默认)
     - 数据目录: `C:\Program Files\PostgreSQL\14\data` (默认)
     - 或者选择: `J:\postgresql\data` (如果您有J盘)

3. **安装完成后，添加到 PATH**:
   - 打开"环境变量"设置
   - 在"系统变量"中找到 `Path`
   - 添加: `C:\Program Files\PostgreSQL\14\bin`

**选项 B: 使用 Chocolatey** (更简单)

```batch
# 如果您有 Chocolatey
choco install postgresql

# 验证安装
psql --version
```

#### 步骤 4: 获取项目代码 (2分钟)

**选项 A: 使用 Git 克隆** (推荐)

```batch
# 如果您有 Git
git clone https://github.com/your-username/lovato-pump-selection.git
cd lovato-pump-selection
```

**选项 B: 直接下载 ZIP**

1. 访问项目仓库
2. 点击 "Code" → "Download ZIP"
3. 解压到您想要的目录
4. 打开解压后的文件夹

#### 步骤 5: 安装依赖和启动 (3分钟)

```batch
# 在项目根目录下
pnpm install

# 创建 .env 文件（复制示例文件）
copy .env.example .env

# 编辑 .env 文件，确认数据库配置
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump

# 创建数据库
psql -U postgres -c "CREATE DATABASE lovato_pump;"

# 运行数据库迁移
psql -U postgres -d lovato_pump < migrations/001_add_membership_tables.sql

# 启动开发服务器
pnpm run dev
```

#### 完成！

打开浏览器访问: **http://localhost:5000**

---

### macOS 用户 - 快速安装

#### 步骤 1: 安装 Homebrew (2分钟)

```bash
# 打开终端，执行以下命令
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 验证安装
brew --version
```

#### 步骤 2: 安装 Node.js (3分钟)

```bash
# 使用 Homebrew 安装
brew install node

# 验证安装
node --version
pnpm --version
```

#### 步骤 3: 安装 pnpm (1分钟)

```bash
# 使用 npm 安装
npm install -g pnpm

# 验证安装
pnpm --version
```

#### 步骤 4: 安装 PostgreSQL (3分钟)

```bash
# 使用 Homebrew 安装
brew install postgresql@14

# 启动 PostgreSQL 服务
brew services start postgresql@14

# 创建数据库
createdb lovato_pump

# 运行迁移
psql -d lovato_pump < migrations/001_add_membership_tables.sql
```

#### 步骤 5: 获取项目并启动 (3分钟)

```bash
# 克隆项目
git clone https://github.com/your-username/lovato-pump-selection.git
cd lovato-pump-selection

# 安装依赖
pnpm install

# 创建 .env 文件
cp .env.example .env

# 启动开发服务器
pnpm run dev
```

#### 完成！

打开浏览器访问: **http://localhost:5000`

---

### Linux 用户 - 快速安装

#### 步骤 1: 更新系统 (1分钟)

```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get upgrade -y
```

#### 步骤 2: 安装 Node.js (2分钟)

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
```

#### 步骤 3: 安装 pnpm (1分钟)

```bash
# 使用 npm 安装
sudo npm install -g pnpm

# 验证安装
pnpm --version
```

#### 步骤 4: 安装 PostgreSQL (3分钟)

```bash
# Ubuntu/Debian
sudo apt-get install -y postgresql postgresql-contrib

# 启动服务
sudo service postgresql start

# 设置密码并创建数据库
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres createdb lovato_pump

# 运行迁移
sudo -u postgres psql -d lovato_pump < migrations/001_add_membership_tables.sql
```

#### 步骤 5: 获取项目并启动 (3分钟)

```bash
# 克隆项目
git clone https://github.com/your-username/lovato-pump-selection.git
cd lovato-pump-selection

# 安装依赖
pnpm install

# 创建 .env 文件
cp .env.example .env

# 启动开发服务器
pnpm run dev
```

#### 完成！

打开浏览器访问: **http://localhost:5000`

---

## 🔧 详细配置

### 数据库配置

#### Windows

编辑项目根目录下的 `.env` 文件:

```env
# 数据库配置
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump

# 数据目录配置
POSTGRES_DATA_DIR=C:\Program Files\PostgreSQL\14\data
POSTGRES_BACKUP_DIR=C:\Program Files\PostgreSQL\14\backups

# 如果使用 J 盘
# POSTGRES_DATA_DIR=J:\postgresql\data
# POSTGRES_BACKUP_DIR=J:\postgresql\backups
```

#### macOS/Linux

编辑 `.env` 文件:

```env
# 数据库配置
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump

# 数据目录配置
POSTGRES_DATA_DIR=/var/lib/postgresql/14/main
POSTGRES_BACKUP_DIR=/var/lib/postgresql/backups
```

### 验证数据库连接

```bash
# Windows
psql -U postgres -d lovato_pump -c "SELECT version();"

# macOS/Linux
psql -d lovato_pump -c "SELECT version();"
```

---

## 🛠️ 常用命令

### 项目管理

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start

# 类型检查
pnpm run ts-check

# 代码检查
pnpm run lint
```

### 数据库管理

```bash
# Windows
# 连接数据库
psql -U postgres -d lovato_pump

# 查看数据库列表
psql -U postgres -l

# 备份数据库
pg_dump -U postgres lovato_pump > backup.sql

# 恢复数据库
psql -U postgres lovato_pump < backup.sql

# macOS/Linux
# 连接数据库
psql -d lovato_pump

# 查看数据库列表
psql -l

# 备份数据库
pg_dump lovato_pump > backup.sql

# 恢复数据库
psql -d lovato_pump < backup.sql
```

### PostgreSQL 服务管理

#### Windows

```batch
# 启动服务
net start postgresql-x64-14

# 停止服务
net stop postgresql-x64-14

# 查看服务状态
sc query postgresql-x64-14
```

#### macOS

```bash
# 启动服务
brew services start postgresql@14

# 停止服务
brew services stop postgresql@14

# 查看服务状态
brew services list
```

#### Linux

```bash
# 启动服务
sudo service postgresql start

# 停止服务
sudo service postgresql stop

# 查看服务状态
sudo service postgresql status
```

---

## ❓ 常见问题

### 问题 1: Node.js 安装失败

**Windows**:
- 确保下载了正确的版本（LTS）
- 以管理员身份运行安装程序
- 检查杀毒软件是否阻止安装

**macOS/Linux**:
- 确保网络连接正常
- 检查是否有权限问题
- 使用 sudo 命令

### 问题 2: PostgreSQL 连接失败

**错误**: `connection refused`

**解决方案**:
```bash
# 检查服务是否运行
# Windows
sc query postgresql-x64-14

# macOS/Linux
brew services list  # macOS
sudo service postgresql status  # Linux

# 检查端口是否被占用
# Windows
netstat -ano | findstr :5432

# macOS/Linux
lsof -i :5432
```

### 问题 3: pnpm 命令不可用

**Windows**:
```batch
# 重新安装 pnpm
npm install -g pnpm

# 刷新环境变量
refreshenv

# 或重启命令提示符
```

**macOS/Linux**:
```bash
# 重新安装 pnpm
sudo npm install -g pnpm

# 检查 PATH
echo $PATH

# 确保 npm 全局路径在 PATH 中
export PATH="$PATH:$(npm config get prefix)/bin"
```

### 问题 4: 端口 5000 被占用

**Windows**:
```batch
# 查看占用端口的进程
netstat -ano | findstr :5000

# 结束进程（替换 PID）
taskkill /PID <进程ID> /F
```

**macOS/Linux**:
```bash
# 查看占用端口的进程
lsof -i :5000

# 结束进程（替换 PID）
kill -9 <PID>
```

---

## 📦 项目结构

```
lovato-pump-selection/
├── src/                    # 源代码
│   ├── app/               # Next.js App Router
│   ├── components/        # React 组件
│   └── lib/              # 工具函数
├── public/               # 静态文件
├── migrations/           # 数据库迁移
├── .env                  # 环境配置
├── .env.example          # 环境配置示例
├── package.json          # 项目配置
├── next.config.ts        # Next.js 配置
└── tsconfig.json         # TypeScript 配置
```

---

## 🎯 下一步

### 1. 测试功能

安装完成后，测试以下功能：

- [ ] 打开主页 http://localhost:5000
- [ ] 测试水泵选型功能
- [ ] 测试用户注册/登录
- [ ] 测试数据查询和显示

### 2. 查看文档

- **README.md**: 项目介绍和功能说明
- **APP_README.md**: 应用功能详细说明
- **MEMBERSHIP_GUIDE.md**: 会员功能指南

### 3. 自定义配置

- **.env**: 修改数据库配置、API密钥等
- **next.config.ts**: 自定义 Next.js 配置
- **tailwind.config.ts**: 自定义样式配置

---

## 📞 获取帮助

如果遇到问题：

1. **查看日志**: 检查控制台输出
2. **检查环境**: 确保所有依赖都已安装
3. **查看文档**: 参考项目中的文档
4. **GitHub Issues**: 搜索或提交问题

---

## ✅ 安装验证清单

安装完成后，验证以下项：

### 系统环境
- [ ] Node.js 已安装 (v24.x)
- [ ] pnpm 已安装 (v9.x)
- [ ] PostgreSQL 已安装 (v14/15)
- [ ] Git 已安装（用于克隆项目）

### 数据库
- [ ] PostgreSQL 服务运行正常
- [ ] lovato_pump 数据库已创建
- [ ] 所有表已创建
- [ ] 可以使用 psql 连接

### 应用程序
- [ ] 依赖已安装 (node_modules)
- [ ] .env 文件已配置
- [ ] 开发服务器已启动
- [ ] 可以访问 http://localhost:5000

### 功能测试
- [ ] 主页可以正常访问
- [ ] 水泵选型功能正常
- [ ] 用户注册/登录正常
- [ ] 数据可以正常查询

---

**恭喜！您已经在本地电脑上成功安装了洛瓦托智能水泵选型系统！** 🎉

现在您可以：
1. 使用和测试系统功能
2. 修改代码进行定制开发
3. 部署到生产环境
