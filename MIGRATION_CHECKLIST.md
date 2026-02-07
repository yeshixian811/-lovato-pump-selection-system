# 数据库迁移到J盘 - 迁移前检查清单

## 📋 执行前必读

### ⚠️ 重要提示

1. **备份是必须的** - 迁移前必须创建完整备份
2. **选择低峰期** - 建议在业务低峰期执行迁移
3. **准备回滚方案** - 确保知道如何快速回滚
4. **通知相关人员** - 迁移期间服务会短暂中断
5. **预计停机时间** - 5-15分钟（取决于数据库大小）

---

## ✅ 环境准备检查

### J盘检查

- [ ] **J 盘已挂载/可用**
  ```bash
  # Windows
  dir J:\
  
  # Linux
  df -h | grep j
  ```

- [ ] **J 盘有足够的可用空间**
  - 建议：至少预留当前数据库大小的 2 倍
  - 最小：10GB 可用空间
  
  ```bash
  # Windows
  wmic logicaldisk where "DeviceID='J:'" get FreeSpace,Size
  
  # Linux
  df -h /mnt/j
  ```

- [ ] **J 盘有读写权限**
  ```bash
  # Windows
  echo test > J:\test.txt
  del J:\test.txt
  
  # Linux
  sudo touch /mnt/j/test
  sudo rm /mnt/j/test
  ```

### 系统资源检查

- [ ] **系统内存充足**
  - 建议：至少 2GB 可用内存
  
  ```bash
  # Windows
  wmic OS get TotalVisibleMemorySize,FreePhysicalMemory
  
  # Linux
  free -h
  ```

- [ ] **磁盘 I/O 性能良好**
  - 建议：SSD 或高性能存储
  - 迁移期间避免其他大量 I/O 操作

---

## 🔧 PostgreSQL 检查

### 服务状态

- [ ] **PostgreSQL 服务正常运行**
  ```bash
  # Windows
  sc query postgresql-x64-14
  
  # Linux
  sudo systemctl status postgresql
  ```

- [ ] **记录当前配置信息**
  ```bash
  # Windows
  type "C:\Program Files\PostgreSQL\14\data\postgresql.conf" | findstr data_directory
  
  # Linux
  sudo -u postgres psql -c "SHOW data_directory;"
  ```

- [ ] **记录当前数据库大小**
  ```sql
  SELECT 
      pg_database.datname,
      pg_size_pretty(pg_database_size(pg_database.datname)) AS size
  FROM pg_database
  WHERE datname = 'lovato_pump';
  ```

- [ ] **记录当前连接数**
  ```sql
  SELECT count(*) FROM pg_stat_activity;
  ```

### 数据完整性检查

- [ ] **数据库完整性检查通过**
  ```sql
  -- 检查表数量
  SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';
  
  -- 检查是否有损坏的表
  SELECT * FROM pg_stat_user_tables WHERE n_dead_tup > 1000;
  ```

- [ ] **关键表记录数已记录**
  ```sql
  -- 根据实际表调整
  SELECT count(*) FROM users;
  SELECT count(*) FROM pumps;
  SELECT count(*) FROM orders;
  ```

---

## 📁 文件准备检查

### 脚本文件

- [ ] **迁移脚本已准备**
  - Windows: `scripts/windows/migrate-database-to-j-drive.bat`
  - Linux: `scripts/migrate-database-to-j-drive.sh`
  
  ```bash
  # Windows
  dir scripts\windows\migrate-database-to-j-drive.bat
  
  # Linux
  ls -la scripts/migrate-database-to-j-drive.sh
  ```

- [ ] **脚本有执行权限**（仅 Linux）
  ```bash
  chmod +x scripts/migrate-database-to-j-drive.sh
  ```

### 配置文件

- [ ] **环境变量已更新**
  ```env
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump
  POSTGRES_DATA_DIR=J:/postgresql/data
  POSTGRES_BACKUP_DIR=J:/postgresql/backups
  ```

- [ ] **应用程序配置已检查**
  - 确认应用程序使用的数据库连接字符串
  - 确认迁移后不需要更改连接配置

### 文档准备

- [ ] **已阅读完整迁移指南**
  - [MIGRATION_EXECUTION_GUIDE.md](./MIGRATION_EXECUTION_GUIDE.md)
  - [DATABASE_J_DRIVE.md](./DATABASE_J_DRIVE.md)

- [ ] **回滚方案已准备**
  - 记录原始数据目录路径
  - 准备回滚步骤
  - 测试回滚流程

---

## 💾 备份准备检查

### 数据库备份

- [ ] **已创建完整数据库备份**
  ```bash
  # Windows
  "C:\Program Files\PostgreSQL\14\bin\pg_dumpall.exe" -U postgres > J:\postgresql\backups\pre_migration_backup.sql
  
  # Linux
  sudo -u postgres pg_dumpall > /mnt/j/postgresql/backups/pre_migration_backup.sql
  ```

