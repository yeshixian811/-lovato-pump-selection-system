# 数据库迁移到J盘 - 执行指南

## 🎯 迁移前检查清单

在执行迁移之前，请确保完成以下检查：

### ✅ 环境检查

- [ ] J 盘已正确挂载/可用
- [ ] J 盘有足够的可用空间（建议至少 10GB）
- [ ] PostgreSQL 服务正常运行
- [ ] 备份目录可写入
- [ ] 有管理员/root 权限
- [ ] 应用程序可以暂停（或选择低峰期执行）

### ✅ 文件检查

- [ ] 迁移脚本已准备完成：
  - Windows: `scripts/windows/migrate-database-to-j-drive.bat`
  - Linux: `scripts/migrate-database-to-j-drive.sh`
- [ ] 环境变量已更新：
  - `POSTGRES_DATA_DIR=J:/postgresql/data`
  - `POSTGRES_BACKUP_DIR=J:/postgresql/backups`
- [ ] 备份策略已确定

### ✅ 数据检查

- [ ] 当前数据库大小已知
- [ ] 预计迁移时间已评估
- [ ] 回滚方案已准备

---

## 🚀 Windows 系统迁移步骤

### 步骤 1: 准备工作

#### 1.1 确认 J 盘状态
```batch
# 检查 J 盘是否存在
dir J:\

# 检查可用空间
wmic logicaldisk where "DeviceID='J:'" get FreeSpace,Size
```

#### 1.2 检查 PostgreSQL 服务
```batch
# 查看服务状态
sc query postgresql-x64-14

# 记录当前配置
type "C:\Program Files\PostgreSQL\14\data\postgresql.conf" | findstr data_directory
```

#### 1.3 停止应用程序
```batch
# 如果有应用程序正在使用数据库，先停止
# 例如：停止 Node.js 服务
net stop nodejs-service
```

### 步骤 2: 执行迁移

#### 2.1 创建备份目录
```batch
if not exist "J:\postgresql" mkdir "J:\postgresql"
if not exist "J:\postgresql\data" mkdir "J:\postgresql\data"
if not exist "J:\postgresql\backups" mkdir "J:\postgresql\backups"
```

#### 2.2 运行迁移脚本
```batch
# 右键点击，以管理员身份运行
cd scripts\windows
migrate-database-to-j-drive.bat
```

**迁移过程说明**：
1. 检查 PostgreSQL 安装
2. 检查服务状态
3. 创建 J 盘目录结构
4. 停止 PostgreSQL 服务
5. 备份现有数据
6. 初始化新数据目录
7. 恢复数据
8. 更新服务配置
9. 重启服务
10. 验证迁移结果

**预计耗时**：5-15 分钟（取决于数据库大小）

### 步骤 3: 验证迁移

#### 3.1 检查服务状态
```batch
sc query postgresql-x64-14
```

应该显示：
```
SERVICE_NAME: postgresql-x64-14
        STATE: 4 RUNNING
```

#### 3.2 检查数据目录
```batch
dir J:\postgresql\data
```

应该看到以下文件：
```
PG_VERSION
base
global
pg_wal
postgresql.conf
```

#### 3.3 测试数据库连接
```batch
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -d lovato_pump
```

执行 SQL 查询：
```sql
SELECT version();
\d
\q
```

#### 3.4 验证数据完整性
```sql
-- 连接到数据库
\c lovato_pump

-- 检查表数量
SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';

-- 检查记录数量（根据实际表调整）
SELECT count(*) FROM users;
SELECT count(*) FROM pumps;
```

### 步骤 4: 重启应用程序

```batch
# 重启应用程序服务
net start nodejs-service
```

### 步骤 5: 测试应用程序

1. 访问应用程序主页
2. 测试数据库连接
3. 验证数据读写功能
4. 检查日志无错误

### 步骤 6: 清理（可选）

**确认迁移成功后**，可以清理旧数据：

