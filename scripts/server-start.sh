#!/bin/bash

# 启动服务脚本

echo "========================================"
echo "   洛瓦托水泵选型系统 - 启动服务"
echo "========================================"
echo ""

cd /workspace/projects

# 检查环境变量
if [ ! -f .env ]; then
    echo "⚠️  警告：.env 文件不存在，使用默认配置"
fi

# 停止现有服务
echo "🛑 停止现有服务..."
pm2 stop lovato-pump-selection 2>/dev/null || true
pm2 delete lovato-pump-selection 2>/dev/null || true

# 启动服务
echo "🚀 启动服务..."
pm2 start ecosystem.config.js --env development

# 保存配置
pm2 save

echo ""
echo "✓ 服务已启动"
echo ""
echo "查看状态: pm2 status"
echo "查看日志: pm2 logs lovato-pump-selection"
echo ""
