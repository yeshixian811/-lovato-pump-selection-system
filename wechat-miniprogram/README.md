# 洛瓦托水泵选型小程序

基于 H5 + WebView 方案快速上线的水泵选型小程序。

## 项目特点

- ✅ **快速上线**：1天内完成开发
- ✅ **零代码改造**：保持当前 Next.js Web 应用
- ✅ **功能完整**：所有现有功能都能正常使用
- ✅ **易于维护**：只需维护一个 Web 版本

## 项目结构

```
wechat-miniprogram/
├── app.js                 # 小程序入口文件
├── app.json               # 小程序全局配置
├── app.wxss               # 小程序全局样式
├── sitemap.json           # 小程序索引配置
├── project.config.json    # 项目配置文件
├── project.private.config.json  # 项目私有配置
├── README.md              # 使用说明
└── pages/
    └── index/             # 首页（WebView 页面）
        ├── index.wxml     # 页面结构
        ├── index.js       # 页面逻辑
        ├── index.wxss     # 页面样式
        └── index.json     # 页面配置
```

## 快速开始

### 1. 准备工作

#### 1.1 注册小程序账号
1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册小程序账号（需要邮箱、手机号）
3. 完成「小程序信息」填写：
   - 名称：洛瓦托水泵选型
   - 简介：智能水泵选型工具，支持性能曲线分析和参数匹配
   - 类目：选择「工具」

#### 1.2 获取 AppID
1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入「开发」→「开发管理」→「开发设置」
3. 复制「开发者ID (AppID)」

### 2. 下载微信开发者工具

