# Windows 脚本使用指南

## 📁 脚本列表

本目录包含 Windows 服务器部署 Cloudflare Tunnel 的所有脚本：

### 核心脚本

| 脚本名称 | 功能 | 使用方法 |
|---------|------|---------|
| `deploy-all.bat` | 一键部署所有组件 | 右键 → 以管理员身份运行 |
| `install-cloudflared.bat` | 安装 cloudflared | 右键 → 以管理员身份运行 |
| `setup-cloudflare.bat` | 配置 Cloudflare Tunnel | 右键 → 以管理员身份运行 |
| `install-service.bat` | 安装 Windows 服务 | 右键 → 以管理员身份运行 |
| `cloudflare-start.bat` | 手动启动隧道 | 右键 → 以管理员身份运行 |
| `service-manager.bat` | 服务管理工具 | 右键 → 以管理员身份运行 |

---

## 🚀 快速开始

### 方式一：一键部署（推荐）

1. **以管理员身份运行** `deploy-all.bat`
2. 按照提示完成配置
3. 等待自动部署完成

### 方式二：分步部署

1. 安装 cloudflared
   ```batch
   install-cloudflared.bat
   ```

2. 配置 Tunnel
   ```batch
   setup-cloudflare.bat
   ```

3. 安装服务
   ```batch
   install-service.bat
   ```

4. 启动服务
   ```batch
   net start cloudflared
   ```

---

## 📋 脚本详细说明

### 1. deploy-all.bat - 一键部署

**功能**：自动执行完整的部署流程

**执行步骤**：
1. 安装 cloudflared
2. 配置 Cloudflare Tunnel
3. 安装 Windows 服务
4. 启动服务

**使用方法**：
```batch
# 右键点击，选择"以管理员身份运行"
deploy-all.bat
```

**预期耗时**：5-10 分钟

---

### 2. install-cloudflared.bat - 安装 cloudflared

**功能**：下载并安装 cloudflared 到系统路径

**使用方法**：
```batch
# 右键点击，选择"以管理员身份运行"
install-cloudflared.bat
```

**安装位置**：`%LOCALAPPDATA%\Microsoft\WindowsApps\cloudflared.exe`

**验证安装**：
```batch
cloudflared --version
```

---

### 3. setup-cloudflare.bat - 配置 Tunnel

**功能**：
- 登录 Cloudflare 账号
- 创建隧道
- 配置 DNS
- 生成配置文件

**使用方法**：
```batch
# 右键点击，选择"以管理员身份运行"
setup-cloudflare.bat
```

**配置文件位置**：`%USERPROFILE%\.cloudflared\config.yml`

---

### 4. install-service.bat - 安装 Windows 服务

**功能**：
- 安装 cloudflared 为 Windows 服务
- 配置开机自启动
- 启动服务

**使用方法**：
```batch
# 右键点击，选择"以管理员身份运行"
install-service.bat
```

**服务配置**：
- 服务名称：`cloudflared`
- 启动类型：自动
- 日志位置：`C:\ProgramData\cloudflared\logs\cloudflared.log`

---

### 5. cloudflare-start.bat - 手动启动

**功能**：手动启动 Cloudflare Tunnel（不作为服务）

**使用方法**：
```batch
# 右键点击，选择"以管理员身份运行"
cloudflare-start.bat
```

**适用场景**：
- 临时测试
- 服务不可用时备用方案

---

### 6. service-manager.bat - 服务管理工具

**功能**：图形化管理 cloudflared 服务

**菜单选项**：
- [1] 启动服务
- [2] 停止服务
- [3] 重启服务
- [4] 查看状态
- [5] 查看日志
- [6] 查看配置
- [7] 测试连接
- [8] 删除服务
- [0] 退出

**使用方法**：
```batch
# 右键点击，选择"以管理员身份运行"
service-manager.bat
```

---

## 🔧 常用命令

### 服务管理

```batch
# 启动服务
net start cloudflared

# 停止服务
net stop cloudflared

# 查看状态
sc query cloudflared

# 查看配置
sc qc cloudflared

# 删除服务
sc delete cloudflared
```

### 隧道管理

```batch
# 列出所有隧道
cloudflared tunnel list

# 查看配置
cloudflared tunnel ingress validate

# 测试连接
curl https://luowato.yourdomain.com
```