- [ ] **备份文件完整性已验证**
  - 检查备份文件大小
  - 确认备份文件不为空
  
  ```bash
  # Windows
  dir J:\postgresql\backups\pre_migration_backup.sql
  
  # Linux
  ls -lh /mnt/j/postgresql/backups/pre_migration_backup.sql
  ```

- [ ] **备份文件已复制到安全位置**
  - 建议复制到另一台服务器或云存储
  - 保留至少两份备份

### 配置文件备份

- [ ] **PostgreSQL 配置文件已备份**
  ```bash
  # Windows
  xcopy "C:\Program Files\PostgreSQL\14\data\*.conf" "J:\postgresql\backups\config\" /Y
  
  # Linux
  sudo cp /etc/postgresql/14/main/*.conf /mnt/j/postgresql/backups/config/
  ```

- [ ] **应用程序配置文件已备份**
  - 备份 `.env` 文件
  - 备份数据库连接配置

---

## 🚦 业务准备检查

### 应用程序

- [ ] **已通知相关人员**
  - 开发团队
  - 运维团队
  - 业务部门

- [ ] **已选择迁移时间窗口**
  - 建议时间：业务低峰期
  - 预计停机：5-15 分钟
  - 计划时间：________________

- [ ] **应用程序已准备停止**
  ```bash
  # Windows
  net stop nodejs-service
  
  # Linux
  sudo systemctl stop nodejs-service
  # 或
  pm2 stop all
  ```

### 监控准备

- [ ] **监控系统已准备**
  - 准备监控服务状态
  - 准备监控磁盘使用
  - 准备监控数据库连接

- [ ] **日志收集已准备**
  ```bash
  # Windows
  # 准备查看日志文件
  
  # Linux
  sudo journalctl -u postgresql -f
  ```

---

## 🔐 权限检查

### 管理权限

- [ ] **有管理员/root 权限**
  ```bash
  # Windows
  # 右键点击脚本 → 以管理员身份运行
  
  # Linux
  sudo -i
  ```

- [ ] **PostgreSQL 管理员密码**
  - 记录 postgres 用户密码
  - 确认可以连接数据库

### 文件权限

- [ ] **J 盘目录权限正确**
  ```bash
  # Windows
  # 确保 postgres 用户有读写权限
  
  # Linux
  sudo chown -R postgres:postgres /mnt/j/postgresql/data
  sudo chmod 700 /mnt/j/postgresql/data
  ```

---

## 📊 测试检查

### 迁移前测试

- [ ] **已执行演练迁移**（可选但推荐）
  - 在测试环境执行迁移
  - 验证迁移流程
  - 记录遇到的问题

- [ ] **回滚流程已测试**
  - 在测试环境测试回滚
  - 验证回滚后服务正常
  - 记录回滚耗时

---

## 📝 检查清单汇总

### 必须项（必须全部勾选）

- [ ] J 盘可用且空间充足
- [ ] PostgreSQL 服务正常运行
- [ ] 迁移脚本已准备
- [ ] 环境变量已更新
- [ ] 完整数据库备份已创建
- [ ] 备份文件已验证
- [ ] 配置文件已备份
- [ ] 相关人员已通知
- [ ] 有管理员/root 权限
- [ ] 回滚方案已准备

### 建议项（强烈建议）

- [ ] 已选择低峰期
- [ ] 已阅读完整文档
- [ ] 已执行演练迁移
- [ ] 回滚流程已测试
- [ ] 监控系统已准备
- [ ] 日志收集已准备

---

## 🚨 风险评估

### 高风险（必须解决）

- ❌ J 盘空间不足
- ❌ 没有完整备份
- ❌ 没有管理员权限
- ❌ PostgreSQL 服务异常

### 中风险（建议解决）

- ⚠️ 在业务高峰期执行
- ⚠️ 没有测试回滚流程
- ⚠️ 磁盘 I/O 性能较差
- ⚠️ 没有通知相关人员

### 低风险（可以接受）

- ℹ️ 没有演练迁移
- ℹ️ 监控系统未准备

---

## ✅ 执行确认

### 最后确认

在执行迁移前，请确认：

```
迁移执行人：________________
日期：________________
时间：________________

✅ 所有必须项已检查并确认
✅ 所有问题已解决
✅ 备份已完成并验证
✅ 回滚方案已准备
✅ 相关人员已通知
✅ 已选择合适的执行时间

确认人签名：________________
```

### 执行命令

**Windows**：
```batch
cd scripts\windows
migrate-database-to-j-drive.bat
```

**Linux**：
```bash
cd /workspace/projects
sudo bash scripts/migrate-database-to-j-drive.sh
```

---

## 📞 紧急联系

如遇到问题，请联系：

- **技术支持**：________________
- **数据库管理员**：________________
- **系统管理员**：________________

---

**检查完成，可以开始迁移！** 🚀

请确保所有必须项都已勾选，再开始执行迁移。
