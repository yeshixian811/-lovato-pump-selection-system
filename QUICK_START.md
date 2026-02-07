# 🚀 快速开始 - 洛瓦托智能水泵选型系统

## 📋 一键安装

### Windows 用户

```batch
# 右键点击 install-local.bat，选择"以管理员身份运行"
install-local.bat

# 安装完成后，启动系统
start.bat
```

### Linux/Mac 用户

```bash
# 运行安装脚本
bash install-local.sh

# 启动系统
bash start.sh
```

---

## 📦 手动安装（推荐给高级用户）

### 1. 安装 Node.js

**Windows**:
- 下载: https://nodejs.org/
- 安装 LTS 版本

**Linux/Mac**:
```bash
# 使用 Homebrew (Mac)
brew install node

# 使用 apt (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. 安装 pnpm

```bash
npm install -g pnpm
```

### 3. 安装 PostgreSQL

**Windows**:
- 下载: https://www.postgresql.org/download/windows/
- 安装 PostgreSQL 14.x
- 密码: `postgres`

**Linux/Mac**:
```bash
# Mac
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get install -y postgresql postgresql-contrib
sudo service postgresql start
```

### 4. 获取项目代码

```bash
# 使用 Git
git clone https://github.com/your-username/lovato-pump-selection.git
cd lovato-pump-selection
```

### 5. 配置数据库

```bash
# Windows
psql -U postgres -c "CREATE DATABASE lovato_pump;"
psql -U postgres -d lovato_pump < migrations/001_add_membership_tables.sql

# Linux/Mac
sudo -u postgres createdb lovato_pump
sudo -u postgres psql -d lovato_pump < migrations/001_add_membership_tables.sql
```

### 6. 安装依赖

```bash
pnpm install
```

### 7. 配置环境变量

```bash
# 复制配置文件
cp .env.example .env

# 编辑 .env 文件（可选）
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump
```

### 8. 启动应用

```bash
pnpm run dev
```

---

## 🌐 访问应用

安装完成后，打开浏览器访问:

**http://localhost:5000**

---

## ✅ 验证安装

检查以下项确保安装成功:

```bash
# 1. 检查 Node.js
node --version

# 2. 检查 pnpm
pnpm --version

# 3. 检查 PostgreSQL
psql --version

# 4. 检查数据库
psql -U postgres -d lovato_pump -c "\dt"

# 5. 访问应用
# 打开浏览器访问 http://localhost:5000
```

---

## 🛠️ 常用命令

### 开发

```bash
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

### 数据库

```bash
# 连接数据库
psql -U postgres -d lovato_pump

# 查看数据库列表
psql -U postgres -l

# 备份数据库
pg_dump -U postgres lovato_pump > backup.sql

# 恢复数据库
psql -U postgres -d lovato_pump < backup.sql
```

---

## 📚 文档

- **LOCAL_PC_INSTALLATION_GUIDE.md** - 详细安装指南
- **README.md** - 项目介绍和功能说明
- **APP_README.md** - 应用功能详细说明
- **MEMBERSHIP_GUIDE.md** - 会员功能指南

---

## ❓ 常见问题

### 问题 1: 端口 5000 被占用

**解决方案**:

**Windows**:
```batch
netstat -ano | findstr :5000
taskkill /PID <进程ID> /F
```

**Linux/Mac**:
```bash
lsof -i :5000
kill -9 <PID>
```

### 问题 2: PostgreSQL 连接失败

**解决方案**:

```bash
# 检查服务是否运行
# Windows
sc query postgresql-x64-14

# Mac
brew services list

# Linux
sudo service postgresql status

# 启动服务
# Windows
net start postgresql-x64-14

# Mac
brew services start postgresql@14

# Linux
sudo service postgresql start
```

### 问题 3: 依赖安装失败

**解决方案**:

```bash
# 清除缓存
pnpm store prune

# 重新安装
rm -rf node_modules
pnpm install
```

---

## 🎯 系统要求

- **操作系统**: Windows 10/11, macOS 11+, Ubuntu 20.04+
- **Node.js**: v24.x (LTS)
- **pnpm**: v9.x
- **PostgreSQL**: v14.x 或 v15.x
- **内存**: 最低 4GB (推荐 8GB+)
- **磁盘空间**: 最低 10GB (推荐 20GB+)

---

## 📞 获取帮助

如果遇到问题:

1. 查看 **LOCAL_PC_INSTALLATION_GUIDE.md** 详细文档
2. 检查控制台输出和错误日志
3. 确保所有依赖都已正确安装
4. 验证数据库配置和连接

---

## ✨ 快速启动检查清单

安装完成后，确保以下项:

- [ ] Node.js 已安装 (v24.x)
- [ ] pnpm 已安装 (v9.x)
- [ ] PostgreSQL 已安装并运行
- [ ] lovato_pump 数据库已创建
- [ ] 所有表已创建
- [ ] 依赖已安装
- [ ] .env 文件已配置
- [ ] 开发服务器已启动
- [ ] 可以访问 http://localhost:5000
- [ ] 水泵选型功能正常
- [ ] 用户注册/登录正常

---

**🎉 恭喜！您已经成功安装并启动了洛瓦托智能水泵选型系统！**

现在可以开始使用系统的各项功能了！
