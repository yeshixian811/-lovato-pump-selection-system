# 🚀 本地Windows服务器部署 - 快速开始

## 📋 文件说明

### 主要文档
- **`LOCAL_SERVER_DEPLOYMENT.md`** - 详细的部署指南，包含完整的步骤说明和故障排除
- **`README-LOCAL-SERVER.md`** - 本文件，快速开始指南

### 执行脚本

所有脚本位于 `scripts/windows/` 目录，需要以**管理员身份**运行。

#### 1. **完整迁移脚本** - `migrate-to-j-drive-local.bat`
- 功能：完整的迁移流程，包含详细的状态显示和验证
- 适用场景：首次迁移，需要详细的执行过程
- 预计时间：15-25分钟

```batch
# 以管理员身份运行
scripts\windows\migrate-to-j-drive-local.bat
```

#### 2. **快速迁移脚本** - `quick-migrate.bat` ⭐ **推荐**
- 功能：简化版迁移，快速执行
- 适用场景：熟悉流程，需要快速完成
- 预计时间：10-15分钟

```batch
# 以管理员身份运行
scripts\windows\quick-migrate.bat
```

#### 3. **验证脚本** - `verify-migration.bat`
- 功能：验证迁移结果，检查所有关键项
- 适用场景：迁移完成后验证
- 预计时间：1-2分钟

```batch
# 以管理员身份运行
scripts\windows\verify-migration.bat
```

#### 4. **回滚脚本** - `rollback-migration.bat`
- 功能：回滚到原始配置
- 适用场景：迁移失败或需要恢复
- 预计时间：2-3分钟

```batch
# 以管理员身份运行
scripts\windows\rollback-migration.bat
```

---

## 🎯 快速执行（3步完成）

### 步骤 1: 准备工作（1分钟）

1. **以管理员身份**打开命令提示符
2. 检查J盘是否可用：
   ```batch
   dir J:\
   ```
3. 检查PostgreSQL服务：
   ```batch
   sc query postgresql-x64-14
   ```

### 步骤 2: 执行迁移（10-15分钟）

选择一个脚本运行：

**选项A: 快速迁移（推荐）**
```batch
cd /d %USERPROFILE%\Desktop\lovato-pump-selection
scripts\windows\quick-migrate.bat
```

**选项B: 完整迁移（详细）**
```batch
cd /d %USERPROFILE%\Desktop\lovato-pump-selection
scripts\windows\migrate-to-j-drive-local.bat
```

### 步骤 3: 验证结果（2分钟）

```batch
scripts\windows\verify-migration.bat
```

如果显示"✅ 验证通过"，迁移成功！

---

## ⚙️ 配置检查

### 确认PostgreSQL安装路径

默认路径：`C:\Program Files\PostgreSQL\14`

如果您的PostgreSQL安装在其他位置，请修改脚本中的路径：

```batch
# 在脚本中找到这一行
set POSTGRES_BIN=C:\Program Files\PostgreSQL\14\bin

# 修改为您的实际路径
set POSTGRES_BIN=D:\PostgreSQL\14\bin
```

### 确认服务名称

默认服务名：`postgresql-x64-14`

如果服务名不同，请修改：

```batch
# 在脚本中找到所有
postgresql-x64-14

# 替换为您的服务名
postgresql-14
```

---

## 📊 迁移流程

```
开始
  ↓
检查环境（J盘、服务、权限）
  ↓
创建备份
  ↓
停止PostgreSQL服务
  ↓
复制数据到J盘
  ↓
更新服务配置
  ↓
启动PostgreSQL服务
  ↓
验证迁移结果
  ↓
完成
```

---

## ✅ 验证清单

迁移成功后，确认以下所有项：

- [ ] PostgreSQL服务状态：RUNNING
- [ ] 数据目录：`J:\postgresql\data`
- [ ] 可以连接数据库
- [ ] 可以执行SQL查询
- [ ] 数据库列表正常
- [ ] lovato_pump数据库存在
- [ ] 数据完整性正常

