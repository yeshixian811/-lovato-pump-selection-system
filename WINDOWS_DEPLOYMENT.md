# 洛瓦托水泵选型系统 - Windows 服务器部署指南

## 📋 目录
- [快速开始](#快速开始)
- [详细部署步骤](#详细部署步骤)
- [配置说明](#配置说明)
- [服务管理](#服务管理)
- [常见问题](#常见问题)
- [高级配置](#高级配置)

---

## 🚀 快速开始

### 前提条件
- ✅ Windows Server 2016/2019/2022 或 Windows 10/11
- ✅ 管理员权限
- ✅ 本地服务运行在 `http://localhost:5000`
- ✅ Cloudflare 账号（免费）

### 一键部署（推荐）

1. **下载脚本**
   - 进入 `scripts/windows/` 目录
   - 确保所有 .bat 文件都在该目录下

2. **以管理员身份运行**
   - 右键点击 `deploy-all.bat`
   - 选择 "以管理员身份运行"

3. **按照提示操作**
   - 脚本会自动完成所有配置
   - 预计耗时：5-10 分钟

4. **验证部署**
   - 访问您配置的域名
   - 检查服务状态：`service-manager.bat`

---

## 📚 详细部署步骤

### 步骤 1：安装 cloudflared

#### 方式 A：使用自动安装脚本

```batch
# 右键点击，以管理员身份运行
scripts/windows/install-cloudflared.bat
```

#### 方式 B：手动安装

1. **下载 cloudflared**
   - 访问：https://github.com/cloudflare/cloudflared/releases/latest
   - 下载 `cloudflared-windows-amd64.exe`

2. **安装到系统路径**
   ```batch
   # 复制到系统目录
   copy cloudflared-windows-amd64.exe %LOCALAPPDATA%\Microsoft\WindowsApps\cloudflared.exe
   ```

3. **验证安装**
   ```batch
   cloudflared --version
   ```

---

### 步骤 2：配置 Cloudflare Tunnel

#### 使用自动配置脚本

```batch
# 右键点击，以管理员身份运行
scripts/windows/setup-cloudflare.bat
```

#### 手动配置步骤

1. **登录 Cloudflare**
   ```batch
   cloudflared tunnel login
   ```
   - 会自动打开浏览器
   - 登录您的 Cloudflare 账号
   - 授权访问

2. **创建隧道**
   ```batch
   cloudflared tunnel create luowato-pump
   ```
   - 记录返回的隧道 ID（如：12345678-1234-1234-1234-123456789012）

3. **配置 DNS**
   ```batch
   # 替换为您的域名
   cloudflared tunnel route dns <tunnel-id> luowato.yourdomain.com
   ```

4. **创建配置文件**
   
   创建文件：`%USERPROFILE%\.cloudflared\config.yml`
   
   ```yaml
   tunnel: <tunnel-id>
   credentials-file: C:\Users\<username>\.cloudflared\<tunnel-id>.json

   ingress:
     - hostname: luowato.yourdomain.com
       service: http://localhost:5000
     - service: http_status:404
   ```

5. **验证配置**
   ```batch
   cloudflared tunnel ingress validate
   ```

---

### 步骤 3：安装 Windows 服务

#### 使用自动安装脚本

```batch
# 右键点击，以管理员身份运行
scripts/windows/install-service.bat
```

#### 手动安装

1. **获取隧道 ID**
   ```batch
   cloudflared tunnel list
   ```

2. **安装服务**
   ```batch
   cloudflared service install <tunnel-id>
   ```

3. **配置自动启动**
   ```batch
   sc config cloudflared start= auto
   sc description cloudflared "Cloudflare Tunnel - 洛瓦托水泵选型系统"
   ```

4. **启动服务**
   ```batch
   net start cloudflared
   ```

---

### 步骤 4：验证部署

#### 1. 检查服务状态
```batch
sc query cloudflared
```

应该显示：
```
SERVICE_NAME: cloudflared
        STATE: 4 RUNNING
```

#### 2. 查看日志
```batch
type C:\ProgramData\cloudflared\logs\cloudflared.log
```

#### 3. 测试连接
```batch
# 测试本地服务
curl http://localhost:5000

# 测试公网访问
curl https://luowato.yourdomain.com
```

#### 4. 使用管理工具
```batch
# 运行服务管理器
scripts/windows/service-manager.bat
```

---

## 🛠️ 配置说明

### 配置文件详解

配置文件位置：`%USERPROFILE%\.cloudflared\config.yml`

```yaml
# 隧道 ID
tunnel: 12345678-1234-1234-1234-123456789012

# 证书文件路径
credentials-file: C:\Users\username\.cloudflared\12345678-1234-1234-1234-123456789012.json

# 入口规则
ingress:
  # 规则 1：映射域名到本地服务
  - hostname: luowato.yourdomain.com
    service: http://localhost:5000
  
  # 规则 2：可以添加多个域名
  - hostname: www.luowato.yourdomain.com
    service: http://localhost:5000
  
  # 规则 3：添加子路径
  - hostname: luowato.yourdomain.com
    path: /api/*
    service: http://localhost:5001
  
  # 默认规则：404 页面
  - service: http_status:404
```

### 高级配置示例

#### 配置多个本地服务

```yaml
ingress:
  # 主站点
  - hostname: luowato.yourdomain.com
    service: http://localhost:5000
  
  # 管理后台
  - hostname: admin.luowato.yourdomain.com
    service: http://localhost:5001
  
  # API 服务
  - hostname: api.luowato.yourdomain.com
    service: http://localhost:5002
  
  # 默认规则
  - service: http_status:404
```

#### 配置 WebSocket 支持

```yaml
ingress:
  - hostname: luowato.yourdomain.com
    service: http://localhost:5000
    originRequest:
      noTLSVerify: true
      http2Origin: false
  
  - service: http_status:404
```

---

## 🔧 服务管理

### 使用管理工具

运行服务管理器：
```batch
scripts/windows/service-manager.bat
```

功能包括：
- [1] 启动服务
- [2] 停止服务
- [3] 重启服务
- [4] 查看状态
- [5] 查看日志
- [6] 查看配置
- [7] 测试连接
- [8] 删除服务

### 命令行管理

#### 服务控制
```batch
# 启动服务
net start cloudflared

# 停止服务
net stop cloudflared

# 重启服务
net stop cloudflared && net start cloudflared
```

#### 查看状态
```batch
# 查看服务状态
sc query cloudflared

# 查看进程信息
tasklist | findstr cloudflared

# 查看详细配置
sc qc cloudflared
```

#### 查看日志
```batch
# 查看实时日志
type C:\ProgramData\cloudflared\logs\cloudflared.log

# 查看最后 50 行
powershell -Command "Get-Content 'C:\ProgramData\cloudflared\logs\cloudflared.log' -Tail 50"

# 搜索错误
powershell -Command "Select-String -Path 'C:\ProgramData\cloudflared\logs\cloudflared.log' -Pattern 'error|Error|ERROR'"
```

#### 删除服务
```batch
# 停止服务
net stop cloudflared

# 删除服务
sc delete cloudflared

# 删除配置文件（可选）
rmdir /s /q %USERPROFILE%\.cloudflared
```

---

## ❓ 常见问题

### 1. 服务启动失败

**问题**：执行 `net start cloudflared` 失败

**解决方案**：
```batch
# 查看详细错误
sc query cloudflared

# 查看日志
type C:\ProgramData\cloudflared\logs\cloudflared.log

# 检查配置
cloudflared tunnel ingress validate
```

常见原因：
- 配置文件路径错误
- 证书文件缺失
- 端口被占用

### 2. 无法访问域名

**问题**：配置后无法访问域名

**解决方案**：
```batch
# 1. 检查本地服务
curl http://localhost:5000

# 2. 检查服务状态
sc query cloudflared

# 3. 查看日志
type C:\ProgramData\cloudflared\logs\cloudflared.log

# 4. 检查 DNS 配置
cloudflared tunnel list
```

### 3. 登录 Cloudflare 失败

**问题**：执行 `cloudflared tunnel login` 失败

**解决方案**：
- 检查网络连接
- 确认 Cloudflare 账号正常
- 尝试使用 VPN
- 检查防火墙设置

### 4. 配置文件找不到

**问题**：提示配置文件不存在

**解决方案**：
```batch
# 检查配置文件位置
dir %USERPROFILE%\.cloudflared

# 如果不存在，重新运行
scripts/windows/setup-cloudflare.bat
```

### 5. 端口被占用

**问题**：5000 端口被其他程序占用

**解决方案**：
```batch
# 查看端口占用
netstat -ano | findstr :5000

# 结束占用进程（谨慎操作）
taskkill /PID <pid> /F

# 或者修改配置文件中的端口
# 编辑 %USERPROFILE%\.cloudflared\config.yml
# 将 service: http://localhost:5000 改为其他端口
```

### 6. 开机自启动失败

**问题**：重启后服务没有自动启动

**解决方案**：
```batch
# 检查服务启动类型
sc qc cloudflared | findstr START_TYPE

# 设置为自动启动
sc config cloudflared start= auto

# 手动启动测试
net start cloudflared

# 查看事件日志
eventvwr.msc
```

---

## 🔐 高级配置

### 配置自定义 TLS 证书

如果需要使用自定义证书：

1. **生成证书**
   ```batch
   cloudflared tunnel cert origin
   ```

2. **配置使用证书**
   ```yaml
   ingress:
     - hostname: luowato.yourdomain.com
       service: https://localhost:5000
       originRequest:
         noTLSVerify: true
   ```

### 配置访问控制

```yaml
ingress:
  - hostname: luowato.yourdomain.com
    service: http://localhost:5000
    originRequest:
      access:
        required: true
        teamName: your-team
  - service: http_status:404
```

### 配置负载均衡

```yaml
ingress:
  - hostname: luowato.yourdomain.com
    service: http://localhost:5000
    loadBalancing:
      policy: round_robin
  - service: http_status:404
```

---

## 📱 配置微信小程序

配置完成后，更新微信小程序配置：

### 1. 修改 `wechat-miniprogram/app.js`

```javascript
App({
  globalData: {
    systemInfo: null,
    baseUrl: 'https://luowato.yourdomain.com'  // 替换为您的域名
  },

  onLaunch() {
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
  }
});
```

### 2. 修改 `wechat-miniprogram/pages/index/index.js`

```javascript
Page({
  data: {
    webviewUrl: 'https://luowato.yourdomain.com'  // 替换为您的域名
  },

  onLoad() {
    console.log('WebView URL:', this.data.webviewUrl);
  }
});
```

### 3. 修改 `wechat-miniprogram/project.private.config.json`

```json
{
  "description": "洛瓦托水泵选型系统",
  "packOptions": {
    "ignore": []
  },
  "setting": {
    "urlCheck": false  // 开发阶段关闭域名校验，生产环境开启
  }
}
```

---

## 📚 相关文档

- [Linux 版本部署指南](./DEPLOYMENT.md)
- [数据库配置](./DATABASE_SETUP.md)
- [API 文档](./API_DOCUMENTATION.md)
- [项目主页](./README.md)

---

## 🆘 获取帮助

### 遇到问题？

1. **查看日志**：`C:\ProgramData\cloudflared\logs\cloudflared.log`
2. **运行诊断**：`service-manager.bat` → [7] 测试连接
3. **检查配置**：`cloudflared tunnel ingress validate`
4. **提交 Issue**：在项目仓库提交问题

### 有用的资源

- [Cloudflare Tunnel 官方文档](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [cloudflared GitHub](https://github.com/cloudflare/cloudflared)
- [Cloudflare 社区](https://community.cloudflare.com/)

---

## 🎉 总结

完成以上步骤后，您的 Windows 服务器已经配置好 Cloudflare Tunnel：

✅ cloudflared 已安装  
✅ Cloudflare Tunnel 已配置  
✅ Windows 服务已安装  
✅ 开机自启动已启用  
✅ 域名可访问  

现在您可以：
- 访问 `https://luowato.yourdomain.com`
- 配置微信小程序使用 HTTPS 域名
- 使用 `service-manager.bat` 管理服务

---

**祝部署顺利！🚀**
