# ⚠️ 当前环境说明

## 📍 当前环境信息

**环境类型**: Linux 开发沙箱
**PostgreSQL**: 未安装
**J 盘**: 未挂载
**适用性**: ❌ 不适合执行实际数据库迁移

---

## 🔍 当前环境详情

```
系统: Linux vefaas-ve39yphh-7eylc1q881-d63g7203p5o9p786gb4g-sandbox
内核: 5.15.120.byteatom-ck.13
架构: x86_64

文件系统:
  - kataShared: 3.5T (1.8T 已用, 1.6T 可用)
  - s3fs: 16E (对象存储)
  
PostgreSQL: 未安装
J 盘: 未挂载
```

---

## ✅ 已准备好的文件

所有迁移脚本和文档已准备完成，可以在您的服务器上使用：

### Windows 服务器
```
scripts/windows/
├── migrate-database-to-j-drive.bat    # 迁移脚本
└── verify-migration.bat              # 验证脚本
```

### Linux 服务器
```
scripts/
├── migrate-database-to-j-drive.sh     # 迁移脚本
└── verify-migration.sh                # 验证脚本
```

---

## 🚀 在您的服务器上执行迁移

### 选项 1: Windows 服务器

#### 步骤 1: 连接到 Windows 服务器
- 使用 RDP 远程桌面连接
- 或使用 SSH（如果已启用）

#### 步骤 2: 下载或复制文件
```batch
# 将 scripts/windows/ 目录复制到服务器
# 例如：复制到 C:\Scripts\postgresql-migration\
```

#### 步骤 3: 执行迁移
```batch
# 1. 打开命令提示符（管理员）
# 按 Win + X，选择"命令提示符 (管理员)"

# 2. 进入脚本目录
cd C:\Scripts\postgresql-migration

# 3. 执行迁移脚本
migrate-database-to-j-drive.bat

# 4. 等待迁移完成（5-15分钟）

# 5. 验证迁移结果
verify-migration.bat

# 6. 重启应用程序
net start nodejs-service
```

---

### 选项 2: Linux 服务器

#### 步骤 1: 连接到 Linux 服务器
```bash
# 使用 SSH 连接
ssh user@your-server-ip
```

#### 步骤 2: 下载或复制文件
```bash
# 创建目录
mkdir -p ~/postgresql-migration

# 复制文件到服务器
scp -r scripts/* user@your-server-ip:~/postgresql-migration/

# 或使用 git 克隆（如果文件在仓库中）
git clone <your-repo-url>
cd <your-repo>
```

#### 步骤 3: 执行迁移
```bash
# 1. 进入脚本目录
cd ~/postgresql-migration

# 2. 赋予执行权限
chmod +x migrate-database-to-j-drive.sh
chmod +x verify-migration.sh

# 3. 确认 J 盘已挂载
df -h | grep j

# 如果未挂载，需要先挂载 J 盘
sudo mkdir -p /mnt/j
sudo mount /dev/sdX1 /mnt/j  # 替换为实际设备

# 4. 执行迁移
sudo bash migrate-database-to-j-drive.sh

# 5. 等待迁移完成（5-15分钟）

# 6. 验证迁移
sudo bash verify-migration.sh

# 7. 重启应用程序
sudo systemctl restart nodejs-service
# 或
pm2 restart all
```

---

## 📋 执行前检查清单

在服务器上执行迁移前，请确认：

### Windows 服务器
- [ ] 已以管理员身份登录
- [ ] J 盘已可访问
- [ ] J 盘有足够的可用空间（建议至少 10GB）
- [ ] PostgreSQL 服务正常运行
- [ ] 已创建完整备份
- [ ] 已选择业务低峰期
- [ ] 相关人员已通知

### Linux 服务器
- [ ] 已有 sudo/root 权限
- [ ] J 盘已正确挂载到 `/mnt/j`
- [ ] J 盘有足够的可用空间（建议至少 10GB）
- [ ] PostgreSQL 服务正常运行
- [ ] 已创建完整备份
- [ ] 已选择业务低峰期
- [ ] 相关人员已通知

---

## 📊 迁移执行流程

### 执行步骤总览

1. **准备阶段**（5-10分钟）
   - 连接到服务器
   - 检查环境
   - 创建备份

2. **迁移阶段**（5-15分钟）
   - 停止应用程序
   - 执行迁移脚本
   - 等待完成

3. **验证阶段**（2-3分钟）
   - 运行验证脚本
   - 检查结果
   - 确认无误

4. **恢复阶段**（2-3分钟）
   - 重启应用程序
   - 测试功能
   - 监控状态

**总计耗时**: 14-31分钟

---

## 🆘 如果需要帮助

### 查看文档

在服务器上，您可以参考以下文档：

- **执行指南**: `EXECUTE_MIGRATION_NOW.md`
- **详细步骤**: `MIGRATION_EXECUTION_GUIDE.md`
- **检查清单**: `MIGRATION_CHECKLIST.md`
- **快速参考**: `DATABASE_QUICK_REFERENCE.md`

### 常见问题

#### 问题 1: 找不到 J 盘

**Windows**:
```batch
dir J:\
```

**Linux**:
```bash
df -h | grep j
ls /mnt/j
```

#### 问题 2: 权限不足

**Windows**: 以管理员身份运行脚本

**Linux**: 使用 `sudo` 执行脚本

#### 问题 3: 需要回滚

参考 `MIGRATION_EXECUTION_GUIDE.md` 中的回滚方案

---

## 📞 紧急联系

如果遇到问题：

1. **查看日志**
   - Windows: `type "J:\postgresql\data\log\postgresql-*.log"`
   - Linux: `sudo journalctl -u postgresql -n 100`

2. **使用回滚方案**
   - 立即执行回滚
   - 恢复服务

3. **联系技术支持**
   - 提供错误日志
   - 描述问题详情

---

## ✅ 下一步行动

### 立即执行

1. **选择您的服务器类型**
   - Windows → 使用 `.bat` 脚本
   - Linux → 使用 `.sh` 脚本

2. **连接到服务器**
   - Windows: RDP 远程桌面
   - Linux: SSH 连接

3. **执行迁移**
   - Windows: `migrate-database-to-j-drive.bat`
   - Linux: `sudo bash migrate-database-to-j-drive.sh`

4. **验证结果**
   - Windows: `verify-migration.bat`
   - Linux: `sudo bash verify-migration.sh`

---

## 📝 迁移记录模板

请在迁移完成后填写：

```
迁移执行记录
================

服务器信息:
  服务器类型: [Windows / Linux]
  服务器IP: _________________
  J盘状态: [已确认 / 未确认]

执行信息:
  执行日期: _________________
  执行时间: _________________
  执行人员: _________________
  迁移耗时: _________________

备份信息:
  备份位置: _________________
  备份大小: _________________
  备份验证: [通过 / 失败]

验证结果:
  服务状态: [正常 / 异常]
  数据完整性: [通过 / 失败]
  功能测试: [通过 / 失败]

问题记录:
  问题描述: _________________
  解决方案: _________________

确认签名: _________________
```

---

## 🎉 准备完成

所有迁移文件和文档已准备完成，可以在您的服务器上执行迁移！

**立即开始**: 按照上述步骤连接到您的服务器并执行迁移

**预计耗时**: 14-31分钟

**风险等级**: 低（有完整备份和回滚方案）

**预期结果**: 数据库成功迁移到J盘，服务正常运行
