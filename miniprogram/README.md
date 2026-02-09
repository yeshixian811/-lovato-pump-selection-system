# 洛瓦托水泵选型系统 - 微信小程序

基于 Taro + React + TypeScript 开发的洛瓦托水泵选型微信小程序。

## 技术栈

- **框架**: Taro 4.x
- **UI 库**: React 18
- **语言**: TypeScript 5
- **状态管理**: Redux Toolkit + Redux Persist
- **图表库**: ECharts for Weixin
- **样式**: SCSS

## 项目结构

```
miniprogram/
├── src/
│   ├── app.ts                  # 小程序入口
│   ├── app.config.ts           # 小程序配置
│   ├── app.scss                # 全局样式
│   ├── components/             # 组件
│   │   ├── PerformanceChart/   # 性能曲线图表组件
│   │   └── ec-canvas/          # ECharts Canvas 组件
│   ├── pages/                  # 页面
│   │   ├── index/              # 首页
│   │   ├── selection/          # 选型页面
│   │   ├── products/           # 产品列表
│   │   ├── result/             # 选型结果详情
│   │   ├── history/            # 历史记录
│   │   ├── login/              # 登录页面
│   │   └── profile/            # 个人中心
│   ├── store/                  # Redux 状态管理
│   │   ├── index.ts            # Store 配置
│   │   ├── withRedux.tsx       # Redux HOC
│   │   └── modules/            # Redux 模块
│   ├── services/               # API 服务
│   ├── types/                  # TypeScript 类型定义
│   └── styles/                 # 样式
├── config/                     # Taro 配置
├── project.config.json         # 微信小程序配置
└── package.json                # 依赖配置
```

## 功能特性

### 已实现功能

1. **首页**
   - 品牌展示
   - 核心功能入口
   - 产品系列介绍
   - 统计数据展示

2. **选型功能**
   - 流量、扬程参数输入
   - 应用类型、流体类型、水泵类型筛选
   - 智能匹配算法（调用后端 API）
   - 选型结果展示
   - 历史记录保存

3. **产品库**
   - 产品列表展示
   - 搜索功能
   - 筛选功能（类型、系列、功率范围）
   - 下拉刷新
   - 上拉加载更多

4. **选型结果详情**
   - 水泵基本信息
   - 性能曲线图表（H-Q 曲线）
   - 匹配度分析
   - 详细参数展示
   - 价格信息

5. **历史记录**
   - 选型历史列表
   - 查看历史详情
   - 删除历史记录
   - 清空所有历史

6. **个人中心**
   - 用户信息展示
   - 功能菜单
   - 登录/登出
   - 统计数据

### 待完成功能

1. [ ] 用户注册功能
2. [ ] 我的收藏功能
3. [ ] 设置页面
4. [ ] 联系客服功能
5. [ ] 分享功能
6. [ ] 性能优化

## 开发指南

### 安装依赖

```bash
cd miniprogram
pnpm install
```

### 开发模式

```bash
# 微信小程序
pnpm run dev:weapp

# H5
pnpm run dev:h5
```

### 构建生产版本

```bash
# 微信小程序
pnpm run build:weapp

# H5
pnpm run build:h5
```

### 微信开发者工具

1. 打开微信开发者工具
2. 导入项目，选择 `miniprogram/dist` 目录
3. 在开发者工具中预览和调试

## 环境配置

在 `config/dev.ts` 和 `config/prod.ts` 中配置 API 地址：

```typescript
export default defineAppConfig({
  // API 地址
  API_BASE_URL: 'https://your-api-domain.com/api'
})
```

## Redux 状态管理

项目使用 Redux Toolkit + Redux Persist 进行状态管理：

- **user**: 用户信息
- **pump**: 水泵数据
- **selection**: 选型结果和历史

### 状态持久化

用户登录状态会自动持久化到本地存储。

## API 接口

所有 API 请求封装在 `src/services/` 目录下：

- `request.ts`: 请求封装
- `user.ts`: 用户相关 API
- `pump.ts`: 水泵相关 API

## 样式规范

- 使用 SCSS 编写样式
- 采用 BEM 命名规范
- 统一使用 750rpx 设计稿

## TypeScript 类型定义

所有类型定义在 `src/types/index.ts` 中：

- `User`: 用户类型
- `Pump`: 水泵类型
- `SelectionParams`: 选型参数
- `SelectionResult`: 选型结果
- `SelectionHistory`: 历史记录

## 组件使用

### PerformanceChart 组件

```tsx
import PerformanceChart from '@/components/PerformanceChart'

<PerformanceChart
  data={performanceData}
  requiredFlowRate={requiredFlowRate}
  requiredHead={requiredHead}
  maxFlowRate={maxFlowRate}
  maxHead={maxHead}
  pumpName="水泵型号"
/>
```

## 注意事项

1. **ECharts 集成**
   - 使用 ECharts for Weixin 实现图表
   - 需要在微信小程序中配置 canvas 组件

2. **Redux 集成**
   - 使用 withRedux HOC 包装所有页面
   - 状态自动持久化

3. **API 请求**
   - 所有请求通过统一的 request 封装
   - 自动注入 Token
   - 401 自动跳转登录

## 部署

### 微信小程序

1. 构建：`pnpm run build:weapp`
2. 打开微信开发者工具
3. 上传代码
4. 提交审核

### H5

1. 构建：`pnpm run build:h5`
2. 部署到服务器

## 问题排查

### TypeScript 错误

如果遇到 TypeScript 类型错误，可以尝试：

```bash
rm -rf node_modules
pnpm install
```

### 构建错误

如果构建失败，检查：

1. 依赖是否正确安装
2. Taro 版本是否匹配
3. 配置文件是否正确

## 版本历史

- v1.0.0 (2024-02-09)
  - 初始版本发布
  - 实现核心选型功能
  - 实现产品库功能
  - 实现历史记录功能
  - 实现个人中心

## 许可证

MIT

## 联系方式

如有问题，请联系开发团队。
