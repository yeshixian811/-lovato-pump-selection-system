#!/bin/bash

# ngrok 停止脚本

echo "========================================"
echo "   停止 ngrok 隧道"
echo "========================================"
echo ""

# 停止 ngrok
if [ -f /tmp/ngrok.pid ]; then
    NGROK_PID=$(cat /tmp/ngrok.pid)
    kill $NGROK_PID 2>/dev/null
    rm /tmp/ngrok.pid
    echo "✓ ngrok 已停止 (PID: $NGROK_PID)"
else
    pkill -f ngrok
    echo "✓ ngrok 已停止"
fi

echo ""
