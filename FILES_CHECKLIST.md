# 📦 本地安装 - 文件清单和使用说明

## 🎯 目标

在您的本地电脑上安装洛瓦托智能水泵选型系统，而不是在 Coze 编程的沙箱环境中。

---

## 📁 创建的文件

### 1. 安装指南文档

#### **LOCAL_PC_INSTALLATION_GUIDE.md** - 详细安装指南
- 适用于 Windows、macOS、Linux 三种操作系统
- 包含完整的安装步骤（5步快速安装）
- 每个步骤都有详细的说明和命令
- 包含故障排除和常见问题解决

#### **QUICK_START.md** - 快速开始指南
- 一键安装说明
- 快速验证步骤
- 常用命令速查
- 系统要求清单

### 2. 自动化安装脚本

#### **install-local.bat** - Windows 自动安装脚本
- 自动检查系统环境
- 引导安装 Node.js、PostgreSQL、pnpm
- 自动配置数据库
- 运行数据库迁移
- 安装项目依赖

**使用方法**:
```batch
# 右键点击，选择"以管理员身份运行"
install-local.bat
```

#### **install-local.sh** - Linux/Mac 自动安装脚本
- 检测操作系统类型
- 自动安装所需的软件
- 配置数据库和运行迁移
- 验证安装结果

**使用方法**:
```bash
bash install-local.sh
```

### 3. 快速启动脚本

#### **start.bat** - Windows 启动脚本
- 检查环境
- 启动 PostgreSQL 服务
- 启动开发服务器

**使用方法**:
```batch
start.bat
```

#### **start.sh** - Linux/Mac 启动脚本
- 检查环境
- 启动 PostgreSQL 服务
- 启动开发服务器

**使用方法**:
```bash
bash start.sh
```

---

## 🚀 快速开始（3步）

### Windows 用户

```batch
# 步骤 1: 运行安装脚本（以管理员身份）
install-local.bat

# 步骤 2: 启动系统
start.bat

# 步骤 3: 打开浏览器访问
# http://localhost:5000
```

### Linux/Mac 用户

```bash
# 步骤 1: 运行安装脚本
bash install-local.sh

# 步骤 2: 启动系统
bash start.sh

# 步骤 3: 打开浏览器访问
# http://localhost:5000
```

---

## 📋 手动安装步骤（高级用户）

如果您想手动控制每个步骤:

### 1. 安装 Node.js
- **Windows**: https://nodejs.org/ 下载 LTS 版本
- **Mac**: `brew install node`
- **Linux**: `sudo apt-get install -y nodejs`

### 2. 安装 pnpm
```bash
npm install -g pnpm
```

### 3. 安装 PostgreSQL
- **Windows**: https://www.postgresql.org/download/windows/
- **Mac**: `brew install postgresql@14`
- **Linux**: `sudo apt-get install -y postgresql postgresql-contrib`

### 4. 配置数据库
```bash
# Windows
psql -U postgres -c "CREATE DATABASE lovato_pump;"
psql -U postgres -d lovato_pump < migrations/001_add_membership_tables.sql

# Linux/Mac
sudo -u postgres createdb lovato_pump
sudo -u postgres psql -d lovato_pump < migrations/001_add_membership_tables.sql
```

### 5. 安装依赖
```bash
pnpm install
```

### 6. 启动应用
```bash
pnpm run dev
```

---

## ✅ 验证安装

运行以下命令验证安装:

```bash
# 检查 Node.js
node --version

# 检查 pnpm
pnpm --version

# 检查 PostgreSQL
psql --version

# 检查数据库
psql -U postgres -d lovato_pump -c "\dt"

# 访问应用
# 打开浏览器: http://localhost:5000
```

---

## 📚 文档结构

```
本地安装相关文件:
├── LOCAL_PC_INSTALLATION_GUIDE.md   # 详细安装指南
├── QUICK_START.md                   # 快速开始指南
├── FILES_CHECKLIST.md               # 本文件（文件清单）
├── install-local.bat                # Windows 自动安装脚本
├── install-local.sh                 # Linux/Mac 自动安装脚本
├── start.bat                        # Windows 启动脚本
└── start.sh                         # Linux/Mac 启动脚本
```

---

## 🔍 文件说明

