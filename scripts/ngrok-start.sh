#!/bin/bash

# ngrok 启动脚本

echo "========================================"
echo "   启动 ngrok 隧道"
echo "========================================"
echo ""

# 停止现有 ngrok
pkill -f ngrok 2>/dev/null || true
sleep 2

# 启动 ngrok
echo "🚀 启动 ngrok 隧道..."
nohup ngrok http 5000 > /app/work/logs/bypass/ngrok.log 2>&1 &
NGROK_PID=$!

# 保存 PID
echo $NGROK_PID > /tmp/ngrok.pid

echo ""
echo "✓ ngrok 已启动 (PID: $NGROK_PID)"
echo ""
echo "查看日志: tail -f /app/work/logs/bypass/ngrok.log"
echo "查看界面: http://localhost:4040"
echo ""
echo "等待 5 秒后显示 URL..."
sleep 5

# 尝试获取 URL
curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok[^"]*' | head -1
echo ""
