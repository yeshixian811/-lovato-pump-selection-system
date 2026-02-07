#!/bin/bash

# ========================================
# 洛瓦托水泵选型系统 - 完整服务器环境安装脚本
# ========================================

set -e

echo "========================================"
echo "   洛瓦托水泵选型系统"
echo "   完整服务器环境安装"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 权限运行此脚本${NC}"
    echo "使用命令: sudo bash install-server.sh"
    exit 1
fi

# 获取项目目录
PROJECT_DIR="${PROJECT_DIR:-/workspace/projects}"
INSTALL_DIR="/opt/lovato"
BIN_DIR="/usr/local/bin"

echo "项目目录: $PROJECT_DIR"
echo "安装目录: $INSTALL_DIR"
echo "二进制目录: $BIN_DIR"
echo ""

# 创建安装目录
echo "📁 创建安装目录..."
mkdir -p $INSTALL_DIR
mkdir -p $INSTALL_DIR/{logs,config,scripts}
mkdir -p /var/log/lovato

echo "========================================"
echo "   1. 安装内网穿透工具"
echo "========================================"
echo ""

# 安装 ngrok
echo "📦 安装 ngrok..."
if [ ! -f "$BIN_DIR/ngrok" ]; then
    cd /tmp
    wget -q https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz -O ngrok.tgz
    tar -xzf ngrok.tgz
    chmod +x ngrok
    mv ngrok $BIN_DIR/
    rm -f ngrok.tgz
    echo -e "${GREEN}✓ ngrok 安装完成${NC}"
else
    echo -e "${YELLOW}✓ ngrok 已安装${NC}"
fi

# 配置 ngrok
if [ ! -f "$INSTALL_DIR/config/ngrok.yml" ]; then
    cat > $INSTALL_DIR/config/ngrok.yml << 'EOF'
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  pump-selection:
    proto: http
    addr: 5000
    bind_tls: true
    inspect: false
EOF
    echo -e "${YELLOW}⚠  ngrok 配置文件已创建，请编辑并填入您的 authtoken${NC}"
    echo "配置文件: $INSTALL_DIR/config/ngrok.yml"
fi

echo ""

# 安装 cloudflared
echo "📦 安装 cloudflared..."
if [ ! -f "$BIN_DIR/cloudflared" ]; then
    cd /tmp
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared
    chmod +x cloudflared
    mv cloudflared $BIN_DIR/
    echo -e "${GREEN}✓ cloudflared 安装完成${NC}"
else
    echo -e "${YELLOW}✓ cloudflared 已安装${NC}"
fi

# 创建 cloudflared 配置目录
mkdir -p ~/.cloudflared

echo ""
echo "========================================"
echo "   2. 安装服务管理工具"
echo "========================================"
echo ""

# 安装 PM2
echo "📦 安装 PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 安装完成${NC}"
else
    echo -e "${YELLOW}✓ PM2 已安装${NC}"
fi

# 创建 PM2 配置文件
if [ ! -f "$INSTALL_DIR/config/ecosystem.config.js" ]; then
    cat > $INSTALL_DIR/config/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'lovato-pump-selection',
    script: 'node',
    args: './node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/bin/next',
    cwd: '/workspace/projects',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/lovato/pm2-error.log',
    out_file: '/var/log/lovato/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
};
EOF
    echo -e "${GREEN}✓ PM2 配置文件已创建${NC}"
fi

echo ""
echo "========================================"
echo "   3. 配置环境变量"
echo "========================================"
echo ""

# 创建 .env 文件
if [ ! -f "$PROJECT_DIR/.env" ]; then
    cat > $PROJECT_DIR/.env << 'EOF'
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/lovato_pump

# JWT 配置
JWT_SECRET=your-secret-key-change-this

# 应用配置
NODE_ENV=development
PORT=5000

# URL 配置
NEXT_PUBLIC_APP_URL=http://localhost:5000

# API 配置
API_BASE_URL=http://localhost:5000

# S3 配置（可选）
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-bucket-name

# Next PWA 配置
NEXT_PUBLIC_PWA_ENABLED=false
EOF
    echo -e "${YELLOW}⚠  .env 文件已创建，请修改配置${NC}"
    echo "配置文件: $PROJECT_DIR/.env"
else
    echo -e "${YELLOW}✓ .env 文件已存在${NC}"
fi

echo ""
echo "========================================"
echo "   4. 安装和配置 Nginx"
echo "========================================"
echo ""

# 检查 Nginx 是否安装
if ! command -v nginx &> /dev/null; then
    echo "📦 安装 Nginx..."
    apt update
    apt install -y nginx
    echo -e "${GREEN}✓ Nginx 安装完成${NC}"
else
    echo -e "${YELLOW}✓ Nginx 已安装${NC}"
fi