### LOCAL_PC_INSTALLATION_GUIDE.md
**用途**: 完整的安装文档
**包含**:
- 系统要求
- Windows/macOS/Linux 详细安装步骤
- 数据库配置
- 验证步骤
- 常见问题解决
- 项目结构说明

### QUICK_START.md
**用途**: 快速参考指南
**包含**:
- 一键安装说明
- 快速验证步骤
- 常用命令
- 检查清单

### install-local.bat
**用途**: Windows 自动安装
**功能**:
- 检查管理员权限
- 检查系统环境
- 引导安装 Node.js
- 引导安装 PostgreSQL
- 安装 pnpm
- 配置数据库
- 运行迁移
- 安装依赖

### install-local.sh
**用途**: Linux/Mac 自动安装
**功能**:
- 检测操作系统
- 自动安装 Node.js
- 自动安装 PostgreSQL
- 安装 pnpm
- 配置数据库
- 运行迁移
- 安装依赖
- 验证安装

### start.bat / start.sh
**用途**: 快速启动应用
**功能**:
- 检查环境
- 启动 PostgreSQL 服务
- 启动开发服务器
- 显示访问地址

---

## 🎯 使用建议

### 对于初学者
**推荐**: 使用自动化安装脚本

**Windows**:
```batch
install-local.bat
start.bat
```

**Linux/Mac**:
```bash
bash install-local.sh
bash start.sh
```

### 对于高级用户
**推荐**: 手动安装，参考详细文档

1. 阅读 `LOCAL_PC_INSTALLATION_GUIDE.md`
2. 按照步骤手动安装每个组件
3. 参考 `QUICK_START.md` 的命令

### 对于快速验证
**推荐**: 使用快速启动指南

1. 阅读 `QUICK_START.md`
2. 运行验证命令
3. 测试系统功能

---

## ❓ 常见问题

### Q1: 我应该使用哪个脚本？

**A**:
- **Windows 用户**: `install-local.bat`
- **Mac 用户**: `install-local.sh`
- **Linux 用户**: `install-local.sh`

### Q2: 脚本需要管理员权限吗？

**A**:
- **Windows**: 是的，需要以管理员身份运行
- **Linux/Mac**: 部分命令需要 sudo，脚本会自动处理

### Q3: 安装需要多长时间？

**A**:
- **自动化脚本**: 10-15分钟
- **手动安装**: 20-30分钟（取决于网络速度）

### Q4: 安装失败怎么办？

**A**:
1. 查看错误信息
2. 参考 `LOCAL_PC_INSTALLATION_GUIDE.md` 的故障排除部分
3. 手动执行失败的步骤

### Q5: 如何卸载？

**A**:
- **卸载 Node.js**: 系统设置 → 应用 → 卸载
- **卸载 PostgreSQL**: 系统设置 → 应用 → 卸载
- **删除项目文件夹**: 直接删除项目目录

---

## 📞 获取帮助

如果遇到问题:

1. **查看文档**:
   - `LOCAL_PC_INSTALLATION_GUIDE.md` - 详细说明
   - `QUICK_START.md` - 快速参考

2. **检查环境**:
   - 确认 Node.js 已安装
   - 确认 PostgreSQL 已安装并运行
   - 确认 pnpm 已安装

3. **验证安装**:
   - 运行验证命令
   - 检查服务状态
   - 查看错误日志

---

## ✨ 下一步

安装完成后，您可以:

1. **使用系统功能**:
   - 水泵智能选型
   - 用户注册/登录
   - 会员管理
   - 数据查询

2. **自定义开发**:
   - 修改代码
   - 添加新功能
   - 定制界面

3. **部署到生产**:
   - 构建生产版本
   - 部署到服务器
   - 配置域名

4. **查看更多文档**:
   - `README.md` - 项目介绍
   - `APP_README.md` - 功能说明
   - `MEMBERSHIP_GUIDE.md` - 会员功能

---

## 🎉 总结

您现在拥有完整的本地安装方案:

✅ 详细的安装指南
✅ 自动化安装脚本
✅ 快速启动脚本
✅ 验证步骤
✅ 故障排除文档

**选择一个方案开始安装吧！**

推荐: **使用自动化脚本（install-local.bat 或 install-local.sh）**

预计时间: **10-15分钟**

---

**准备好了吗？开始安装吧！** 🚀
