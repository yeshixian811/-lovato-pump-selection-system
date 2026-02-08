# Cloudflare Tunnel 配置指南

## 概述

Cloudflare Tunnel 是一个安全的内网穿透解决方案，可以为本地应用提供 HTTPS 访问，无需配置端口转发或防火墙规则。

## 优势

相比 ngrok 和其他内网穿透方案，Cloudflare Tunnel 具有以下优势：

- ✅ **固定域名**：免费提供稳定的域名
- ✅ **HTTPS 自动配置**：自动申请和续期 SSL 证书
- ✅ **无需端口映射**：不需要在路由器中配置端口转发
- ✅ **全球 CDN**：利用 Cloudflare 全球网络加速访问
- ✅ **免费使用**：提供免费计划，功能强大
- ✅ **DDoS 防护**：内置 DDoS 攻击防护
- ✅ **易于管理**：通过 Cloudflare Dashboard 或命令行管理

## 前置要求

1. **Cloudflare 账户**（免费）
   - 注册地址：https://dash.cloudflare.com/sign-up

2. **域名**（可选）
   - 如果有自己的域名，可以添加到 Cloudflare
   - 没有域名可以使用 Cloudflare 提供的免费子域名

3. **Windows 系统**
   - 适用于本项目的 Windows 本地部署

## 安装步骤

### 方法 1：使用提供的安装脚本（推荐）

项目已提供 Cloudflare Tunnel 安装脚本，请参考以下文件：

- `scripts/windows/install-cloudflared.bat` - 安装 cloudflared
- `scripts/windows/setup-cloudflare.bat` - 设置 Cloudflare Tunnel
- `scripts/windows/cloudflare-start.bat` - 启动 Cloudflare Tunnel

### 方法 2：手动安装

#### 1. 下载 cloudflared

访问 Cloudflare 官方下载页面：
https://github.com/cloudflare/cloudflared/releases/latest

下载适用于 Windows 的版本（通常是 `cloudflared-windows-amd64.exe`）。

#### 2. 安装 cloudflared

将下载的文件重命名为 `cloudflared.exe`，然后将其移动到系统 PATH 中的目录，例如：
- `C:\Windows\System32\`
- 或 `C:\Program Files\`

或者将其放在项目目录中，并添加到 PATH。

#### 3. 验证安装

打开命令行（CMD 或 PowerShell），运行：

```bash
cloudflared --version
```

如果显示版本号，说明安装成功。

## 配置步骤

### 步骤 1：登录 Cloudflare

打开命令行，运行：

```bash
cloudflared tunnel login
```

这会打开浏览器，要求您登录 Cloudflare 账户并授权。

### 步骤 2：创建 Tunnel

```bash
cloudflared tunnel create lovato-pump-system
```

系统会返回 Tunnel ID，请保存这个 ID。

示例输出：
```
Tunnel credentials written to C:\Users\YourUser\.cloudflared\<TUNNEL_ID>.json
Created tunnel lovato-pump-system with id <TUNNEL_ID>
```

### 步骤 3：配置 Tunnel

创建配置文件 `C:\Users\YourUser\.cloudflared\config.yml`：

```yaml
tunnel: <TUNNEL_ID>
credentials-file: C:\Users\YourUser\.cloudflared\<TUNNEL_ID>.json

ingress:
  - hostname: lovato-pump.yourdomain.com
    service: http://localhost:5000
  - service: http_status:404
```

**说明**：
- `<TUNNEL_ID>`：替换为实际的 Tunnel ID
- `hostname`：替换为您的域名或 Cloudflare 提供的子域名
- `service`：本地应用地址（本项目为 `http://localhost:5000`）

### 步骤 4：配置 DNS

```bash
cloudflared tunnel route dns lovato-pump-system lovato-pump.yourdomain.com
```

这会在 Cloudflare DNS 中创建一个 CNAME 记录。

### 步骤 5：启动 Tunnel

#### 开发环境（前台运行）

```bash
cloudflared tunnel run lovato-pump-system
```

#### 生产环境（后台运行）

使用提供的脚本：

```batch
scripts\windows\cloudflare-start.bat
```

或者手动配置为 Windows 服务：

```bash
cloudflared service install
```

然后启动服务：

```bash
net start cloudflared
```

## 配置文件示例

### 完整配置文件 (config.yml)

