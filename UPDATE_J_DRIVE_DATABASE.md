# 数据库迁移到J盘 - 更新说明

## 📅 更新日期

2026-02-07

---

## 📝 更新内容

### 1. 数据库配置更新

**文件**: `.env`

更新内容：
- 添加 J 盘数据目录配置
- 添加 J 盘备份目录配置

```env
# 数据库数据目录（J盘）
POSTGRES_DATA_DIR=J:/postgresql/data
POSTGRES_BACKUP_DIR=J:/postgresql/backups
```

---

### 2. 新增迁移脚本

#### Windows 版本
**文件**: `scripts/windows/migrate-database-to-j-drive.bat`

功能：
- 自动检测 PostgreSQL 安装
- 创建 J 盘目录结构
- 备份现有数据
- 初始化新数据目录
- 恢复数据
- 更新服务配置
- 验证迁移结果

使用方法：
```batch
# 右键点击，以管理员身份运行
scripts\windows\migrate-database-to-j-drive.bat
```

#### Linux 版本
**文件**: `scripts/migrate-database-to-j-drive.sh`

功能：
- 检测现有数据库
- 创建 J 盘挂载点
- 备份数据库
- 迁移数据文件
- 更新配置
- 验证迁移

使用方法：
```bash
sudo bash scripts/migrate-database-to-j-drive.sh
```

---

### 3. 新增文档

#### DATABASE_J_DRIVE.md
完整的 J 盘数据库配置文档，包含：
- 配置说明
- 目录结构
- 管理操作
- 备份与恢复
- 监控与维护
- 性能优化
- 安全配置
- 故障排除

#### DATABASE_QUICK_REFERENCE.md
J 盘数据库快速参考卡片，包含：
- 配置信息
- 快速命令
- 目录结构
- 常用 SQL
- 迁移脚本
- 备份计划
- 故障排查

---

## 🚀 使用指南

### 首次部署到 J 盘

#### Windows 系统

1. **确保 J 盘可用**
   - 确认 J 盘已正确挂载
   - 确保有足够的磁盘空间

2. **运行迁移脚本**
   ```batch
   # 右键点击，以管理员身份运行
   scripts\windows\migrate-database-to-j-drive.bat
   ```

3. **验证迁移**
   ```batch
   # 检查服务状态
   sc query postgresql-x64-14
   
   # 检查数据目录
   dir J:\postgresql\data
   
   # 测试连接
   "C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres
   ```

#### Linux 系统

1. **确保 J 盘可用**
   ```bash
   # 挂载 J 盘
   sudo mount /dev/sdX1 /mnt/j
   
   # 验证挂载
   df -h /mnt/j
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
   sudo -u postgres psql
   ```

---

## 📊 迁移后的配置

### 目录结构

```
J:/
└── postgresql/
    ├── data/          # 数据库数据文件
    │   ├── base/
    │   ├── global/
    │   ├── pg_wal/
    │   └── postgresql.conf
    └── backups/       # 数据库备份
        └── postgres_backup_*.sql
```

### 环境变量

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump
POSTGRES_DATA_DIR=J:/postgresql/data
POSTGRES_BACKUP_DIR=J:/postgresql/backups
```

---

## ⚠️ 重要注意事项

### 1. 数据库连接

应用程序的连接字符串保持不变：
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump
```

数据目录的迁移不影响应用程序连接。

### 2. 备份策略

- 迁移脚本会自动创建完整备份
- 备份文件保存在 `J:/postgresql/backups/`
- 建议在迁移后验证备份完整性

### 3. 磁盘空间

- 确保 J 盘有足够的可用空间（建议至少 10GB）
- 定期清理旧备份文件
- 监控磁盘使用情况

### 4. 权限设置

- Windows: 确保 postgres 用户对 J 盘有读写权限
- Linux: 确保正确的文件权限（700）

---

## 🔧 后续维护

### 定期备份

创建自动备份脚本（Windows）：

```batch
@echo off
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=J:\postgresql\backups\lovato_pump_%TIMESTAMP%.sql

"C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -U postgres lovato_pump > %BACKUP_FILE%
echo Backup completed: %BACKUP_FILE%
```

设置 Windows 任务计划程序每天自动运行。

### 监控

- 定期检查服务状态
- 监控磁盘使用情况
- 查看数据库日志
- 检查备份完整性

---

## 📚 相关文档

| 文档 | 说明 |
|-----|------|
| [DATABASE_J_DRIVE.md](./DATABASE_J_DRIVE.md) | 完整的 J 盘数据库配置文档 |
| [DATABASE_QUICK_REFERENCE.md](./DATABASE_QUICK_REFERENCE.md) | 快速参考卡片 |
| [README.md](./README.md) | 项目主页 |
| [WINDOWS_DEPLOYMENT.md](./WINDOWS_DEPLOYMENT.md) | Windows 部署指南 |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Linux 部署指南 |

---

## 🆘 获取帮助

### 遇到问题？

1. **查看日志**
   - Windows: `type "J:\postgresql\data\log\postgresql-*.log"`
   - Linux: `sudo journalctl -u postgresql -n 50`

2. **检查服务状态**
   - Windows: `sc query postgresql-x64-14`
   - Linux: `sudo systemctl status postgresql`

3. **查看文档**
   - [DATABASE_J_DRIVE.md](./DATABASE_J_DRIVE.md) - 故障排除章节
   - [DATABASE_QUICK_REFERENCE.md](./DATABASE_QUICK_REFERENCE.md) - 快速命令

---

## ✅ 检查清单

迁移完成后，请确认：

- [ ] 服务正常运行
- [ ] 数据目录在 J 盘
- [ ] 备份文件已创建
- [ ] 应用程序可正常连接
- [ ] 数据完整性验证通过
- [ ] 旧数据目录已备份（可选）

---

## 📞 支持

如有问题，请：
1. 查阅相关文档
2. 检查日志文件
3. 联系技术支持

---

**更新完成！** 🎉

数据库已成功配置为使用 J 盘存储。所有迁移脚本和文档都已准备就绪，可以开始使用。
