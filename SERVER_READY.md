# ✅ 本地服务器已就绪！

## 🎉 服务器状态

**✅ 服务运行成功！**

### 服务器信息
- **内网IP**: `9.128.67.37`
- **端口**: `5000`
- **状态**: ✅ 运行中
- **协议**: HTTP (需要配置 HTTPS 用于微信小程序)

---

## 🌐 访问地址

### 本地访问
```
http://localhost:5000
```

### 内网访问
```
http://9.128.67.37:5000
```

---

## 🚀 配置微信小程序（必须使用 HTTPS）

由于微信小程序 WebView **必须** 使用 HTTPS，需要使用内网穿透工具。

### 方案 1：使用 ngrok（5分钟配置，推荐快速测试）

#### 步骤 1：安装 ngrok

访问 https://ngrok.com/download 下载对应系统的版本。

#### 步骤 2：启动隧道

```bash
# 下载后解压，进入目录
cd /path/to/ngrok

# 启动隧道
./ngrok http 5000
```

您会看到类似输出：
```
Session Status                online
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:5000
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:5000
```

#### 步骤 3：复制 HTTPS URL

复制 `https://abc123.ngrok-free.app`（这是示例，实际 URL 会不同）

#### 步骤 4：配置小程序

**修改 `wechat-miniprogram/app.js`:**
```javascript
globalData: {
  systemInfo: null,
  baseUrl: 'https://abc123.ngrok-free.app'  // 替换为 ngrok URL
}
```

**修改 `wechat-miniprogram/pages/index/index.js`:**
```javascript
data: {
  webviewUrl: 'https://abc123.ngrok-free.app'  // 替换为 ngrok URL
}
```

**修改 `wechat-miniprogram/project.private.config.json`:**
```json
{
  "setting": {
    "urlCheck": false  // 开发阶段关闭域名校验
  }
}
```

#### 步骤 5：测试小程序

1. 打开微信开发者工具
2. 导入 `wechat-miniprogram` 项目
3. 点击「编译」
4. 在模拟器中查看效果

---

### 方案 2：使用 Cloudflare Tunnel（免费，稳定）

#### 步骤 1：注册 Cloudflare

访问 https://dash.cloudflare.com/sign-up 注册账号。

#### 步骤 2：安装 cloudflared

**macOS:**
```bash
brew install cloudflared
```

**Linux:**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

**Windows:**
- 访问 https://github.com/cloudflare/cloudflared/releases
- 下载 Windows 版本

#### 步骤 3：登录 Cloudflare

```bash
cloudflared tunnel login
```

会打开浏览器，授权登录。

#### 步骤 4：创建隧道

```bash
cloudflared tunnel create luowato-pump
```

会获得一个 Tunnel ID，例如：`abc123-def456-ghi789`

#### 步骤 5：配置域名

在 Cloudflare Dashboard 中：
1. 进入 `Zero Trust` → `Networks` → `Tunnels`
2. 找到创建的隧道
3. 点击 `Public Hostname` → `Add a public hostname`
4. 配置：
   - Subdomain: `luowato`（或您想要的）
   - Domain: 选择您的域名（如 `yourdomain.com`）
   - Service: `http://localhost:5000`
5. 保存

#### 步骤 6：启动隧道

```bash
cloudflared tunnel run luowato-pump
```

或者使用配置文件：

```bash
# 创建配置文件
cat > ~/.cloudflared/config.yml << EOF
tunnel: abc123-def456-ghi789  # 替换为您的 Tunnel ID
credentials-file: /home/user/.cloudflared/abc123-def456-ghi789.json

ingress:
  - hostname: luowato.yourdomain.com
    service: http://localhost:5000
  - service: http_status:404
EOF

# 启动
cloudflared tunnel run luowato-pump
```

#### 步骤 7：配置小程序

修改小程序配置文件，使用 Cloudflare Tunnel 提供的域名：
```javascript
// wechat-miniprogram/app.js
globalData: {
  systemInfo: null,
  baseUrl: 'https://luowato.yourdomain.com'  // 替换为您的域名
}
```

---

### 方案 3：使用 frp（生产环境，稳定）

#### 服务端配置（公网服务器）

**安装 frps:**
```bash
# 在公网服务器上
wget https://github.com/fatedier/frp/releases/download/v0.52.3/frp_0.52.3_linux_amd64.tar.gz
tar -xzf frp_0.52.3_linux_amd64.tar.gz
cd frp_0.52.3_linux_amd64
```

**配置 frps.toml:**
```toml
bindPort = 7000
vhostHTTPPort = 80
vhostHTTPSPort = 443

[auth]
token = "your-secret-token"
```

