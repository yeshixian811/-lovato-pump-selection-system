# 🚀 环境快速修复指南

## 📊 当前状态

```
✅ Node.js: v24.13.0
✅ pnpm: 9.0.0
✅ Web服务: 运行中 (端口5000)
✅ 磁盘空间: 已使用 53% (1.6T 可用)
✅ 内存: 已使用 40%

❌ PostgreSQL: 未安装
⚠️  数据库连接: 不可连接
⚠️  .env配置: 使用Windows路径
```

---

## 🔧 快速修复（5分钟）

### 选项 1: 自动安装（推荐）

在当前 Linux 环境中自动安装和配置 PostgreSQL:

```bash
# 运行自动化安装脚本
sudo bash scripts/install-postgresql-linux.sh
```

这个脚本会自动完成:
- ✅ 安装 PostgreSQL
- ✅ 配置用户和密码
- ✅ 创建数据库
- ✅ 运行迁移脚本
- ✅ 更新 .env 配置
- ✅ 验证安装

---

### 选项 2: 手动安装

如果您想手动控制每个步骤:

#### 步骤 1: 安装 PostgreSQL

```bash
# 更新包管理器
sudo apt-get update

# 安装 PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# 启动服务
sudo service postgresql start
```

#### 步骤 2: 配置数据库

```bash
# 设置 postgres 用户密码
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

# 创建数据库
sudo -u postgres createdb lovato_pump
```

#### 步骤 3: 运行迁移

```bash
# 创建数据库表
sudo -u postgres psql -d lovato_pump < migrations/001_add_membership_tables.sql
```

#### 步骤 4: 更新配置

```bash
# 备份原配置
cp .env .env.backup

# 更新路径配置
sed -i 's|^POSTGRES_DATA_DIR=.*|POSTGRES_DATA_DIR=/var/lib/postgresql/14/main|' .env
sed -i 's|^POSTGRES_BACKUP_DIR=.*|POSTGRES_BACKUP_DIR=/var/lib/postgresql/backups|' .env
```

#### 步骤 5: 验证安装

```bash
# 测试数据库连接
sudo -u postgres psql -d lovato_pump -c "SELECT version();"

# 查看数据库表
sudo -u postgres psql -d lovato_pump -c "\dt"

# 查看快速检查
bash scripts/quick-check.sh
```

---

## 🎯 环境说明

### 当前环境

**类型**: Linux 沙箱环境
**系统**: Ubuntu 24.04.3 LTS
**用途**: 开发和测试

### 特点

✅ **优点**:
- Node.js 和 pnpm 已安装
- Web 服务运行正常
- 存储空间充足 (1.6T)
- 内存充足 (4.8G 可用)

⚠️ **限制**:
- PostgreSQL 未安装
- .env 配置使用 Windows 路径
- 数据不持久化 (重启会丢失)

---

## 📝 配置说明

### .env 配置

#### 当前配置 (Windows):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump
POSTGRES_DATA_DIR=J:/postgresql/data
POSTGRES_BACKUP_DIR=J:/postgresql/backups
```

#### 推荐配置 (Linux):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump
POSTGRES_DATA_DIR=/var/lib/postgresql/14/main
POSTGRES_BACKUP_DIR=/var/lib/postgresql/backups
```

**注意**: `DATABASE_URL` 配置在两个环境下都有效，主要差异在于数据目录路径。

---

## 🔍 验证检查

安装完成后，验证以下项:

```bash
# 1. 检查 PostgreSQL 版本
psql --version

# 2. 检查服务状态
sudo service postgresql status

# 3. 测试数据库连接
sudo -u postgres psql -d lovato_pump -c "SELECT 1;"

# 4. 查看数据库列表
sudo -u postgres psql -l

# 5. 查看表列表
sudo -u postgres psql -d lovato_pump -c "\dt"

# 6. 运行快速检查
bash scripts/quick-check.sh
```

---

## 🛠️ 常用命令

### PostgreSQL 管理

```bash
# 启动服务
sudo service postgresql start

# 停止服务
sudo service postgresql stop

# 重启服务
sudo service postgresql restart

# 连接数据库
sudo -u postgres psql -d lovato_pump

# 以 postgres 用户连接
psql -U postgres -d lovato_pump

# 备份数据库
sudo -u postgres pg_dump lovato_pump > backup.sql

# 恢复数据库
sudo -u postgres psql -d lovato_pump < backup.sql

# 查看日志
tail -f /var/log/postgresql/postgresql-14-main.log
```

### 数据库操作

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

## ❓ 常见问题

### 问题 1: 无法连接数据库

**症状**:
```
psql: error: could not connect to server
```

**解决**:
```bash
# 检查服务状态
sudo service postgresql status

# 如果服务未运行
sudo service postgresql start

# 检查端口
sudo netstat -tlnp | grep 5432
```

### 问题 2: 权限错误

**症状**:
```
permission denied
```

**解决**:
```bash
# 使用 sudo
sudo -u postgres psql

# 或切换到 postgres 用户
sudo su - postgres
psql
```

### 问题 3: 数据库不存在

**症状**:
```
database "lovato_pump" does not exist
```

**解决**:
```bash
# 创建数据库
sudo -u postgres createdb lovato_pump
```

---

## 📊 环境对比

### 当前 Linux 沙箱环境

| 项目 | 状态 | 说明 |
|------|------|------|
| 操作系统 | ✅ Ubuntu 24.04 | 开发环境 |
| Node.js | ✅ v24.13.0 | 最新版本 |
| pnpm | ✅ 9.0.0 | 符合要求 |
| PostgreSQL | ❌ 未安装 | 需要安装 |
| 存储 | ✅ 1.6T 可用 | 充足 |
| Web服务 | ✅ 运行中 | 正常 |

### Windows 服务器环境（目标）

| 项目 | 状态 | 说明 |
|------|------|------|
| 操作系统 | ⏳ 待安装 | Windows Server |
| Node.js | ⏳ 待安装 | v24.13.0 |
| pnpm | ⏳ 待安装 | 9.0.0 |
| PostgreSQL | ⏳ 待安装 | 14+ |
| 存储 | ⏳ 待配置 | J 盘 |
| Web服务 | ⏳ 待启动 | 端口 5000 |

---

## 🎯 下一步

### 现在可以做:

1. **立即修复当前环境**:
   ```bash
   sudo bash scripts/install-postgresql-linux.sh
   ```

2. **查看完整报告**:
   ```bash
   cat SYSTEM_ENVIRONMENT_CHECK_REPORT.md
   ```

3. **测试应用程序**:
   ```bash
   # 安装完成后，应用会自动连接数据库
   # 访问 http://localhost:5000 测试
   ```

### 后续要做:

1. **开发/测试功能**:
   - 测试用户注册/登录
   - 测试数据查询
   - 测试会员功能

2. **准备生产部署**:
   - 查看本地服务器部署文档
   - 准备 Windows 服务器
   - 使用提供的 Windows 脚本

---

## 📞 需要帮助?

- 查看完整报告: `SYSTEM_ENVIRONMENT_CHECK_REPORT.md`
- 查看部署指南: `LOCAL_SERVER_DEPLOYMENT.md`
- 运行快速检查: `bash scripts/quick-check.sh`

---

**现在就运行安装脚本，5分钟后即可完成环境配置！** 🚀

```bash
sudo bash scripts/install-postgresql-linux.sh
```
