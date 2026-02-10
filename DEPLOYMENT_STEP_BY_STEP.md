# 腾讯云部署 - 详细步骤指南

## ⚠️ 重要提示
**我无法直接访问你的服务器**，你需要在本地的终端或 SSH 客户端中执行以下命令。

---

## 📦 部署前准备

### 1. 准备必要信息
在开始之前，请准备好以下信息：
- ✅ 腾讯云服务器公网 IP 地址
- ✅ 服务器 SSH 密钥文件路径
- ✅ 域名（已解析到服务器 IP）
- ✅ 腾讯云 PostgreSQL 连接信息
- ✅ 微信小程序 AppID
- ✅ SSL 证书文件（fullchain.pem 和 privkey.pem）

### 2. 本地检查（在你的本地电脑执行）
```bash
# 检查项目目录
cd /path/to/luowato-selection
ls -lh

# 确认以下文件存在：
# - deploy-tencent.sh
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
# ssh -i ~/.ssh/tencent-key.pem root@123.456.789.0
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
root@VM-0-0-ubuntu:~#
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
# scp -i ~/.ssh/tencent-key.pem -r . root@123.456.789.0:/var/www/luowato-selection

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
ls -lh deploy-tencent.sh

# 修改部署脚本中的域名和邮箱
nano deploy-tencent.sh
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
chmod +x deploy-tencent.sh

# 运行部署脚本
bash deploy-tencent.sh
```

**部署脚本会自动执行以下操作：**
1. 检查并安装 Node.js 24
2. 检查并安装 pnpm
3. 检查并安装 PM2
4. 创建项目目录
5. 安装项目依赖
6. 构建项目
7. 配置 PM2
8. 启动应用
9. 配置 Nginx
10. 重启 Nginx

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

# 腾讯云 COS 配置（可选）
# COS_SECRET_ID=your-tencent-cos-secret-id
# COS_SECRET_KEY=your-tencent-cos-secret-key
# COS_BUCKET=your-bucket-name
# COS_REGION=ap-beijing
```

**保存并退出 nano：**
- 按 `Ctrl + O` 保存
- 按 `Enter` 确认
- 按 `Ctrl + X` 退出

---

### 步骤 5：上传 SSL 证书

#### 在你的本地电脑上执行

```bash
# 创建 SSL 证书目录
ssh -i /path/to/your-ssh-key.pem root@你的服务器公网IP "mkdir -p /etc/nginx/ssl/your-domain.com"

# 上传 SSL 证书文件
scp -i /path/to/your-ssh-key.pem fullchain.pem root@你的服务器公网IP:/etc/nginx/ssl/your-domain.com/
scp -i /path/to/your-ssh-key.pem privkey.pem root@你的服务器公网IP:/etc/nginx/ssl/your-domain.com/

# 示例：
# scp -i ~/.ssh/tencent-key.pem fullchain.pem root@123.456.789.0:/etc/nginx/ssl/your-domain.com/
# scp -i ~/.ssh/tencent-key.pem privkey.pem root@123.456.789.0:/etc/nginx/ssl/your-domain.com/
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
apt install -y nodejs
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
```

### 问题 6：数据库连接失败
```bash
# 检查环境变量
cat /var/www/luowato-selection/.env.production | grep DATABASE_URL

# 测试数据库连接
psql -h 内网地址 -U 用户名 -d 数据库名

# 检查防火墙
ufw status

# 重启应用
pm2 restart luowato-selection
```

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
