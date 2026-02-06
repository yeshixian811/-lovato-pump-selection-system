# 🚀 快速部署指南

## 当前服务状态

✅ **项目已在运行** - 端口 5000

访问地址：
- 本地：http://localhost:5000
- 网络：http://9.129.95.222:5000

---

## 📱 微信小程序 HTTPS 部署方案

微信小程序 WebView **必须** 使用 HTTPS，提供以下两种方案：

### 方案 A：ngrok HTTPS 隧道（推荐用于开发测试）

#### 安装 ngrok

**macOS:**
```bash
brew install ngrok
```

**Linux:**
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok -y
```

**Windows:**
- 访问 https://ngrok.com/download
- 下载并解压

#### 启动 HTTPS 隧道

```bash
ngrok http 5000
```

您会看到类似输出：
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:5000
```

#### 配置小程序

复制 ngrok URL（如：`https://abc123.ngrok-free.app`），修改以下文件：

1. `wechat-miniprogram/app.js` 第 21 行：
```javascript
baseUrl: 'https://abc123.ngrok-free.app'  // 替换为 ngrok URL
```

2. `wechat-miniprogram/pages/index/index.js` 第 5 行：
```javascript
webviewUrl: 'https://abc123.ngrok-free.app'  // 替换为 ngrok URL
```

3. `wechat-miniprogram/project.private.config.json`：
```json
{
  "setting": {
    "urlCheck": false  // 开发阶段关闭域名校验
  }
}
```

---

### 方案 B：Vercel 部署（推荐用于生产环境）

#### 安装 Vercel CLI

```bash
pnpm add -g vercel
```

#### 登录

```bash
vercel login
```

#### 部署

```bash
# 在项目根目录
cd /workspace/projects

# 部署到 Vercel
vercel
```

按提示操作：
1. 选择 "Set up and deploy"
2. 选择账号和项目名称
3. 确认配置

#### 记录部署 URL

部署成功后，Vercel 会提供 HTTPS URL，如：
```
https://luowato-pump-selection.vercel.app
```

#### 配置小程序

修改 `wechat-miniprogram/app.js` 和 `wechat-miniprogram/pages/index/index.js` 中的 URL 为 Vercel URL。

#### 配置业务域名

1. 登录 https://mp.weixin.qq.com/
2. 进入：开发 → 开发管理 → 开发设置 → 业务域名
3. 添加 Vercel 域名
4. 下载验证文件（如：`MP_verify_xxxxx.txt`）
5. 创建验证文件：

```bash
mkdir -p public
echo "your-verification-code" > public/MP_verify_xxxxx.txt
```

6. 重新部署：

```bash
vercel --prod
```

---

## 🛠️ 常用命令

### 服务管理

```bash
# 快速启动（查看状态）
./quick-start.sh

# 启动服务
coze dev

# 停止服务
pkill -f "next-server"

# 重启服务
pkill -f "next-server" && coze dev > /app/work/logs/bypass/dev.log 2>&1 &

# 查看日志
tail -f /app/work/logs/bypass/dev.log
```

### ngrok

```bash
# 启动隧道
ngrok http 5000

# 查看请求日志（访问 http://localhost:4040）
```

### Vercel

```bash
# 部署
vercel

# 生产部署
vercel --prod

# 查看日志
vercel logs

# 查看部署历史
vercel list

# 本地预览生产构建
vercel build
vercel dev
```

---

## 📋 部署清单

### ngrok 方案（开发测试）
- [ ] 服务正在运行（5000 端口）
- [ ] 已安装 ngrok
- [ ] ngrok 隧道已启动
- [ ] 已记录 HTTPS URL
- [ ] 小程序配置已更新（URL + urlCheck: false）
- [ ] 小程序测试通过

### Vercel 方案（生产环境）
- [ ] 已安装 Vercel CLI
- [ ] 已登录 Vercel 账号
- [ ] 项目已部署到 Vercel
- [ ] 已记录 HTTPS URL
- [ ] 业务域名已配置（微信后台）
- [ ] 验证文件已上传到 Vercel
- [ ] 小程序配置已更新（URL + urlCheck: true）
- [ ] 小程序测试通过

---

## 🔍 验证部署

### 本地服务

```bash
# 检查端口
ss -lptn 'sport = :5000'

# 测试响应
curl http://localhost:5000

# 应该返回 HTML 内容
```

### ngrok

```bash
# 访问 ngrok 控制面板
# 浏览器打开：http://localhost:4040

# 查看当前 HTTPS URL
# 在控制面板中查看 Forwarding URL
```

### Vercel

```bash
# 测试 HTTPS 响应
curl https://your-vercel-app.vercel.app

# 查看部署日志
vercel logs

# 访问 Vercel Dashboard
https://vercel.com/dashboard
```

---

## 🐛 常见问题

### Q: ngrok URL 经常变化怎么办？
**A:** 注册 ngrok 账号并配置 authtoken，或使用 Vercel 获取稳定域名。

### Q: 小程序提示「不在合法域名列表中」？
**A:** 登录微信公众平台，配置「业务域名」并上传验证文件。

### Q: Vercel 部署后 404 错误？
**A:** 检查 `package.json` 中的 `build` 脚本，运行 `vercel logs` 查看日志。

### Q: 本地服务无法访问？
**A:** 检查端口占用，重启服务：`pkill -f "next-server" && coze dev`

---

## 📖 详细文档

- **完整部署指南**：`DEPLOYMENT.md`
- **小程序配置**：`wechat-miniprogram/README.md`
- **快速启动指南**：`wechat-miniprogram/QUICKSTART.md`

---

## 🎯 推荐流程

**开发阶段**：
1. 使用 `./quick-start.sh` 启动本地服务
2. 使用 `ngrok http 5000` 创建 HTTPS 隧道
3. 配置小程序使用 ngrok URL
4. 在微信开发者工具中测试

**生产环境**：
1. 使用 `vercel` 部署到 Vercel
2. 配置微信业务域名
3. 上传验证文件
4. 配置小程序使用 Vercel URL
5. 提交审核发布

---

## 🚀 开始部署

```bash
# 查看当前服务状态
./quick-start.sh

# 使用 ngrok（开发测试）
ngrok http 5000

# 或部署到 Vercel（生产环境）
vercel
```

**开始吧！** 🎉
