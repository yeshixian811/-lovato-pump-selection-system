# 洛瓦托水泵选型系统 - Windows 服务器完整部署指南

**版本**：v1.0
**最后更新**：2026-02-08
**适用系统**：Windows Server 2019/2022

---

## 目录

1. [系统要求](#系统要求)
2. [环境准备](#环境准备)
3. [软件安装](#软件安装)
4. [数据库配置](#数据库配置)
5. [应用部署](#应用部署)
6. [安全加固](#安全加固)
7. [性能优化](#性能优化)
8. [监控和日志](#监控和日志)
9. [备份和恢复](#备份和恢复)
10. [故障排查](#故障排查)

---

## 系统要求

### 硬件要求

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 4核 | 8核或更高 |
| 内存 | 8GB | 16GB或更高 |
| 存储 | 100GB SSD | 200GB SSD |
| 网络 | 100Mbps | 1Gbps |

### 软件要求

- **操作系统**：Windows Server 2019/2022 或 Windows 10/11 专业版
- **Node.js**：24.x LTS
- **PostgreSQL**：14.x 或更高
- **pnpm**：9.x 或更高
- **PowerShell**：5.1 或更高

---

## 环境准备

### 1. 系统更新

```powershell
# 以管理员身份运行 PowerShell
# 更新 Windows
Install-Module PSWindowsUpdate
Import-Module PSWindowsUpdate
Get-WindowsUpdate -AcceptAll -Install
```

### 2. 创建用户账户

```powershell
# 创建应用专用用户
New-LocalUser -Name "lovato" -Password (ConvertTo-SecureString "YourStrongPassword123!" -AsPlainText -Force) -Description "Lovato App User"

# 添加到管理员组
Add-LocalGroupMember -Group "Administrators" -Member "lovato"
```

### 3. 配置防火墙

```powershell
# 允许端口 5000（应用端口）
New-NetFirewallRule -DisplayName "Lovato App - Port 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow

# 允许端口 5432（数据库端口，仅本地访问）
New-NetFirewallRule -DisplayName "PostgreSQL - Port 5432" -Direction Inbound -LocalPort 5432 -Protocol TCP -Action Allow -RemoteAddress 127.0.0.1

# 禁用远程桌面（如果不需要）
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server" -Name "fDenyTSConnections" -Value 1
```

---

## 软件安装

### 1. 安装 Node.js

```powershell
# 下载并安装 Node.js 24 LTS
# 访问：https://nodejs.org/

# 验证安装
node --version
npm --version
```

### 2. 安装 pnpm

```powershell
# 安装 pnpm
npm install -g pnpm@latest

# 验证安装
pnpm --version
```

### 3. 安装 PostgreSQL

#### 方式一：使用安装包

1. 下载 PostgreSQL 安装包：https://www.postgresql.org/download/windows/
2. 运行安装程序
3. 设置超级用户密码（请妥善保管）
4. 安装 pgAdmin 4（可选）
5. 完成安装

#### 方式二：使用 Chocolatey

```powershell
# 安装 Chocolatey（如果未安装）
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装 PostgreSQL
choco install postgresql -y

# 启动 PostgreSQL 服务
Start-Service postgresql-x64-14
```

### 4. 验证安装

```powershell
# 验证 PostgreSQL 安装
psql --version

# 连接到数据库
psql -U postgres
```

---

## 数据库配置

### 1. 创建数据库

```sql
-- 使用 psql 连接到 PostgreSQL
psql -U postgres

-- 创建数据库
CREATE DATABASE lovato_pump;

-- 创建专用用户
CREATE USER lovato_user WITH PASSWORD 'StrongPassword123!';

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE lovato_pump TO lovato_user;

-- 退出
\q
```

### 2. 配置 PostgreSQL 连接

编辑 PostgreSQL 配置文件 `postgresql.conf`：

```ini
# 数据库连接配置
listen_addresses = 'localhost'
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# 日志配置
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'mod'
log_duration = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# 性能优化
random_page_cost = 1.1
effective_io_concurrency = 200
```

### 3. 配置 pg_hba.conf

编辑 `pg_hba.conf` 文件：

```ini
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# 本地连接
local   all             all                                     md5

# IPv4 本地连接
host    all             all             127.0.0.1/32            md5

# IPv6 本地连接
host    all             all             ::1/128                 md5
```

### 4. 重启 PostgreSQL 服务

```powershell
# 重启 PostgreSQL 服务
Restart-Service postgresql-x64-14

# 验证服务状态
Get-Service postgresql-x64-14
```

---

## 应用部署

### 1. 创建项目目录

```powershell
# 创建项目目录
New-Item -ItemType Directory -Path "C:\LovatoApp"
New-Item -ItemType Directory -Path "C:\LovatoApp\logs"
New-Item -ItemType Directory -Path "C:\LovatoApp\uploads"
```

### 2. 复制项目文件

```powershell
# 将项目文件复制到服务器
# 使用 Git 克隆或手动复制
cd C:\LovatoApp
git clone <your-repo-url> .
```

### 3. 配置环境变量

创建 `.env` 文件：

```env
# ============================================
# 洛瓦托水泵选型系统 - 环境变量配置
# ============================================

# ============================================
# JWT 认证配置
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
JWT_ACCESS_TOKEN_EXPIRY=3600
JWT_REFRESH_TOKEN_EXPIRY=604800

# ============================================
# 数据加密配置
# ============================================
ENCRYPTION_KEY=your-super-secret-encryption-key-minimum-32-characters-change-in-production
ENCRYPTION_ALGORITHM=aes-256-gcm

# ============================================
# 数据库配置
# ============================================
DATABASE_URL=postgresql://lovato_user:StrongPassword123!@localhost:5432/lovato_pump

# ============================================
# CORS 配置
# ============================================
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,http://localhost:5000

# ============================================
# 对象存储配置（如果使用）
# ============================================
COZE_BUCKET_ACCESS_KEY=your_access_key_here
COZE_BUCKET_SECRET_KEY=your_secret_key_here

# ============================================
# 应用配置
# ============================================
NODE_ENV=production
PORT=5000

# ============================================
# 日志配置
# ============================================
LOG_LEVEL=info
LOG_VERBOSE=false
```

### 4. 安装依赖

```powershell
cd C:\LovatoApp
pnpm install --frozen-lockfile
```

### 5. 构建应用

```powershell
# 构建生产版本
pnpm run build
```

---

## 安全加固

### 1. Windows 安全配置

```powershell
# 启用 Windows Defender 实时保护
Set-MpPreference -DisableRealtimeMonitoring $false

# 配置 Windows Update 自动更新
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update" -Name "AUOptions" -Value 4

# 禁用不必要的服务
Set-Service -Name "RemoteRegistry" -StartupType Disabled
Set-Service -Name "TermService" -StartupType Disabled
```

### 2. 文件权限配置

```powershell
# 设置应用目录权限
icacls "C:\LovatoApp" /grant "lovato:(OI)(CI)F"
icacls "C:\LovatoApp" /inheritance:r

# 设置日志目录权限
icacls "C:\LovatoApp\logs" /grant "lovato:(OI)(CI)F"
```

### 3. SSL/TLS 配置

#### 使用自签名证书（开发/测试）

```powershell
# 生成自签名证书
New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My"
```

#### 使用 Let's Encrypt（生产环境）

1. 安装 Win-ACME：
```powershell
choco install win-acme
```

2. 配置 SSL 证书：
```powershell
# 运行 wacs.exe
wacs.exe
```

### 4. 防火墙规则

```powershell
# 仅允许特定 IP 访问（可选）
$allowedIPs = "192.168.1.0/24"
New-NetFirewallRule -DisplayName "Lovato App - Allowed IPs" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow -RemoteAddress $allowedIPs
```

---

## 性能优化

### 1. PostgreSQL 性能优化

编辑 `postgresql.conf`：

```ini
# 内存配置
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 16MB
maintenance_work_mem = 512MB

# 查询优化
random_page_cost = 1.1
effective_io_concurrency = 200
max_worker_processes = 8
max_parallel_workers_per_gather = 4

# WAL 配置
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB
checkpoint_completion_target = 0.9
```

### 2. Node.js 性能优化

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'lovato-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '1G',
    error_file: 'C:\\LovatoApp\\logs\\error.log',
    out_file: 'C:\\LovatoApp\\logs\\out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

### 3. 系统性能优化

```powershell
# 调整虚拟内存
$system = Get-WmiObject -Class Win32_ComputerSystem
$system.AutomaticManagedPagefile = $true
$system.Put()

# 优化网络设置
netsh interface tcp set global autotuninglevel=normal
netsh interface tcp set global rss=enabled
```

---

## 监控和日志

### 1. 配置应用日志

编辑 `next.config.ts`：

```typescript
const nextConfig = {
  // 日志配置
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
```

### 2. 配置 PostgreSQL 日志

编辑 `postgresql.conf`：

```ini
# 日志配置
logging_collector = on
log_directory = 'C:\Program Files\PostgreSQL\14\data\pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'all'
log_duration = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

### 3. 使用 PM2 监控

```powershell
# 安装 PM2
pnpm add -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 监控应用
pm2 monit

# 查看日志
pm2 logs lovato-app
```

### 4. Windows 性能监控

```powershell
# 启用性能计数器
Get-Counter -ListSet * | Where-Object { $_.CounterSetName -like "*Processor*" }

# 监控 CPU 使用率
Get-Counter '\Processor(_Total)\% Processor Time' -SampleInterval 5 -MaxSamples 10

# 监控内存使用
Get-Counter '\Memory\Available MBytes' -SampleInterval 5 -MaxSamples 10
```

---

## 备份和恢复

### 1. 数据库备份

创建备份脚本 `backup-database.bat`：

```batch
@echo off
set BACKUP_DIR=C:\LovatoApp\backups
set DATE=%date:~0,4%%date:~5,2%%date:~8,2%
set TIME=%time:~0,2%%time:~3,2%%time:~6,2%
set FILENAME=lovato_pump_%DATE%_%TIME%.sql

if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

cd "C:\Program Files\PostgreSQL\14\bin"
pg_dump -U lovato_user -h localhost -F c -b -v -f "%BACKUP_DIR%\%FILENAME%" lovato_pump

echo Backup completed: %BACKUP_DIR%\%FILENAME%
```

### 2. 自动备份配置

使用 Windows 任务计划程序：

```powershell
# 创建任务计划程序触发器
$trigger = New-ScheduledTaskTrigger -Daily -At 2:00AM

# 创建任务计划程序操作
$action = New-ScheduledTaskAction -Execute "C:\LovatoApp\backup-database.bat"

# 创建任务计划程序
Register-ScheduledTask -TaskName "Lovato Database Backup" -Trigger $trigger -Action $action -User "lovato" -RunLevel Highest
```

### 3. 数据库恢复

```batch
@echo off
set BACKUP_FILE=C:\LovatoApp\backups\lovato_pump_20260208_020000.sql

cd "C:\Program Files\PostgreSQL\14\bin"
pg_restore -U lovato_user -h localhost -d lovato_pump -v "%BACKUP_FILE%"

echo Restore completed
```

### 4. 应用文件备份

```powershell
# 创建备份脚本
$backupDir = "C:\LovatoApp\backups\files"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# 压缩项目文件
Compress-Archive -Path "C:\LovatoApp\*" -DestinationPath "$backupDir\lovato_app_$timestamp.zip" -Force

Write-Host "Backup completed: $backupDir\lovato_app_$timestamp.zip"
```

---

## 故障排查

### 1. 应用无法启动

**检查端口占用**：
```powershell
netstat -ano | findstr :5000
```

**检查日志**：
```powershell
Get-Content C:\LovatoApp\logs\error.log -Tail 50
```

**重启服务**：
```powershell
pm2 restart lovato-app
```

### 2. 数据库连接失败

**检查 PostgreSQL 服务**：
```powershell
Get-Service postgresql-x64-14
```

**测试连接**：
```sql
psql -U lovato_user -h localhost -d lovato_pump
```

**检查防火墙**：
```powershell
Get-NetFirewallRule -DisplayName "*PostgreSQL*"
```

### 3. 性能问题

**检查 CPU 使用**：
```powershell
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10
```

**检查内存使用**：
```powershell
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10
```

**检查数据库性能**：
```sql
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

### 4. SSL 证书问题

**检查证书**：
```powershell
Get-ChildItem cert:\LocalMachine\My | Select-Object Subject, NotAfter
```

**更新证书**：
```powershell
# 使用 wacs.exe 更新证书
wacs.exe
```

---

## 附录

### A. 环境变量完整列表

参见 `.env.example` 文件。

### B. 端口列表

| 端口 | 服务 | 说明 |
|------|------|------|
| 5000 | Next.js 应用 | 应用服务端口 |
| 5432 | PostgreSQL | 数据库端口（仅本地） |

### C. 服务列表

| 服务名称 | 启动类型 | 说明 |
|----------|----------|------|
| postgresql-x64-14 | 自动 | PostgreSQL 数据库服务 |

### D. 目录结构

```
C:\LovatoApp\
├── .next\                 # Next.js 构建输出
├── logs\                  # 应用日志
├── backups\               # 备份文件
│   ├── database\          # 数据库备份
│   └── files\             # 文件备份
├── uploads\               # 上传文件
├── src\                   # 源代码
├── package.json           # 依赖配置
├── next.config.ts         # Next.js 配置
├── ecosystem.config.js    # PM2 配置
├── .env                   # 环境变量
└── README.md              # 项目说明
```

---

**文档版本**：v1.0
**最后更新**：2026-02-08
**维护者**：技术支持团队