---

## 🔧 故障排除

### 问题 1: J盘不存在

**症状**：`dir J:\` 显示"找不到路径"

**解决方案**：
1. 检查J盘是否正确挂载
2. 或者修改脚本使用其他可用驱动器（如D:、E:等）

### 问题 2: 服务启动失败

**症状**：迁移后服务无法启动

**解决方案**：
```batch
# 查看日志
type "J:\postgresql\data\log\postgresql-*.log"

# 检查权限
icacls "J:\postgresql\data" /grant "postgres:(OI)(CI)F" /T

# 如果仍然失败，运行回滚
scripts\windows\rollback-migration.bat
```

### 问题 3: 权限错误

**症状**：提示"需要管理员权限"

**解决方案**：
1. 右键点击脚本
2. 选择"以管理员身份运行"
3. 确认UAC提示时选择"是"

### 问题 4: 数据丢失

**症状**：迁移后数据不完整

**解决方案**：
```batch
# 从备份恢复
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres < J:\postgresql\backups\backup_YYYYMMDD_HHMMSS.sql
```

---

## 📁 目录结构

迁移后的目录结构：

```
J:\
└── postgresql\
    ├── data\              # 数据目录
    │   ├── base\
    │   ├── global\
    │   ├── pg_wal\
    │   ├── PG_VERSION
    │   ├── postgresql.conf
    │   └── pg_hba.conf
    └── backups\           # 备份目录
        ├── backup_20250114_103030.sql
        ├── postgresql.conf
        └── pg_hba.conf
```

---

## 🎯 迁移后操作

### 1. 更新应用程序配置

如果应用程序需要知道数据库路径，更新配置：

```env
# .env 文件
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump
POSTGRES_DATA_DIR=J:\postgresql\data
POSTGRES_BACKUP_DIR=J:\postgresql\backups
```

### 2. 重启应用程序

```batch
# 重启Node.js应用
net stop nodejs-service
net start nodejs-service

# 或者重启其他相关服务
```

### 3. 测试应用程序

访问 `http://localhost:5000` 测试：
- [ ] 应用可以正常打开
- [ ] 用户登录正常
- [ ] 数据查询正常
- [ ] 数据写入正常

### 4. 清理旧数据（可选）

确认一切正常后，可以删除旧数据：

```batch
# 1. 先备份到其他位置
xcopy "C:\Program Files\PostgreSQL\14\data" "D:\backup\old_postgres_data" /E /I /H /Y

# 2. 然后删除（谨慎！）
rmdir /s /q "C:\Program Files\PostgreSQL\14\data"
```

---

## 📞 获取帮助

如果遇到问题：

1. **查看日志**：`type "J:\postgresql\data\log\postgresql-*.log"`
2. **检查服务**：`sc query postgresql-x64-14`
3. **运行验证**：`scripts\windows\verify-migration.bat`
4. **查看详细文档**：`LOCAL_SERVER_DEPLOYMENT.md`
5. **执行回滚**：`scripts\windows\rollback-migration.bat`

---

## 📝 执行记录

建议记录执行信息：

```
迁移执行记录
============

服务器: 本地Windows服务器
执行时间: ______
操作员: ______
脚本: quick-migrate.bat

迁移前:
  J盘可用空间: ______ GB
  PostgreSQL版本: ______

迁移后:
  数据目录: J:\postgresql\data
  备份文件: J:\postgresql\backups\backup_YYYYMMDD_HHMMSS.sql
  备份大小: ______ MB

验证结果:
  [ ] 服务正常
  [ ] 数据完整
  [ ] 应用正常

备注: ______
```

---

## ✅ 准备好了？

现在您可以开始迁移了！

1. 以管理员身份运行 `scripts\windows\quick-migrate.bat`
2. 等待完成（10-15分钟）
3. 运行 `scripts\windows\verify-migration.bat` 验证
4. 测试应用程序

**祝迁移顺利！** 🚀
