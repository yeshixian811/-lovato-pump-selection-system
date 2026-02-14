# 项目结构说明

## 📁 完整目录结构

```
wechat-miniprogram/
│
├── 📄 app.ts                      # 小程序入口文件
├── 📄 app.json                     # 全局配置文件
├── 📄 app.wxss                     # 全局样式文件
├── 📄 project.config.json          # 项目配置文件
├── 📄 sitemap.json                 # 站点地图配置
├── 📄 types.d.ts                   # TypeScript 类型定义
│
├── 📁 pages/                       # 页面目录
│   │
│   ├── 📁 index/                   # 首页
│   │   ├── 📄 index.ts             # 首页逻辑
│   │   ├── 📄 index.wxml           # 首页结构
│   │   ├── 📄 index.wxss           # 首页样式
│   │   └── 📄 index.json           # 首页配置
│   │
│   ├── 📁 selection/               # 智能选型页 ⭐⭐⭐⭐⭐
│   │   ├── 📄 selection.ts         # 选型逻辑
│   │   ├── 📄 selection.wxml       # 选型结构
│   │   ├── 📄 selection.wxss       # 选型样式
│   │   └── 📄 selection.json       # 选型配置
│   │
│   ├── 📁 products/                # 产品库页
│   │   ├── 📄 products.ts          # 产品库逻辑
│   │   ├── 📄 products.wxml        # 产品库结构
│   │   ├── 📄 products.wxss        # 产品库样式
│   │   └── 📄 products.json        # 产品库配置
│   │
│   ├── 📁 product-detail/          # 产品详情页 ⭐⭐⭐⭐⭐
│   │   ├── 📄 product-detail.ts    # 详情逻辑
│   │   ├── 📄 product-detail.wxml  # 详情结构
│   │   ├── 📄 product-detail.wxss  # 详情样式
│   │   └── 📄 product-detail.json  # 详情配置
│   │
│   ├── 📁 favorites/               # 收藏页
│   │   ├── 📄 favorites.ts         # 收藏逻辑
│   │   ├── 📄 favorites.wxml       # 收藏结构
│   │   ├── 📄 favorites.wxss       # 收藏样式
│   │   └── 📄 favorites.json       # 收藏配置
│   │
│   └── 📁 about/                   # 关于我们页
│       ├── 📄 about.ts             # 关于逻辑
│       ├── 📄 about.wxml           # 关于结构
│       ├── 📄 about.wxss           # 关于样式
│       └── 📄 about.json           # 关于配置
│
├── 📁 components/                  # 组件目录
│   │
│   └── 📁 pump-curve-chart/        # 性能曲线图表组件 ⭐⭐⭐⭐⭐
│       ├── 📄 pump-curve-chart.ts  # 图表逻辑
│       ├── 📄 pump-curve-chart.wxml# 图表结构
│       ├── 📄 pump-curve-chart.wxss# 图表样式
│       └── 📄 pump-curve-chart.json# 图表配置
│
├── 📁 utils/                       # 工具类目录
│   │
│   └── 📄 api.ts                   # API 请求工具类
│
├── 📁 images/                      # 图片资源目录
│   ├── 📄 home.png                 # 首页图标
│   ├── 📄 home-active.png          # 首页图标（激活）
│   ├── 📄 selection.png            # 选型图标
│   ├── 📄 selection-active.png     # 选型图标（激活）
│   ├── 📄 products.png             # 产品库图标
│   ├── 📄 products-active.png      # 产品库图标（激活）
│   ├── 📄 favorites.png            # 收藏图标
│   ├── 📄 favorites-active.png     # 收藏图标（激活）
│   ├── 📄 about.png                # 关于图标
│   └── 📄 about-active.png         # 关于图标（激活）
│
├── 📄 README.md                    # 项目说明文档
├── 📄 DEPLOYMENT.md                # 部署指南
├── 📄 QUICKSTART.md                # 快速开始
├── 📄 PROJECT_STRUCTURE.md         # 项目结构说明（本文件）
└── 📄 CHECKLIST.md                 # 发布检查清单
```

---

## 📋 文件说明

### 核心文件

#### app.ts
小程序入口文件，包含：
- 小程序生命周期
- 全局数据
- 收藏功能
- 更新检查

#### app.json
全局配置文件，包含：
- 页面路径配置
- 窗口配置
- TabBar 配置
- 网络超时配置
- 权限配置

#### app.wxss
全局样式文件，包含：
- 颜色变量
- 通用样式
- 工具类
- 响应式样式

#### project.config.json
项目配置文件，包含：
- 项目描述
- AppID
- 编译配置
- ES6 配置
- 增强编译配置

#### types.d.ts
TypeScript 类型定义文件，包含：
- 小程序选项接口
- 产品类型接口
- API 响应接口
- 曲线数据接口

---

## 📄 页面说明

### 1. 首页 (pages/index/)

**功能**：
- 产品轮播展示
- 快速入口
- 精选产品
- 产品特性介绍

**文件**：
- `index.ts` - 页面逻辑
- `index.wxml` - 页面结构
- `index.wxss` - 页面样式
- `index.json` - 页面配置

### 2. 智能选型页 (pages/selection/) ⭐⭐⭐⭐⭐

**功能**：
- 参数输入（流量、扬程）
- 应用场景选择
- 流体类型选择
- 水泵类型选择
- 智能匹配
- 结果展示

