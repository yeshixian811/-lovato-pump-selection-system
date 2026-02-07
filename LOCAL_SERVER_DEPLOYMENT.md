# 🏠 本地Windows服务器部署指南

## 📌 您的位置：本地Windows服务器

**目标**: 将PostgreSQL数据库迁移到本地Windows服务器的J盘

---

## ✅ 前提条件检查

在开始之前，请确认您的本地服务器满足以下条件：

### 必须满足
- [ ] ✅ 操作系统：Windows Server 2016/2019/2022 或 Windows 10/11
- [ ] ✅ PostgreSQL已安装（建议版本14+）
- [ ] ✅ J盘已挂载并可访问
- [ ] ✅ J盘有足够空间（建议至少10GB）
- [ ] ✅ 有Administrator权限
- [ ] ✅ 已选择业务低峰期

### 检查命令

打开**命令提示符（管理员）**，执行以下命令检查：

```batch
# 1. 检查操作系统
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"

# 2. 检查J盘
dir J:\

# 3. 检查J盘空间
wmic logicaldisk where "DeviceID='J:'" get FreeSpace,Size

# 4. 检查PostgreSQL服务
sc query postgresql-x64-14

# 5. 检查PostgreSQL安装
"C:\Program Files\PostgreSQL\14\bin\psql.exe" --version
```

---

## 🚀 快速执行（5步完成）

### 步骤 1: 打开命令提示符（管理员）

1. 按 `Win + X` 键
2. 选择"命令提示符 (管理员)"或"Windows PowerShell (管理员)"

### 步骤 2: 检查环境

```batch
# 检查J盘
dir J:\

# 检查空间
wmic logicaldisk where "DeviceID='J:'" get FreeSpace,Size

# 检查PostgreSQL服务
sc query postgresql-x64-14
```

**预期结果**:
- J盘可访问
- J盘有足够空间（≥10GB）
- PostgreSQL服务状态：RUNNING

### 步骤 3: 创建备份

```batch
# 创建备份目录
mkdir J:\postgresql\backups

# 创建完整备份
"C:\Program Files\PostgreSQL\14\bin\pg_dumpall.exe" -U postgres > J:\postgresql\backups\backup_%date:~0,4%%date:~5,2%%date:~8,2%.sql

# 验证备份文件
dir J:\postgresql\backups\
```

### 步骤 4: 执行迁移

```batch
# 停止PostgreSQL服务
net stop postgresql-x64-14

# 创建数据目录
mkdir J:\postgresql\data

# 初始化数据目录
"C:\Program Files\PostgreSQL\14\bin\initdb.exe" -D "J:\postgresql\data" -U postgres -E UTF8 --locale=C

# 复制旧数据（可选，如果没有新数据）
# xcopy "C:\Program Files\PostgreSQL\14\data" "J:\postgresql\data\" /E /I /H /Y

# 更新服务配置
sc config postgresql-x64-14 binPath= "\"C:\Program Files\PostgreSQL\14\bin\pg_ctl.exe\" runservice -N \"postgresql-x64-14\" -D \"J:\postgresql\data\" -w"

# 启动PostgreSQL服务
net start postgresql-x64-14
```

### 步骤 5: 验证迁移

```batch
# 检查服务状态
sc query postgresql-x64-14

# 测试数据库连接
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -c "SELECT version();"

# 检查数据目录
dir J:\postgresql\data
```

---

## 📊 完整执行步骤（详细版）

### 阶段 1: 环境检查（2分钟）

```batch
REM 检查J盘
dir J:\
REM 如果显示"找不到路径"，说明J盘未挂载，需要先挂载

REM 检查J盘空间
wmic logicaldisk where "DeviceID='J:'" get FreeSpace,Size
REM 确保FreeSpace > 10GB

REM 检查PostgreSQL服务
sc query postgresql-x64-14
REM 应该显示 STATE: 4 RUNNING

REM 检查PostgreSQL版本
"C:\Program Files\PostgreSQL\14\bin\psql.exe" --version
```

### 阶段 2: 创建备份（3-5分钟）

```batch
REM 创建目录结构
mkdir J:\postgresql
mkdir J:\postgresql\data
mkdir J:\postgresql\backups
mkdir J:\postgresql\backups\config

REM 备份所有数据库
"C:\Program Files\PostgreSQL\14\bin\pg_dumpall.exe" -U postgres > J:\postgresql\backups\full_backup_%date:~0,4%%date:~5,2%%date:~8,2%.sql

REM 备份配置文件
copy "C:\Program Files\PostgreSQL\14\data\postgresql.conf" J:\postgresql\backups\config\
copy "C:\Program Files\PostgreSQL\14\data\pg_hba.conf" J:\postgresql\backups\config\

REM 验证备份
dir J:\postgresql\backups\
```

