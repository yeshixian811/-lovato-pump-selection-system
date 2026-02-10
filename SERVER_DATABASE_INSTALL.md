# 🗄️ 服务器 PostgreSQL 数据库安装指南

## 📋 服务器信息

- **服务器地址**：122.51.22.101
- **操作系统**：Ubuntu（推测）
- **SSH 用户**：ubuntu
- **SSH 密码**：yezi100243..
- **数据库名称**：lovato_pump

---

## 🚀 第 1 步：连接到服务器

### 使用 SSH 连接

```bash
ssh ubuntu@122.51.22.101
```

**输入密码：** `yezi100243..`

---

## 📦 第 2 步：更新系统包

### 更新包列表

```bash
sudo apt update
```

### 升级已安装的包（可选）

```bash
sudo apt upgrade -y
```

---

## 🗄️ 第 3 步：安装 PostgreSQL

### 安装 PostgreSQL 14

```bash
sudo apt install postgresql-14 postgresql-contrib-14 -y
```

**安装内容包括：**
- PostgreSQL 14 数据库服务器
- 附加模块和工具

---

## 🔐 第 4 步：启动 PostgreSQL 服务

### 启动 PostgreSQL 服务

```bash
sudo systemctl start postgresql
```

### 设置开机自启动

```bash
sudo systemctl enable postgresql
```

### 检查服务状态

```bash
sudo systemctl status postgresql
```

**预期输出：**
```
● postgresql.service - PostgreSQL RDBMS
   Loaded: loaded (/lib/systemd/system/postgresql.service; enabled; vendor preset: enabled)
   Active: active (exited) since ...
```

---

## 👤 第 5 步：设置 PostgreSQL 用户密码

### 切换到 postgres 用户

```bash
sudo -u postgres psql
```

### 修改 postgres 用户密码

```sql
ALTER USER postgres WITH PASSWORD 'yezi100243..';
```

### 退出 psql

```sql
\q
```

---

## 🗄️ 第 6 步：创建数据库和用户

### 方法 1：使用 psql 命令

#### 切换到 postgres 用户

```bash
sudo -u postgres psql
```

#### 创建数据库用户

```sql
-- 创建数据库用户
CREATE USER lovato_user WITH PASSWORD 'lovato_db_password_2024';
```

#### 创建数据库

```sql
-- 创建数据库
CREATE DATABASE lovato_pump OWNER lovato_user;
```

#### 授予权限

```sql
-- 授予所有权限
GRANT ALL PRIVILEGES ON DATABASE lovato_pump TO lovato_user;
```

#### 退出 psql

```sql
\q
```

---

### 方法 2：使用 createdb 命令

#### 创建用户

```bash
sudo -u postgres createuser --interactive
```

**按照提示输入：**
```
Enter name of role to add: lovato_user
Shall the new role be a superuser? (y/n) n
Shall the new role be allowed to create databases? (y/n) y
Shall the new role be allowed to create more new roles? (y/n) n
Password: lovato_db_password_2024
```

#### 创建数据库

```bash
sudo -u postgres createdb -O lovato_user lovato_pump
```

---

## 🌐 第 7 步：配置 PostgreSQL 远程访问

### 1. 编辑 PostgreSQL 配置文件

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

### 2. 修改监听地址

找到以下行：

```conf
#listen_addresses = 'localhost'
```

修改为：

```conf
listen_addresses = '*'
```

**保存并退出：** `Ctrl + O` → `Enter` → `Ctrl + X`

### 3. 编辑 pg_hba.conf 配置文件

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

### 4. 添加客户端认证规则

在文件末尾添加以下内容：

```conf
# 允许 IP 地址 122.51.22.101 访问
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             122.51.22.101/32         scram-sha-256
host    all             all             0.0.0.0/0               scram-sha-256
```

**说明：**
- `host`：使用 TCP/IP 连接
- 第一个 `all`：允许所有数据库
- 第二个 `all`：允许所有用户
- `127.0.0.1/32`：本地连接
- `122.51.22.101/32`：服务器自身连接
- `0.0.0.0/0`：允许所有 IP 连接（生产环境建议限制具体 IP）
- `scram-sha-256`：使用 scram-sha-256 密码加密

**保存并退出：** `Ctrl + O` → `Enter` → `Ctrl + X`

### 5. 重启 PostgreSQL 服务

```bash
sudo systemctl restart postgresql
```

---

## 🔥 第 8 步：配置防火墙

### 方法 1：使用 UFW（推荐）

```bash
# 允许 PostgreSQL 端口
sudo ufw allow 5432/tcp

# 查看防火墙状态
sudo ufw status
```

### 方法 2：使用 iptables

```bash
# 添加规则允许 5432 端口
sudo iptables -A INPUT -p tcp --dport 5432 -j ACCEPT

# 保存规则
sudo iptables-save > /etc/iptables/rules.v4
```

---

## 🧪 第 9 步：测试数据库连接

### 本地测试

