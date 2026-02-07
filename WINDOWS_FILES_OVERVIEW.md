# 📁 Windows 本地安装 - 完整文件清单

## 🎯 目标

在您的 Windows 本地电脑上安装洛瓦托智能水泵选型系统。

---

## 📦 创建的 Windows 专用文件

### 📖 安装文档

#### 1. **WINDOWS_INSTALLATION_GUIDE.md**
**用途**: 完整的 Windows 安装指南

**包含内容**:
- 详细的系统要求
- 5步安装流程（每步都有详细说明）
- Node.js 安装步骤
- pnpm 安装步骤
- PostgreSQL 安装步骤（含 J 盘配置）
- 数据库配置和迁移
- 常用命令大全
- 6个常见问题的解决方案
- 项目结构说明

**适用人群**: 初学者和高级用户
**预计阅读时间**: 15分钟

---

#### 2. **WINDOWS_QUICK_START.md**
**用途**: 快速安装和启动指南

**包含内容**:
- 3分钟快速安装（自动化脚本）
- 15分钟手动安装
- 快速验证命令
- 常用命令速查
- 常见问题快速解决
- 系统要求
- 安装检查清单

**适用人群**: 所有用户
**预计阅读时间**: 3分钟

---

#### 3. **WINDOWS_INSTALLATION_CHECKLIST.md**
**用途**: 安装检查清单

**包含内容**:
- 10个部分的检查项（共71项）
- 环境准备检查
- 软件安装验证
- 数据库配置检查
- 功能测试清单
- 完成度统计
- 3个完成标准（60%/80%/100%）

**适用人群**: 需要逐步验证的用户
**预计阅读时间**: 5分钟

---

### 🛠️ 安装和启动脚本

#### 4. **install-local.bat** ✨
**用途**: Windows 自动化安装脚本

**功能**:
- 检查管理员权限
- 检查系统环境
- 检查 Node.js
- 检查 PostgreSQL
- 安装 pnpm
- 配置数据库
- 运行数据库迁移
- 创建 .env 文件
- 安装项目依赖
- 验证安装结果

**使用方法**:
```batch
# 右键点击，选择"以管理员身份运行"
install-local.bat
```

**预计时间**: 10-15分钟

**优点**:
- 自动化程度高
- 详细的进度显示
- 完整的错误提示
- 自动验证安装结果

---

#### 5. **start-windows.bat** ✨
**用途**: 一键启动应用

**功能**:
- 检查 Node.js
- 检查 pnpm
- 检查依赖
- 检查 .env 配置
- 检查 PostgreSQL 服务
- 检查数据库连接
- 启动开发服务器
- 显示访问地址

**使用方法**:
```batch
# 双击运行或在命令提示符中运行
start-windows.bat
```

**预计时间**: 10-30秒

**优点**:
- 自动检查所有依赖
- 自动启动服务
- 详细的错误提示
- 用户友好的界面

---

#### 6. **diagnose.bat** 🔧
**用途**: 环境诊断工具

**功能**:
- 检查操作系统
- 检查 Node.js
- 检查 npm
- 检查 pnpm
- 检查 PostgreSQL
- 检查服务状态
- 检查数据库连接
- 检查项目文件
- 检查端口占用
- 检查磁盘空间
- 检查内存
- 提供诊断建议

**使用方法**:
```batch
# 双击运行
diagnose.bat
```

**预计时间**: 10秒

**优点**:
- 快速诊断问题
- 评分系统（0-8分）
- 提供修复建议
- 可选择操作

---

## 🚀 快速开始（3种方式）

### 方式 1: 完全自动化（推荐）

```batch
# 步骤 1: 运行安装脚本（以管理员身份）
install-local.bat

# 步骤 2: 启动应用
start-windows.bat

# 步骤 3: 打开浏览器
# http://localhost:5000
```

**预计时间**: 15-20分钟
**适合人群**: 初学者、快速验证

