# 洛瓦托水泵选型 - 微信小程序

基于 Taro + React + TypeScript + Redux 开发的原生微信小程序应用。

## 技术栈

- **框架**: Taro 4.x
- **UI**: React + Taro Components
- **语言**: TypeScript
- **状态管理**: Redux Toolkit + Redux Persist
- **图表**: ECharts for Weixin
- **样式**: SCSS

## 项目结构

```
miniprogram/
├── config/              # 配置文件
│   ├── index.ts        # 主配置
│   ├── dev.ts          # 开发环境配置
│   └── prod.ts         # 生产环境配置
├── src/
│   ├── app.config.ts   # 小程序配置
│   ├── app.ts          # 入口文件
│   ├── app.scss        # 全局样式
│   ├── assets/         # 静态资源
│   ├── components/     # 公共组件
│   ├── pages/          # 页面
│   │   ├── index/      # 首页
│   │   ├── selection/  # 选型页面
│   │   ├── products/   # 产品列表
│   │   ├── result/     # 选型结果详情
│   │   ├── login/      # 登录
│   │   └── profile/    # 个人中心
│   ├── services/       # API 服务
│   │   ├── request.ts  # 请求封装
│   │   ├── user.ts     # 用户 API
│   │   └── pump.ts     # 水泵 API
│   ├── store/          # Redux 状态管理
│   │   ├── index.ts    # Store 配置
│   │   └── modules/    # Reducers
│   │       ├── user.ts
│   │       ├── pump.ts
│   │       └── selection.ts
│   ├── styles/         # 样式文件
│   │   ├── variables.scss
│   │   └── mixins.scss
│   ├── types/          # TypeScript 类型定义
│   │   └── index.ts
│   └── utils/          # 工具函数
├── package.json
├── tsconfig.json
├── project.config.json # 微信小程序配置
└── README.md
```

## 功能模块

### 1. 首页
- 产品展示
- 快速选型入口
- 统计数据展示
- 产品系列介绍

### 2. 水泵选型
- 参数输入（流量、扬程）
- 应用类型选择
- 流体类型选择
- 水泵类型选择
- 智能匹配算法
- 选型结果展示

### 3. 产品库
- 产品列表展示
- 产品筛选
- 产品详情
- 性能曲线查看

### 4. 用户系统
- 登录/注册
- 个人信息管理
- 订阅状态查看
- 使用统计

### 5. 选型结果
- 详细参数展示
- 性能曲线图表
- 匹配度分析
- 产品对比

## 快速开始

### 安装依赖

```bash
cd miniprogram
npm install
```

### 开发环境

```bash
npm run dev:weapp
```

### 生产构建

```bash
npm run build:weapp
```

### 预览

1. 打开微信开发者工具
2. 导入项目，选择 `miniprogram/dist` 目录
3. 配置 AppID（在 project.config.json 中）
4. 点击"编译"预览

## 配置说明

### API 配置

在 `config/dev.ts` 和 `config/prod.ts` 中配置 API 地址：

```typescript
// 开发环境
defineConstants: {
  API_BASE_URL: '"http://localhost:5000/api"'
}

// 生产环境
defineConstants: {
  API_BASE_URL: '"https://luowato.com/api"'
}
```

### 微信小程序配置

在 `project.config.json` 中配置：

```json
{
  "appid": "your_appid_here",
  "projectname": "lovato-pump-miniprogram"
}
```

## API 接口

### 用户相关

- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/user/me` - 获取用户信息
- `POST /api/auth/logout` - 登出

### 水泵相关

- `GET /api/pumps` - 获取水泵列表
- `GET /api/pumps/:id` - 获取水泵详情
- `GET /api/pumps/:id/performance` - 获取性能曲线
- `POST /api/pump/match` - 水泵选型

## 开发规范

### 组件开发

```tsx
import { Component } from 'react'
import { View, Text } from '@tarojs/components'

class MyComponent extends Component {
  render() {
    return (
      <View>
        <Text>Hello</Text>
      </View>
    )
  }
}

export default MyComponent
```

### 状态管理

```typescript
// store/modules/example.ts
import { createSlice } from '@reduxjs/toolkit'

const exampleSlice = createSlice({
  name: 'example',
  initialState: { data: [] },
  reducers: {
    setData: (state, action) => {
      state.data = action.payload
    }
  }
})

export const { setData } = exampleSlice.actions
export default exampleSlice.reducer
```

### API 调用

```typescript
import { get, post } from '@/services/request'

// GET 请求
const response = await get('/pumps')

// POST 请求
const response = await post('/pump/match', params)
```

## 样式规范

使用 SCSS 变量和 Mixins：

```scss
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.my-component {
  padding: $spacing-lg;
  background: $color-primary;
  @include flex-center();
}
```

## 部署流程

### 1. 代码提交

```bash
git add .
git commit -m "feat: 新功能"
git push
```

### 2. 构建生产版本

```bash
npm run build:weapp
```

### 3. 上传代码

在微信开发者工具中：
1. 点击"上传"
2. 填写版本号和项目备注
3. 确认上传

### 4. 提交审核

在微信公众平台：
1. 进入"版本管理"
2. 选择开发版本
3. 点击"提交审核"
4. 填写审核信息
5. 等待审核通过

### 5. 发布

审核通过后：
1. 在"版本管理"中选择审核通过版本
2. 点击"发布"
3. 确认发布

## 注意事项

1. **HTTPS 要求**: 微信小程序强制要求使用 HTTPS
2. **域名白名单**: 必须在微信公众平台配置业务域名
3. **API 兼容**: 确保后端 API 支持 CORS 请求
4. **性能优化**:
   - 图片使用 WebP 格式
   - 列表使用虚拟滚动
   - 合理使用缓存
5. **用户体验**:
   - 添加加载状态
   - 错误提示友好
   - 交互反馈及时

## 待完成功能

- [ ] 产品列表页面
- [ ] 选型结果详情页面
- [ ] 个人中心页面
- [ ] 性能曲线图表组件
- [ ] 收藏功能
- [ ] 历史记录
- [ ] 分享功能
- [ ] 意见反馈

## 相关文档

- [Taro 官方文档](https://docs.taro.zone/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Redux Toolkit 文档](https://redux-toolkit.js.org/)

## 联系方式

如有问题，请联系开发团队。
