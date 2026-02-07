# 数据库配置 - J 盘部署

## 📋 概述

洛瓦托水泵选型系统的 PostgreSQL 数据库已配置为使用 **J 盘**作为数据存储位置。

### 配置信息

- **数据库类型**: PostgreSQL
- **数据目录**: `J:/postgresql/data`
- **备份目录**: `J:/postgresql/backups`
- **数据库名**: `lovato_pump`
- **默认用户**: `postgres`

---

## 🗂️ 目录结构

```
J:/
└── postgresql/
    ├── data/          # 数据库数据文件
    │   ├── base/
    │   ├── global/
    │   ├── pg_wal/
    │   └── postgresql.conf
    └── backups/       # 数据库备份文件
        └── postgres_backup_*.sql
```

---

## 🚀 快速开始

### 首次部署

#### Windows 系统

1. **准备 J 盘**
   - 确保 J 盘已正确挂载
   - 确保有足够的磁盘空间（建议至少 10GB）

2. **运行迁移脚本**
   ```batch
   # 右键点击，以管理员身份运行
   scripts\windows\migrate-database-to-j-drive.bat
   ```

3. **验证迁移**
   - 检查服务状态：`sc query postgresql-x64-14`
   - 检查数据目录：`dir J:\postgresql\data`
   - 测试连接：`psql -U postgres -d lovato_pump`

#### Linux 系统

1. **准备 J 盘挂载点**
   ```bash
   # 挂载 J 盘（根据实际情况调整）
   sudo mount /dev/sdX1 /mnt/j
   ```

2. **运行迁移脚本**
   ```bash
   sudo bash scripts/migrate-database-to-j-drive.sh
   ```

3. **验证迁移**
   ```bash
   # 检查服务状态
   sudo systemctl status postgresql
   
   # 检查数据目录
   ls -la /mnt/j/postgresql/data
   
   # 测试连接
   sudo -u postgres psql -d lovato_pump
   ```

---

## 🔧 配置说明

### 环境变量

`.env` 文件中的数据库配置：

```env
# 数据库配置
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump

# 数据库数据目录（J盘）
POSTGRES_DATA_DIR=J:/postgresql/data
POSTGRES_BACKUP_DIR=J:/postgresql/backups
```

### 连接字符串

| 环境 | 连接字符串 |
|-----|-----------|
| 开发 | `postgresql://postgres:postgres@localhost:5432/lovato_pump` |
| 生产 | `postgresql://user:password@localhost:5432/lovato_pump` |

---

## 📊 管理操作

### 服务管理

#### Windows

```batch
# 启动服务
net start postgresql-x64-14

# 停止服务
net stop postgresql-x64-14

# 重启服务
net stop postgresql-x64-14
net start postgresql-x64-14

# 查看状态
sc query postgresql-x64-14
```

#### Linux

```bash
# 启动服务
sudo systemctl start postgresql

# 停止服务
sudo systemctl stop postgresql

# 重启服务
sudo systemctl restart postgresql

# 查看状态
sudo systemctl status postgresql
```

### 数据库操作

#### 连接数据库

```bash
# 使用 postgres 用户连接
psql -U postgres -d lovato_pump

# 连接到默认数据库
psql -U postgres

# 使用连接字符串
psql "postgresql://postgres:postgres@localhost:5432/lovato_pump"
```

#### 常用命令

```sql
-- 查看所有数据库
\l

-- 连接到特定数据库
\c lovato_pump

-- 查看所有表
\dt

-- 查看表结构
\d table_name

-- 退出
\q
```

---

## 💾 备份与恢复

### 创建备份

#### 完整备份

```bash
# 备份所有数据库
pg_dumpall -U postgres > J:/postgresql/backups/full_backup_$(date +%Y%m%d).sql

# 备份单个数据库
pg_dump -U postgres lovato_pump > J:/postgresql/backups/lovato_pump_$(date +%Y%m%d).sql

# 压缩备份
pg_dump -U postgres lovato_pump | gzip > J:/postgresql/backups/lovato_pump_$(date +%Y%m%d).sql.gz
```

#### Windows 批处理示例

```batch
@echo off
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=J:\postgresql\backups\lovato_pump_%TIMESTAMP%.sql

echo 正在备份数据库...
"C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -U postgres lovato_pump > %BACKUP_FILE%

if %errorLevel% equ 0 (
    echo [✓] 备份完成: %BACKUP_FILE%
) else (
    echo [✗] 备份失败！
)

pause
```

### 恢复备份