# 创建 Nginx 配置
if [ ! -f "/etc/nginx/sites-available/lovato-pump" ]; then
    cat > /etc/nginx/sites-available/lovato-pump << 'EOF'
server {
    listen 80;
    server_name _;

    # 日志
    access_log /var/log/nginx/lovato-pump-access.log;
    error_log /var/log/nginx/lovato-pump-error.log;

    # 客户端最大请求体大小
    client_max_body_size 10M;

    # 代理到 Node.js 应用
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:5000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # 启用配置
    ln -sf /etc/nginx/sites-available/lovato-pump /etc/nginx/sites-enabled/

    # 测试配置
    nginx -t

    # 重启 Nginx
    systemctl restart nginx
    systemctl enable nginx

    echo -e "${GREEN}✓ Nginx 配置完成${NC}"
else
    echo -e "${YELLOW}✓ Nginx 配置已存在${NC}"
fi

echo ""
echo "========================================"
echo "   5. 配置防火墙"
echo "========================================"
echo ""

# 检查防火墙状态
if command -v ufw &> /dev/null; then
    echo "🔧 配置 UFW 防火墙..."
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 5000/tcp
    ufw --force enable
    echo -e "${GREEN}✓ 防火墙配置完成${NC}"
elif command -v firewall-cmd &> /dev/null; then
    echo "🔧 配置 firewalld..."
    firewall-cmd --permanent --add-port=22/tcp
    firewall-cmd --permanent --add-port=80/tcp
    firewall-cmd --permanent --add-port=443/tcp
    firewall-cmd --permanent --add-port=5000/tcp
    firewall-cmd --reload
    echo -e "${GREEN}✓ 防火墙配置完成${NC}"
else
    echo -e "${YELLOW}⚠  未检测到防火墙，跳过配置${NC}"
fi

echo ""
echo "========================================"
echo "   6. 配置 SSL 证书 (Let's Encrypt)"
echo "========================================"
echo ""

# 安装 certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 安装 certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✓ certbot 安装完成${NC}"
else
    echo -e "${YELLOW}✓ certbot 已安装${NC}"
fi

echo -e "${YELLOW}⚠  请在配置域名后运行以下命令获取 SSL 证书：${NC}"
echo "   certbot --nginx -d your-domain.com"
echo ""

echo ""
echo "========================================"
echo "   7. 创建管理脚本"
echo "========================================"
echo ""

# 创建启动脚本
cat > $INSTALL_DIR/scripts/start.sh << 'EOF'
#!/bin/bash
PROJECT_DIR="/workspace/projects"
cd $PROJECT_DIR
pm2 start /opt/lovato/config/ecosystem.config.js --env development
pm2 save
echo "服务已启动"
EOF
chmod +x $INSTALL_DIR/scripts/start.sh

# 创建停止脚本
cat > $INSTALL_DIR/scripts/stop.sh << 'EOF'
#!/bin/bash
pm2 stop lovato-pump-selection
echo "服务已停止"
EOF
chmod +x $INSTALL_DIR/scripts/stop.sh

# 创建重启脚本
cat > $INSTALL_DIR/scripts/restart.sh << 'EOF'
#!/bin/bash
pm2 restart lovato-pump-selection
echo "服务已重启"
EOF
chmod +x $INSTALL_DIR/scripts/restart.sh

# 创建日志查看脚本
cat > $INSTALL_DIR/scripts/logs.sh << 'EOF'
#!/bin/bash
pm2 logs lovato-pump-selection
EOF
chmod +x $INSTALL_DIR/scripts/logs.sh

# 创建 ngrok 启动脚本
cat > $INSTALL_DIR/scripts/ngrok-start.sh << 'EOF'
#!/bin/bash
/opt/lovato/scripts/ngrok-stop.sh 2>/dev/null
ngrok http 5000 > /var/log/lovato/ngrok.log 2>&1 &
echo $! > /var/run/ngrok.pid
echo "ngrok 已启动，查看日志: tail -f /var/log/lovato/ngrok.log"
EOF
chmod +x $INSTALL_DIR/scripts/ngrok-start.sh

# 创建 ngrok 停止脚本
cat > $INSTALL_DIR/scripts/ngrok-stop.sh << 'EOF'
#!/bin/bash
if [ -f /var/run/ngrok.pid ]; then
    kill $(cat /var/run/ngrok.pid) 2>/dev/null
    rm -f /var/run/ngrok.pid
    echo "ngrok 已停止"
else
    echo "ngrok 未运行"
fi
EOF
chmod +x $INSTALL_DIR/scripts/ngrok-stop.sh

# 创建 cloudflared 启动脚本
cat > $INSTALL_DIR/scripts/cloudflared-start.sh << 'EOF'
#!/bin/bash
/opt/lovato/scripts/cloudflared-stop.sh 2>/dev/null
cloudflared tunnel run luowato-pump > /var/log/lovato/cloudflared.log 2>&1 &
echo $! > /var/run/cloudflared.pid
echo "cloudflared 已启动，查看日志: tail -f /var/log/lovato/cloudflared.log"
EOF
chmod +x $INSTALL_DIR/scripts/cloudflared-start.sh

# 创建 cloudflared 停止脚本
cat > $INSTALL_DIR/scripts/cloudflared-stop.sh << 'EOF'
#!/bin/bash
if [ -f /var/run/cloudflared.pid ]; then
    kill $(cat /var/run/cloudflared.pid) 2>/dev/null
    rm -f /var/run/cloudflared.pid
    echo "cloudflared 已停止"
else
    echo "cloudflared 未运行"
fi
EOF
chmod +x $INSTALL_DIR/scripts/cloudflared-stop.sh

# 创建系统服务脚本
cat > /etc/systemd/system/lovato.service << 'EOF'
[Unit]
Description=Lovato Pump Selection Service
After=network.target

[Service]
Type=forking
User=root
WorkingDirectory=/workspace/projects
ExecStart=/usr/local/bin/pm2 start /opt/lovato/config/ecosystem.config.js --env development
ExecStop=/usr/local/bin/pm2 stop lovato-pump-selection
ExecReload=/usr/local/bin/pm2 reload lovato-pump-selection
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✓ 管理脚本创建完成${NC}"

echo ""
echo "========================================"
echo "   8. 配置开机自启"
echo "========================================"
echo ""

# 配置 PM2 开机自启
pm2 startup systemd -u root --hp /root

# 启用服务
systemctl enable lovato.service

echo -e "${GREEN}✓ 开机自启配置完成${NC}"

echo ""
echo "========================================"
echo "   安装完成！"
echo "========================================"
echo ""

echo -e "${GREEN}✓ 服务器环境安装完成！${NC}"
echo ""

echo "========================================"
echo "   下一步操作"
echo "========================================"
echo ""

echo "1. 配置环境变量："
echo "   vim $PROJECT_DIR/.env"
echo ""

echo "2. 配置 ngrok（如果使用）："
echo "   vim $INSTALL_DIR/config/ngrok.yml"
echo "   填入您的 authtoken"
echo ""

echo "3. 配置域名（如果使用 cloudflared）："
echo "   cloudflared tunnel login"
echo "   cloudflared tunnel create luowato-pump"
echo "   cloudflared tunnel route dns luowato-pump your-domain.com"
echo ""

echo "4. 启动服务："
echo "   pm2 start /opt/lovato/config/ecosystem.config.js --env development"
echo "   pm2 save"
echo ""

echo "5. 启动内网穿透（选择一种）："
echo "   方式 1 - ngrok:"
echo "     $INSTALL_DIR/scripts/ngrok-start.sh"
echo ""
echo "   方式 2 - cloudflared:"
echo "     $INSTALL_DIR/scripts/cloudflared-start.sh"
echo ""

echo "6. 获取 SSL 证书（需要域名）："
echo "   certbot --nginx -d your-domain.com"
echo ""

echo "========================================"
echo "   管理命令"
echo "========================================"
echo ""

echo "服务管理："
echo "  启动: $INSTALL_DIR/scripts/start.sh"
echo "  停止: $INSTALL_DIR/scripts/stop.sh"
echo "  重启: $INSTALL_DIR/scripts/restart.sh"
echo "  日志: $INSTALL_DIR/scripts/logs.sh"
echo ""

echo "内网穿透："
echo "  ngrok 启动: $INSTALL_DIR/scripts/ngrok-start.sh"
echo "  ngrok 停止: $INSTALL_DIR/scripts/ngrok-stop.sh"
echo "  cloudflared 启动: $INSTALL_DIR/scripts/cloudflared-start.sh"
echo "  cloudflared 停止: $INSTALL_DIR/scripts/cloudflared-stop.sh"
echo ""

echo "PM2 管理："
echo "  pm2 status"
echo "  pm2 logs"
echo "  pm2 restart all"
echo ""

echo "Nginx 管理："
echo "  systemctl status nginx"
echo "  systemctl restart nginx"
echo "  nginx -t"
echo ""

echo "========================================"
echo "   重要文件位置"
echo "========================================"
echo ""

echo "项目目录: $PROJECT_DIR"
echo "安装目录: $INSTALL_DIR"
echo "配置目录: $INSTALL_DIR/config"
echo "脚本目录: $INSTALL_DIR/scripts"
echo "日志目录: /var/log/lovato"
echo "PM2 配置: $INSTALL_DIR/config/ecosystem.config.js"
echo "Nginx 配置: /etc/nginx/sites-available/lovato-pump"
echo ""

echo "========================================"
