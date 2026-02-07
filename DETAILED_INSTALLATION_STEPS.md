# 📝 详细安装步骤指南

## 🎯 当前进度

✅ 第1步：安装 Node.js - **已完成**

⬇️ 继续下一步...

---

## 第2步：安装 pnpm（预计时间：1分钟）

### 步骤说明：

#### 1. 打开命令提示符（管理员）
- 按 `Win + X` 键
- 选择"终端管理员"或"命令提示符(管理员)"
- 点击"是"确认

#### 2. 安装 pnpm

在命令提示符中输入以下命令：

```batch
npm install -g pnpm
```

#### 3. 等待安装完成
- 安装过程需要1-2分钟
- 屏幕会显示下载进度
- 看到类似输出表示成功：
  ```
  added 1 package in 2s
  ```

#### 4. 验证安装

输入命令：

```batch
pnpm --version
```

应该显示：`9.0.0` 或更高版本

---

### ⚠️ 常见问题

**问题**: 安装失败，提示权限错误

**解决**:
1. 确保以管理员身份运行命令提示符
2. 重新运行安装命令

**问题**: 安装很慢或卡住

**解决**:
1. 检查网络连接
2. 尝试清除 npm 缓存：
   ```batch
   npm cache clean --force
   npm install -g pnpm
   ```

---

## 第3步：安装 PostgreSQL（预计时间：5分钟）

### 步骤说明：

#### 1. 下载 PostgreSQL

1. 打开浏览器，访问：**https://www.postgresql.org/download/windows/**

2. 点击下载链接（通常显示"Download the installer"）

3. 选择版本：
   - 推荐：**PostgreSQL 14.x** 或 **15.x**
   - 文件格式：`Windows x86-64`
   - 文件大小：约 200-300MB
   - 文件名：`postgresql-14.x-1-windows-x64.exe`

4. 等待下载完成

---

#### 2. 安装 PostgreSQL

1. **找到下载的文件**（通常在下载文件夹）

2. **右键点击安装文件**，选择"以管理员身份运行"

3. **按照安装向导操作**：

   ##### **步骤 1 - 欢迎界面**
   - 点击 **Next**

   ##### **步骤 2 - 选择组件**
   - 保持默认选择即可
   - 点击 **Next**

   ##### **步骤 3 - 选择安装目录**
   - 默认路径：`C:\Program Files\PostgreSQL\14`
   - **如果您有 J 盘，强烈推荐改为**：`J:\Program Files\PostgreSQL\14`
   - 点击 **Next**

   ##### **步骤 4 - 选择数据目录** ⭐ **重要！**
   - 默认路径：`C:\Program Files\PostgreSQL\14\data`
   - **如果您有 J 盘，强烈推荐改为**：`J:\postgresql\data`
   - 数据目录存储所有数据库文件，占用空间较大
   - 点击 **Next**

   ##### **步骤 5 - 设置密码** ⭐ **重要！**
   - 在密码框输入：**`postgres`**
   - 在确认密码框输入：**`postgres`**
   - **请记住这个密码！**
   - 点击 **Next**

   ##### **步骤 6 - 设置端口**
   - 默认端口：`5432`
   - 保持不变
   - 点击 **Next**

   ##### **步骤 7 - 区域设置**
   - 选择：**C**（推荐）
   - 或选择默认区域
   - 点击 **Next**

   ##### **步骤 8 - 准备安装**
   - 检查所有配置
   - 点击 **Next** 开始安装

4. **等待安装完成**（2-3分钟）

5. **完成安装**：
   - 取消勾选 "Launch Stack Builder"（我们不需要）
   - 点击 **Finish**

---

#### 3. 将 PostgreSQL 添加到系统 PATH

**如果安装时没有自动添加到 PATH**：

1. 按 `Win + R` 键，输入 `sysdm.cpl`，按 Enter

2. 点击"高级"选项卡

3. 点击"环境变量"按钮

4. 在"系统变量"区域找到 `Path`

5. 选中 `Path`，点击"编辑"

