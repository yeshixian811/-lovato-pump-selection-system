# 🚀 火山云手动部署步骤

**一步一步手动部署洛瓦托水泵选型系统到火山云**

---

## 📋 部署信息

- 服务器 IP：14.103.55.52
- 域名：lowato-pumps.com
- 项目路径：C:\Users\ASUS\Downloads\pack_project (3).tar.gz

---

## 第 1 步：连接到火山云服务器

**在你的本地电脑（Windows）上执行：**

### 方式 1：如果你有 SSH 密钥文件

```cmd
ssh -i C:\Users\ASUS\Downloads\你的密钥文件.pem root@14.103.55.52
```

### 方式 2：使用密码登录

```cmd
ssh root@14.103.55.52
```

输入密码（输入时不会显示）

---

## 第 2 步：在服务器上安装 Node.js

**在服务器上执行：**

```bash
# 更新系统
apt update

# 安装必要的工具
apt install -y curl git

# 安装 Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs

# 验证安装
node -v
npm -v
```

应该看到 Node.js 版本 v24.x.x

---

## 第 3 步：安装 pnpm

**在服务器上执行：**

```bash
# 全局安装 pnpm
npm install -g pnpm

# 验证安装
pnpm -v
```

应该看到 pnpm 版本

---

## 第 4 步：安装 PM2

**在服务器上执行：**

```bash
# 全局安装 PM2
npm install -g pm2

# 验证安装
pm2 -v
```

---

## 第 5 步：安装 Nginx

**在服务器上执行：**

```bash
# 安装 Nginx
apt install -y nginx

# 启动 Nginx
systemctl start nginx
systemctl enable nginx

# 验证安装
nginx -v
systemctl status nginx
```

---

## 第 6 步：上传项目文件到服务器

**在你的本地电脑（Windows）上执行：**

### 6.1 确认文件存在

```cmd
cd C:\Users\ASUS\Downloads
dir
```

确认 `pack_project (3).tar.gz` 文件存在

### 6.2 上传压缩包

```cmd
# 如果使用密钥文件
scp -i C:\Users\ASUS\Downloads\你的密钥文件.pem "C:\Users\ASUS\Downloads\pack_project (3).tar.gz" root@14.103.55.52:/tmp/

# 如果使用密码
scp "C:\Users\ASUS\Downloads\pack_project (3).tar.gz" root@14.103.55.52:/tmp/
```

---

## 第 7 步：在服务器上解压项目

**在服务器上执行：**

```bash
# 进入 tmp 目录
cd /tmp

# 确认文件已上传
ls -lh

# 创建项目目录
mkdir -p /var/www/luowato-selection

# 解压项目
tar -xzf "pack_project (3).tar.gz" -C /var/www/luowato-selection

# 如果解压后有多层目录，移动文件
cd /var/www/luowato-selection
ls -la

# 如果看到类似 pack_project 这样的目录，移动文件
# mv pack_project/* .
# mv pack_project/.* . 2>/dev/null || true
# rm -rf pack_project

# 进入项目目录
cd /var/www/luowato-selection

# 确认项目文件
ls -la
```

应该看到 package.json、src、public 等文件

---

## 第 8 步：安装项目依赖

**在服务器上执行：**

```bash
# 进入项目目录
cd /var/www/luowato-selection

# 安装依赖
pnpm install

# 等待安装完成（可能需要 5-10 分钟）
```

---

## 第 9 步：构建项目

**在服务器上执行：**

```bash
# 构建项目
pnpm run build

# 等待构建完成（可能需要 3-5 分钟）
```

构建完成后，应该看到 `.next` 目录

```bash
# 确认构建结果
ls -la .next
```

---

## 第 10 步：配置环境变量

**在服务器上执行：**

```bash
# 创建环境变量文件
cat > /var/www/luowato-selection/.env.production << EOF
# 数据库配置（请修改为实际的数据库连接字符串）
DATABASE_URL=postgresql://用户名:密码@内网地址:5432/数据库名

# 微信小程序配置
NEXT_PUBLIC_WECHAT_APP_ID=你的微信AppID

# 其他配置
NODE_ENV=production
PORT=5000
NEXT_PUBLIC_APP_URL=https://lowato-pumps.com
EOF

# 查看环境变量文件
cat /var/www/luowato-selection/.env.production
```

---

## 第 11 步：启动应用

**在服务器上执行：**

```bash
# 进入项目目录
cd /var/www/luowato-selection

# 启动应用
PORT=5000 NODE_ENV=production node .next/standalone/server.js &

# 或者使用 PM2 启动
pm2 start /var/www/luowato-selection/.next/standalone/server.js --name luowato-selection --env production -- 5000

# 查看应用状态
pm2 status

# 查看日志
pm2 logs luowato-selection

# 保存 PM2 配置
pm2 save
pm2 startup
```

---

## 第 12 步：配置 Nginx

**在服务器上执行：**

