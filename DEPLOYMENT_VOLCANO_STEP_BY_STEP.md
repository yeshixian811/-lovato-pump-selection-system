# 火山云部署 - 详细步骤指南

## ⚠️ 重要提示
**我无法直接访问你的服务器**，你需要在本地的终端或 SSH 客户端中执行以下命令。

---

## 📦 部署前准备

### 1. 准备必要信息
在开始之前，请准备好以下信息：
- ✅ 火山云服务器公网 IP 地址
- ✅ 服务器 SSH 密钥文件路径
- ✅ 域名（已解析到服务器 IP）
- ✅ 火山云 PostgreSQL 连接信息
- ✅ 微信小程序 AppID
- ✅ SSL 证书文件（fullchain.pem 和 privkey.pem）

### 2. 本地检查（在你的本地电脑执行）
```bash
# 检查项目目录
cd /path/to/luowato-selection
ls -lh

# 确认以下文件存在：
# - deploy-volcano.sh
# - ecosystem.config.js
# - nginx-config
# - .env.production.example
# - package.json
```

---

## 🚀 部署步骤

### 步骤 1：连接到服务器

#### 方式 A：使用 SSH 密钥（推荐）
```bash
# 在本地终端执行
ssh -i /path/to/your-ssh-key.pem root@你的服务器公网IP

# 示例：
# ssh -i ~/.ssh/volcano-key.pem root@123.456.789.0
```

#### 方式 B：使用密码
```bash
# 在本地终端执行
ssh root@你的服务器公网IP

# 示例：
# ssh root@123.456.789.0
# 然后输入密码
```

**成功连接后，你应该看到类似这样的提示：**
```
[root@volcano-instance ~]#
```

---

### 步骤 2：上传项目到服务器

#### 在你的本地电脑上执行（新开一个终端窗口）

```bash
# 进入项目目录
cd /path/to/luowato-selection

# 上传整个项目到服务器
scp -i /path/to/your-ssh-key.pem -r . root@你的服务器公网IP:/var/www/luowato-selection

# 示例：
# scp -i ~/.ssh/volcano-key.pem -r . root@123.456.789.0:/var/www/luowato-selection

# 如果使用密码：
# scp -r . root@你的服务器公网IP:/var/www/luowato-selection
```

**上传时间可能需要几分钟，取决于你的网速。**

---

### 步骤 3：在服务器上运行自动部署脚本

#### 回到 SSH 连接的服务器终端执行

```bash
# 进入项目目录
cd /var/www/luowato-selection

# 查看部署脚本
ls -lh deploy-volcano.sh

# 修改部署脚本中的域名和邮箱
nano deploy-volcano.sh
```

**在 nano 编辑器中，找到以下行并修改：**
```bash
# 找到第 17 行，修改为你的域名
DOMAIN="your-domain.com"  # 改为 DOMAIN="your-actual-domain.com"

# 找到第 18 行，修改为你的邮箱
EMAIL="your-email@example.com"  # 改为 EMAIL="your-email@your-domain.com"
```

**保存并退出 nano：**
- 按 `Ctrl + O` 保存
- 按 `Enter` 确认
- 按 `Ctrl + X` 退出

```bash
# 给脚本添加执行权限（如果没有）
chmod +x deploy-volcano.sh

# 运行部署脚本
bash deploy-volcano.sh
```

**部署脚本会自动执行以下操作：**
1. 检查并安装 Node.js 24
2. 检查并安装 pnpm
3. 检查并安装 PM2
4. 检查并安装 Git
5. 创建项目目录
6. 安装项目依赖
7. 构建项目
8. 配置环境变量模板
9. 配置 PM2
10. 启动应用
11. 配置 Nginx
12. 重启 Nginx

**部署大约需要 5-10 分钟，请耐心等待。**

---

### 步骤 4：配置环境变量

#### 在服务器上执行

```bash
# 编辑环境变量文件
nano /var/www/luowato-selection/.env.production
```

**修改以下配置：**

```bash
# 数据库配置（重要！）
# 火山云 PostgreSQL 连接字符串格式
# 格式：postgresql://用户名:密码@内网地址:端口/数据库名
DATABASE_URL=postgresql://用户名:密码@内网IP:5432/数据库名

# 示例：
# DATABASE_URL=postgresql://postgres:your-password@10.0.0.1:5432/luowato_selection

# 微信小程序配置
NEXT_PUBLIC_WECHAT_APP_ID=你的微信AppID

# 应用配置
NODE_ENV=production
PORT=5000
NEXT_PUBLIC_APP_URL=https://your-domain.com

# 火山云对象存储 TOS 配置（可选）
# TOS_ACCESS_KEY_ID=your-volcano-tos-access-key-id
# TOS_SECRET_ACCESS_KEY=your-volcano-tos-secret-access-key
# TOS_BUCKET=your-bucket-name
# TOS_REGION=cn-beijing
```

