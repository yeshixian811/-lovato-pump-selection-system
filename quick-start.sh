#!/bin/bash

# 洛瓦托水泵选型系统 - 快速启动脚本

echo "========================================"
echo "   洛瓦托水泵选型系统 - 快速启动"
echo "========================================"
echo ""

# 检查项目状态
echo "📊 检查项目状态..."

# 检查 5000 端口是否被占用
PORT_STATUS=$(ss -lptn 'sport = :5000' 2>/dev/null)

if [ -n "$PORT_STATUS" ]; then
    echo "✅ 服务已在 5000 端口运行"
    echo ""
    echo "📍 访问地址："
    echo "   - 本地: http://localhost:5000"
    echo "   - 网络: http://$(hostname -I | awk '{print $1}'):5000"
    echo ""
    echo "💡 如需重启服务，请先执行：pkill -f 'next-server'"
else
    echo "⚠️  服务未运行，正在启动..."
    echo ""
    
    # 检查依赖是否安装
    if [ ! -d "node_modules" ]; then
        echo "📦 正在安装依赖..."
        pnpm install
    fi
    
    # 启动服务
    echo "🚀 启动开发服务器..."
    nohup coze dev > /app/work/logs/bypass/dev.log 2>&1 &
    
    # 等待服务启动
    echo "⏳ 等待服务启动..."
    for i in {1..30}; do
        if ss -lptn 'sport = :5000' > /dev/null 2>&1; then
            echo ""
            echo "✅ 服务启动成功！"
            echo ""
            echo "📍 访问地址："
            echo "   - 本地: http://localhost:5000"
            echo "   - 网络: http://$(hostname -I | awk '{print $1}'):5000"
            echo ""
            break
        fi
        sleep 1
        echo -n "."
    done
fi

echo ""
echo "========================================"
echo "   部署选项"
echo "========================================"
echo ""
echo "1. 使用 ngrok 创建 HTTPS 隧道（推荐用于开发测试）"
echo "   命令: ngrok http 5000"
echo ""
echo "2. 部署到 Vercel（推荐用于生产环境）"
echo "   命令: vercel"
echo ""
echo "3. 查看服务日志"
echo "   命令: tail -f /app/work/logs/bypass/dev.log"
echo ""
echo "4. 停止服务"
echo "   命令: pkill -f 'next-server'"
echo ""
echo "5. 重启服务"
echo "   命令: pkill -f 'next-server' && coze dev > /app/work/logs/bypass/dev.log 2>&1 &"
echo ""
echo "========================================"
echo "   详细文档"
echo "========================================"
echo ""
echo "📖 查看完整部署指南："
echo "   cat DEPLOYMENT.md"
echo ""
echo "📱 查看小程序配置："
echo "   cat wechat-miniprogram/README.md"
echo ""
echo "========================================"