```bash
# 创建 Nginx 配置文件
cat > /etc/nginx/sites-available/luowato-selection << EOF
server {
    listen 80;
    server_name lowato-pumps.com;

    # 反向代理
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 创建软链接
ln -sf /etc/nginx/sites-available/luowato-selection /etc/nginx/sites-enabled/

# 删除默认配置（可选）
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx

# 查看 Nginx 状态
systemctl status nginx
```

---

## 第 13 步：配置 SSL 证书（可选）

**在服务器上执行：**

### 13.1 安装 Certbot

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx
```

### 13.2 获取 SSL 证书

```bash
# 获取 SSL 证书
certbot --nginx -d lowato-pumps.com

# 按提示操作：
# 1. 输入邮箱地址
# 2. 同意服务条款（A）
# 3. 选择是否共享邮箱（N）
# 4. 选择域名
# 5. 选择是否强制 HTTPS 重定向（2）
```

### 13.3 自动续期

```bash
# 测试自动续期
certbot renew --dry-run

# Certbot 会自动配置续期任务
```

---

## 第 14 步：验证部署

### 14.1 检查应用状态

**在服务器上执行：**

```bash
# 查看 PM2 状态
pm2 status

# 查看应用日志
pm2 logs luowato-selection

# 检查端口监听
ss -lptn 'sport = :5000'
```

### 14.2 测试访问

**在你的本地电脑上执行：**

```cmd
# 测试 HTTP 访问
curl http://lowato-pumps.com

# 测试 HTTPS 访问（如果配置了 SSL）
curl https://lowato-pumps.com
```

### 14.3 在浏览器中测试

1. 打开浏览器
2. 访问：http://lowato-pumps.com
3. 应该看到洛瓦托水泵选型系统

---

## 第 15 步：配置火山云 PostgreSQL 白名单（重要！）

**在火山云控制台执行：**

1. 访问：https://console.volcengine.com/
2. 进入"云数据库 PostgreSQL"
3. 选择你的实例
4. 点击"白名单设置"
5. 添加以下之一：
   - ECS 内网 IP（推荐）
   - `0.0.0.0/0`（允许所有，不推荐生产环境）
6. 点击"确定"

**查看连接信息：**
- 内网地址：`10.0.x.x`
- 端口：`5432`（火山云默认）

---

## 第 16 步：更新环境变量（配置数据库）

**在服务器上执行：**

```bash
# 编辑环境变量文件
nano /var/www/luowato-selection/.env.production
```

修改数据库连接字符串：

```bash
# 格式：postgresql://用户名:密码@内网地址:5432/数据库名
DATABASE_URL=postgresql://用户名:密码@10.0.x.x:5432/数据库名
```

保存并退出：
- 按 `Ctrl + O` 保存
- 按 `Enter` 确认
- 按 `Ctrl + X` 退出

```bash
# 重启应用
pm2 restart luowato-selection
```

---

## 第 17 步：配置域名解析

**在火山云控制台执行：**

1. 访问：https://console.volcengine.com/
2. 进入"域名解析"
3. 找到域名 `lowato-pumps.com`
4. 点击"添加记录"
5. 填写：
   - 记录类型：A
   - 主机记录：@
   - 记录值：14.103.55.52
   - TTL：600
6. 点击"确定"

---

## 🎉 部署完成！

### 访问地址：
- HTTP: http://lowato-pumps.com
- HTTPS: https://lowato-pumps.com（如果配置了 SSL）

### 管理命令：

```bash
# PM2 管理
pm2 status
pm2 logs luowato-selection
pm2 restart luowato-selection
pm2 stop luowato-selection
pm2 delete luowato-selection

# Nginx 管理
systemctl status nginx
systemctl restart nginx
systemctl reload nginx
nginx -t
```

---

## 🆘 常见问题

### 问题 1：应用无法启动

```bash
# 查看日志
pm2 logs luowato-selection

# 检查端口
ss -lptn 'sport = :5000'

# 重启应用
pm2 restart luowato-selection
```

### 问题 2：Nginx 502 错误

```bash
# 检查应用是否运行
pm2 status

# 检查应用日志
pm2 logs luowato-selection

# 检查 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

### 问题 3：数据库连接失败

```bash
# 检查环境变量
cat /var/www/luowato-selection/.env.production

# 确认 PostgreSQL 白名单已配置
# 确认端口是 5432
# 确认使用内网地址

# 重启应用
pm2 restart luowato-selection
```

---

## 🔥 火山云特有说明

### PostgreSQL 连接信息

**连接字符串格式：**
```bash
postgresql://用户名:密码@内网地址:5432/数据库名
```

**示例：**
```bash
DATABASE_URL=postgresql://postgres:your-password@10.0.1.100:5432/postgres
```

**重要：**
- 端口是 **5432**（火山云默认）
- 内网地址格式：`10.0.x.x`

### 白名单配置

在火山云控制台：
1. 进入"云数据库 PostgreSQL"
2. 选择实例
3. 点击"白名单设置"
4. 添加 ECS 内网 IP

---

**部署完成后，告诉我结果如何！** 🚀
