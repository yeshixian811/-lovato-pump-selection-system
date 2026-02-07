# J盘数据库配置快速参考

## 📌 配置信息

| 项目 | 值 |
|-----|---|
| 数据库类型 | PostgreSQL 14 |
| 数据库名称 | lovato_pump |
| 数据目录 | `J:/postgresql/data` |
| 备份目录 | `J:/postgresql/backups` |
| 默认端口 | 5432 |
| 默认用户 | postgres |

---

## 🚀 快速命令

### Windows

```batch
# 启动数据库
net start postgresql-x64-14

# 停止数据库
net stop postgresql-x64-14

# 查看状态
sc query postgresql-x64-14

# 连接数据库
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -d lovato_pump

# 备份数据库
"C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -U postgres lovato_pump > J:\postgresql\backups\backup.sql

# 恢复数据库
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -d lovato_pump < J:\postgresql\backups\backup.sql
```

### Linux

```bash
# 启动数据库
sudo systemctl start postgresql

# 停止数据库
sudo systemctl stop postgresql

# 查看状态
sudo systemctl status postgresql

# 连接数据库
sudo -u postgres psql -d lovato_pump

# 备份数据库
sudo -u postgres pg_dump lovato_pump > /mnt/j/postgresql/backups/backup.sql

# 恢复数据库
sudo -u postgres psql -d lovato_pump < /mnt/j/postgresql/backups/backup.sql
```

---

## 📂 目录结构

```
J:/
└── postgresql/
    ├── data/              # 数据库数据
    │   ├── base/
    │   ├── global/
    │   └── pg_wal/
    └── backups/           # 备份文件
        └── postgres_backup_*.sql
```

---

## 🔧 环境变量

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump
POSTGRES_DATA_DIR=J:/postgresql/data
POSTGRES_BACKUP_DIR=J:/postgresql/backups
```

---

## 📊 常用 SQL 命令

```sql
-- 查看所有数据库
\l

-- 连接数据库
\c lovato_pump

-- 查看所有表
\dt

-- 查看表结构
\d table_name

-- 执行 SQL 查询
SELECT * FROM table_name LIMIT 10;

-- 退出
\q
```

---

## 🔄 数据库迁移

### Windows 迁移脚本

```batch
# 以管理员身份运行
scripts\windows\migrate-database-to-j-drive.bat
```

### Linux 迁移脚本

```bash
# 使用 root 权限运行
sudo bash scripts/migrate-database-to-j-drive.sh
```

---

## 📝 备份计划

### 自动备份脚本（Windows）

创建 `J:\postgresql\backup.bat`：

```batch
@echo off
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=J:\postgresql\backups\lovato_pump_%TIMESTAMP%.sql

"C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -U postgres lovato_pump > %BACKUP_FILE%

echo Backup completed: %BACKUP_FILE%
```

### 设置定时任务（Windows）

使用任务计划程序设置每天自动备份：
1. 打开任务计划程序
2. 创建基本任务
3. 触发器：每天 02:00
4. 操作：启动程序 `J:\postgresql\backup.bat`

---

## ⚠️ 重要提示

1. **确保 J 盘已挂载**
   - Windows: 确保J盘存在并可访问
   - Linux: 确保J盘已正确挂载到 `/mnt/j`

2. **磁盘空间**
   - 建议至少预留 10GB 可用空间
   - 定期清理旧备份文件

3. **权限设置**
   - Windows: 确保 postgres 用户有读写权限
   - Linux: 确保正确的文件权限（700）

4. **备份策略**
   - 建议每天自动备份
   - 保留最近 7 天的备份
   - 定期测试恢复流程

---

## 🆘 故障排查

### 问题：服务无法启动

**Windows**：
```batch
# 查看服务状态
sc query postgresql-x64-14

# 查看日志
type "J:\postgresql\data\log\postgresql-*.log"
```

**Linux**：
```bash
# 查看服务状态
sudo systemctl status postgresql

# 查看日志
sudo journalctl -u postgresql -n 50
```

### 问题：连接失败

1. 检查服务是否运行
2. 检查防火墙设置
3. 验证连接字符串
4. 检查用户名和密码

### 问题：磁盘空间不足

```bash
# 查看磁盘使用
df -h /mnt/j

# 清理旧备份（保留最近7天）
find /mnt/j/postgresql/backups -name "*.sql" -mtime +7 -delete

# 清理数据库
VACUUM FULL;
```

---

## 📚 相关文档

- [完整数据库配置文档](./DATABASE_J_DRIVE.md)
- [项目主页](./README.md)
- [Windows 部署指南](./WINDOWS_DEPLOYMENT.md)
- [Linux 部署指南](./DEPLOYMENT.md)

---

**最后更新**: 2026-02-07
