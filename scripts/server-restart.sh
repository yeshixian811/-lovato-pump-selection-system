#!/bin/bash

# 重启服务脚本

echo "========================================"
echo "   洛瓦托水泵选型系统 - 重启服务"
echo "========================================"
echo ""

# 重启服务
echo "🔄 重启服务..."
pm2 restart lovato-pump-selection

echo ""
echo "✓ 服务已重启"
echo ""
echo "查看状态: pm2 status"
echo "查看日志: pm2 logs lovato-pump-selection"
echo ""