### 阶段 3: 停止服务（1分钟）

```batch
REM 停止PostgreSQL服务
net stop postgresql-x64-14

REM 等待服务完全停止
timeout /t 3

REM 验证服务已停止
sc query postgresql-x64-14
REM 应该显示 STATE: 1 STOPPED
```

### 阶段 4: 迁移数据（5-10分钟）

```batch
REM 检查旧数据目录
dir "C:\Program Files\PostgreSQL\14\data"

REM 选项A: 复制现有数据（推荐）
REM 这会保留所有现有数据
xcopy "C:\Program Files\PostgreSQL\14\data" "J:\postgresql\data\" /E /I /H /Y

REM 选项B: 初始化新数据库（如果需要全新安装）
REM "C:\Program Files\PostgreSQL\14\bin\initdb.exe" -D "J:\postgresql\data" -U postgres -E UTF8 --locale=C

REM 设置权限
icacls "J:\postgresql\data" /grant "postgres:(OI)(CI)F" /T

REM 验证数据复制完成
dir J:\postgresql\data
REM 应该看到 PG_VERSION, base, global 等文件和目录
```

### 阶段 5: 更新配置（1分钟）

```batch
REM 查看当前服务配置
sc qc postgresql-x64-14

REM 更新服务配置以指向新的数据目录
sc config postgresql-x64-14 binPath= "\"C:\Program Files\PostgreSQL\14\bin\pg_ctl.exe\" runservice -N \"postgresql-x64-14\" -D \"J:\postgresql\data\" -w"

REM 设置服务描述
sc description postgresql-x64-14 "PostgreSQL Database Server - Data on J: drive"
```

### 阶段 6: 启动服务（1分钟）

```batch
REM 启动PostgreSQL服务
net start postgresql-x64-14

REM 等待服务启动
timeout /t 5

REM 检查服务状态
sc query postgresql-x64-14
REM 应该显示 STATE: 4 RUNNING
```

### 阶段 7: 验证迁移（2分钟）

```batch
REM 测试1: 检查服务状态
sc query postgresql-x64-14

REM 测试2: 连接数据库
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -c "SELECT version();"

REM 测试3: 查看数据库列表
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -l

REM 测试4: 检查数据完整性
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -d lovato_pump -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

---

## ✅ 验证清单

迁移成功后，请确认以下所有项：

### 服务状态
- [ ] PostgreSQL服务运行正常
- [ ] 服务类型：RUNNING

### 数据目录
- [ ] 数据目录存在：J:\postgresql\data
- [ ] 包含必要文件：PG_VERSION, base, global, pg_wal
- [ ] 配置文件存在：postgresql.conf, pg_hba.conf

### 数据库连接
- [ ] 可以使用psql连接
- [ ] 可以执行SQL查询
- [ ] 版本信息正确

### 数据完整性
- [ ] 所有数据库存在
- [ ] lovato_pump数据库存在
- [ ] 表数量正确
- [ ] 数据无丢失

### 应用程序
- [ ] 可以正常访问应用
- [ ] 用户登录正常
- [ ] 数据查询正常
- [ ] 数据写入正常

---

## 🔧 常见问题解决

### 问题 1: J盘不存在

**症状**: `dir J:\` 显示"找不到路径"

**解决**:
```batch
REM 检查所有可用驱动器
wmic logicaldisk get DeviceID,VolumeName,Size,FreeSpace

REM 如果J盘未挂载，需要先在Windows中挂载J盘
REM 或者使用其他可用的驱动器（如D:、E:等）
REM 修改所有命令中的 J: 为实际可用的驱动器
```

### 问题 2: 服务启动失败

**症状**: `net start postgresql-x64-14` 失败

**解决**:
```batch
REM 查看详细错误
type "J:\postgresql\data\log\postgresql-*.log"

REM 常见原因：
REM 1. 权限问题 - 设置正确权限
icacls "J:\postgresql\data" /grant "postgres:(OI)(CI)F" /T

REM 2. 端口占用 - 检查端口5432
netstat -ano | findstr :5432

