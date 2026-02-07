# 🖥️ 本地服务器配置指南

## 当前服务器信息

**服务器地址**: `9.128.67.37` (内网IP)
**端口**: `5000`
**访问方式**: 需要内网穿透或 VPN

---

## 🚀 快速部署方案

### 方案 A：使用内网穿透工具（推荐用于微信小程序）

由于微信小程序必须使用 HTTPS，使用内网穿透工具创建公网 HTTPS 域名。

#### 1. 使用 frp（推荐）

**服务端配置（公网服务器）：**
```toml
# frps.toml
bindPort = 7000
vhostHTTPPort = 80
vhostHTTPSPort = 443
```

**客户端配置（当前机器）：**
```toml
# frpc.toml
serverAddr = "your-public-server-ip"
serverPort = 7000

[[proxies]]
name = "pump-selection"
type = "http"
localPort = 5000
customDomains = ["luowato.yourdomain.com"]
```

#### 2. 使用 ngrok（快速测试）

```bash
# 下载 ngrok
# 访问 https://ngrok.com/download

# 启动隧道
ngrok http 5000

# 获取 HTTPS URL（如：https://abc123.ngrok-free.app）
```

#### 3. 使用 Cloudflare Tunnel（免费）

```bash
# 安装 cloudflared
# 访问 https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# 登录
cloudflared tunnel login

# 创建隧道
cloudflared tunnel create luowato-pump

# 配置隧道
cloudflared tunnel route dns luowato-pump luowato.yourdomain.com

# 启动隧道
cloudflared tunnel run luowato-pump
```

---

### 方案 B：配置公网服务器（生产环境推荐）

#### 1. 将代码部署到公网服务器

```bash
# 在当前机器
cd /workspace/projects
tar -czf pump-selection.tar.gz ./

# 传输到公网服务器
scp pump-selection.tar.gz user@your-server:/var/www/

# 在公网服务器
ssh user@your-server
cd /var/www
tar -xzf pump-selection.tar.gz
cd pump-selection

# 安装依赖
pnpm install

# 构建
pnpm build

# 启动服务
pnpm start
```

#### 2. 使用 PM2 管理服务

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start npm --name "pump-selection" -- start

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs pump-selection
```

#### 3. 配置 Nginx 反向代理

```nginx
# /etc/nginx/sites-available/pump-selection
server {
    listen 80;
    server_name luowato.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 启用配置
ln -s /etc/nginx/sites-available/pump-selection /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 4. 配置 HTTPS（Let's Encrypt）

```bash
# 安装 certbot
apt install certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d luowato.yourdomain.com

# 自动续期
certbot renew --dry-run
```

---

## 📱 微信小程序配置

### 1. 配置业务域名

登录 https://mp.weixin.qq.com/:
- 开发 → 开发管理 → 开发设置 → 业务域名
- 添加您的域名（如：`luowato.yourdomain.com` 或 `abc123.ngrok-free.app`）

### 2. 上传验证文件

创建验证文件：
```bash
# 在项目根目录
echo "your-verification-code" > public/MP_verify_xxxxx.txt
```

重启服务后验证：
```bash
curl https://your-domain.com/MP_verify_xxxxx.txt
```

### 3. 配置小程序

修改 `wechat-miniprogram/app.js`:
```javascript
globalData: {
  systemInfo: null,
  baseUrl: 'https://your-domain.com'  // 替换为您的 HTTPS 域名
}
```

修改 `wechat-miniprogram/pages/index/index.js`:
```javascript
data: {
  webviewUrl: 'https://your-domain.com'  // 替换为您的 HTTPS 域名
}
```

---

## 🔧 本地服务管理

### 启动服务

```bash
# 方式 1: 使用 coze dev
coze dev

# 方式 2: 直接使用 next
cd /workspace/projects
/workspace/projects/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/bin/next dev -p 5000

# 方式 3: 使用 PM2
pm2 start npm --name "pump-selection" -- dev
```

### 停止服务

```bash
# 停止所有 Next.js 进程
pkill -f "next"

# 停止特定服务
pm2 stop pump-selection
```

### 查看日志

```bash
# 查看应用日志
tail -f /app/work/logs/bypass/dev.log

# 查看 PM2 日志
pm2 logs pump-selection
```

### 检查服务状态

```bash
# 检查端口
ss -lptn 'sport = :5000'

# 测试服务
curl http://localhost:5000

# 查看 PM2 状态
pm2 status
```

---

## 🌐 网络配置

### 当前机器信息

```
内网IP: 9.128.67.37
端口: 5000
状态: 运行中
```

### 内网访问

在同一局域网内，可以通过以下地址访问：

```
http://9.128.67.37:5000
```

### 外网访问

需要使用内网穿透工具或公网服务器：

**选项 1: ngrok（快速）**
```bash
ngrok http 5000
# 获得: https://abc123.ngrok-free.app
```

**选项 2: frp（稳定）**
```bash
# 配置 frp 客户端
frpc -c frpc.toml
# 获得: https://luowato.yourdomain.com
```

**选项 3: Cloudflare Tunnel（免费）**
```bash
cloudflared tunnel run luowato-pump
# 获得: https://luowato.yourdomain.com
```

---

## 📊 推荐方案对比

| 方案 | 成本 | 稳定性 | 设置难度 | 适合场景 |
|------|------|--------|----------|----------|
| **ngrok** | 免费版有限 | ⭐⭐⭐ | ⭐ | 快速测试 |
| **frp** | 需要公网服务器 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 生产环境 |
| **Cloudflare Tunnel** | 免费 | ⭐⭐⭐⭐ | ⭐⭐ | 免费方案 |
| **公网服务器** | 付费 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 企业级 |

---

## 🚀 立即开始

### 快速测试（5分钟）

```bash
# 1. 确认服务运行
ss -lptn 'sport = :5000'

# 2. 下载并启动 ngrok
# 访问 https://ngrok.com/download 下载
ngrok http 5000

# 3. 复制 HTTPS URL
# 例如：https://abc123.ngrok-free.app

# 4. 配置小程序
# 修改 wechat-miniprogram/app.js 和 pages/index/index.js

# 5. 在微信开发者工具中测试
```

### 生产部署（30分钟）

```bash
# 1. 购买公网服务器
# 阿里云、腾讯云、AWS 等

# 2. 配置 frp
# 在公网服务器和当前机器配置 frp

# 3. 配置 HTTPS
# 使用 Let's Encrypt 免费证书

# 4. 配置域名
# 购买域名并解析

# 5. 配置小程序
# 在微信公众平台配置业务域名

# 6. 提交审核
# 在微信开发者工具提交小程序
```

---

## 📞 需要帮助？

- ngrok 文档: https://ngrok.com/docs
- frp 文档: https://github.com/fatedier/frp
- Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- PM2 文档: https://pm2.keymetrics.io/docs/usage/quick-start/

---

## 🎯 推荐流程

**开发阶段**（今天）
1. 使用 ngrok 创建 HTTPS 隧道
2. 配置小程序使用 ngrok URL
3. 在微信开发者工具中测试

**生产环境**（本周）
1. 购买公网服务器（约 ¥50/月）
2. 配置 frp 内网穿透
3. 配置域名和 HTTPS
4. 提交小程序审核

---

**开始部署吧！** 🚀