```batch
# 1. 再次确认服务运行正常
sc query postgresql-x64-14

# 2. 备份旧数据目录到安全位置
xcopy "C:\Program Files\PostgreSQL\14\data" "D:\backup\old_postgresql_data" /E /I /H /Y

# 3. 删除旧数据目录（谨慎操作）
# rmdir /s /q "C:\Program Files\PostgreSQL\14\data"
```

---

## 🐧 Linux 系统迁移步骤

### 步骤 1: 准备工作

#### 1.1 确认 J 盘挂载状态
```bash
# 检查 J 盘是否已挂载
df -h | grep j

# 如果未挂载，需要先挂载
sudo fdisk -l  # 查看可用磁盘
sudo mount /dev/sdX1 /mnt/j  # 替换为实际设备
```

#### 1.2 检查 PostgreSQL 服务
```bash
# 查看服务状态
sudo systemctl status postgresql

# 记录当前配置
sudo -u postgres psql -c "SHOW data_directory;"
```

#### 1.3 停止应用程序
```bash
# 如果有应用程序正在使用数据库，先停止
sudo systemctl stop nodejs-service
# 或
pm2 stop all
```

### 步骤 2: 执行迁移

#### 2.1 创建挂载点
```bash
# 创建挂载点
sudo mkdir -p /mnt/j

# 挂载 J 盘（如果还未挂载）
sudo mount /dev/sdX1 /mnt/j  # 替换为实际设备

# 验证挂载
df -h /mnt/j
```

#### 2.2 运行迁移脚本
```bash
# 使用 root 权限运行
cd /workspace/projects
sudo bash scripts/migrate-database-to-j-drive.sh
```

**迁移过程说明**：
1. 检查现有数据库
2. 创建 J 盘目录结构
3. 停止 PostgreSQL 服务
4. 备份现有数据
5. 初始化新数据目录
6. 恢复数据
7. 更新配置
8. 重启服务
9. 验证迁移结果

**预计耗时**：5-15 分钟（取决于数据库大小）

### 步骤 3: 验证迁移

#### 3.1 检查服务状态
```bash
sudo systemctl status postgresql
```

应该显示：
```
● postgresql.service - PostgreSQL database server
   Loaded: loaded (/etc/systemd/system/postgresql.service; enabled)
   Active: active (running) since ...
```

#### 3.2 检查数据目录
```bash
ls -la /mnt/j/postgresql/data
```

应该看到以下文件：
```
PG_VERSION
base
global
pg_wal
postgresql.conf
```

#### 3.3 测试数据库连接
```bash
sudo -u postgres psql -d lovato_pump
```

执行 SQL 查询：
```sql
SELECT version();
\dt
\q
```

#### 3.4 验证数据完整性
```sql
-- 连接到数据库
\c lovato_pump

-- 检查表数量
SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';

-- 检查记录数量
SELECT count(*) FROM users;
SELECT count(*) FROM pumps;
```

### 步骤 4: 重启应用程序

```bash
# 重启应用程序服务
sudo systemctl start nodejs-service
# 或
pm2 start all
```

### 步骤 5: 测试应用程序

1. 访问应用程序主页
2. 测试数据库连接
3. 验证数据读写功能
4. 检查日志无错误

### 步骤 6: 清理（可选）

**确认迁移成功后**，可以清理旧数据：

```bash
# 1. 再次确认服务运行正常
sudo systemctl status postgresql

# 2. 备份旧数据目录到安全位置
sudo cp -r /var/lib/postgresql/14/main /backup/old_postgresql_data

# 3. 删除旧数据目录（谨慎操作）
# sudo rm -rf /var/lib/postgresql/14/main
```

---

## 🔄 回滚方案

如果迁移失败，需要回滚到原状态：

### Windows 回滚步骤

```batch
# 1. 停止服务
net stop postgresql-x64-14

# 2. 恢复原始数据目录配置
sc config postgresql-x64-14 binPath= "\"C:\Program Files\PostgreSQL\14\bin\pg_ctl.exe\" runservice -N \"postgresql-x64-14\" -D \"C:\Program Files\PostgreSQL\14\data\" -w"

# 3. 启动服务
net start postgresql-x64-14

# 4. 验证服务状态
sc query postgresql-x64-14
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres
```