**启动服务端:**
```bash
./frps -c frps.toml
```

#### 客户端配置（当前机器）

**安装 frpc:**
```bash
wget https://github.com/fatedier/frp/releases/download/v0.52.3/frp_0.52.3_linux_amd64.tar.gz
tar -xzf frp_0.52.3_linux_amd64.tar.gz
cd frp_0.52.3_linux_amd64
```

**配置 frpc.toml:**
```toml
serverAddr = "your-public-server-ip"
serverPort = 7000

[auth]
token = "your-secret-token"

[[proxies]]
name = "pump-selection-http"
type = "http"
localPort = 5000
customDomains = ["luowato.yourdomain.com"]

[[proxies]]
name = "pump-selection-https"
type = "https"
localPort = 5000
customDomains = ["luowato.yourdomain.com"]

[[proxies.plugin]]
type = "https2http"
localAddr = "127.0.0.1:5000"
crtPath = "/path/to/cert.pem"
keyPath = "/path/to/key.pem"
hostHeaderRewrite = "luowato.yourdomain.com"
```

**启动客户端:**
```bash
./frpc -c frpc.toml
```

---

## 🛠️ 服务管理

### 查看服务状态

```bash
# 检查端口
ss -lptn 'sport = :5000'

# 查看进程
ps aux | grep next

# 测试服务
curl http://localhost:5000
```

### 查看日志

```bash
# 查看实时日志
tail -f /app/work/logs/bypass/dev.log

# 查看最近 50 行
tail -n 50 /app/work/logs/bypass/dev.log
```

### 停止服务

```bash
# 停止所有 Next.js 进程
pkill -f "next"

# 停止特定进程
kill 1051  # 替换为实际的 PID
```

### 重启服务

```bash
# 停止并重启
pkill -f "next" && cd /workspace/projects && nohup /workspace/projects/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/bin/next dev -p 5000 --webpack > /app/work/logs/bypass/dev.log 2>&1 &

# 或者使用启动脚本
./start-local-server.sh
```

---

## 📋 部署检查清单

### 本地服务
- [x] 服务正在运行
- [x] 端口 5000 可访问
- [x] 内网地址：`http://9.128.67.37:5000`
- [x] HTTP 响应正常

### ngrok 方案
- [ ] 已安装 ngrok
- [ ] ngrok 隧道已启动
- [ ] 已获取 HTTPS URL
- [ ] 小程序配置已更新
- [ ] 小程序测试通过

### Cloudflare Tunnel 方案
- [ ] 已注册 Cloudflare 账号
- [ ] 已安装 cloudflared
- [ ] 已创建隧道
- [ ] 已配置域名
- [ ] 隧道已启动
- [ ] 小程序配置已更新
- [ ] 小程序测试通过

### frp 方案
- [ ] 已配置公网服务器
- [ ] 服务端 frps 已启动
- [ ] 客户端 frpc 已启动
- [ ] 域名已解析
- [ ] HTTPS 证书已配置
- [ ] 小程序配置已更新
- [ ] 小程序测试通过

---

## 🎯 推荐方案

| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| **开发测试** | ngrok | 快速配置，5分钟可用 |
| **免费稳定** | Cloudflare Tunnel | 完全免费，稳定可靠 |
| **生产环境** | frp + 公网服务器 | 可控性强，适合企业 |

---

## 📖 相关文档

- **本地服务器详细配置**: `cat LOCAL_SERVER.md`
- **微信小程序配置**: `cat wechat-miniprogram/README.md`
- **小程序快速部署**: `cat wechat-miniprogram/QUICKSTART.md`
- **快速启动脚本**: `./start-local-server.sh`

---

## 💡 提示

1. **HTTPS 必须**: 微信小程序 WebView 必须使用 HTTPS，HTTP 无法访问
2. **域名配置**: 需要在微信公众平台配置业务域名
3. **验证文件**: 需要上传验证文件到服务器根目录
4. **URL 变化**: ngrok 免费版 URL 会变化，生产环境建议使用固定域名
5. **服务稳定性**: Cloudflare Tunnel 和 frp 比 ngrok 更稳定

---

## 🚀 立即开始

```bash
# 1. 查看服务状态
ss -lptn 'sport = :5000'

# 2. 使用 ngrok（最简单）
ngrok http 5000

# 3. 复制 HTTPS URL
# 4. 配置小程序
# 5. 在微信开发者工具中测试
```

---

**现在您的服务器已经就绪，可以开始配置微信小程序了！** 🎉
