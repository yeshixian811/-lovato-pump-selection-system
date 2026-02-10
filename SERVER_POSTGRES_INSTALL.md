# 🗄️ 服务器 PostgreSQL 安装指南

## 服务器信息

- **地址**：122.51.22.101
- **SSH 用户**：ubuntu
- **SSH 密码**：yezi100243..
- **数据库名**：lovato_pump
- **用户名**：lovato_user
- **密码**：lovato_db_password_2024

---

## 🚀 完整安装步骤

### 第 1 步：连接到服务器

```bash
ssh ubuntu@122.51.22.101
```

### 第 2 步：更新系统

```bash
sudo apt update
```

### 第 3 步：安装 PostgreSQL

```bash
sudo apt install postgresql-14 postgresql-contrib-14 -y
```

### 第 4 步：启动服务

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 第 5 步：设置密码

```bash
sudo -u postgres psql
```

```sql
ALTER USER postgres WITH PASSWORD 'yezi100243..';
\q
```

### 第 6 步：创建数据库和用户

```bash
sudo -u postgres psql
```

```sql
CREATE USER lovato_user WITH PASSWORD 'lovato_db_password_2024';
CREATE DATABASE lovato_pump OWNER lovato_user;
GRANT ALL PRIVILEGES ON DATABASE lovato_pump TO lovato_user;
\q
```

### 第 7 步：配置远程访问

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

修改：
```conf
listen_addresses = '*'
```

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

添加：
```conf
host    all             all             0.0.0.0/0               scram-sha-256
```

### 第 8 步：重启服务

```bash
sudo systemctl restart postgresql
```

### 第 9 步：配置防火墙

```bash
sudo ufw allow 5432/tcp
```

---

## 🔗 连接信息

```
postgresql://lovato_user:lovato_db_password_2024@122.51.22.101:5432/lovato_pump
```

---

## ✅ 安装检查清单

- [ ] PostgreSQL 已安装
- [ ] 服务已启动
- [ ] 数据库已创建
- [ ] 用户已创建
- [ ] 远程访问已配置
- [ ] 防火墙已配置

---

## 🧪 测试连接

```bash
sudo -u postgres psql -U lovato_user -d lovato_pump
```