**保存并退出 nano：**
- 按 `Ctrl + O` 保存
- 按 `Enter` 确认
- 按 `Ctrl + X` 退出

---

### 步骤 5：获取并上传 SSL 证书

#### 方式 A：使用火山云 SSL 证书（推荐）

1. 登录火山云控制台
2. 进入「SSL 证书」服务
3. 申请免费证书（DV 证书）
4. 下载证书（选择 Nginx 格式）
5. 解压后你会得到：
   - `your-domain.com.pem` 或 `fullchain.pem`
   - `your-domain.com.key` 或 `privkey.pem`

#### 在你的本地电脑上执行

```bash
# 创建 SSL 证书目录
ssh -i /path/to/your-ssh-key.pem root@你的服务器公网IP "mkdir -p /etc/nginx/ssl/your-domain.com"

# 上传 SSL 证书文件
scp -i /path/to/your-ssh-key.pem fullchain.pem root@你的服务器公网IP:/etc/nginx/ssl/your-domain.com/
scp -i /path/to/your-ssh-key.pem privkey.pem root@你的服务器公网IP:/etc/nginx/ssl/your-domain.com/

# 示例：
# scp -i ~/.ssh/volcano-key.pem fullchain.pem root@123.456.789.0:/etc/nginx/ssl/your-domain.com/
# scp -i ~/.ssh/volcano-key.pem privkey.pem root@123.456.789.0:/etc/nginx/ssl/your-domain.com/
```

#### 方式 B：使用 Certbot 自动获取（Let's Encrypt）

#### 在服务器上执行

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书
certbot --nginx -d your-domain.com

# 按提示操作：
# 1. 输入邮箱地址
# 2. 同意服务条款
# 3. 选择是否共享邮箱
# 4. 选择域名
# 5. 选择是否强制 HTTPS 重定向

# Certbot 会自动配置 Nginx SSL
```

#### 在服务器上验证

```bash
# 验证证书文件
ls -lh /etc/nginx/ssl/your-domain.com/

# 应该看到：
# fullchain.pem
# privkey.pem
```

---

### 步骤 6：重启服务并验证部署

#### 在服务器上执行

```bash
# 重启 Nginx
systemctl restart nginx

# 检查 Nginx 状态
systemctl status nginx

# 重启应用
pm2 restart luowato-selection

# 检查应用状态
pm2 status

# 检查端口监听
ss -lptn 'sport = :5000'

# 应该看到类似这样的输出：
# State      Recv-Q Send-Q Local Address:Port   Peer Address:Port
# LISTEN     0      128                *:5000              *:*    users:(("node",pid=1234,fd=10))
```

---

### 步骤 7：测试访问

#### 在你的本地电脑上执行

```bash
# 测试 HTTP 访问
curl -I http://your-domain.com

# 测试 HTTPS 访问
curl -I https://your-domain.com

# 检查自动重定向
curl -I http://your-domain.com
# 应该看到：HTTP/1.1 301 Moved Permanently
# Location: https://your-domain.com/
```

#### 在浏览器中测试

1. 打开浏览器
2. 访问 `http://your-domain.com`
3. 应该自动跳转到 `https://your-domain.com`
4. 检查页面是否正常显示
5. 测试智能选型功能
6. 测试产品库功能（密码：admin123）

---

### 步骤 8：配置火山云域名解析

#### 在火山云控制台执行

1. 登录火山云控制台
2. 进入「域名解析」服务
3. 选择你的域名
4. 添加记录：
   - 记录类型：A
   - 主机记录：@
   - 记录值：你的服务器公网 IP
   - TTL：600
   - 可选：添加 www 子域名（主机记录：www）

---

### 步骤 9：配置微信小程序业务域名

#### 在微信公众平台执行

1. 登录微信公众平台
2. 进入「开发」→「开发管理」→「开发设置」
3. 找到「业务域名」
4. 点击「配置」
5. 添加你的域名：
   - 域名：your-domain.com
6. 下载校验文件，上传到服务器根目录：
   ```bash
   scp -i /path/to/your-ssh-key.pem MP_verify_xxxxxx.txt root@你的服务器公网IP:/var/www/luowato-selection/public/
   ```
7. 点击「确认」验证

---

## ✅ 部署完成检查清单

### 基础检查
- [ ] SSH 连接成功
- [ ] 项目文件上传成功
- [ ] 部署脚本执行成功
- [ ] 环境变量配置完成
- [ ] SSL 证书上传成功
- [ ] Nginx 重启成功
- [ ] 应用重启成功

### 功能检查
- [ ] HTTP 访问正常
- [ ] HTTPS 访问正常
- [ ] 自动重定向正常
- [ ] 首页自动跳转到智能选型
- [ ] 智能选型页面正常
- [ ] 产品库页面需要密码
- [ ] 产品库密码（admin123）正常