---

### 方式 2: 快速手动安装

```batch
# 步骤 1: 安装 Node.js
# 访问 https://nodejs.org/ 下载并安装

# 步骤 2: 安装 pnpm
npm install -g pnpm

# 步骤 3: 安装 PostgreSQL
# 访问 https://www.postgresql.org/download/windows/ 下载并安装
# 密码设置为: postgres

# 步骤 4: 配置数据库
psql -U postgres -c "CREATE DATABASE lovato_pump;"
psql -U postgres -d lovato_pump < migrations\001_add_membership_tables.sql

# 步骤 5: 安装依赖
pnpm install

# 步骤 6: 创建配置
copy .env.example .env

# 步骤 7: 启动应用
pnpm run dev
```

**预计时间**: 20-30分钟
**适合人群**: 有一定经验的用户

---

### 方式 3: 详细手动安装

参考 **WINDOWS_INSTALLATION_GUIDE.md**，按照5步详细流程安装。

**预计时间**: 30-45分钟
**适合人群**: 喜欢详细了解每一步的用户

---

## 📋 使用流程

### 初次安装

```
1. 阅读 WINDOWS_QUICK_START.md (3分钟)
   ↓
2. 运行 diagnose.bat 诊断环境 (10秒)
   ↓
3. 运行 install-local.bat 自动安装 (15分钟)
   ↓
4. 运行 start-windows.bat 启动应用 (30秒)
   ↓
5. 访问 http://localhost:5000 (立即)
```

### 日常使用

```
1. 打开命令提示符
   ↓
2. 进入项目目录
   cd lovato-pump-selection
   ↓
3. 运行启动脚本
   start-windows.bat
   ↓
4. 打开浏览器
   http://localhost:5000
```

### 遇到问题

```
1. 运行 diagnose.bat 诊断 (10秒)
   ↓
2. 查看诊断结果和修复建议
   ↓
3. 根据建议修复问题
   ↓
4. 重新运行 diagnose.bat 验证
   ↓
5. 如果仍无法解决，查看详细文档
```

---

## ✅ 验证安装

### 自动验证

运行 **diagnose.bat**，查看完成度：

- **8/8**: 完美！所有检查通过
- **6-7/8**: 基本就绪，可以启动
- **4-5/8**: 需要配置
- **0-3/8**: 需要完整安装

### 手动验证

```batch
# 1. 检查 Node.js
node --version

# 2. 检查 pnpm
pnpm --version

# 3. 检查 PostgreSQL
psql --version

# 4. 检查服务
sc query postgresql-x64-14

# 5. 检查数据库
psql -U postgres -d lovato_pump -c "\dt"

# 6. 访问应用
# 打开浏览器: http://localhost:5000
```

---

## 📚 文档导航

### 根据需求选择文档

| 需求 | 推荐文档 | 阅读时间 |
|------|----------|----------|
| 快速了解系统 | WINDOWS_QUICK_START.md | 3分钟 |
| 详细安装步骤 | WINDOWS_INSTALLATION_GUIDE.md | 15分钟 |
| 逐步验证安装 | WINDOWS_INSTALLATION_CHECKLIST.md | 5分钟 |
| 了解文件结构 | FILES_CHECKLIST.md | 5分钟 |

---

## 🎯 文件说明速查

| 文件 | 类型 | 用途 | 何时使用 |
|------|------|------|----------|
| WINDOWS_INSTALLATION_GUIDE.md | 文档 | 详细安装指南 | 初次安装、学习系统 |
| WINDOWS_QUICK_START.md | 文档 | 快速开始指南 | 快速上手、日常参考 |
| WINDOWS_INSTALLATION_CHECKLIST.md | 文档 | 安装检查清单 | 验证安装、测试环境 |
| install-local.bat | 脚本 | 自动安装脚本 | 自动化安装 |
| start-windows.bat | 脚本 | 启动脚本 | 日常启动应用 |
| diagnose.bat | 脚本 | 诊断工具 | 问题诊断、环境检查 |

