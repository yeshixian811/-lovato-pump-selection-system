#!/bin/bash

# 停止服务脚本

echo "========================================"
echo "   洛瓦托水泵选型系统 - 停止服务"
echo "========================================"
echo ""

# 停止服务
echo "🛑 停止服务..."
pm2 stop lovato-pump-selection 2>/dev/null || echo "服务未运行"

echo ""
echo "✓ 服务已停止"
echo ""
