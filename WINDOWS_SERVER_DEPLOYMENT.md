# Windows Server 部署指南

## 📋 部署到 Windows Server 物理服务器

### 前提条件

- ✅ Windows Server 2019 / 2022
- ✅ 至少 2GB 内存
- ✅ 至少 20GB 磁盘空间
- ✅ 公网IP
- ✅ 普通网络连接（不需要专线）

---

## 🚀 快速开始

### 1. 安装必需软件

#### 安装 IIS

**通过 PowerShell（管理员）：**

```powershell
Install-WindowsFeature -name Web-Server -IncludeManagementTools
Install-WindowsFeature -name Web-CGI
Install-WindowsFeature -name Web-ISAPI-Ext
Install-WindowsFeature -name Web-ISAPI-Filter
Install-WindowsFeature -name NET-Framework-45-Core
```

#### 安装 URL Rewrite Module

下载并安装：
```
https://www.iis.net/downloads/microsoft/url-rewrite
```

#### 安装 Node.js

下载并安装 LTS 版本：
```
https://nodejs.org/
```

#### 安装 pnpm 和 PM2

```powershell
npm install -g pnpm
npm install -g pm2
npm install -g pm2-windows-startup
pm2-startup install
```

---

### 2. 上传项目

#### 使用 Git

```powershell
mkdir C:\projects
cd C:\projects
git clone https://github.com/yeshixian811/-lovato-pump-selection-system.git
cd -lovato-pump-selection-system
```

#### 或手动上传

1. 在本地压缩项目
2. 通过远程桌面上传到服务器
3. 解压到 `C:\projects\lovato-pump`

---

### 3. 安装依赖并构建

```powershell
cd C:\projects\lovato-pump

# 安装依赖
pnpm install --ignore-scripts

# 构建项目
pnpm run build
```

---

### 4. 使用 PM2 启动

```powershell
pm2 start npm --name "lovato-pump" -- start
pm2 save
```

---

### 5. 配置 IIS 反向代理

1. 打开 IIS 管理器
2. 添加网站
   - 名称: `lovato-pump`
   - 物理路径: `C:\inetpub\wwwroot`
   - 端口: `80`

3. 配置反向代理
   - 点击网站
   - 双击"URL 重写"
   - 添加反向代理规则
   - 目标: `http://localhost:3000`

---

### 6. 配置防火墙

```powershell
New-NetFirewallRule -DisplayName "Allow HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
```

---

### 7. 测试访问

- 本地: `http://localhost`
- 外网: `http://你的服务器IP`
- 域名: `http://your-domain.com`

---

## 📊 PM2 管理命令

```powershell
# 查看状态
pm2 status

# 查看日志
pm2 logs lovato-pump

# 重启项目
pm2 restart lovato-pump

# 停止项目
pm2 stop lovato-pump

# 删除项目
pm2 delete lovato-pump
```

---

## 🔍 故障排查

### 访问不到网站

1. 检查 PM2 状态: `pm2 status`
2. 检查端口: `netstat -ano | findstr :3000`
3. 检查防火墙规则
4. 测试本地访问: `curl http://localhost:3000`

### PM2 进程退出

1. 查看日志: `pm2 logs lovato-pump`
2. 检查依赖是否安装: `pnpm list`
3. 检查构建是否成功

---

## 🎯 网络要求

✅ **不需要专线网络**

- 普通网络连接即可
- 推荐 1-5 Mbps 带宽
- 需要公网IP
- 域名可选（推荐）

---

## 📞 支持

如有问题，查看日志或联系技术支持。
