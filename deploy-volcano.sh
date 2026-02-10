#!/bin/bash

# 火山云自动部署脚本
# 使用方法: bash deploy.sh

set -e

echo "=========================================="
echo "洛瓦托水泵选型系统 - 火山云部署脚本"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_DIR="/var/www/luowato-selection"
PORT=5000
DOMAIN="your-domain.com"  # 请修改为你的域名
EMAIL="your-email@example.com"  # 请修改为你的邮箱

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 检查并安装依赖
echo -e "${YELLOW}[1/8] 检查并安装依赖...${NC}"

if ! command -v node &> /dev/null; then
    echo "安装 Node.js 24..."
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
    apt install -y nodejs
fi

if ! command -v pnpm &> /dev/null; then
    echo "安装 pnpm..."
    npm install -g pnpm
fi

if ! command -v git &> /dev/null; then
    echo "安装 Git..."
    apt install -y git
fi

if ! command -v pm2 &> /dev/null; then
    echo "安装 PM2..."
    npm install -g pm2
fi

echo -e "${GREEN}✓ 依赖安装完成${NC}"

# 创建项目目录
echo -e "${YELLOW}[2/8] 创建项目目录...${NC}"
mkdir -p "$PROJECT_DIR"
echo -e "${GREEN}✓ 项目目录创建完成${NC}"

# 安装依赖并构建
echo -e "${YELLOW}[3/8] 安装项目依赖...${NC}"
cd "$PROJECT_DIR"
pnpm install --prefer-frozen-lockfile
echo -e "${GREEN}✓ 依赖安装完成${NC}"

echo -e "${YELLOW}[4/8] 构建项目...${NC}"
pnpm run build
echo -e "${GREEN}✓ 项目构建完成${NC}"

# 配置环境变量
echo -e "${YELLOW}[5/8] 配置环境变量...${NC}"
if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    cat > "$PROJECT_DIR/.env.production" << EOF
# 数据库配置（请修改为实际的数据库连接字符串）
DATABASE_URL=postgresql://username:password@localhost:5432/luowato_selection

# 微信小程序配置（请修改为实际的 AppID）
NEXT_PUBLIC_WECHAT_APP_ID=your-wechat-app-id

# 其他配置
NODE_ENV=production
PORT=5000
EOF
    echo -e "${YELLOW}⚠ 已创建 .env.production 文件，请修改其中的配置项${NC}"
else
    echo -e "${GREEN}✓ .env.production 文件已存在${NC}"
fi

# 配置 PM2
echo -e "${YELLOW}[6/8] 配置 PM2...${NC}"
cat > "$PROJECT_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: 'luowato-selection',
    script: 'node',
    args: '.next/standalone/server.js',
    cwd: '$PROJECT_DIR',
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

# 创建日志目录
mkdir -p /var/log/luowato-selection

# 停止旧进程（如果存在）
pm2 delete luowato-selection 2>/dev/null || true

# 启动应用
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✓ PM2 配置完成${NC}"

# 配置 Nginx
echo -e "${YELLOW}[7/8] 配置 Nginx...${NC}"

if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    apt install -y nginx
fi

cat > "/etc/nginx/sites-available/luowato-selection" << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # 重定向到 HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志配置
    access_log /var/log/nginx/luowato-selection-access.log;
    error_log /var/log/nginx/luowato-selection-error.log;

    # 反向代理
    location / {
        proxy_pass http://localhost:$PORT;
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

    # 静态资源缓存
    location /_next/static {
        proxy_pass http://localhost:$PORT;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/luowato-selection /etc/nginx/sites-enabled/

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
echo -e "${GREEN}✓ Nginx 配置完成${NC}"

# 获取 SSL 证书
echo -e "${YELLOW}[8/8] 配置 SSL 证书...${NC}"
if ! command -v certbot &> /dev/null; then
    echo "安装 Certbot..."
    apt install -y certbot python3-certbot-nginx
fi

echo -e "${YELLOW}获取 SSL 证书...${NC}"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL"

echo -e "${GREEN}✓ SSL 证书配置完成${NC}"

# 显示部署信息
echo ""
echo "=========================================="
echo -e "${GREEN}部署完成！${NC}"
echo "=========================================="
echo ""
echo "访问地址:"
echo "  HTTP:  http://$DOMAIN"
echo "  HTTPS: https://$DOMAIN"
echo ""
echo "管理命令:"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs luowato-selection"
echo "  重启应用: pm2 restart luowato-selection"
echo "  重启 Nginx: systemctl restart nginx"
echo ""
echo "重要提醒:"
echo "  1. 请修改 $PROJECT_DIR/.env.production 中的配置"
echo "  2. 请配置微信小程序业务域名"
echo "  3. 默认产品库密码: admin123"
echo ""
