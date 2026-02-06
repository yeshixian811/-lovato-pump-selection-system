# 🚀 快速部署指南

## 5 分钟快速上线

### 第 1 步：准备账号（5 分钟）

1. **注册小程序账号**
   - 访问：https://mp.weixin.qq.com/
   - 注册小程序（需要邮箱、手机号）
   - 完成信息填写：
     - 名称：洛瓦托水泵选型
     - 简介：智能水泵选型工具
     - 类目：工具

2. **获取 AppID**
   - 登录微信公众平台
   - 进入：开发 → 开发管理 → 开发设置
   - 复制「开发者ID (AppID)」

---

### 第 2 步：配置域名（5 分钟）

⚠️ **重要：必须使用 HTTPS！**

#### 2.1 部署 Web 应用（如果还没有）
推荐使用 Vercel（免费 HTTPS）：
```bash
# 在项目根目录
pnpm build
vercel --prod
```

#### 2.2 配置业务域名
1. 登录微信公众平台
2. 进入：开发 → 开发管理 → 开发设置 → 业务域名
3. 点击「配置业务域名」
4. 添加您的域名（如：`luowato.vercel.app`）
5. 下载验证文件并上传到 Web 服务器根目录
6. 确认可以通过 `https://your-domain.com/MP_verify_xxxxx.txt` 访问

---

### 第 3 步：配置小程序（2 分钟）

修改以下文件：

#### 3.1 `project.config.json`
```json
{
  "appid": "wx1234567890abcdef"  // 替换为您的 AppID
}
```

#### 3.2 `app.js`
```javascript
globalData: {
  systemInfo: null,
  baseUrl: 'https://luowato.vercel.app'  // 替换为您的域名
}
```

#### 3.3 `pages/index/index.js`
```javascript
data: {
  webviewUrl: 'https://luowato.vercel.app'  // 替换为您的域名
}
```

---

### 第 4 步：导入项目（2 分钟）

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开开发者工具，选择「小程序」
3. 点击「导入项目」
4. 选择目录：`wechat-miniprogram`
5. 填写：
   - 项目名称：洛瓦托水泵选型
   - AppID：粘贴您的 AppID
6. 点击「导入」

---

### 第 5 步：本地测试（5 分钟）

#### 5.1 开发阶段测试（使用 ngrok）

1. **安装 ngrok**
   ```bash
   # macOS
   brew install ngrok

   # Windows: 从 https://ngrok.com 下载
   ```

2. **启动 ngrok 隧道**
   ```bash
   # 确保您的本地开发服务器正在运行
   # 启动 Next.js 开发服务器
   cd /workspace/projects
   coze dev

   # 新开终端，启动 ngrok
   ngrok http 5000
   ```

3. **获取 HTTPS URL**
   - 复制 ngrok 生成的 HTTPS URL（如：`https://abc123.ngrok.io`）

4. **修改小程序配置**
   - 修改 `project.private.config.json`：
     ```json
     {
       "setting": {
         "urlCheck": false  // 关闭域名校验
       }
     }
     ```
   - 修改 `app.js` 和 `pages/index/index.js` 中的 URL 为 ngrok URL

5. **测试**
   - 点击微信开发者工具的「编译」按钮
   - 在模拟器中查看效果

#### 5.2 生产环境测试

1. 确保您的 Web 应用已部署到 HTTPS 域名
2. 修改 `app.js` 和 `pages/index/index.js` 中的 URL 为生产域名
3. 在 `project.private.config.json` 中设置 `urlCheck: true`
4. 点击「编译」测试

---

### 第 6 步：提交审核（5 分钟）

1. **上传代码**
   - 点击开发者工具的「上传」按钮
   - 填写版本号（如：1.0.0）
   - 填写更新日志（如：初始版本发布）

2. **提交审核**
   - 登录微信公众平台
   - 进入：版本管理 → 开发版本
   - 点击「提交审核」
   - 填写信息：
     - 测试账号：（如果有，提供账号密码）
     - 功能页面：选择「首页」
     - 类目：选择「工具」

3. **等待审核**
   - 通常 1-7 个工作日
   - 审核通过后会收到微信通知

---

### 第 7 步：发布上线（1 分钟）

1. 登录微信公众平台
2. 进入：版本管理 → 审核版本
3. 点击「发布」
4. 🎉 小程序正式上线！

---

## 📱 如何找到小程序

### 微信搜索
1. 打开微信
2. 点击「发现」→「小程序」
3. 点击右上角「搜索」
4. 输入「洛瓦托水泵选型」
5. 点击搜索结果进入小程序

### 扫码进入
1. 登录微信公众平台
2. 进入：设置 → 基本设置 → 小程序码
3. 下载小程序二维码
4. 用户扫码即可进入

---

## 🔧 常见问题快速解决

### ❌ 问题 1：WebView 显示空白

**解决方案：**
1. 检查 URL 是否为 HTTPS（必须）
2. 检查域名是否已添加到「业务域名」
3. 打开调试器查看控制台错误

### ❌ 问题 2：提示「不在合法域名列表中」

**解决方案：**
1. 登录微信公众平台
2. 进入：开发 → 开发设置 → 服务器域名
3. 添加您的 API 域名

### ❌ 问题 3：登录功能不正常

**解决方案：**
1. 确认 Web 应用使用 localStorage 存储登录状态
2. 避免使用 Cookie（小程序限制较多）

### ❌ 问题 4：开发阶段测试本地代码

**解决方案：**
```bash
# 使用 ngrok 创建 HTTPS 隧道
ngrok http 5000

# 修改小程序配置
# project.private.config.json: urlCheck: false
# app.js 和 pages/index/index.js: 使用 ngrok URL
```

---

## 📞 需要帮助？

- **微信开发者文档**：https://developers.weixin.qq.com/miniprogram/dev/framework/
- **项目 README**：查看完整的 README.md
- **联系技术支持**：support@luowato.com

---

## ✅ 上线检查清单

发布前请确认：

- [ ] 已注册小程序账号
- [ ] 已获取 AppID
- [ ] Web 应用已部署到 HTTPS 域名
- [ ] 业务域名已配置并验证
- [ ] 服务器域名已配置（如果有 API 调用）
- [ ] 小程序配置文件已正确填写
- [ ] 本地测试通过
- [ ] 生产环境测试通过
- [ ] 已上传代码
- [ ] 已提交审核
- [ ] 审核通过
- [ ] 已发布上线

---

🎉 **恭喜！小程序已成功上线！**
