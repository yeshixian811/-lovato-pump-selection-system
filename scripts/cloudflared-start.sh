#!/bin/bash

# cloudflared 启动脚本

echo "========================================"
echo "   启动 Cloudflare Tunnel"
echo "========================================"
echo ""

# 检查是否已安装
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared 未安装"
    echo "请运行: wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
    echo "然后: chmod +x cloudflared"
    echo "然后: sudo mv cloudflared /usr/local/bin/"
    exit 1
fi

# 检查是否已登录
if [ ! -f ~/.cloudflared/cert.pem ]; then
    echo "⚠️  未登录 cloudflared"
    echo "请先运行: cloudflared tunnel login"
    exit 1
fi

# 检查是否已创建隧道
if [ ! -f ~/.cloudflared/config.yml ]; then
    echo "⚠️  未创建隧道"
    echo "请先运行:"
    echo "  cloudflared tunnel create luowato-pump"
    echo "  cloudflared tunnel route dns luowato-pump your-domain.com"
    exit 1
fi

# 停止现有 tunnel
pkill -f cloudflared 2>/dev/null || true
sleep 2

# 启动 tunnel
echo "🚀 启动 Cloudflare Tunnel..."
nohup cloudflared tunnel run luowato-pump > /app/work/logs/bypass/cloudflared.log 2>&1 &
CLOUDFLARED_PID=$!

# 保存 PID
echo $CLOUDFLARED_PID > /tmp/cloudflared.pid

echo ""
echo "✓ Cloudflare Tunnel 已启动 (PID: $CLOUDFLARED_PID)"
echo ""
echo "查看日志: tail -f /app/work/logs/bypass/cloudflared.log"
echo ""