6. 点击"新建"，添加以下路径：
   ```
   C:\Program Files\PostgreSQL\14\bin
   ```
   （如果安装在其他位置，请修改为实际路径）

7. 点击"确定"保存所有设置

8. **关闭所有命令提示符窗口**（重要！）

9. **重新打开命令提示符**

---

#### 4. 验证安装

在新的命令提示符中输入：

```batch
psql --version
```

应该显示：`psql (PostgreSQL) 14.x` 或类似版本

---

#### 5. 启动 PostgreSQL 服务

在命令提示符中输入：

```batch
net start postgresql-x64-14
```

**成功输出**：
```
The postgresql-x64-14 service is starting.
The postgresql-x64-14 service was started successfully.
```

**如果显示"服务已在运行"**：
- 说明服务已经在运行，这很好！

**如果显示"服务未启动"或失败**：
1. 检查服务名称是否正确（可能是 `postgresql-14` 而不是 `postgresql-x64-14`）
2. 尝试：`net start postgresql-14`
3. 或打开"服务"（按 Win+R，输入 `services.msc`），找到 PostgreSQL 服务并手动启动

---

### ⚠️ 常见问题

**问题1**: 提示"找不到命令"

**解决**:
1. 确认 PostgreSQL 已添加到 PATH（参考上面步骤3）
2. 关闭所有命令提示符窗口
3. 重新打开命令提示符

**问题2**: 服务启动失败

**解决**:
1. 检查端口 5432 是否被占用：
   ```batch
   netstat -ano | findstr :5432
   ```
