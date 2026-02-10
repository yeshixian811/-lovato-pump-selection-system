#!/bin/bash

# 洛瓦托水泵选型系统 - 腾讯云自动化部署脚本
# 使用方法: bash deploy-tencent-auto.sh

set -e

echo "=========================================="
echo "洛瓦托水泵选型系统 - 腾讯云部署脚本"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_DIR="/var/www/luowato-selection"
PORT=3000
DOMAIN="lowatopump.com"
EMAIL="admin@lowatopump.com"
GITHUB_REPO="https://github.com/yeshixian811/-lovato-pump-selection-system.git"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 函数：打印步骤
print_step() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# 函数：检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. 更新系统
print_step "[1/10] 更新系统包..."
apt update && apt upgrade -y
echo -e "${GREEN}✓ 系统更新完成${NC}"

# 2. 安装基础工具
print_step "[2/10] 安装基础工具..."
apt install -y curl wget git unzip software-properties-common
echo -e "${GREEN}✓ 基础工具安装完成${NC}"

# 3. 安装 Node.js 24
print_step "[3/10] 安装 Node.js 24..."
if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js 已安装: $NODE_VERSION${NC}"
else
    echo "正在安装 Node.js 24..."
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}✓ Node.js 安装完成: $(node -v)${NC}"
fi

# 4. 安装 pnpm
print_step "[4/10] 安装 pnpm..."
if command_exists pnpm; then
    echo -e "${GREEN}✓ pnpm 已安装: $(pnpm -v)${NC}"
else
    npm install -g pnpm
    echo -e "${GREEN}✓ pnpm 安装完成: $(pnpm -v)${NC}"
fi

# 5. 安装 PM2
print_step "[5/10] 安装 PM2..."
if command_exists pm2; then
    echo -e "${GREEN}✓ PM2 已安装: $(pm2 -v)${NC}"
else
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 安装完成: $(pm2 -v)${NC}"
fi

# 6. 克隆或更新项目
print_step "[6/10] 克隆/更新项目..."
if [ -d "$PROJECT_DIR" ]; then
    echo "项目已存在，正在更新..."
    cd "$PROJECT_DIR"
    git fetch origin
    git reset --hard origin/main
    echo -e "${GREEN}✓ 项目更新完成${NC}"
else
    echo "正在克隆项目..."
    mkdir -p "$PROJECT_DIR"
    git clone "$GITHUB_REPO" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    echo -e "${GREEN}✓ 项目克隆完成${NC}"
fi

# 7. 安装依赖
print_step "[7/10] 安装项目依赖..."
cd "$PROJECT_DIR"
pnpm install --frozen-lockfile
echo -e "${GREEN}✓ 依赖安装完成${NC}"

# 8. 构建项目
print_step "[8/10] 构建项目..."
pnpm run build
echo -e "${GREEN}✓ 项目构建完成${NC}"

# 9. 配置环境变量
print_step "[9/10] 配置环境变量..."
if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    cat > "$PROJECT_DIR/.env.production" << EOF
# 数据库配置（请修改为实际的数据库连接字符串）
DATABASE_URL=postgresql://username:password@localhost:5432/luowato_selection

# 微信小程序配置（请修改为实际的 AppID）
NEXT_PUBLIC_WECHAT_APP_ID=your-wechat-app-id

# 应用配置
NODE_ENV=production
PORT=$PORT
NEXT_PUBLIC_APP_URL=https://$DOMAIN
EOF
    echo -e "${YELLOW}⚠ 已创建 .env.production 文件，请修改其中的配置项${NC}"
else
    echo -e "${GREEN}✓ .env.production 文件已存在${NC}"
fi

# 10. 配置 PM2
print_step "[10/10] 配置 PM2..."
cat > "$PROJECT_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: 'luowato-selection',
    script: 'npm',
    args: 'start',
    cwd: '$PROJECT_DIR',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
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
pm2 startup
echo -e "${GREEN}✓ PM2 配置完成，应用已启动${NC}"

# 显示应用状态
pm2 status

# 11. 安装 Nginx
print_step "[11/11] 安装和配置 Nginx..."
if command_exists nginx; then
    echo -e "${GREEN}✓ Nginx 已安装: $(nginx -v 2>&1)${NC}"
else
    apt install -y nginx
    echo -e "${GREEN}✓ Nginx 安装完成${NC}"
fi

# 配置 Nginx
cat > "/etc/nginx/sites-available/luowato-selection" << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

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

# 删除默认站点
rm -f /etc/nginx/sites-enabled/default

# 创建软链接
ln -sf /etc/nginx/sites-available/luowato-selection /etc/nginx/sites-enabled/

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
echo -e "${GREEN}✓ Nginx 配置完成${NC}"

# 12. 配置防火墙
print_step "[12/12] 配置防火墙..."
if command_exists ufw; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    echo -e "${GREEN}✓ 防火墙配置完成${NC}"
fi

# 完成提示
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${BLUE}应用状态：${NC}"
pm2 status

echo -e "\n${BLUE}访问地址：${NC}"
echo -e "${GREEN}http://$DOMAIN${NC}"
echo -e "${GREEN}http://www.$DOMAIN${NC}"

echo -e "\n${YELLOW}接下来需要执行的步骤：${NC}"
echo -e "1. 配置域名 DNS 解析，将 $DOMAIN 指向 $(curl -s ifconfig.me)"
echo -e "2. 等待 DNS 生效（10-20 分钟）"
echo -e "3. 获取 SSL 证书："
echo -e "   ${GREEN}sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"

echo -e "\n${YELLOW}常用命令：${NC}"
echo -e "查看应用状态: ${GREEN}pm2 status${NC}"
echo -e "查看应用日志: ${GREEN}pm2 logs luowato-selection${NC}"
echo -e "重启应用:     ${GREEN}pm2 restart luowato-selection${NC}"
echo -e "停止应用:     ${GREEN}pm2 stop luowato-selection${NC}"
echo -e "查看 Nginx 日志: ${GREEN}tail -f /var/log/nginx/luowato-selection-access.log${NC}"

echo -e "\n${GREEN}========================================${NC}"