---

## 🔧 故障排除

### 问题 1: 脚本无法运行

**症状**: 双击 .bat 文件无反应或窗口闪退

**解决**:
1. 右键点击脚本
2. 选择"以管理员身份运行"
3. 或在命令提示符中运行

---

### 问题 2: 安装失败

**解决步骤**:
1. 运行 `diagnose.bat` 查看环境状态
2. 根据诊断结果修复问题
3. 重新运行 `install-local.bat`
4. 如果仍失败，参考 **WINDOWS_INSTALLATION_GUIDE.md** 的故障排除部分

---

### 问题 3: 无法启动应用

**解决步骤**:
1. 运行 `diagnose.bat` 检查环境
2. 确认所有检查通过
3. 检查端口 5000 是否被占用
4. 运行 `start-windows.bat` 启动

---

### 问题 4: 数据库连接失败

**解决步骤**:
1. 确认 PostgreSQL 服务运行: `net start postgresql-x64-14`
2. 确认数据库存在: `psql -U postgres -l`
3. 确认密码正确（应为 postgres）
4. 运行迁移: `psql -U postgres -d lovato_pump < migrations\001_add_membership_tables.sql`

---

## 💡 使用技巧

### 技巧 1: 创建桌面快捷方式

1. 右键点击 `start-windows.bat`
2. 选择"创建快捷方式"
3. 将快捷方式移动到桌面
4. 以后双击即可启动

### 技巧 2: 固定到任务栏

1. 将 `start-windows.bat` 的快捷方式拖到任务栏
2. 以后一键启动

### 技巧 3: 自动检查环境

每次启动前运行 `diagnose.bat`，确保环境正常。

### 技巧 4: 保存常用命令

创建一个批处理文件 `常用命令.bat`:

```batch
@echo off
echo 常用命令:
echo.
echo 1. 启动应用: start-windows.bat
echo 2. 诊断环境: diagnose.bat
echo 3. 启动PostgreSQL: net start postgresql-x64-14
echo 4. 停止PostgreSQL: net stop postgresql-x64-14
echo 5. 连接数据库: psql -U postgres -d lovato_pump
echo.
pause
```

---

## 📊 完成度评估

### 完美安装（8/8）

✅ Node.js 已安装
✅ pnpm 已安装
✅ PostgreSQL 已安装
✅ 服务运行中
✅ 数据库连接成功
✅ package.json 存在
✅ .env 配置存在
✅ 依赖已安装

**状态**: 可以立即使用！

---

## 🎉 总结

您现在拥有完整的 Windows 安装方案：

### 文档
- ✅ 详细安装指南
- ✅ 快速开始指南
- ✅ 安装检查清单

### 工具
- ✅ 自动安装脚本
- ✅ 一键启动脚本
- ✅ 环境诊断工具

### 支持
- ✅ 故障排除指南
- ✅ 常见问题解答
- ✅ 使用技巧

---

## 🚀 现在开始

### 推荐流程

1. **快速了解** (3分钟)
   - 阅读 `WINDOWS_QUICK_START.md`

2. **诊断环境** (10秒)
   - 运行 `diagnose.bat`

3. **开始安装** (15分钟)
   - 运行 `install-local.bat`

4. **启动应用** (30秒)
   - 运行 `start-windows.bat`

5. **访问系统** (立即)
   - http://localhost:5000

**预计总时间**: 20分钟

---

## 📞 获取帮助

如果需要帮助：

1. **查看文档**: 参考 Windows 相关文档
2. **运行诊断**: 使用 `diagnose.bat`
3. **检查清单**: 使用 `WINDOWS_INSTALLATION_CHECKLIST.md`
4. **搜索问题**: 查看常见问题部分

---

**准备好了吗？开始您的 Windows 本地安装之旅吧！** 🚀