### 日志检查
```bash
# 查看 PM2 日志
pm2 logs luowato-selection

# 查看 Nginx 错误日志
tail -100 /var/log/nginx/luowato-selection-error.log

# 查看 Nginx 访问日志
tail -100 /var/log/nginx/luowato-selection-access.log
```

---

## 🔥 火山云特有配置

### 火山云 PostgreSQL 连接

1. 登录火山云控制台
2. 进入「云数据库 PostgreSQL」
3. 选择你的实例
4. 查看连接信息：
   - 内网地址
   - 端口
   - 数据库名
   - 用户名
   - 密码

**连接字符串格式：**
```bash
DATABASE_URL=postgresql://用户名:密码@内网地址:端口/数据库名
```

### 火山云对象存储 TOS（可选）

1. 登录火山云控制台
2. 进入「对象存储 TOS」
3. 创建存储桶
4. 获取访问密钥：
   - Access Key ID
   - Secret Access Key

**配置到环境变量：**
```bash
TOS_ACCESS_KEY_ID=your-access-key-id
TOS_SECRET_ACCESS_KEY=your-secret-access-key
TOS_BUCKET=your-bucket-name
TOS_REGION=cn-beijing
```

### 火山云 CDN（可选）

1. 登录火山云控制台
2. 进入「内容分发网络 CDN」
3. 添加加速域名
4. 配置回源到你的服务器
5. 等待配置生效

---

## 🆘 常见问题排查

### 问题 1：连接服务器失败
```bash
# 检查 SSH 密钥权限
chmod 600 /path/to/your-ssh-key.pem

# 使用详细模式连接
ssh -v -i /path/to/your-ssh-key.pem root@你的服务器公网IP
```

### 问题 2：上传文件失败
```bash
# 检查服务器磁盘空间
ssh root@你的服务器公网IP "df -h"

# 分批上传
cd /path/to/luowato-selection
tar -czf project.tar.gz .
scp -i /path/to/your-ssh-key.pem project.tar.gz root@你的服务器公网IP:/var/www/
ssh root@你的服务器公网IP "cd /var/www && tar -xzf project.tar.gz -C luowato-selection"
```

### 问题 3：部署脚本执行失败
```bash
# 手动安装依赖
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs git
npm install -g pnpm pm2

# 手动构建
cd /var/www/luowato-selection
pnpm install
pnpm run build

# 手动启动
pm2 start ecosystem.config.js
pm2 save
```

### 问题 4：访问 502 Bad Gateway
```bash
# 检查应用状态
pm2 status

# 重启应用
pm2 restart luowato-selection

# 查看日志
pm2 logs luowato-selection

# 检查端口
ss -lptn 'sport = :5000'
```

### 问题 5：SSL 证书错误
```bash
# 检查证书文件
ls -la /etc/nginx/ssl/your-domain.com/

# 测试 Nginx 配置
nginx -t

# 查看 Nginx 错误日志
tail -100 /var/log/nginx/luowato-selection-error.log

# 使用 Certbot 重新获取
certbot --nginx -d your-domain.com --force-renewal
```

### 问题 6：数据库连接失败
```bash
# 检查环境变量
cat /var/www/luowato-selection/.env.production | grep DATABASE_URL

# 测试数据库连接
psql -h 内网地址 -U 用户名 -d 数据库名

# 检查防火墙
systemctl status firewalld
# 或
ufw status

# 重启应用
pm2 restart luowato-selection
```

### 问题 7：火山云 PostgreSQL 无法连接

```bash
# 检查安全组配置
# 1. 登录火山云控制台
# 2. 进入「云服务器 ECS」
# 3. 选择你的实例
# 4. 点击「安全组」
# 5. 确认已开放 5432 端口（仅内网）

# 测试数据库连接
psql -h 内网地址 -p 5432 -U 用户名 -d 数据库名

# 检查数据库是否在运行
# 在火山云控制台查看数据库实例状态
```

---

## 💰 火山云成本估算

### 月度成本
- 云服务器 ECS（2核4GB）：约 200 元/月
- PostgreSQL（4GB）：约 150 元/月
- 带宽（5Mbps）：约 150 元/月
- SSL 证书（火山云免费）：0 元/月
- 域名：约 5 元/月
- CDN（按流量）：约 0.24 元/GB

**总计：约 500 元/月**

---

## 📞 需要帮助？

如果遇到问题，请提供以下信息：

1. **当前步骤**：你执行到哪一步了？
2. **错误信息**：完整的错误输出
3. **日志信息**：
   ```bash
   pm2 logs luowato-selection --lines 100
   tail -100 /var/log/nginx/luowato-selection-error.log
   ```
4. **系统信息**：
   ```bash
   cat /etc/os-release
   node -v
   pnpm -v
   ```

---

## 📝 部署记录

请在 `DEPLOYMENT_PROGRESS.md` 文件中记录你的部署进度。
