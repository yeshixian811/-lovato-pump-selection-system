# 数据库迁移到J盘 - 执行指令

## 🎯 现在可以开始迁移！

所有准备工作已完成，您可以安全地执行数据库迁移。

---

## 📋 执行前最后确认

### 必须完成的步骤

- ✅ 已阅读 `MIGRATION_CHECKLIST.md` 并完成检查
- ✅ 已阅读 `MIGRATION_EXECUTION_GUIDE.md` 了解详细步骤
- ✅ J 盘已准备并可访问
- ✅ 已选择业务低峰期
- ✅ 相关人员已通知
- ✅ 有完整的回滚方案

### 需要准备的信息

- PostgreSQL 服务名称（默认: `postgresql-x64-14`）
- PostgreSQL 安装路径（默认: `C:\Program Files\PostgreSQL\14`）
- postgres 用户密码
- 应用程序服务名称（如有）

---

## 🚀 Windows 系统执行步骤

### 步骤 1: 打开命令提示符（管理员）

1. 按 `Win + X` 打开开始菜单
2. 选择"Windows PowerShell (管理员)"或"命令提示符 (管理员)"

### 步骤 2: 进入脚本目录

```batch
cd C:\path\to\your\project\scripts\windows
```

### 步骤 3: 执行迁移脚本

```batch
migrate-database-to-j-drive.bat
```

### 步骤 4: 按照脚本提示操作

脚本会自动执行以下步骤：
1. ✅ 检查 PostgreSQL 安装
2. ✅ 检查服务状态
3. ✅ 创建 J 盘目录结构
4. ✅ 停止 PostgreSQL 服务
5. ✅ 备份现有数据
6. ✅ 初始化新数据目录
7. ✅ 恢复数据
8. ✅ 更新服务配置
9. ✅ 重启服务
10. ✅ 验证迁移结果

### 步骤 5: 验证迁移

```batch
# 运行验证脚本
verify-migration.bat
```

查看验证结果，确认所有检查项通过。

### 步骤 6: 重启应用程序

```batch
# 重启应用程序服务
net start nodejs-service

# 或使用 PM2
pm2 restart all
```

### 步骤 7: 测试应用程序

1. 访问应用程序主页: `http://localhost:5000`
2. 测试用户登录功能
3. 测试数据查询功能
4. 测试数据写入功能
5. 检查应用程序日志

---

## 🐧 Linux 系统执行步骤

### 步骤 1: 打开终端

### 步骤 2: 进入脚本目录

```bash
cd /path/to/your/project/scripts
```

### 步骤 3: 赋予脚本执行权限

```bash
chmod +x migrate-database-to-j-drive.sh
chmod +x verify-migration.sh
```

### 步骤 4: 执行迁移脚本

```bash
sudo bash migrate-database-to-j-drive.sh
```

### 步骤 5: 验证迁移

```bash
sudo bash verify-migration.sh
```

### 步骤 6: 重启应用程序

```bash
# 使用 systemd
sudo systemctl restart nodejs-service

# 或使用 PM2
pm2 restart all
```

### 步骤 7: 测试应用程序

1. 访问应用程序主页: `http://localhost:5000`
2. 测试用户登录功能
3. 测试数据查询功能
4. 测试数据写入功能
5. 检查应用程序日志

---

## ⏱️ 预计耗时

| 阶段 | 预计耗时 |
|-----|---------|
| 迁移脚本执行 | 5-15 分钟 |
| 验证脚本执行 | 1-2 分钟 |
| 应用程序重启 | 1-2 分钟 |
| 功能测试 | 5-10 分钟 |
| **总计** | **12-29 分钟** |

---

## 📊 迁移过程中监控

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

## ✅ 成功标志

迁移成功的标志：

- ✅ PostgreSQL 服务状态：运行中
- ✅ 数据目录：J:\postgresql\data（或 /mnt/j/postgresql/data）
- ✅ 数据库连接：正常
- ✅ 所有数据库存在
- ✅ 所有表数据完整
- ✅ 应用程序可正常访问
- ✅ 功能测试：全部通过
- ✅ 备份文件：已创建

---

## ⚠️ 如果遇到问题

### 问题 1: 服务无法启动

**症状**：迁移后服务启动失败

**解决方案**：
```batch
# Windows
sc query postgresql-x64-14
type "J:\postgresql\data\log\postgresql-*.log"

# Linux
sudo systemctl status postgresql
sudo journalctl -u postgresql -n 50
```

### 问题 2: 数据丢失

**症状**：数据库表或记录丢失

**解决方案**：
```bash
# 从备份恢复
psql -U postgres -d lovato_pump < J:/postgresql/backups/postgres_backup_YYYYMMDD_HHMMSS.sql
```

### 问题 3: 需要回滚

**症状**：迁移失败或影响业务

**解决方案**：参考 `MIGRATION_EXECUTION_GUIDE.md` 中的【回滚方案】章节

---

## 📞 紧急联系

如遇到无法解决的问题：

1. **查看日志**
   - Windows: `type "J:\postgresql\data\log\postgresql-*.log"`
   - Linux: `sudo journalctl -u postgresql -n 100`

2. **使用回滚方案**
   - 如果影响业务，立即执行回滚
   - 确保服务恢复后再排查问题

3. **联系技术支持**
   - 提供错误日志
   - 描述迁移步骤
   - 说明当前状态

---

## 📝 迁移记录

请在迁移完成后填写以下信息：

```
执行日期：________________
执行人员：________________
迁移方式：□ Windows  □ Linux
迁移耗时：________________
数据大小：________________

验证结果：
  服务状态：□ 正常  □ 异常
  数据完整性：□ 通过  □ 失败
  功能测试：□ 通过  □ 失败

问题描述：________________
解决方案：________________
```

---

## 🎉 完成后

### 清理工作（可选）

确认迁移成功后，可以：

1. **备份旧数据目录**（强烈建议）
   ```batch
   # Windows
   xcopy "C:\Program Files\PostgreSQL\14\data" "D:\backup\old_postgresql_data" /E /I /H /Y
   
   # Linux
   sudo cp -r /var/lib/postgresql/14/main /backup/old_postgresql_data
   ```

2. **删除旧数据目录**（谨慎操作）
   ```batch
   # Windows
   # rmdir /s /q "C:\Program Files\PostgreSQL\14\data"
   
   # Linux
   # sudo rm -rf /var/lib/postgresql/14/main
   ```

3. **更新监控配置**
   - 更新磁盘监控路径
   - 更新备份脚本路径
   - 通知监控系统

### 文档更新

- 更新配置文档
- 更新部署文档
- 更新运维手册
- 通知团队成员

---

## 📚 相关文档

| 文档 | 说明 |
|-----|------|
| MIGRATION_CHECKLIST.md | 迁移前检查清单 |
| MIGRATION_EXECUTION_GUIDE.md | 详细执行指南 |
| MIGRATION_REPORT.md | 迁移报告模板 |
| DATABASE_J_DRIVE.md | J盘数据库配置 |
| DATABASE_QUICK_REFERENCE.md | 快速参考 |

---

**准备好就执行迁移！** 🚀

请确保：
1. ✅ 已完成所有检查清单项
2. ✅ 已选择合适的执行时间
3. ✅ 已准备好回滚方案
4. ✅ 相关人员已通知

现在可以开始执行迁移了！
