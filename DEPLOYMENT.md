# 洛瓦托水泵选型系统 - 部署指南

## 📋 目录
- [服务器配置](#服务器配置)
- [快速部署](#快速部署)
- [微信小程序配置](#微信小程序配置)
- [内网穿透方案](#内网穿透方案)
- [常见问题](#常见问题)

---

## 🖥️ 服务器配置

### 当前服务器状态
- **内网IP**: `9.128.67.37`
- **服务端口**: `5000`
- **服务状态**: ✅ 运行中
- **进程管理**: PM2
- **访问地址**: 
  - 内网: `http://9.128.67.37:5000`
  - 本地: `http://localhost:5000`

### 环境要求
- Node.js 24+
- PostgreSQL 数据库
- PM2 进程管理器
- 内网穿透工具（ngrok/cloudflared）

---

## 🚀 快速部署

### 方式一：一键启动脚本

```bash
# 进入项目目录
cd /workspace/projects

# 启动所有服务
./scripts/start-all.sh

# 查看服务状态
./scripts/status.sh

# 停止所有服务
./scripts/stop-all.sh
```

### 方式二：手动启动

#### 1. 安装依赖
```bash
pnpm install
```

#### 2. 配置环境变量

编辑 `.env` 文件（如果不存在则创建）：
```env
# 数据库配置
DATABASE_URL="postgresql://user:password@localhost:5432/luowato_pump"

# 服务端口
PORT=5000

# 微信小程序配置
WECHAT_APP_ID="your_app_id"
WECHAT_APP_SECRET="your_app_secret"
```

#### 3. 启动开发服务器
```bash
coze dev
```

#### 4. 使用 PM2 管理进程（生产环境推荐）
```bash
# 启动服务
pm2 start ecosystem.config.js

# 查看日志
pm2 logs

# 停止服务
pm2 stop luowato-pump

# 重启服务
pm2 restart luowato-pump
```

---

## 📱 微信小程序配置

由于微信小程序的 WebView 组件**必须使用 HTTPS**，你需要配置内网穿透。

### 配置步骤

#### 1. 配置内网穿透（参考下方【内网穿透方案】）

#### 2. 修改小程序配置文件

**修改 `wechat-miniprogram/app.js`：**
```javascript
App({
  globalData: {
    systemInfo: null,
    baseUrl: 'https://your-ngrok-url.ngrok-free.app'  // 替换为你的 HTTPS URL
  },

  onLaunch() {
    // 初始化系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
  }
});
```

**修改 `wechat-miniprogram/pages/index/index.js`：**
```javascript
Page({
  data: {
    webviewUrl: 'https://your-ngrok-url.ngrok-free.app'  // 替换为你的 HTTPS URL
  },

  onLoad() {
    console.log('WebView URL:', this.data.webviewUrl);
  }
});
```

**修改 `wechat-miniprogram/project.private.config.json`：**
```json
{
  "description": "洛瓦托水泵选型系统",
  "packOptions": {
    "ignore": []
  },
  "setting": {
    "urlCheck": false  // 开发阶段关闭域名校验
  }
}
```

#### 3. 测试小程序

1. 打开微信开发者工具
2. 导入 `wechat-miniprogram` 项目
3. 点击「编译」
4. 在模拟器中查看效果

#### 4. 提交审核发布

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入「版本管理」→「开发版本」
3. 提交审核，填写审核信息：
   - 类目：工具
   - 功能描述：洛瓦托水泵选型系统，帮助用户快速选择合适的水泵产品
4. 等待审核通过后发布

---

## 🌐 内网穿透方案

### 方案 A：ngrok（推荐用于开发测试）

#### 优点
- ✅ 最简单的方案
- ✅ 免费 HTTPS
- ✅ 自动生成域名
- ✅ 无需额外配置

#### 缺点
- ❌ 域名会变化（每次重启）
- ❌ 连接不稳定（免费版）
- ❌ 不适合生产环境

#### 配置步骤

1. **下载 ngrok**
   - 访问：https://ngrok.com/download
   - 下载适合你系统的版本
   - 解压后进入目录

2. **启动隧道**
   ```bash
   # Linux/Mac
   ./ngrok http 5000

   # Windows
   ngrok.exe http 5000
   ```

3. **获取 HTTPS URL**
   
   你会看到类似输出：
   ```
   Forwarding                    https://abc123.ngrok-free.app -> http://localhost:5000
   Forwarding                    https://abc123.ngrok-free.app -> http://localhost:5000
   ```
   
   复制 `https://abc123.ngrok-free.app` 并更新小程序配置。

4. **使用自动化脚本**
   
   项目提供了自动化脚本：
   ```bash
   ./scripts/ngrok-start.sh
   ```

---

### 方案 B：Cloudflare Tunnel（推荐用于长期使用）

#### 优点
- ✅ 完全免费
- ✅ 域名固定
- ✅ 连接稳定
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS

#### 缺点
- ❌ 需要注册 Cloudflare 账号
- ❌ 需要配置域名

#### 配置步骤

1. **注册 Cloudflare**
   - 访问：https://dash.cloudflare.com/sign-up
   - 注册并登录账号

2. **下载 cloudflared**
   
   ```bash
   # Linux
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   dpkg -i cloudflared-linux-amd64.deb
   
   # Mac
   brew install cloudflared
   ```

3. **登录 Cloudflare**
   ```bash
   cloudflared tunnel login
   ```

4. **创建隧道**
   ```bash
   cloudflared tunnel create luowato-pump
   ```

5. **配置隧道**
   
   创建配置文件 `~/.cloudflared/config.yml`：
   ```yaml
   tunnel: <tunnel-id>
   credentials-file: ~/.cloudflared/<tunnel-id>.json

   ingress:
     - hostname: luowato.yourdomain.com
       service: http://localhost:5000
     - service: http_status:404
   ```

6. **配置 DNS**
   ```bash
   cloudflared tunnel route dns luowato-pump luowato.yourdomain.com
   ```

7. **启动隧道**
   ```bash
   # 前台运行
   cloudflared tunnel run luowato-pump
   
   # 后台运行
   nohup cloudflared tunnel run luowato-pump > /tmp/cloudflared.log 2>&1 &
   ```

8. **使用自动化脚本**
   
   项目提供了自动化脚本：
   ```bash
   ./scripts/cloudflare-start.sh
   ```

---

### 方案 C：frp（生产环境推荐）

#### 优点
- ✅ 最稳定可靠
- ✅ 完全控制
- ✅ 适合生产环境
- ✅ 支持多种协议

#### 缺点
- ❌ 需要公网服务器
- ❌ 配置较复杂

#### 配置步骤

1. **下载 frp**
   - 访问：https://github.com/fatedier/frp/releases
   - 下载适合你系统的版本

2. **配置 frps（服务器端）**
   
   编辑 `frps.ini`：
   ```ini
   [common]
   bind_port = 7000
   vhost_http_port = 80
   vhost_https_port = 443
   ```

3. **配置 frpc（客户端）**
   
   编辑 `frpc.ini`：
   ```ini
   [common]
   server_addr = your-public-server-ip
   server_port = 7000

   [web]
   type = http
   local_ip = 127.0.0.1
   local_port = 5000
   custom_domains = luowato.yourdomain.com
   ```

4. **启动 frpc**
   ```bash
   ./frpc -c frpc.ini
   ```

5. **配置 HTTPS**
   
   使用 Let's Encrypt 获取免费 SSL 证书：
   ```bash
   apt install certbot
   certbot certonly --standalone -d luowato.yourdomain.com
   ```

---

## ❓ 常见问题

### 1. 服务无法启动

**问题**：执行 `coze dev` 后报错

**解决方案**：
```bash
# 检查端口占用
netstat -tuln | grep 5000

# 如果端口被占用，杀死进程
kill -9 <pid>

# 重新启动
coze dev
```

### 2. 数据库连接失败

**问题**：无法连接到数据库

**解决方案**：
```bash
# 检查数据库状态
systemctl status postgresql

# 启动数据库
systemctl start postgresql

# 检查环境变量
cat .env | grep DATABASE_URL
```

### 3. ngrok URL 不稳定

**问题**：每次重启 ngrok URL 都会变化

**解决方案**：
- 使用 ngrok 付费版
- 或者改用 Cloudflare Tunnel（免费且域名固定）

### 4. 微信小程序白屏

**问题**：小程序打开后白屏

**解决方案**：
1. 检查 URL 是否为 HTTPS
2. 检查 `project.private.config.json` 中的 `urlCheck` 设置
3. 查看小程序控制台的错误日志
4. 确认后端服务正在运行

### 5. 内网无法访问

**问题**：内网其他机器无法访问 `9.128.67.37:5000`

**解决方案**：
```bash
# 检查防火墙
ufw status

# 允许端口 5000
ufw allow 5000

# 或者临时关闭防火墙
ufw disable
```

---

## 📚 相关文档

- [项目主页](./README.md)
- [数据库配置](./DATABASE_SETUP.md)
- [API 文档](./API_DOCUMENTATION.md)
- [贡献指南](./CONTRIBUTING.md)

---

## 🆘 获取帮助

如果你遇到问题：

1. 查看日志：`./scripts/logs.sh`
2. 检查服务状态：`./scripts/status.sh`
3. 查看 PM2 日志：`pm2 logs`
4. 提交 Issue

---

**祝部署顺利！🎉**