### 日志查看

```batch
# 查看完整日志
type C:\ProgramData\cloudflared\logs\cloudflared.log

# 查看最后 50 行
powershell -Command "Get-Content 'C:\ProgramData\cloudflared\logs\cloudflared.log' -Tail 50"

# 实时监控
powershell -Command "Get-Content 'C:\ProgramData\cloudflared\logs\cloudflared.log' -Wait"
```

---

## 📊 文件位置

### 配置文件

| 文件 | 位置 |
|-----|------|
| 配置文件 | `%USERPROFILE%\.cloudflared\config.yml` |
| 证书文件 | `%USERPROFILE%\.cloudflared\*.json` |

### 日志文件

| 文件 | 位置 |
|-----|------|
| 服务日志 | `C:\ProgramData\cloudflared\logs\cloudflared.log` |

### 可执行文件

| 文件 | 位置 |
|-----|------|
| cloudflared | `%LOCALAPPDATA%\Microsoft\WindowsApps\cloudflared.exe` |

---

## ⚠️ 注意事项

### 1. 管理员权限

所有脚本都必须**以管理员身份运行**：
- 右键点击脚本
- 选择 "以管理员身份运行"

### 2. 网络连接

配置过程中需要：
- 访问 GitHub（下载 cloudflared）
- 访问 Cloudflare API
- 打开浏览器进行 OAuth 认证

### 3. 防火墙设置

确保防火墙允许：
- cloudflared 访问网络
- 端口 5000 可访问（本地服务）
- 出站连接到 Cloudflare

### 4. 服务依赖

cloudflared 服务需要：
- 本地服务运行在 `http://localhost:5000`
- 网络连接正常

---

## ❓ 故障排除

### 问题 1：脚本运行失败

**症状**：双击脚本后立即关闭

**解决方案**：
- 在命令提示符中运行：`cmd` → 拖入脚本 → 回车
- 查看错误信息
- 检查管理员权限

### 问题 2：无法下载 cloudflared

**症状**：提示下载失败

**解决方案**：
- 检查网络连接
- 手动下载：
  1. 访问 https://github.com/cloudflare/cloudflared/releases/latest
  2. 下载 `cloudflared-windows-amd64.exe`
  3. 复制到 `%LOCALAPPDATA%\Microsoft\WindowsApps\cloudflared.exe`

### 问题 3：服务无法启动

**症状**：执行 `net start cloudflared` 失败

**解决方案**：
```batch
# 查看详细错误
sc query cloudflared

# 查看日志
type C:\ProgramData\cloudflared\logs\cloudflared.log

# 重新安装服务
sc delete cloudflared
install-service.bat
```

### 问题 4：域名无法访问

**症状**：配置后无法访问域名

**解决方案**：
```batch
# 1. 检查本地服务
curl http://localhost:5000

# 2. 检查服务状态
sc query cloudflared

# 3. 使用管理工具
service-manager.bat → [7] 测试连接
```

---

## 📞 获取帮助

### 查看文档

- **完整部署指南**：`../../WINDOWS_DEPLOYMENT.md`
- **项目主页**：`../../README.md`

### 在线资源

- [Cloudflare Tunnel 官方文档](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [cloudflared GitHub](https://github.com/cloudflare/cloudflared)
- [Cloudflare 社区](https://community.cloudflare.com/)

### 工具使用

运行 `service-manager.bat` 获取诊断信息：
- [4] 查看状态
- [5] 查看日志
- [7] 测试连接

---

## ✅ 检查清单

部署完成后，检查以下项：

- [ ] cloudflared 已安装：`cloudflared --version`
- [ ] 配置文件存在：`type %USERPROFILE%\.cloudflared\config.yml`
- [ ] 服务已安装：`sc query cloudflared`
- [ ] 服务正在运行：`sc query cloudflared | findstr RUNNING`
- [ ] 本地服务可访问：`curl http://localhost:5000`
- [ ] 公网域名可访问：`curl https://luowato.yourdomain.com`
- [ ] 日志无错误：`type C:\ProgramData\cloudflared\logs\cloudflared.log | findstr error`

---

**祝你使用愉快！🎉**