```yaml
# Tunnel ID
tunnel: <TUNNEL_ID>

# 凭证文件路径
credentials-file: C:\Users\YourUser\.cloudflared\<TUNNEL_ID>.json

# 入站规则
ingress:
  # 主站点
  - hostname: lovato-pump.yourdomain.com
    service: http://localhost:5000
  
  # 备用域名（可选）
  - hostname: www.lovato-pump.yourdomain.com
    service: http://localhost:5000
  
  # 微信小程序专用域名（可选）
  - hostname: lovato-pump-mini.yourdomain.com
    service: http://localhost:5000
  
  # 默认规则（404）
  - service: http_status:404

# 日志配置
loglevel: info

# 重试配置
origincert: C:\Users\YourUser\.cloudflared\<TUNNEL_ID>.json
no-autoupdate: false
```

### 多路径配置

如果需要将不同的路径路由到不同的本地服务：

```yaml
ingress:
  # API 路由
  - hostname: api.lovato-pump.yourdomain.com
    service: http://localhost:5000
    path: /api/*
  
  # 主站点
  - hostname: lovato-pump.yourdomain.com
    service: http://localhost:5000
  
  # 默认规则
  - service: http_status:404
```

## 域名配置

### 使用自己的域名

1. **添加域名到 Cloudflare**
   - 登录 Cloudflare Dashboard
   - 添加您的域名
   - 按照提示更新域名服务器

2. **配置 DNS**
   - 在 Cloudflare Dashboard 中，进入 DNS 设置
   - 添加 CNAME 记录：
     - 名称：lovato-pump（或其他子域名）
     - 类型：CNAME
     - 目标：lovato-pump-system.cfargotunnel.com
     - 代理状态：已代理（橙色云朵图标）

### 使用 Cloudflare 提供的免费子域名

如果没有自己的域名，可以使用 Cloudflare 提供的免费子域名：

1. 在创建 Tunnel 时，系统会提供一个子域名
2. 格式通常是：`your-tunnel-name.trycloudflare.com`
3. 每次启动 Tunnel 时可能会变化，不适合生产环境

## HTTPS 配置

Cloudflare Tunnel 会自动配置 HTTPS，无需额外操作：

- ✅ SSL 证书自动申请
- ✅ 证书自动续期
- ✅ 强制 HTTPS 重定向
- ✅ HSTS 配置

### 自定义 SSL 设置

如果需要自定义 SSL 设置，在 Cloudflare Dashboard 中：

1. 进入 SSL/TLS 设置
2. 选择加密模式：
   - **Flexible**：Cloudflare 到用户是 HTTPS，Cloudflare 到服务器是 HTTP
   - **Full**：Cloudflare 到服务器也是 HTTPS（但不验证证书）
   - **Full (Strict)**：Cloudflare 到服务器是 HTTPS 且验证证书（推荐）

3. 配置 HSTS：
   - 启用 HSTS
   - 设置 Max-Age（建议 6 个月）

## 安全配置

### 1. 访问控制

在 Cloudflare Dashboard 中配置：

#### IP 白名单

1. 进入 Firewall → Access Policies
2. 创建规则：
   - 规则名称：允许特定 IP
   - 选择：Allow
   - 添加 IP 地址或 CIDR 块

#### 地理位置限制

1. 进入 Firewall → Access Policies
2. 创建规则：
   - 规则名称：限制特定地区
   - 选择：Block
   - 添加国家/地区

### 2. 防火墙规则

1. 进入 Firewall → Rules
2. 创建规则：
   ```
   (http.host eq "lovato-pump.yourdomain.com" and ip.geoip.country in {"CN" "US"}) or (ip.src in {192.0.2.1 203.0.113.5})
   ```
   - 允许特定国家和 IP 地址访问
   - 拒绝其他访问

### 3. 速率限制

1. 进入 Security → WAF → Custom Rules
2. 创建速率限制规则：
   ```
   (http.request.uri.path contains "/api/auth/login")
   ```
   - 限制登录接口的访问频率

### 4. Bot 保护

1. 进入 Security → Bot Fight Mode
2. 启用 Bot Fight Mode
3. 配置 Bot 分数阈值

## 监控和日志

### 1. 访问日志

在 Cloudflare Dashboard 中：

1. 进入 Analytics & Logs → Logs
2. 查看所有 HTTP 请求日志
3. 可以导出日志进行分析

### 2. 实时监控

1. 进入 Analytics → Security
2. 查看实时流量和安全事件
3. 查看威胁分析和阻止的请求

### 3. 速度测试

1. 进入 Speed
2. 查看 Core Web Vitals
3. 查看全球访问速度

## 故障排查

### 问题 1：无法访问域名

**可能原因**：
- DNS 配置错误
- Tunnel 未启动
- 防火墙阻止连接

**解决方法**：
```bash
# 检查 DNS 配置
nslookup lovato-pump.yourdomain.com

# 检查 Tunnel 状态
cloudflared tunnel info lovato-pump-system

# 重启 Tunnel
cloudflared tunnel run lovato-pump-system
```

