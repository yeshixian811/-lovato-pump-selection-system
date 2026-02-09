# 洛瓦托水泵选型小程序 - 快速开始指南

## 🚀 快速开始

### 1. 安装依赖

```bash
cd miniprogram
npm install
```

### 2. 配置环境变量

#### 开发环境配置

编辑 `config/dev.ts`：

```typescript
defineConstants: {
  API_BASE_URL: '"http://localhost:5000/api"'  // 修改为你的本地 API 地址
}
```

#### 生产环境配置

编辑 `config/prod.ts`：

```typescript
defineConstants: {
  API_BASE_URL: '"https://your-domain.com/api"'  // 修改为你的生产环境 API 地址
}
```

### 3. 配置微信小程序

编辑 `project.config.json`：

```json
{
  "appid": "your_wechat_appid_here",  // 替换为你的微信小程序 AppID
  "projectname": "lovato-pump-miniprogram"
}
```

### 4. 启动开发服务器

```bash
npm run dev:weapp
```

### 5. 使用微信开发者工具预览

1. 打开微信开发者工具
2. 选择"导入项目"
3. 项目目录选择：`miniprogram/dist`
4. AppID 选择：测试号或你的 AppID
5. 点击"导入"

### 6. 开始开发

- 修改 `src/` 目录下的代码
- 保存后会自动编译到 `dist/` 目录
- 微信开发者工具会自动刷新预览

## 📦 依赖说明

### 核心依赖

```json
{
  "@tarojs/taro": "^4.0.0",           // Taro 框架
  "@tarojs/react": "^4.0.0",          // Taro React 运行时
  "react": "^18.2.0",                 // React 18
  "@reduxjs/toolkit": "^1.9.0",       // Redux Toolkit
  "redux-persist": "^6.0.0",          // Redux 持久化
  "echarts-for-weixin": "^1.0.0",     // ECharts 图表库
  "dayjs": "^1.11.10"                 // 日期处理
}
```

### 开发依赖

```json
{
  "@tarojs/cli": "^4.0.0",            // Taro CLI
  "@tarojs/webpack5-runner": "^4.0.0", // Webpack 5 构建器
  "typescript": "^5.1.0",             // TypeScript
  "sass": "^1.56.0"                   // SCSS 预处理器
}
```

## 🏗️ 项目结构

```
miniprogram/
├── dist/                    # 编译输出目录（自动生成）
├── src/
│   ├── pages/               # 页面
│   │   ├── index/          # 首页 ✅
│   │   ├── selection/      # 选型页面 ✅
│   │   ├── login/          # 登录页面 ✅
│   │   ├── products/       # 产品列表 🚧
│   │   ├── result/         # 选型结果详情 🚧
│   │   └── profile/        # 个人中心 🚧
│   ├── services/           # API 服务
│   │   ├── request.ts      # 请求封装 ✅
│   │   ├── user.ts         # 用户 API ✅
│   │   └── pump.ts         # 水泵 API ✅
│   ├── store/              # Redux 状态管理
│   │   ├── index.ts        # Store 配置 ✅
│   │   └── modules/        # Reducers
│   ├── types/              # TypeScript 类型 ✅
│   ├── styles/             # 样式文件 ✅
│   └── app.*               # 入口文件 ✅
├── config/                 # 配置文件 ✅
├── package.json            # 依赖管理
├── tsconfig.json           # TypeScript 配置
├── project.config.json     # 微信小程序配置
└── README.md               # 完整文档
```

## 📝 开发指南

### 创建新页面

1. 在 `src/pages/` 创建新页面目录
2. 创建页面文件（index.tsx, index.scss, index.config.ts）
3. 在 `src/app.config.ts` 中注册页面路由

示例：

```tsx
// src/pages/mypage/index.tsx
import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

export default class MyPage extends Component {
  render() {
    return (
      <View className='my-page'>
        <Text>Hello World</Text>
      </View>
    )
  }
}
```

```scss
// src/pages/mypage/index.scss
.my-page {
  padding: 32px;
}
```

```typescript
// src/pages/mypage/index.config.ts
export default {
  navigationBarTitleText: '我的页面'
}
```

```typescript
// src/app.config.ts
export default {
  pages: [
    // ... 其他页面
    'pages/mypage/index'  // 添加新页面
  ]
}
```

### 调用 API