1. 访问 [微信开发者工具下载页面](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 根据您的操作系统下载对应版本
3. 安装并启动开发者工具

### 3. 配置项目

#### 3.1 配置 AppID
打开 `project.config.json`，将 `appid` 替换为您的小程序 AppID：

```json
{
  "appid": "wx1234567890abcdef"  // 替换为您的 AppID
}
```

#### 3.2 配置业务域名
**重要：微信小程序 WebView 必须使用 HTTPS 协议！**

1. 确保您的 Web 应用已部署到支持 HTTPS 的服务器
2. 登录 [微信公众平台](https://mp.weixin.qq.com/)
3. 进入「开发」→「开发管理」→「开发设置」→「业务域名」
4. 点击「配置业务域名」，添加您的域名（如：`luowato.com`）
5. 下载验证文件（如：`MP_verify_xxxxx.txt`）
6. 将验证文件上传到您的 Web 服务器根目录
7. 确保可以通过 `https://your-domain.com/MP_verify_xxxxx.txt` 访问
8. 返回微信公众平台，点击「确定」

#### 3.3 配置 WebView URL
**修改以下文件中的 URL：**

1. `app.js` 第 21 行：
```javascript
globalData: {
  systemInfo: null,
  baseUrl: 'https://luowato.com'  // 替换为您的实际域名
}
```

2. `pages/index/index.js` 第 5 行：
```javascript
data: {
  webviewUrl: 'https://luowato.com'  // 替换为您的实际域名
}
```

### 4. 导入项目

1. 打开微信开发者工具
2. 选择「小程序」
3. 点击「导入项目」
4. 选择项目目录：`wechat-miniprogram`
5. 填写项目名称：洛瓦托水泵选型
6. 填写 AppID：粘贴您的 AppID
7. 点击「导入」

### 5. 本地测试

#### 5.1 开发阶段（本地测试）
1. 打开 `project.private.config.json`，将 `urlCheck` 设置为 `false`：
```json
{
  "setting": {
    "urlCheck": false  // 开发阶段关闭域名校验
  }
}
```

2. 使用本地 HTTPS 开发服务器（需要配置本地 HTTPS）
   - 推荐：使用 `ngrok` 创建 HTTPS 隧道
   - 或使用 Vercel/Netlify 等平台

3. 点击开发者工具的「编译」按钮
4. 在模拟器中查看效果

#### 5.2 使用 ngrok 本地测试（推荐）
```bash
# 安装 ngrok
# macOS: brew install ngrok
# Windows: 从 https://ngrok.com 下载

# 启动 ngrok 隧道（指向您的本地开发服务器）
ngrok http 5000

# 复制生成的 HTTPS URL（如：https://abc123.ngrok.io）
```

### 6. 部署生产环境

#### 6.1 部署 Web 应用
将您的 Next.js 应用部署到支持 HTTPS 的服务器：
- Vercel（推荐，免费 HTTPS）
- Netlify
- 阿里云/腾讯云/华为云
- 自有服务器（需配置 SSL 证书）

#### 6.2 更新小程序配置
将 `app.js` 和 `pages/index/index.js` 中的 URL 更新为生产域名。

#### 6.3 提交审核
1. 点击开发者工具的「上传」按钮
2. 填写版本号和更新日志
3. 登录 [微信公众平台](https://mp.weixin.qq.com/)
4. 进入「版本管理」→「开发版本」
5. 点击「提交审核」
6. 填写审核信息：
   - 测试账号：提供测试用的账号密码
   - 功能页面：选择「首页」
   - 类目：选择「工具」
7. 等待审核（通常 1-7 个工作日）

#### 6.4 发布上线
审核通过后：
1. 进入「版本管理」→「审核版本」
2. 点击「发布」
3. 小程序正式上线！

## 进阶配置

### 1. 微信登录集成（可选）

如果您想实现微信小程序登录，需要在 Web 应用中集成微信 OAuth。

#### 1.1 配置微信网页授权
1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入「开发」→「接口设置」→「网页账号」
3. 配置「网页授权域名」

#### 1.2 Web 应用集成微信登录
```javascript
// 在 Next.js 应用中
// src/lib/wechat-auth.ts

export function getWechatAuthUrl() {
  const appId = 'your-wechat-appid'
  const redirectUri = encodeURIComponent('https://your-domain.com/api/auth/callback')
  const scope = 'snsapi_userinfo'

  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=STATE#wechat_redirect`
}
```

### 2. 消息推送（可选）

如果您想在微信小程序中接收消息通知，可以配置服务器地址。

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入「开发」→「开发设置」→「服务器域名」
3. 配置「socket 合法域名」

### 3. 分享功能（可选）

在小程序中添加分享功能。

#### 3.1 修改 index.js
```javascript
onShareAppMessage() {
  return {
    title: '洛瓦托水泵选型 - 智能选型工具',
    path: '/pages/index/index',
    imageUrl: '/assets/share-image.png'
  }
}
```

## 常见问题

### Q1: WebView 页面显示空白？
**A:** 检查以下几点：
1. 确认 URL 是否为 HTTPS
2. 确认域名是否已添加到「业务域名」
3. 打开调试器查看控制台错误信息

### Q2: 提示「不在以下 request 合法域名列表中」？
**A:** 需要配置「服务器域名」：
1. 登录微信公众平台
2. 进入「开发」→「开发设置」→「服务器域名」
3. 添加您的 API 域名

### Q3: 登录功能不正常？
**A:** 检查 Cookie 和 localStorage：
1. 微信小程序 WebView 中 localStorage 可以使用
2. 确保您的 Web 应用使用 localStorage 存储登录状态
3. 避免使用 Cookie（小程序中限制较多）

### Q4: 如何更新小程序？
**A:**
1. 修改代码
2. 在微信开发者工具中点击「上传」
3. 登录微信公众平台提交审核
4. 审核通过后发布

### Q5: 开发阶段如何测试本地代码？
**A:** 使用 ngrok 或其他内网穿透工具：
```bash
# 使用 ngrok
ngrok http 5000

# 获取 HTTPS URL（如：https://abc123.ngrok.io）
# 修改小程序中的 URL 为 ngrok URL
# 在 project.private.config.json 中设置 urlCheck: false
```

## 性能优化建议

1. **启用 Web 加速**
   - 在 `project.config.json` 中设置 `useEngineNative: true`

2. **预加载资源**
   - 在 Web 应用中预加载关键资源
   - 使用 `<link rel="preload">`

3. **优化图片**
   - 使用 WebP 格式
   - 压缩图片大小

4. **使用 CDN**
   - 静态资源使用 CDN 加速
   - 减少服务器负载

5. **缓存策略**
   - 合理设置 HTTP 缓存头
   - 使用 Service Worker 缓存资源

## 安全建议

1. **使用 HTTPS**
   - 必须使用 HTTPS 协议
   - 配置有效的 SSL 证书

2. **验证来源**
   - 验证请求是否来自微信小程序
   - 检查 User-Agent 或 Token

3. **数据加密**
   - 敏感数据加密传输
   - 使用 HTTPS 加密通信

4. **防范 XSS**
   - 对用户输入进行过滤和转义
   - 使用 CSP（内容安全策略）

## 更新日志

### v1.0.0 (2026-02-06)
- ✅ 初始版本发布
- ✅ 集成 WebView 加载 Web 应用
- ✅ 支持微信小程序基础功能

## 联系方式

- 项目名称：洛瓦托水泵选型
- 官网：https://luowato.com
- 技术支持：support@luowato.com

## 许可证

Copyright © 2026 洛瓦托水泵选型系统