### 问题 2：SSL 证书错误

**可能原因**：
- DNS 传播未完成
- SSL 模式配置错误

**解决方法**：
1. 等待 DNS 传播（最多 24 小时）
2. 检查 SSL/TLS 设置
3. 确保加密模式设置为 Full (Strict)

### 问题 3：连接超时

**可能原因**：
- 本地应用未启动
- 端口配置错误
- 防火墙阻止

**解决方法**：
```bash
# 检查本地应用是否启动
curl http://localhost:5000

# 检查端口占用
netstat -ano | findstr :5000

# 临时关闭防火墙测试
netsh advfirewall set allprofiles state off
```

### 问题 4：速率限制触发

**可能原因**：
- 访问频率过高
- DDoS 攻击

**解决方法**：
1. 检查 Firewall → Rate Limiting Rules
2. 调整速率限制阈值
3. 添加白名单 IP

## 性能优化

### 1. 启用缓存

1. 进入 Caching → Configuration
2. 设置缓存级别：Standard
3. 配置浏览器缓存 TTL

### 2. 启用压缩

1. 进入 Speed → Optimization
2. 启用 Auto Minify（CSS, JS, HTML）
3. 启用 Brotli 压缩

### 3. 配置 ARP（智能路由）

1. 进入 Network → 0.0.0.0/0
2. 启用 Smart Routing
3. 启用 Route Optimization

### 4. 配置图像优化

1. 进入 Speed → Optimization
2. 启用 Polish（图像压缩）
3. 启用 Mirage（移动端优化）

## 备份和恢复

### 备份 Tunnel 配置

```bash
# 复制配置文件
copy C:\Users\YourUser\.cloudflared\config.yml config-backup.yml

# 复制凭证文件
copy C:\Users\YourUser\.cloudflared\<TUNNEL_ID>.json tunnel-backup.json
```

### 恢复 Tunnel 配置

```bash
# 恢复配置文件
copy config-backup.yml C:\Users\YourUser\.cloudflared\config.yml

# 恢复凭证文件
copy tunnel-backup.json C:\Users\YourUser\.cloudflared\<TUNNEL_ID>.json

# 启动 Tunnel
cloudflared tunnel run lovato-pump-system
```

## 自动启动配置

### 方法 1：使用 Windows 服务

```bash
# 安装为服务
cloudflared service install

# 启动服务
net start cloudflared

# 设置自动启动
sc config cloudflared start=auto
```

### 方法 2：使用启动脚本

创建 `start-cloudflare-tunnel.bat`：

```batch
@echo off
title Cloudflare Tunnel - Lovato Pump System
echo Starting Cloudflare Tunnel...
echo.
cd /d "%~dp0"
cloudflared tunnel run lovato-pump-system
pause
```

将此快捷方式添加到 Windows 启动文件夹：
```
C:\Users\YourUser\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
```

### 方法 3：使用任务计划程序

1. 打开任务计划程序
2. 创建基本任务
3. 设置触发器：计算机启动时
4. 设置操作：启动程序
   - 程序：`cloudflared.exe`
   - 参数：`tunnel run lovato-pump-system`

## 成本分析

### 免费计划（推荐）

- ✅ 无限流量
- ✅ 无限请求
- ✅ DDoS 防护
- ✅ SSL 证书
- ✅ 全球 CDN
- ✅ 速率限制（基础）
- ❌ 高级分析
- ❌ 自定义页面规则（有限）

### 付费计划

- **Pro**：$20/月
  - 增强分析
  - 更多页面规则
  - 图像优化

- **Business**：$200/月
  - 高级 WAF
  - 自定义规则
  - 优先支持

## 更新和维护

### 更新 cloudflared

```bash
cloudflared update
```

### 查看 Tunnel 状态

```bash
cloudflared tunnel info lovato-pump-system
```

### 删除 Tunnel

```bash
# 删除 DNS 记录
cloudflared tunnel route dns lovato-pump-system lovato-pump.yourdomain.com --delete

# 删除 Tunnel
cloudflared tunnel delete lovato-pump-system
```

## 参考资源

- **Cloudflare 官方文档**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **cloudflared GitHub**: https://github.com/cloudflare/cloudflared
- **Cloudflare 社区**: https://community.cloudflare.com/

## 支持和帮助

如果遇到问题：

1. 查看 Cloudflare Dashboard 中的日志
2. 检查 cloudflared 日志：`cloudflared tunnel run --loglevel debug lovato-pump-system`
3. 访问 Cloudflare 社区论坛
4. 联系 Cloudflare 支持（付费计划）

---

**文档版本**: v1.0.0
**最后更新**: 2025-01-15
**维护者**: 洛瓦托水泵选型系统团队