```typescript
import { get, post } from '@/services/request'

// GET 请求
const response = await get('/pumps', { skip: 0, limit: 20 })
if (response.success) {
  console.log(response.data)
}

// POST 请求
const response = await post('/pump/match', {
  required_flow_rate: 10,
  required_head: 20,
  application_type: '供水',
  fluid_type: '清水',
  pump_type: '离心泵'
})
```

### 使用 Redux

```tsx
import { Component } from 'react'
import { connect } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { getPumps } from '@/store/modules/pump'

@connect(
  ({ pump }: RootState) => ({
    pumps: pump.pumps,
    loading: pump.loading
  }),
  (dispatch: AppDispatch) => ({
    getPumps: () => dispatch(getPumps())
  })
)
class MyComponent extends Component {
  componentDidMount() {
    this.props.getPumps()
  }

  render() {
    // ...
  }
}
```

### 使用样式变量

```scss
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.my-component {
  padding: $spacing-lg;
  background: $color-primary;
  border-radius: $radius-lg;
  @include flex-center();
}
```

## 🔧 常见问题

### 1. 依赖安装失败

```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

### 2. 编译失败

```bash
# 清除编译缓存
rm -rf dist
npm run dev:weapp
```

### 3. 微信开发者工具无法预览

- 确保编译成功（dist 目录有内容）
- 选择正确的项目目录（miniprogram/dist）
- 检查 AppID 是否正确配置

### 4. API 请求失败

- 检查 API_BASE_URL 配置
- 确保后端服务正在运行
- 检查网络连接
- 查看微信开发者工具控制台错误信息

### 5. TypeScript 类型错误

```bash
# 检查 TypeScript 配置
npx tsc --noEmit
```

## 📱 测试流程

### 1. 真机调试

1. 在微信开发者工具中点击"真机调试"
2. 扫描二维码
3. 在手机上预览和测试

### 2. 预览体验

1. 点击"预览"
2. 生成预览二维码
3. 扫码体验

### 3. 上传代码

1. 点击"上传"
2. 填写版本号和备注
3. 上传到微信后台

## 🚢 发布流程

### 1. 构建生产版本

```bash
npm run build:weapp
```

### 2. 使用微信开发者工具上传

1. 打开微信开发者工具
2. 导入 `miniprogram/dist` 目录
3. 点击"上传"
4. 填写版本号和项目备注
5. 确认上传

### 3. 提交审核

1. 登录[微信公众平台](https://mp.weixin.qq.com)
2. 进入"版本管理"
3. 选择开发版本
4. 点击"提交审核"
5. 填写审核信息
6. 等待审核通过（通常 1-7 个工作日）

### 4. 发布上线

审核通过后：
1. 在"版本管理"中选择审核通过版本
2. 点击"发布"
3. 确认发布

## 🔐 安全注意事项

1. **API 地址**
   - 生产环境必须使用 HTTPS
   - 不要在代码中硬编码敏感信息
   - 使用环境变量管理配置

2. **用户数据**
   - Token 存储在本地 Storage
   - 敏感操作需要重新验证
   - 定期清理过期数据

3. **代码保护**
   - 生产构建会自动压缩代码
   - 不要在注释中暴露敏感信息
   - 使用混淆工具保护代码

## 📚 相关资源

- [Taro 官方文档](https://docs.taro.zone/)
- [React 官方文档](https://react.dev/)
- [Redux Toolkit 文档](https://redux-toolkit.js.org/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

## 💡 开发技巧

1. **热更新**
   - 修改代码后自动重新编译
   - 微信开发者工具自动刷新

2. **调试**
   - 使用 `console.log` 输出调试信息
   - 在微信开发者工具中查看控制台
   - 使用断点调试

3. **性能优化**
   - 避免频繁渲染
   - 使用 `useMemo` 和 `useCallback` 优化
   - 合理使用缓存

4. **代码规范**
   - 使用 TypeScript 类型检查
   - 统一的代码风格
   - 有意义的命名

## 🎉 开始你的开发之旅

现在你已经了解了项目的结构和开发流程，可以开始开发了！

如果你遇到任何问题，请查看：
- README.md - 完整文档
- PROJECT_SUMMARY.md - 项目总结
- [Taro 官方文档](https://docs.taro.zone/)

祝你开发顺利！🚀
