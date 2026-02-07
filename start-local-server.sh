#!/bin/bash

# 洛瓦托水泵选型系统 - 本地服务器启动脚本

echo "========================================"
echo "   洛瓦托水泵选型系统 - 本地服务器"
echo "========================================"
echo ""

# 获取机器信息
LOCAL_IP=$(hostname -I | awk '{print $1}')
PORT="5000"

echo "📍 服务器信息："
echo "   内网IP: $LOCAL_IP"
echo "   端口: $PORT"
echo ""

# 检查服务状态
if ss -lptn "sport = :$PORT" > /dev/null 2>&1; then
    echo "✅ 服务已在运行"
    echo ""
    echo "🌐 访问地址："
    echo "   - 本地: http://localhost:$PORT"
    echo "   - 内网: http://$LOCAL_IP:$PORT"
    echo ""
    echo "💡 如需重启服务，请先执行：pkill -f 'next'"
else
    echo "⚠️  服务未运行，正在启动..."
    echo ""

    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo "📦 正在安装依赖..."
        /usr/bin/pnpm install --prefer-frozen-lockfile --prefer-offline
    fi

    # 启动服务
    echo "🚀 启动开发服务器..."
    cd /workspace/projects
    nohup /workspace/projects/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/bin/next dev -p $PORT --webpack > /app/work/logs/bypass/dev.log 2>&1 &

    # 等待服务启动
    echo "⏳ 等待服务启动..."
    for i in {1..30}; do
        if ss -lptn "sport = :$PORT" > /dev/null 2>&1; then
            echo ""
            echo "✅ 服务启动成功！"
            echo ""
            echo "🌐 访问地址："
            echo "   - 本地: http://localhost:$PORT"
            echo "   - 内网: http://$LOCAL_IP:$PORT"
            echo ""
            break
        fi
        sleep 1
        echo -n "."
    done
fi

echo "========================================"
echo "   微信小程序 HTTPS 隧道配置"
echo "========================================"
echo ""
echo "选项 1: 使用 ngrok（快速测试）"
echo "   # 1. 下载 ngrok"
echo "   # 2. 启动隧道"
echo "   ngrok http $PORT"
echo "   # 3. 复制 HTTPS URL"
echo "   # 4. 配置小程序使用该 URL"
echo ""
echo "选项 2: 使用 Cloudflare Tunnel（免费）"
echo "   # 1. 安装 cloudflared"
echo "   # 2. 创建隧道"
echo "   cloudflared tunnel create luowato-pump"
echo "   # 3. 配置 DNS"
echo "   cloudflared tunnel route dns luowato-pump luowato.yourdomain.com"
echo "   # 4. 启动隧道"
echo "   cloudflared tunnel run luowato-pump"
echo ""
echo "选项 3: 使用 frp（生产环境）"
echo "   # 1. 在公网服务器配置 frps"
echo "   # 2. 在本地配置 frpc"
echo "   # 3. 启动 frp 客户端"
echo "   frpc -c frpc.toml"
echo ""
echo "========================================"
echo "   服务管理"
echo "========================================"
echo ""
echo "查看日志:"
echo "   tail -f /app/work/logs/bypass/dev.log"
echo ""
echo "停止服务:"
echo "   pkill -f 'next'"
echo ""
echo "重启服务:"
echo "   pkill -f 'next' && nohup /workspace/projects/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/bin/next dev -p $PORT --webpack > /app/work/logs/bypass/dev.log 2>&1 &"
echo ""
echo "========================================"
echo "   详细文档"
echo "========================================"
echo ""
echo "📖 查看完整配置指南："
echo "   cat LOCAL_SERVER.md"
echo ""
echo "📱 查看小程序配置："
echo "   cat wechat-miniprogram/README.md"
echo ""
echo "========================================"