2. 如果被占用，停止占用进程或更改端口
3. 查看错误日志：`C:\Program Files\PostgreSQL\14\data\log\`

**问题3**: 密码错误

**解决**:
1. 记住安装时设置的密码（应该是 `postgres`）
2. 如果忘记，需要重置 PostgreSQL 密码（较复杂，建议重新安装）

---

## 第4步：获取项目代码（预计时间：2分钟）

### 方案 A：使用 Git 克隆（推荐）

**如果您已经安装了 Git**：

1. 打开命令提示符

2. 进入您想要安装项目的目录（例如桌面）：
   ```batch
   cd Desktop
   ```

3. 克隆项目（**替换为实际的仓库地址**）：
   ```batch
   git clone https://github.com/your-username/lovato-pump-selection.git
   ```

4. 进入项目目录：
   ```batch
   cd lovato-pump-selection
   ```

---

### 方案 B：直接下载 ZIP（如果代码在当前环境）

如果您现在就在 Coze 沙箱环境中：

1. **从当前环境导出项目**（方法1 - 推荐）：
   ```batch
   # 在项目根目录下
   cd /workspace/projects

   # 创建打包
   tar -czf lovato-pump-selection.tar.gz lovato-pump-selection/

   # 下载文件（如果有下载工具）
   # 或通过其他方式传输到您的 Windows 电脑
   ```

2. **方法2 - 逐个文件复制**：
   - 手动复制项目文件夹
   - 粘贴到您的 Windows 电脑

3. **在 Windows 电脑上**：
   - 找到项目文件夹
   - 确认 `package.json` 文件存在
   - 确认 `migrations` 文件夹存在

---

### 验证项目文件

在项目根目录下，应该看到以下文件：

```
lovato-pump-selection/
├── package.json          ✅ 必须存在
├── .env.example          ✅ 必须存在
├── migrations/           ✅ 必须存在
│   └── 001_add_membership_tables.sql
├── src/                  ✅ 应该存在
├── public/               ✅ 应该存在
└── README.md             ✅ 应该存在
```

---

## 第5步：配置和启动（预计时间：5分钟）

### 5.1 安装项目依赖

1. **确保在项目根目录**（有 `package.json` 文件的地方）

2. 在命令提示符中输入：
   ```batch
   pnpm install
   ```

3. **等待安装完成**（3-5分钟）
   - 会下载所有依赖包
   - 看到类似输出表示成功：
     ```
     Done in 234s
     ```

4. **验证安装**：
   - 应该看到 `node_modules` 文件夹

---

### 5.2 创建 .env 配置文件

1. **复制配置文件**：
   ```batch
   copy .env.example .env
   ```

2. **编辑 .env 文件**：
   - 右键点击 `.env` 文件
   - 选择"打开方式" → "记事本"
   - 或使用其他文本编辑器（推荐 VS Code）

3. **配置数据库连接**：

   如果使用默认 C 盘安装：
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump
   POSTGRES_DATA_DIR=C:\Program Files\PostgreSQL\14\data
   POSTGRES_BACKUP_DIR=C:\Program Files\PostgreSQL\14\backups
   ```

   如果使用 J 盘：
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump
   POSTGRES_DATA_DIR=J:\postgresql\data
   POSTGRES_BACKUP_DIR=J:\postgresql\backups
   ```

4. **保存文件**

---

### 5.3 创建数据库

1. **在命令提示符中输入**：
   ```batch
   psql -U postgres -c "CREATE DATABASE lovato_pump;"
   ```

2. **输入密码**：
   - 提示时输入：`postgres`
   - （输入时不会显示字符，这是正常的）

3. **成功输出**：
   ```
   CREATE DATABASE
   ```

---

### 5.4 运行数据库迁移

1. **在命令提示符中输入**：
   ```batch
   psql -U postgres -d lovato_pump < migrations\001_add_membership_tables.sql
   ```

2. **输入密码**：
   - 提示时输入：`postgres`

3. **等待执行完成**（几秒钟）

4. **成功提示**：
   - 应该看到多个 CREATE TABLE 和 CREATE INDEX 的输出
   - 无错误信息

---

### 5.5 验证数据库

1. **查看数据库列表**：
   ```batch
   psql -U postgres -l
   ```

   应该看到 `lovato_pump` 数据库

2. **查看数据库表**：
   ```batch
   psql -U postgres -d lovato_pump -c "\dt"
   ```

   应该看到 7 个表：
   - users
   - email_verifications
   - password_resets
   - subscription_plans
   - subscriptions
   - selection_history
   - usage_stats

---

### 5.6 启动开发服务器

1. **确保在项目根目录**

2. **输入命令**：
   ```batch
   pnpm run dev
   ```

3. **等待编译完成**（几秒到一分钟）

4. **成功输出**：
   ```
   ▲ Next.js 16.1.1
   - Local:        http://localhost:5000
   - Ready in 2.5s
   ```

---

### 5.7 访问应用

1. **打开浏览器**（Chrome、Edge、Firefox 等）

2. **访问地址**：
   ```
   http://localhost:5000
   ```

3. **应该看到**：
   - 洛瓦托智能水泵选型系统主页
   - 无明显错误
   - 页面正常显示

---

## ✅ 验证安装

使用以下命令快速验证：

```batch
echo 验证 Node.js...
node --version

echo.
echo 验证 pnpm...
pnpm --version

echo.
echo 验证 PostgreSQL...
psql --version

echo.
echo 验证服务...
sc query postgresql-x64-14

echo.
echo 验证数据库...
psql -U postgres -d lovato_pump -c "\dt"

echo.
echo 验证完成！
```

---

## 🎯 完成！

恭喜！您已经成功在 Windows 本地电脑上安装了洛瓦托智能水泵选型系统！

### 下次启动应用：

**方法 1：使用启动脚本**
```batch
start-windows.bat
```

**方法 2：手动启动**
```batch
# 确保服务运行
net start postgresql-x64-14

# 进入项目目录
cd lovato-pump-selection

# 启动应用
pnpm run dev
```

**方法 3：使用诊断工具**
```batch
diagnose.bat
# 然后选择启动应用
```

---

## 📞 需要帮助？

如果遇到问题：

1. **查看详细文档**：
   - WINDOWS_INSTALLATION_GUIDE.md
   - WINDOWS_QUICK_START.md

2. **运行诊断工具**：
   ```batch
   diagnose.bat
   ```

3. **检查常见问题**：
   - 参考 WINDOWS_INSTALLATION_GUIDE.md 的"常见问题"部分

---

**祝您使用愉快！** 🚀
