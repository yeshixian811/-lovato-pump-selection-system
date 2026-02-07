# 📦 洛瓦托水泵选型系统 - 文件下载清单

## 🎯 快速开始

您需要将以下文件从 Coze 沙箱复制到您的本地 Windows 电脑：

### 📁 项目根目录 (`C:\lovato-pump\`)

#### 必需文件：
- ✅ `package.json` - 项目依赖配置
- ✅ `tsconfig.json` - TypeScript 配置
- ✅ `next.config.js` - Next.js 配置
- ✅ `tailwind.config.ts` - Tailwind CSS 配置
- ✅ `.env` - 环境变量配置
- ✅ `ONE_CLICK_DEPLOYMENT.bat` - 一键部署脚本
- ✅ `COMPLETE_DEPLOYMENT_GUIDE.md` - 完整部署指南

---

### 📁 数据库文件 (`C:\lovato-pump\migrations\`)

#### 必需文件：
- ✅ `002_create_pump_tables.sql` - **重要！数据库表结构**
- ✅ `003_insert_sample_pumps.sql` - **重要！22个水泵样本数据**

---

### 📁 前端页面 (`C:\lovato-pump\src\app\`)

#### 必需文件：
- ✅ `page.tsx` - 首页（已存在）
- ✅ `layout.tsx` - 页面布局（已存在）
- ✅ `globals.css` - 全局样式（已存在）
- ✅ `selection/page.tsx` - **重要！水泵选型表单页面**

---

### 📁 API 接口 (`C:\lovato-pump\src\app\api\pump\match\`)

#### 必需文件：
- ✅ `route.ts` - **重要！水泵匹配 API 接口**

---

## 📥 下载方式

### 方式1：使用提供的部署脚本（最简单）

1. 在本地创建 `C:\lovato-pump` 目录
2. 运行 `ONE_CLICK_DEPLOYMENT.bat`
3. 脚本会自动创建目录结构
4. 手动复制上述必需文件到对应目录

### 方式2：手动复制

1. 下载所有必需文件
2. 按照上述目录结构复制文件
3. 确保文件路径正确

### 方式3：使用 Git（如果有代码仓库）

```batch
cd C:\
git clone <仓库地址> lovato-pump
cd lovato-pump
pnpm install
```

---

## 🔍 关键文件说明

### 1. 数据库文件（最关键！）

#### `migrations/002_create_pump_tables.sql`
- 创建 3 个数据库表：
  - `pumps` - 水泵产品表
  - `pump_performance_curves` - 性能曲线表
  - `selection_records` - 选型记录表

#### `migrations/003_insert_sample_pumps.sql`
- 插入 22 个水泵样本数据
- 包括离心泵、立式泵、潜水泵
- 包含性能曲线数据

### 2. 前端页面

#### `src/app/selection/page.tsx`
- 水泵选型表单界面
- 参数输入（流量、扬程、应用类型等）
- 匹配结果展示
- 智能匹配算法

### 3. API 接口

#### `src/app/api/pump/match/route.ts`
- 接收选型参数
- 查询数据库
- 计算匹配度
- 返回匹配结果

---

## ✅ 部署检查清单

在启动应用前，请确保：

- [ ] Node.js 已安装（v18+）
- [ ] pnpm 已安装
- [ ] PostgreSQL 已安装并启动
- [ ] 数据库 `lovato_pump_selection` 已创建
- [ ] 数据库表已创建（运行 002_create_pump_tables.sql）
- [ ] 样本数据已插入（运行 003_insert_sample_pumps.sql）
- [ ] 所有必需文件已复制到正确位置
- [ ] .env 文件已正确配置
- [ ] 依赖已安装（运行 pnpm install）

---

## 🚀 启动命令

```batch
cd C:\lovato-pump
pnpm install
pnpm run dev
```

访问：http://localhost:5000

---

## 🧪 测试步骤

1. 打开浏览器访问 `http://localhost:5000`
2. 点击"开始选型"
3. 填写参数：
   - 流量需求：50 m³/h
   - 扬程需求：30 m
   - 应用类型：供水系统
   - 流体类型：清水
4. 点击"开始选型"
5. 应该看到匹配结果

---

## 📊 系统数据

### 水泵产品数量：22 个

#### 分类：
- 离心泵：10 个
- 立式泵：8 个
- 潜水泵：4 个

#### 性能范围：
- 流量：3 - 250 m³/h
- 扬程：10 - 125 m
- 功率：0.75 - 75 kW

---

## 🆘 常见问题

### Q1: 如何验证数据库是否正确初始化？

```batch
psql -U postgres -d lovato_pump_selection -c "SELECT COUNT(*) FROM pumps;"
```

应该显示：`22`

### Q2: 如何查看所有水泵型号？

```batch
psql -U postgres -d lovato_pump_selection -c "SELECT model, name FROM pumps;"
```

### Q3: 如何重置数据库？

```batch
psql -U postgres -d lovato_pump_selection -f migrations\003_insert_sample_pumps.sql
```

### Q4: 如何添加新的水泵？

参考 `migrations/003_insert_sample_pumps.sql` 中的 INSERT 语句

---

## 📞 需要帮助？

如果遇到问题，请：
1. 查看 `COMPLETE_DEPLOYMENT_GUIDE.md` 详细指南
2. 检查控制台错误信息
3. 确认所有必需文件都已正确复制
4. 验证数据库连接

---

**准备好开始了吗？** 🚀

1. 下载所有必需文件
2. 运行部署脚本
3. 启动应用
4. 开始选型！

**祝您使用愉快！** 💪