### Linux 回滚步骤

```bash
# 1. 停止服务
sudo systemctl stop postgresql

# 2. 恢复原始配置
sudo sed -i "s|^data_directory =.*|data_directory = '/var/lib/postgresql/14/main'|" /etc/postgresql/14/main/postgresql.conf

# 3. 启动服务
sudo systemctl start postgresql

# 4. 验证服务状态
sudo systemctl status postgresql
sudo -u postgres psql
```

---

## 📊 迁移监控

### 实时监控命令

#### Windows
```batch
# 监控服务状态
watch -n 5 "sc query postgresql-x64-14"

# 监控磁盘使用
watch -n 5 "wmic logicaldisk where \"DeviceID='J:'\" get FreeSpace,Size"

# 监控日志
type "J:\postgresql\data\log\postgresql-*.log" -wait
```

#### Linux
```bash
# 监控服务状态
watch -n 5 'sudo systemctl status postgresql'

# 监控磁盘使用
watch -n 5 'df -h /mnt/j'

# 监控日志
sudo tail -f /var/log/postgresql/postgresql-*.log
```

---

## ⚠️ 故障排除

### 问题 1: 服务无法启动

**症状**：迁移后服务启动失败

**解决方案**：
```bash
# Windows
sc query postgresql-x64-14
type "J:\postgresql\data\log\postgresql-*.log"

# Linux
sudo systemctl status postgresql
sudo journalctl -u postgresql -n 50
```

**常见原因**：
- 配置文件路径错误
- 权限问题
- 端口被占用

### 问题 2: 数据丢失

**症状**：数据库表或记录丢失

**解决方案**：
```bash
# 从备份恢复
psql -U postgres -d lovato_pump < J:/postgresql/backups/postgres_backup_YYYYMMDD_HHMMSS.sql
```

### 问题 3: 性能下降

**症状**：迁移后数据库性能变慢

**解决方案**：
```sql
-- 分析表
ANALYZE;

-- 清理
VACUUM ANALYZE;

-- 重建索引
REINDEX DATABASE lovato_pump;
```

---

## ✅ 迁移后检查清单

迁移完成后，请确认：

### 服务状态
- [ ] PostgreSQL 服务正常运行
- [ ] 应用程序服务正常运行
- [ ] 所有依赖服务正常

### 数据完整性
- [ ] 所有数据库存在
- [ ] 所有表存在
- [ ] 记录数量与迁移前一致
- [ ] 数据查询正常

### 功能测试
- [ ] 应用程序可正常访问
- [ ] 用户登录功能正常
- [ ] 数据读写功能正常
- [ ] 性能无明显下降

### 文档更新
- [ ] 更新配置文档
- [ ] 更新监控告警
- [ ] 更新备份策略
- [ ] 通知相关人员

---

## 📞 紧急联系

如遇到无法解决的问题：

1. **查看日志**
   - Windows: `type "J:\postgresql\data\log\postgresql-*.log"`
   - Linux: `sudo journalctl -u postgresql -n 100`

2. **联系技术支持**
   - 提供错误日志
   - 描述迁移步骤
   - 说明当前状态

3. **使用回滚方案**
   - 如果影响业务，立即执行回滚
   - 确保服务恢复后再排查问题

---

## 📝 迁移记录

请在迁移完成后填写以下信息：

```
迁移日期：________________
执行人员：________________
迁移方式：□ Windows  □ Linux
迁移时长：________________
数据大小：________________

备份信息：
  备份文件：________________
  备份时间：________________
  备份大小：________________

验证结果：
  服务状态：□ 正常  □ 异常
  数据完整性：□ 通过  □ 失败
  功能测试：□ 通过  □ 失败

问题描述：________________
解决方案：________________
```

---

**祝迁移顺利！** 🚀