```bash
sudo -u postgres psql -U lovato_user -d lovato_pump
```

**预期输出：**
```
psql (14.x)
Type "help" for help.

lovato_pump=#
```

### 远程测试（从其他机器）

```bash
psql -h 122.51.22.101 -U lovato_user -d lovato_pump
```

**输入密码：** `lovato_db_password_2024`

---

## 📋 第 10 步：获取数据库连接字符串

### 格式

```
postgresql://用户名:密码@主机:端口/数据库名
```

### 连接字符串

```
postgresql://lovato_user:lovato_db_password_2024@122.51.22.101:5432/lovato_pump
```

### URL 编码的连接字符串

如果密码包含特殊字符，需要进行 URL 编码：

```
postgresql://lovato_user:lovato_db_password_2024@122.51.22.101:5432/lovato_pump
```

---

## 🔄 第 11 步：初始化数据库表

### 方法 1：使用 Drizzle ORM（推荐）

#### 从项目根目录运行

```bash
# 生成迁移文件
pnpm drizzle-kit generate:pg

# 执行迁移
pnpm drizzle-kit push:pg

# 或者使用迁移文件
pnpm drizzle-kit migrate
```

### 方法 2：手动执行 SQL

```bash
sudo -u postgres psql -U lovato_user -d lovato_pump -f path/to/schema.sql
```

---

## 🌐 第 12 步：在 Vercel 中配置环境变量

### Vercel Dashboard 配置

1. 访问 https://vercel.com/dashboard
2. 选择项目：`luowato-pump-selection-system`
3. 点击 **Settings** → **Environment Variables**
4. 添加或更新 `DATABASE_URL`：

```
Name: DATABASE_URL
Value: postgresql://lovato_user:lovato_db_password_2024@122.51.22.101:5432/lovato_pump
Environment: All
```

5. 点击 **Save**
6. 点击 **Redeploy** 重新部署

---

## 🔍 第 13 步：验证数据库配置

### 检查数据库连接

```bash
sudo -u postgres psql -U lovato_user -d lovato_pump -c "SELECT version();"
```

### 检查数据库列表

```bash
sudo -u postgres psql -U lovato_user -d lovato_pump -c "\l"
```

### 检查用户列表

```bash
sudo -u postgres psql -U lovato_user -d lovato_pump -c "\du"
```

---

## 🔧 常见问题

### 问题 1：无法连接到数据库

**错误信息：**
```
connection refused
```

**解决方案：**
```bash
# 检查 PostgreSQL 服务状态
sudo systemctl status postgresql

# 重启服务
sudo systemctl restart postgresql

# 检查端口是否开放
sudo netstat -tlnp | grep 5432
```

### 问题 2：认证失败

**错误信息：**
```
FATAL: password authentication failed for user "lovato_user"
```

**解决方案：**
```bash
# 重置密码
sudo -u postgres psql
ALTER USER lovato_user WITH PASSWORD 'new_password';
\q
```

### 问题 3：防火墙阻止连接

**解决方案：**
```bash
# 允许 5432 端口
sudo ufw allow 5432/tcp

# 重启防火墙
sudo ufw reload
```

---

## 📊 安装总结

### 已完成的配置

| 项目 | 状态 |
|------|------|
| **PostgreSQL 安装** | ✅ 完成 |
| **服务启动** | ✅ 完成 |
| **用户创建** | ✅ 完成 |
| **数据库创建** | ✅ 完成 |
| **远程访问配置** | ✅ 完成 |
| **防火墙配置** | ✅ 完成 |
| **连接字符串** | ✅ 已生成 |
| **Vercel 环境变量** | ⏠️ 待配置 |

### 数据库信息

| 项目 | 值 |
|------|-----|
| **主机** | 122.51.22.101 |
| **端口** | 5432 |
| **数据库名** | lovato_pump |
| **用户名** | lovato_user |
| **密码** | lovato_db_password_2024 |
| **连接字符串** | postgresql://lovato_user:lovato_db_password_2024@122.51.22.101:5432/lovato_pump |

---

## 🎯 下一步

### 1. 在 Vercel 中配置环境变量

1. 访问 Vercel Dashboard
2. 添加 `DATABASE_URL` 环境变量
3. 重新部署

### 2. 初始化数据库表

```bash
pnpm drizzle-kit push:pg
```

### 3. 测试数据库连接

访问网站，确认数据库功能正常。

---

## 📝 维护命令

### 备份数据库

```bash
sudo -u postgres pg_dump -U lovato_user lovato_pump > backup.sql
```

### 恢复数据库

```bash
sudo -u postgres psql -U lovato_user lovato_pump < backup.sql
```

### 查看数据库大小

```bash
sudo -u postgres psql -U lovato_user -d lovato_pump -c "SELECT pg_size_pretty(pg_database_size('lovato_pump'));"
```

---

**数据库安装完成后，记得在 Vercel 中配置环境变量并重新部署！** 🚀
