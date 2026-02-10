# ✅ 数据库配置检查清单

## 服务器 PostgreSQL（推荐）

### 安装检查

- [ ] 连接到服务器：`ssh ubuntu@122.51.22.101`
- [ ] 更新系统：`sudo apt update`
- [ ] 安装 PostgreSQL：`sudo apt install postgresql-14 -y`
- [ ] 启动服务：`sudo systemctl start postgresql`
- [ ] 设置 postgres 密码
- [ ] 创建数据库 `lovato_pump`
- [ ] 创建用户 `lovato_user`
- [ ] 配置远程访问（postgresql.conf）
- [ ] 配置 pg_hba.conf
- [ ] 重启服务
- [ ] 配置防火墙：`sudo ufw allow 5432/tcp`
- [ ] 测试本地连接

### Vercel 配置

- [ ] 访问 Vercel Dashboard
- [ ] 选择项目
- [ ] 添加环境变量 `DATABASE_URL`
- [ ] 重新部署项目

### 验证

- [ ] 访问网站：https://lowatopump.com
- [ ] 测试登录功能
- [ ] 测试选型功能
- [ ] 测试管理后台

---

## 连接信息

### 服务器 PostgreSQL

```
主机: 122.51.22.101
端口: 5432
数据库: lovato_pump
用户: lovato_user
密码: lovato_db_password_2024
```

### 连接字符串

```
postgresql://lovato_user:lovato_db_password_2024@122.51.22.101:5432/lovato_pump
```

---

## 故障排查

### 检查服务状态

```bash
sudo systemctl status postgresql
```

### 查看日志

```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### 重启服务

```bash
sudo systemctl restart postgresql
```

### 检查端口

```bash
sudo netstat -tlnp | grep 5432
```

---

## 维护命令

### 备份数据库

```bash
sudo -u postgres pg_dump -U lovato_user lovato_pump > backup.sql
```

### 恢复数据库

```bash
sudo -u postgres psql -U lovato_user lovato_pump < backup.sql
```

### 查看数据库列表

```bash
sudo -u postgres psql -l
```

---

## 安全建议

### 1. 修改默认密码

```sql
ALTER USER lovato_user WITH PASSWORD '新的强密码';
```

### 2. 限制访问 IP

在 `pg_hba.conf` 中，将 `0.0.0.0/0` 改为特定 IP：
```
host    all             all             Vercel服务器IP/32    scram-sha-256
```

### 3. 定期备份

创建定时任务：
```bash
sudo crontab -e
```

添加：
```
0 2 * * * /usr/bin/pg_dump -U lovato_user lovato_pump > /backup/lovato_pump_$(date +\%Y\%m\%d).sql
```

---

## 完成后

完成安装和配置后，告诉我结果：

1. ✅ PostgreSQL 安装成功
2. ✅ 数据库创建成功
3. ✅ 远程访问配置成功
4. ✅ Vercel 环境变量已配置
5. ✅ 网站功能正常

我会帮你验证一切是否正常工作！
