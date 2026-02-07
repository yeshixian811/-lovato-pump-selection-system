#!/bin/bash

# cloudflared 停止脚本

echo "========================================"
echo "   停止 Cloudflare Tunnel"
echo "========================================"
echo ""

# 停止 cloudflared
if [ -f /tmp/cloudflared.pid ]; then
    CLOUDFLARED_PID=$(cat /tmp/cloudflared.pid)
    kill $CLOUDFLARED_PID 2>/dev/null
    rm /tmp/cloudflared.pid
    echo "✓ Cloudflare Tunnel 已停止 (PID: $CLOUDFLARED_PID)"
else
    pkill -f cloudflared
    echo "✓ Cloudflare Tunnel 已停止"
fi

echo ""
