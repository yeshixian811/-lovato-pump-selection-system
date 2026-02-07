# 微信小程序集成指南

本项目已针对微信小程序 WebView 进行了优化，可以在微信小程序中正常使用。

## 功能特性

✅ H5 响应式布局，完美适配各种屏幕尺寸
✅ 微信浏览器兼容
✅ 微信小程序 WebView 兼容
✅ 微信 JSSDK 集成（支持分享功能）
✅ 自动检测微信环境
✅ 微信分享配置

## 配置步骤

### 1. 配置环境变量

在 `.env` 文件中添加以下配置：

```env
# 微信公众号 AppID（用于微信 JSSDK）
NEXT_PUBLIC_WECHAT_APP_ID=your_wechat_app_id_here

# 微信小程序 AppID（可选）
NEXT_PUBLIC_MINIPROGRAM_APP_ID=your_miniprogram_app_id_here

# 微信 AppSecret（仅服务端使用）
WECHAT_APP_SECRET=your_wechat_app_secret_here
```

### 2. 配置业务域名

登录[微信公众平台](https://mp.weixin.qq.com)，在以下位置配置：

- **公众号**：设置 → 公众号设置 → 功能设置 → JS 接口安全域名
- **小程序**：开发 → 开发管理 → 开发设置 → 业务域名

将您的域名（如 `https://luowato.com`）添加到白名单。

**注意**：必须使用 HTTPS 协议。

### 3. 创建微信小程序页面

在小程序中创建一个 WebView 页面，例如 `pages/webview/index`：

```javascript
// pages/webview/index.js
Page({
  data: {
    url: '',
  },

  onLoad(options) {
    const { url } = options;
    if (url) {
      this.setData({
        url: decodeURIComponent(url),
      });
    }
  },
});
```

```xml
<!-- pages/webview/index.wxml -->
<web-view src="{{url}}" />
```

```json
{
  "navigationBarTitleText": "洛瓦托选型"
}
```

### 4. 在小程序中调用

```javascript
// 跳转到选型页面
wx.navigateTo({
  url: '/pages/webview/index?url=' + encodeURIComponent('https://luowato.com/selection')
});
```

## 微信 JSSDK 功能

### 分享功能

页面已自动配置微信分享，包括：
- 分享给朋友
- 分享到朋友圈

分享内容可以在 `src/components/wechat/initializer.tsx` 中配置。

### 自定义分享

如需自定义分享内容，在页面中使用 `WechatShareConfig` 组件：

```tsx
<WechatShareConfig
  title="自定义标题"
  desc="自定义描述"
  link="https://luowato.com/custom-page"
  imgUrl="/custom-image.png"
/>
```

## API 接口

### 获取微信签名

用于微信 JSSDK 初始化：

```javascript
POST /api/wechat/signature
{
  "appId": "your_app_id",
  "url": "https://luowato.com/selection"
}

Response:
{
  "appId": "your_app_id",
  "timestamp": 1234567890,
  "nonceStr": "random_string",
  "signature": "calculated_signature"
}
```

## 环境检测

项目提供了多个工具函数用于检测微信环境：

```typescript
import {
  isWechatBrowser,
  isWechatMiniProgram,
  getWechatEnvironment,
  navigateTo,
  navigateBack,
  showToast
} from '@/lib/wechat';

// 检测是否在微信浏览器
if (isWechatBrowser()) {
  console.log('在微信浏览器中');
}

// 检测是否在微信小程序中
if (isWechatMiniProgram()) {
  console.log('在微信小程序中');
}

// 获取完整环境信息
const env = getWechatEnvironment();
console.log(env);

// 兼容微信小程序的页面跳转
navigateTo('/selection');

// 兼容微信小程序的返回
navigateBack();

// 兼容微信小程序的 Toast
showToast('操作成功');
```

## 注意事项

### HTTPS 要求

微信小程序强制要求使用 HTTPS 协议。请确保：

1. 域名已配置 SSL 证书
2. 所有资源都使用 HTTPS
3. API 接口都使用 HTTPS

### 域名白名单

必须将域名添加到微信公众平台的业务域名白名单中，否则无法加载。

### User-Agent 检测

小程序 WebView 会包含 `miniprogram` 标识：

```
Mozilla/5.0 (Linux; Android 10; MI 9) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.62 XWEB/2695 MMWEBSDK/20200801 Mobile Safari/537.36 MiniProgram Env/Wechat
```

### 导航栏

在微信小程序中，系统会自动隐藏网页导航栏，使用小程序的导航栏。

### 返回按钮

在小程序环境中，使用微信小程序的返回按钮而非网页的返回按钮。

## 性能优化

1. **图片优化**：使用 WebP 格式，压缩图片大小
2. **懒加载**：图片和内容使用懒加载
3. **缓存策略**：合理使用浏览器缓存
4. **CDN 加速**：静态资源使用 CDN 分发

## 测试

### 微信开发者工具

1. 打开微信开发者工具
2. 选择小程序项目
3. 在模拟器中测试 WebView 页面

### 真机测试

1. 在真机上运行小程序
2. 测试各种设备和网络环境
3. 测试不同微信版本

## 常见问题

### Q: 页面无法加载？

A: 检查以下项：
- 域名是否已添加到白名单
- 是否使用 HTTPS
- 证书是否有效

### Q: 分享功能不工作？

A: 检查以下项：
- 是否正确配置了 AppID
- 是否正确获取了签名
- JSSDK 是否正确初始化

### Q: 页面样式错乱？

A: 检查以下项：
- 是否正确配置了 viewport
- 是否使用了响应式布局
- 是否在小程序环境中隐藏了导航栏

## 技术支持

如有问题，请联系技术支持：
- Email: support@luowato.com
- 电话: 400-xxx-xxxx
