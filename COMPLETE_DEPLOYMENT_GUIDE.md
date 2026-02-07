# 洛瓦托水泵选型系统 - 完整部署指南

## 📋 系统概览

本系统包含以下核心功能：
- ✅ 智能水泵选型（流量、扬程、功率匹配）
- ✅ 多类型水泵支持（离心泵、立式泵、潜水泵）
- ✅ 数据库驱动的产品管理
- ✅ 匹配度智能计算
- ✅ 库存状态实时查询

---

## 📦 必需文件清单

请确保以下文件已复制到您的本地项目目录 `C:\lovato-pump`：

### 1. 数据库文件
```
migrations/
├── 002_create_pump_tables.sql          # 数据库表结构
└── 003_insert_sample_pumps.sql         # 水泵样本数据（22个产品）
```

### 2. 前端页面
```
src/app/
├── selection/page.tsx                  # 水泵选型表单页面
└── api/pump/match/route.ts             # 水泵匹配 API 接口
```

### 3. 配置文件
```
.env                                    # 环境变量配置
```

---

## 🚀 部署步骤（Windows）

### 第一步：环境检查

在您的本地 Windows 电脑上执行：

```batch
@echo off
echo 正在检查环境...

REM 检查 Node.js
node --version
if errorlevel 1 (
    echo ❌ Node.js 未安装！
    echo 请访问 https://nodejs.org 下载安装
    pause
    exit /b 1
)

REM 检查 pnpm
pnpm --version
if errorlevel 1 (
    echo ❌ pnpm 未安装！
    echo 正在安装 pnpm...
    npm install -g pnpm
)

REM 检查 PostgreSQL
psql --version
if errorlevel 1 (
    echo ❌ PostgreSQL 未安装！
    echo 请访问 https://www.postgresql.org/download/windows/ 下载安装
    pause
    exit /b 1
)

echo ✅ 环境检查完成！
pause
```

### 第二步：创建项目目录

```batch
@echo off
set "PROJECT_DIR=C:\lovato-pump"
echo 正在创建项目目录 %PROJECT_DIR%...

if exist "%PROJECT_DIR%" (
    echo 目录已存在，正在清理...
    rmdir /s /q "%PROJECT_DIR%"
)

mkdir "%PROJECT_DIR%"
cd "%PROJECT_DIR%"
mkdir src\app\selection
mkdir src\app\api\pump\match
mkdir migrations

echo ✅ 项目目录创建完成！
echo 请将必需文件复制到 %PROJECT_DIR%
pause
```

### 第三步：复制文件

**方式1：使用 Git（推荐）**

如果代码已推送到 GitHub/Gitee：

```batch
cd C:\
git clone https://github.com/your-username/lovato-pump-selection.git lovato-pump
cd lovato-pump
pnpm install
```

**方式2：手动复制**

1. 将所有必需文件复制到 `C:\lovato-pump` 对应目录
2. 确保文件结构正确

### 第四步：安装依赖

```batch
cd C:\lovato-pump
pnpm install
```

### 第五步：配置数据库

1. 确保 PostgreSQL 已启动
2. 创建数据库：

```batch
psql -U postgres -c "CREATE DATABASE lovato_pump_selection;"
```

3. 执行数据库迁移：

```batch
psql -U postgres -d lovato_pump_selection -f migrations\002_create_pump_tables.sql
psql -U postgres -d lovato_pump_selection -f migrations\003_insert_sample_pumps.sql
```

4. 验证数据：

```batch
psql -U postgres -d lovato_pump_selection -c "SELECT COUNT(*) FROM pumps;"
```

应该显示：`count`
`22`

### 第六步：启动应用

```batch
cd C:\lovato-pump
pnpm run dev
```

应用将在 `http://localhost:5000` 启动

---

## 🧪 测试系统

### 测试步骤：

1. 打开浏览器访问：`http://localhost:5000`

2. 点击"开始选型"

3. 填写参数：
   - 流量需求：50 m³/h
   - 扬程需求：30 m
   - 应用类型：供水系统
   - 流体类型：清水

4. 点击"开始选型"

5. 应该看到匹配结果，显示多个水泵产品及其匹配度

---

## 🔧 常见问题

### 问题1：数据库连接失败

**错误信息**：`connection refused`

**解决方案**：
1. 检查 PostgreSQL 服务是否启动
2. 打开服务管理器（services.msc）
3. 找到 `postgresql-x64-14` 服务
4. 确保状态为"正在运行"

### 问题2：找不到 psql 命令

**解决方案**：
1. 找到 PostgreSQL 安装目录（通常在 `C:\Program Files\PostgreSQL\14\bin`）
2. 将该目录添加到系统 PATH 环境变量
3. 重启命令行窗口

### 问题3：端口 5000 已被占用

**解决方案**：
```batch
netstat -ano | findstr :5000
taskkill /PID <进程ID> /F
```

### 问题4：npm/pnpm 安装失败

**解决方案**：
```batch
# 清除缓存
pnpm store prune

# 删除 node_modules 和 lock 文件
rmdir /s /q node_modules
del pnpm-lock.yaml

# 重新安装
pnpm install
```

---

## 📊 数据库说明

### 水泵数据（22个产品）

#### 离心泵（10个）
- LVP-50-125 到 LVP-125-315
- 流量范围：6.3 - 250 m³/h
- 扬程范围：18 - 125 m
- 功率范围：1.5 - 75 kW

#### 立式泵（8个）
- LVV-40-100 到 LVV-80-180
- 流量范围：3 - 50 m³/h
- 扬程范围：12 - 60 m
- 功率范围：0.75 - 15 kW

#### 潜水泵（4个）
- LVS-50-15 到 LVS-100-25
- 流量范围：10 - 200 m³/h
- 扬程范围：10 - 30 m
- 功率范围：3 - 37 kW

### 匹配度算法

系统综合考虑以下因素：
1. 流量匹配（权重 35%）
2. 扬程匹配（权重 35%）
3. 功率匹配（权重 15%）
4. 应用场景匹配（权重 10%）
5. 流体类型匹配（权重 5%）

---

## 🎯 下一步

### 功能扩展建议：

1. **用户系统**
   - 注册/登录
   - 选型历史记录
   - 个人收藏

2. **产品详情**
   - 详细规格展示
   - 产品图片
   - PDF 说明书下载

3. **高级筛选**
   - 价格区间
   - 品牌筛选
   - 材质筛选

4. **订单系统**
   - 在线下单
   - 支付集成
   - 订单跟踪

5. **微信小程序**
   - 微信授权登录
   - 小程序选型界面
   - 微信支付

---

## 📞 技术支持

如遇到问题，请提供以下信息：

1. 错误截图
2. 控制台输出
3. 操作系统版本
4. Node.js 版本
5. PostgreSQL 版本

---

## 📝 更新日志

### v1.0.0 (2025-01-15)
- ✅ 初始版本发布
- ✅ 水泵选型功能
- ✅ 22个样本产品
- ✅ 智能匹配算法
- ✅ 数据库支持

---

**祝您使用愉快！** 🚀
