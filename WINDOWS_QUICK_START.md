# 🚀 Windows 快速安装 - 洛瓦托智能水泵选型系统

## ⚡ 3分钟快速安装（使用自动化脚本）

### 方案 A: 一键安装（推荐）

```batch
# 步骤 1: 右键点击 install-local.bat，选择"以管理员身份运行"
install-local.bat

# 步骤 2: 安装完成后，启动系统
start.bat

# 步骤 3: 打开浏览器
# http://localhost:5000
```

---

## 📦 手动安装（15分钟）

### 第1步: 安装 Node.js (3分钟)

1. 下载: https://nodejs.org/ (选择 LTS 版本)
2. 双击安装，一路 Next
3. 验证: 打开命令提示符，输入 `node --version`

### 第2步: 安装 pnpm (1分钟)

```batch
npm install -g pnpm
```

### 第3步: 安装 PostgreSQL (5分钟)

1. 下载: https://www.postgresql.org/download/windows/
2. 安装时设置密码: `postgres`
3. 验证: `psql --version`

### 第4步: 配置数据库 (2分钟)

```batch
# 创建数据库
psql -U postgres -c "CREATE DATABASE lovato_pump;"

# 运行迁移
psql -U postgres -d lovato_pump < migrations\001_add_membership_tables.sql
```

### 第5步: 安装依赖和启动 (4分钟)

```batch
# 安装依赖
pnpm install

# 创建配置文件
copy .env.example .env

# 启动应用
pnpm run dev
```

---

## ✅ 快速验证

```batch
# 1. 检查 Node.js
node --version

# 2. 检查 pnpm
pnpm --version

# 3. 检查 PostgreSQL
psql --version

# 4. 检查数据库
psql -U postgres -d lovato_pump -c "\dt"

# 5. 访问应用
# 打开浏览器: http://localhost:5000
```

---

## 🛠️ 常用命令

### 启动应用
```batch
pnpm run dev
# 或
start.bat
```

### 数据库管理
```batch
# 启动 PostgreSQL
net start postgresql-x64-14

# 连接数据库
psql -U postgres -d lovato_pump

# 查看数据库
psql -U postgres -l
```

---

## ❓ 遇到问题？

### 端口被占用
```batch
# 查看占用进程
netstat -ano | findstr :5000

# 结束进程
taskkill /PID <PID> /F
```

### PostgreSQL 连接失败
```batch
# 启动服务
net start postgresql-x64-14

# 查看服务状态
sc query postgresql-x64-14
```

### 依赖安装失败
```batch
# 清除缓存重新安装
rmdir /s /q node_modules
pnpm store prune
pnpm install
```

---

## 📚 详细文档

- **WINDOWS_INSTALLATION_GUIDE.md** - 完整的 Windows 安装指南
- **QUICK_START.md** - 快速开始指南

---

## 🎯 系统要求

- Windows 10 或 Windows 11
- 4GB 内存（推荐 8GB）
- 10GB 磁盘空间
- 稳定网络连接

---

## ✨ 检查清单

安装后确认以下项：

- [ ] Node.js 已安装 (v24.x)
- [ ] pnpm 已安装 (v9.x)
- [ ] PostgreSQL 已安装 (v14/15)
- [ ] lovato_pump 数据库已创建
- [ ] 所有表已创建
- [ ] 依赖已安装
- [ ] 可以访问 http://localhost:5000

---

**准备好开始了吗？选择一个方案安装吧！** 🚀

推荐使用: **install-local.bat** 一键安装
