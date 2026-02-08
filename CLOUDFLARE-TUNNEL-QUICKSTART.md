# Cloudflare Tunnel 快速入门指南

## 前置要求

1. [Cloudflare 账户](https://dash.cloudflare.com/)
2. 已注册域名（必须托管在 Cloudflare）
3. Windows 操作系统
4. 已安装 cloudflared 工具

## 第一步：安装 cloudflared

1. 访问 [cloudflared 下载页面](https://github.com/cloudflare/cloudflared/releases/latest)
2. 下载 Windows 64 位版本：`cloudflared-windows-amd64.exe`
3. 将文件重命名为 `cloudflared.exe`
4. 将 `cloudflared.exe` 移动到系统 PATH 目录之一：
   - 推荐：`C:\Windows\System32\`
   - 或添加到环境变量 PATH
5. 验证安装：
   ```bash
   cloudflared --version
   ```

## 第二步：登录 Cloudflare 账户

1. 打开命令提示符（CMD）或 PowerShell
2. 运行登录命令：
   ```bash
   cloudflared tunnel login
   ```
3. 浏览器会自动打开，登录您的 Cloudflare 账户
4. 授权 cloudflared 访问您的域名
5. 授权成功后，证书文件会保存到 `C:\Users\<用户名>\.cloudflared\`

## 第三步：创建隧道

```bash
# 方法 1：使用配置向导（推荐）
setup-cloudflare-tunnel.bat

# 方法 2：手动创建
cloudflared tunnel create lovato-pump
```

## 第四步：配置隧道

### 1. 创建配置文件

创建文件 `cloudflared-tunnel-config.yml`：

```yaml
tunnel: lovato-pump
credentials-file: C:\Users\<用户名>\.cloudflared\lovato-pump.json

ingress:
  # 您的主域名
  - hostname: pump.yourdomain.com
    service: http://localhost:5000

  # 微信小程序域名
  - hostname: miniprogram.yourdomain.com
    service: http://localhost:5000

  # 其他域名
  - hostname: www.yourdomain.com
    service: http://localhost:5000

  # 默认 404
  - service: http_status:404
```

### 2. 配置域名 DNS

```bash
# 将隧道路由到域名
cloudflared tunnel route dns lovato-pump pump.yourdomain.com
cloudflared tunnel route dns lovato-pump miniprogram.yourdomain.com
cloudflared tunnel route dns lovato-pump www.yourdomain.com
```

或在 Cloudflare Dashboard 中手动添加 CNAME 记录：
- 名称：`pump`（或 `miniprogram`）
- 类型：`CNAME`
- 目标：`<隧道ID>.cfargotunnel.com`
- 代理状态：已代理（橙色云朵）

## 第五步：启动隧道

### 临时启动（测试）

```bash
cloudflared tunnel --config cloudflared-tunnel-config.yml run lovato-pump
```

### 注册为 Windows 服务（推荐）

```bash
# 安装服务
cloudflared service install

# 启动服务
net start cloudflared

# 停止服务
net stop cloudflared

# 查看服务状态
sc query cloudflared
```

## 第六步：验证连接

1. 确保 Next.js 开发服务器正在运行：
   ```bash
   coze dev
   ```

2. 确保 Cloudflare Tunnel 服务正在运行：
   ```bash
   sc query cloudflared
   ```

3. 在浏览器中访问：
   - `https://pump.yourdomain.com`
   - `https://miniprogram.yourdomain.com`

4. 测试所有功能是否正常

## 高级配置

### 多个本地服务

```yaml
tunnel: lovato-pump
credentials-file: C:\Users\<用户名>\.cloudflared\lovato-pump.json

ingress:
  # 主应用
  - hostname: pump.yourdomain.com
    service: http://localhost:5000

  # 数据库管理工具（如果需要）
  - hostname: db.yourdomain.com
    service: http://localhost:8080

  # 其他服务
  - hostname: api.yourdomain.com
    service: http://localhost:3000

  - service: http_status:404
```

### 自定义 SSL 证书（可选）

如果您的域名使用自定义 SSL 证书：

```yaml
tunnel: lovato-pump
credentials-file: C:\Users\<用户名>\.cloudflared\lovato-pump.json

ingress:
  - hostname: pump.yourdomain.com
    service: https://localhost:5000
    noTLSVerify: true

  - service: http_status:404
```

### WebSocket 支持（如果需要）

```yaml
tunnel: lovato-pump
credentials-file: C:\Users\<用户名>\.cloudflared\lovato-pump.json

ingress:
  - hostname: pump.yourdomain.com
    service: http://localhost:5000
    originRequest:
      noTLSVerify: true
      http2Origin: true

  - service: http_status:404
```

## 故障排查

### 隧道无法启动

1. 检查证书文件是否存在：
   ```bash
   dir C:\Users\<用户名>\.cloudflared\
   ```

2. 检查配置文件语法：
   ```bash
   cloudflared tunnel --config cloudflared-tunnel-config.yml ingress validate
   ```

3. 查看日志：
   ```bash
   cloudflared tunnel --config cloudflared-tunnel-config.yml run lovato-pump --loglevel debug
   ```

### 域名无法访问

1. 检查 DNS 配置：
   ```bash
   nslookup pump.yourdomain.com
   ```

2. 检查 Cloudflare Proxy 状态：
   - 登录 Cloudflare Dashboard
   - 进入 DNS 设置
   - 确保记录的代理状态为"已代理"（橙色云朵）

3. 检查防火墙设置：
   - 确保 cloudflared 可以访问互联网
   - 确保 Windows 防火墙允许 cloudflared

### 微信小程序无法访问

1. 确保域名已备案（如果在中国大陆）
2. 检查域名是否在微信小程序后台配置：
   - 登录 [微信公众平台](https://mp.weixin.qq.com/)
   - 进入开发 -> 开发管理 -> 开发设置 -> 服务器域名
   - 添加 `https://miniprogram.yourdomain.com` 到 request 合法域名
3. 确保使用 HTTPS（Cloudflare Tunnel 默认提供 HTTPS）

### 服务启动失败

1. 检查服务状态：
   ```bash
   sc query cloudflared
   ```

2. 查看事件日志：
   - 打开"事件查看器"
   - 进入"Windows 日志" -> "应用程序"
   - 查找 cloudflared 相关错误

3. 重新安装服务：
   ```bash
   # 停止并删除服务
   net stop cloudflared
   sc delete cloudflared

   # 重新安装
   cloudflared service install
   net start cloudflared
   ```

## 安全建议

1. **启用访问控制**
   - 在 Cloudflare Dashboard 中配置访问策略
   - 限制特定 IP 地址访问
   - 使用 Cloudflare Access 进行身份验证

2. **配置速率限制**
   - 在 Cloudflare Dashboard 中配置速率限制规则
   - 防止 DDoS 攻击

3. **启用 WAF（Web 应用防火墙）**
   - 配置 WAF 规则
   - 拦截恶意流量

4. **定期更新 cloudflared**
   ```bash
   cloudflared update
   ```

## 监控和日志

### 查看隧道状态

```bash
cloudflared tunnel info lovato-pump
```

### 查看实时日志

```bash
cloudflared tunnel --config cloudflared-tunnel-config.yml run lovato-pump --loglevel info
```

### Cloudflare Dashboard

1. 登录 Cloudflare Dashboard
2. 进入"Zero Trust" -> "Networks" -> "Tunnels"
3. 查看隧道状态、流量、错误率等

## 下一步

1. 配置自定义域名
2. 设置 SSL 证书（Cloudflare 自动提供）
3. 配置 Cloudflare Access（可选）
4. 设置监控和告警
5. 配置备份隧道（可选）

## 详细文档

更多详细信息请参阅：
- [Cloudflare Tunnel 官方文档](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [CLOUDFLARE-TUNNEL-GUIDE.md](CLOUDFLARE-TUNNEL-GUIDE.md) - 完整配置指南

## 支持

如遇问题，请：
1. 查看 Cloudflare 社区论坛
2. 查看 cloudflared GitHub Issues
3. 联系技术支持团队