```bash
# 恢复完整备份
psql -U postgres < J:/postgresql/backups/full_backup_20240101.sql

# 恢复单个数据库
psql -U postgres -d lovato_pump < J:/postgresql/backups/lovato_pump_20240101.sql

# 恢复压缩备份
gunzip -c J:/postgresql/backups/lovato_pump_20240101.sql.gz | psql -U postgres -d lovato_pump
```

---

## 🔍 监控与维护

### 查看数据库大小

```sql
-- 查看数据库大小
SELECT 
    datname,
    pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
WHERE datname = 'lovato_pump';

-- 查看表大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 查看连接信息

```sql
-- 查看当前连接
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start
FROM pg_stat_activity
WHERE datname = 'lovato_pump';

-- 查看活跃连接数
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
```

### 清理与优化

```sql
-- 分析表（更新统计信息）
ANALYZE;

-- 清理死元组
VACUUM;

-- 清理并分析
VACUUM ANALYZE;

-- 完全清理（释放空间）
VACUUM FULL;

-- 重建索引
REINDEX DATABASE lovato_pump;
```

---

## 📈 性能优化

### 配置调优

编辑 `J:/postgresql/data/postgresql.conf`：

```conf
# 内存配置
shared_buffers = 256MB              # 系统内存的 25%
effective_cache_size = 1GB          # 系统内存的 50-75%
work_mem = 16MB                     # 每个排序操作的内存
maintenance_work_mem = 64MB         # 维护操作内存

# 连接配置
max_connections = 100               # 最大连接数

# WAL 配置
wal_buffers = 16MB
checkpoint_completion_target = 0.9
max_wal_size = 1GB
min_wal_size = 80MB

# 查询规划
random_page_cost = 1.1              # SSD 硬盘
effective_io_concurrency = 200      # 并发 I/O
```

### 索引优化

```sql
-- 查看缺失的索引
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;

-- 创建索引
CREATE INDEX index_name ON table_name (column_name);

-- 查看索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 🔐 安全配置

### 修改默认密码

```sql
-- 修改 postgres 用户密码
ALTER USER postgres WITH PASSWORD 'your_strong_password';

-- 创建专用用户
CREATE USER lovato_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lovato_pump TO lovato_user;
```

### 配置访问控制

编辑 `J:/postgresql/data/pg_hba.conf`：

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# 允许本地连接
local   all             postgres                                peer
local   all             all                                     md5

# 允许 IPv4 本地连接
host    all             all             127.0.0.1/32            md5

# 允许 IPv6 本地连接
host    all             all             ::1/128                 md5

# 拒绝其他连接
host    all             all             0.0.0.0/0               reject
```

---

## 🚨 故障排除

### 常见问题

#### 1. 服务无法启动

**问题**：PostgreSQL 服务无法启动

**解决方案**：
```bash
# Windows
sc query postgresql-x64-14
net start postgresql-x64-14

# 查看日志
type "C:\Program Files\PostgreSQL\14\data\log\*.log"

# Linux
sudo systemctl status postgresql
sudo journalctl -u postgresql -n 50
```

#### 2. 磁盘空间不足

**问题**：J 盘空间不足

**解决方案**：
```bash
# 查看磁盘使用情况
df -h /mnt/j

# 清理旧备份
find J:/postgresql/backups -name "*.sql" -mtime +30 -delete

# 清理数据库
VACUUM FULL;
```

#### 3. 连接超时

**问题**：无法连接到数据库

**解决方案**：
```sql
-- 检查最大连接数
SHOW max_connections;

-- 检查活跃连接
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- 终止长时间运行的查询
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
AND query_start < now() - interval '5 minutes';
```

#### 4. 性能问题

**问题**：数据库响应缓慢

**解决方案**：
```sql
-- 查看慢查询
SELECT 
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- 分析表
ANALYZE;

-- 清理
VACUUM ANALYZE;
```

---

## 📚 相关文档

- [项目主页](../README.md)
- [Windows 部署指南](../WINDOWS_DEPLOYMENT.md)
- [Linux 部署指南](../DEPLOYMENT.md)
- [API 文档](../API_DOCUMENTATION.md)

---

## 🆘 获取帮助

### 查看日志

**Windows**：
```batch
type "J:\postgresql\data\log\postgresql-*.log"
```

**Linux**：
```bash
tail -f /var/log/postgresql/postgresql-*.log
```

### 有用的资源

- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [PostgreSQL Wiki](https://wiki.postgresql.org/)
- [PostgreSQL 社区](https://www.postgresql.org/community/)

---

**配置更新日期**: 2026-02-07  
**数据库版本**: PostgreSQL 14  
**数据目录**: J:/postgresql/data
