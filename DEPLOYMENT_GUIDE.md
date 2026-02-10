# 火山云部署指南 - 微信小程序网站格式

## 项目信息

- **项目名称**: 洛瓦托水泵选型系统
- **技术栈**: Next.js 16 + React 19 + TypeScript 5
- **部署目标**: 火山云服务器
- **格式要求**: 微信小程序网站格式

## 语法检查结果

✅ TypeScript 编译检查通过
✅ 构建检查通过
✅ 无语法错误

## 微信小程序网站格式配置

### 1. PWA 配置
- ✅ `manifest.json` 已配置
- ✅ 支持添加到主屏幕
- ✅ 离线可用（PWA功能）
- ✅ 应用图标已配置

### 2. 微信兼容配置
- ✅ `wechat-enable-compatible` 标签
- ✅ 移动端优化
- ✅ 响应式设计
- ✅ 微信小程序兼容标签

### 3. 图标配置
- ✅ icon-192x192.png
- ✅ icon-512x512.png
- ✅ apple-touch-icon.png
- ✅ favicon.ico

### 4. 小程序配置文件
- ✅ `app.json` (微信小程序配置)
- ✅ `sitemap.json` (小程序搜索配置)

## 部署步骤

### 步骤 1: 准备服务器

登录火山云服务器：
```bash
ssh root@your-server-ip
```

### 步骤 2: 安装依赖

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 Git
apt install -y git

# 验证安装
node -v  # 应显示 v24.x.x
pnpm -v  # 应显示 9.0.0
```

### 步骤 3: 克隆项目

```bash
# 克隆项目到服务器
git clone your-repo-url /var/www/luowato-selection
cd /var/www/luowato-selection
```

### 步骤 4: 安装依赖并构建

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 启动服务
pnpm run start
```

### 步骤 5: 配置环境变量

创建 `.env.production` 文件：
```bash
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/luowato_selection

# 微信小程序配置
NEXT_PUBLIC_WECHAT_APP_ID=your-wechat-app-id

# 其他配置
NODE_ENV=production
```

### 步骤 6: 配置 PM2（进程管理）

```bash
# 安装 PM2
npm install -g pm2

# 创建 PM2 配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'luowato-selection',
    script: 'node',
    args: '.next/standalone/server.js',
    cwd: '/var/www/luowato-selection',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/luowato-selection/error.log',
    out_file: '/var/log/luowato-selection/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF

# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

### 步骤 7: 配置 Nginx

```bash
# 安装 Nginx
apt install -y nginx

# 创建站点配置
cat > /etc/nginx/sites-available/luowato-selection << EOF
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置（使用 Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志配置
    access_log /var/log/nginx/luowato-selection-access.log;
    error_log /var/log/nginx/luowato-selection-error.log;

    # 反向代理到 Next.js 应用
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

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态资源缓存
    location /_next/static {
        proxy_pass http://localhost:5000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 静态文件
    location /static {
        proxy_pass http://localhost:5000;
        proxy_cache_valid 200 60m;
    }
}
EOF

# 启用站点
ln -s /etc/nginx/sites-available/luowato-selection /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

### 步骤 8: 配置 SSL 证书

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书
certbot --nginx -d your-domain.com

# 自动续期
certbot renew --dry-run
```

## 微信小程序配置

### 配置业务域名

1. 登录微信公众平台
2. 进入「开发」→「开发管理」→「开发设置」
3. 在「业务域名」中添加你的域名
4. 下载校验文件并上传到网站根目录

### 配置 web-view 域名（如需要）

在小程序的 `project.config.json` 中配置：
```json
{
  "setting": {
    "urlCheck": true
  }
}
```

## 验证部署

### 1. 检查服务状态

```bash
# 检查 PM2 状态
pm2 status

# 检查日志
pm2 logs luowato-selection

# 检查 Nginx 状态
systemctl status nginx
```

### 2. 测试访问

```bash
# 测试 HTTP 访问
curl -I http://your-domain.com

# 测试 HTTPS 访问
curl -I https://your-domain.com

# 测试智能选型页面
curl -I https://your-domain.com/selection

# 测试产品库页面
curl -I https://your-domain.com/products
```

### 3. 微信小程序测试

1. 在微信中打开：`https://your-domain.com`
2. 测试所有功能：
   - ✅ 智能选型功能
   - ✅ 产品库功能（需要密码：admin123）
   - ✅ 性能曲线显示
   - ✅ 产品编辑功能
   - ✅ 批量导入功能
   - ✅ PDF 导出功能

## 性能优化

### 1. 启用 Gzip 压缩

在 Nginx 配置中添加：
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript
           application/x-javascript application/xml+rss
           application/javascript application/json;
```

### 2. 配置缓存策略

```nginx
# 静态资源长期缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 监控和日志

### 查看应用日志

```bash
# PM2 日志
pm2 logs luowato-selection

# Nginx 访问日志
tail -f /var/log/nginx/luowato-selection-access.log

# Nginx 错误日志
tail -f /var/log/nginx/luowato-selection-error.log
```

### 设置日志轮转

```bash
# 安装 logrotate
apt install -y logrotate

# 创建 PM2 日志轮转配置
cat > /etc/logrotate.d/luowato-selection << EOF
/var/log/luowato-selection/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
```

## 常见问题

### 问题 1: 端口被占用

```bash
# 查看端口占用
lsof -i :5000

# 杀死进程
kill -9 <PID>
```

### 问题 2: 内存不足

```bash
# 检查内存使用
free -h

# 重启 PM2 应用
pm2 restart luowato-selection
```

### 问题 3: 数据库连接失败

```bash
# 检查数据库状态
systemctl status postgresql

# 检查连接字符串
echo $DATABASE_URL
```

## 安全建议

1. ✅ 使用 HTTPS（已配置）
2. ✅ 启用防火墙
3. ✅ 定期更新系统和依赖
4. ✅ 配置安全头（已在 next.config.ts 中配置）
5. ✅ 限制 API 访问频率
6. ✅ 备份数据库
7. ✅ 使用强密码
8. ✅ 监控日志和异常

## 技术支持

如遇问题，请检查：
1. PM2 日志：`pm2 logs luowato-selection`
2. Nginx 日志：`/var/log/nginx/`
3. 应用日志：`/var/log/luowato-selection/`