REM 3. 配置错误 - 检查postgresql.conf
type "J:\postgresql\data\postgresql.conf" | findstr data_directory
```

### 问题 3: 数据丢失

**症状**: 迁移后数据丢失

**解决**:
```batch
REM 从备份恢复
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres < J:\postgresql\backups\full_backup_YYYYMMDD.sql
```

### 问题 4: 需要回滚

**症状**: 迁移失败或出现问题

**回滚步骤**:
```batch
REM 1. 停止服务
net stop postgresql-x64-14

REM 2. 恢复原始配置
sc config postgresql-x64-14 binPath= "\"C:\Program Files\PostgreSQL\14\bin\pg_ctl.exe\" runservice -N \"postgresql-x64-14\" -D \"C:\Program Files\PostgreSQL\14\data\" -w"

REM 3. 启动服务
net start postgresql-x64-14

REM 4. 验证服务
sc query postgresql-x64-14
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -c "SELECT version();"
```

---

## 📝 执行记录

请在执行时记录以下信息：

```
迁移执行记录
============

服务器信息:
  操作系统: _______________________
  J盘可用空间: _____________________
  PostgreSQL版本: ___________________

执行时间:
  开始时间: _______________________
  结束时间: _______________________
  总耗时: _____________________分钟

备份信息:
  备份文件: J:\postgresql\backups\full_backup______.sql
  备份大小: _____________________MB

验证结果:
  [ ] 服务运行正常
  [ ] 数据目录正确
  [ ] 数据库连接成功
  [ ] 数据完整性通过
  [ ] 应用程序正常

遇到的问题: ______________________________
解决方案: ______________________________
```

---

## 🎯 立即执行

### 完整命令序列（复制粘贴）

```batch
@echo off
echo 开始迁移PostgreSQL到J盘...
echo.

REM 检查J盘
echo [1/7] 检查J盘...
dir J:\
if errorlevel 1 (
    echo 错误：J盘不存在！
    pause
    exit /b 1
)

REM 创建备份
echo [2/7] 创建备份...
mkdir J:\postgresql\backups
"C:\Program Files\PostgreSQL\14\bin\pg_dumpall.exe" -U postgres > J:\postgresql\backups\backup_%date:~0,4%%date:~5,2%%date:~8,2%.sql

REM 停止服务
echo [3/7] 停止服务...
net stop postgresql-x64-14
timeout /t 3

REM 创建目录
echo [4/7] 创建数据目录...
mkdir J:\postgresql\data

REM 复制数据
echo [5/7] 复制数据...
xcopy "C:\Program Files\PostgreSQL\14\data" "J:\postgresql\data\" /E /I /H /Y

REM 更新配置
echo [6/7] 更新服务配置...
sc config postgresql-x64-14 binPath= "\"C:\Program Files\PostgreSQL\14\bin\pg_ctl.exe\" runservice -N \"postgresql-x64-14\" -D \"J:\postgresql\data\" -w"

REM 启动服务
echo [7/7] 启动服务...
net start postgresql-x64-14
timeout /t 5

REM 验证
echo 验证迁移结果...
sc query postgresql-x64-14
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -c "SELECT version();"

echo.
echo 迁移完成！
pause
```

将上述命令保存为 `migrate-to-j-drive.bat`，然后以管理员身份运行。

---

## ✅ 完成后

### 清理旧数据（可选）

确认迁移成功后，可以删除旧数据：

```batch
REM 1. 再次确认服务正常运行
sc query postgresql-x64-14

REM 2. 备份旧数据到其他位置
xcopy "C:\Program Files\PostgreSQL\14\data" "D:\backup\old_postgres_data" /E /I /H /Y

REM 3. 删除旧数据（谨慎！）
REM rmdir /s /q "C:\Program Files\PostgreSQL\14\data"
```

### 更新应用程序配置

如果需要，更新应用程序的数据库连接配置：

```env
# .env 文件
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump
POSTGRES_DATA_DIR=J:\postgresql\data
POSTGRES_BACKUP_DIR=J:\postgresql\backups
```

---

## 📞 需要帮助？

如果遇到问题：

1. **查看日志**: `type "J:\postgresql\data\log\postgresql-*.log"`
2. **检查服务**: `sc query postgresql-x64-14`
3. **使用回滚**: 按照上面的回滚步骤执行
4. **查看文档**: 参考 `MIGRATION_EXECUTION_GUIDE.md`

---

**现在可以在您的本地Windows服务器上执行这些命令了！** 🚀

**预计耗时**: 10-25分钟  
**风险等级**: 低（有完整备份）  
**预计结果**: 数据库成功迁移到J盘