**核心功能**：水泵选型的核心

**文件**：
- `selection.ts` - 选型逻辑
- `selection.wxml` - 选型界面
- `selection.wxss` - 选型样式
- `selection.json` - 选型配置

### 3. 产品库页 (pages/products/)

**功能**：
- 产品列表
- 搜索功能
- 筛选功能
- 排序功能

**文件**：
- `products.ts` - 产品库逻辑
- `products.wxml` - 产品库界面
- `products.wxss` - 产品库样式
- `products.json` - 产品库配置

### 4. 产品详情页 (pages/product-detail/) ⭐⭐⭐⭐⭐

**功能**：
- 产品信息展示
- 主要参数
- **性能曲线展示** ⭐⭐⭐⭐⭐
- 详细参数
- 应用场景
- 收藏功能
- 联系客服
- 分享功能

**核心功能**：性能曲线展示（最关键）

**文件**：
- `product-detail.ts` - 详情逻辑
- `product-detail.wxml` - 详情界面
- `product-detail.wxss` - 详情样式
- `product-detail.json` - 详情配置

### 5. 收藏页 (pages/favorites/)

**功能**：
- 收藏列表
- 查看详情
- 取消收藏

**文件**：
- `favorites.ts` - 收藏逻辑
- `favorites.wxml` - 收藏界面
- `favorites.wxss` - 收藏样式
- `favorites.json` - 收藏配置

### 6. 关于我们页 (pages/about/)

**功能**：
- 公司介绍
- 联系方式
- 版本信息

**文件**：
- `about.ts` - 关于逻辑
- `about.wxml` - 关于界面
- `about.wxss` - 关于样式
- `about.json` - 关于配置

---

## 🧩 组件说明

### 性能曲线组件 (components/pump-curve-chart/) ⭐⭐⭐⭐⭐

**功能**：
- 显示扬程曲线
- 显示效率曲线
- 显示功率曲线
- 显示参考线
- 显示交叉点
- 缩放和交互

**核心组件**：性能曲线展示

**文件**：
- `pump-curve-chart.ts` - 组件逻辑
- `pump-curve-chart.wxml` - 组件结构
- `pump-curve-chart.wxss` - 组件样式
- `pump-curve-chart.json` - 组件配置

---

## 🔧 工具类说明

### API 工具类 (utils/api.ts)

**功能**：
- 封装 wx.request
- 统一错误处理
- 统一响应格式
- Mock 数据支持

**API 接口**：
- `getProducts()` - 获取产品列表
- `getProductDetail(id)` - 获取产品详情
- `selectPump(params)` - 智能选型
- `searchProducts(keyword)` - 搜索产品
- `getPerformanceCurve(productId)` - 获取性能曲线

---

## 📦 资源文件说明

### images 目录

包含所有图标资源：

- `home.png` - 首页图标
- `home-active.png` - 首页图标（激活状态）
- `selection.png` - 选型图标
- `selection-active.png` - 选型图标（激活状态）
- `products.png` - 产品库图标
- `products-active.png` - 产品库图标（激活状态）
- `favorites.png` - 收藏图标
- `favorites-active.png` - 收藏图标（激活状态）
- `about.png` - 关于图标
- `about-active.png` - 关于图标（激活状态）

---

## 📚 文档说明

### README.md
项目说明文档，包含：
- 项目简介
- 功能特性
- 快速开始
- 配置说明
- 性能曲线说明
- 发布流程

### DEPLOYMENT.md
部署指南文档，包含：
- 导入项目
- 配置开发环境
- 测试和调试
- 发布上线
- 常见问题

### QUICKSTART.md
快速开始指南，包含：
- 5 分钟快速部署
- 项目概览
- 配置说明
- 常见问题

### PROJECT_STRUCTURE.md
项目结构说明文档（本文件），包含：
- 完整目录结构
- 文件说明
- 页面说明
- 组件说明
- 工具类说明

### CHECKLIST.md
发布检查清单，包含：
- 功能检查
- 性能检查
- 安全检查
- 合规检查

---

## 🎯 核心功能标识

⭐⭐⭐⭐⭐ = 最重要，核心功能
⭐⭐⭐⭐ = 重要
⭐⭐⭐ = 一般
⭐⭐ = 次要
⭐ = 辅助

### 核心功能清单

1. **智能选型** ⭐⭐⭐⭐⭐
   - 页面：pages/selection/
   - 功能：参数输入、智能匹配

2. **性能曲线** ⭐⭐⭐⭐⭐
   - 页面：pages/product-detail/
   - 组件：components/pump-curve-chart/
   - 功能：曲线展示、参考线、交叉点

3. **产品库** ⭐⭐⭐⭐
   - 页面：pages/products/
   - 功能：搜索、筛选、排序

4. **收藏功能** ⭐⭐⭐
   - 页面：pages/favorites/
   - 功能：收藏、取消收藏

5. **联系方式** ⭐⭐
   - 页面：pages/about/
   - 功能：电话、邮箱、地址

---

## 🚀 快速导航

- [返回首页](README.md)
- [部署指南](DEPLOYMENT.md)
- [快速开始](QUICKSTART.md)
- [检查清单](CHECKLIST.md)

---

如有疑问，请联系技术支持：
- 客服电话：400-XXX-XXXX
- 电子邮箱：support@lovato-pump.com
