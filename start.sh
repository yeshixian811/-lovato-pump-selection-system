#!/bin/bash
#
# 启动洛瓦托智能水泵选型系统 (Linux/Mac)
#

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "=========================================="
echo "  启动洛瓦托智能水泵选型系统"
echo "=========================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[错误]${NC} Node.js 未安装！"
    echo "请先运行: bash install-local.sh"
    exit 1
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}[错误]${NC} pnpm 未安装！"
    echo "请先运行: bash install-local.sh"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[信息]${NC} 依赖未安装，正在安装..."
    pnpm install
fi

# 检查 .env
if [ ! -f ".env" ]; then
    echo -e "${RED}[错误]${NC} .env 文件不存在！"
    echo "请先运行: bash install-local.sh"
    exit 1
fi

# 检查 PostgreSQL 服务
echo -e "${BLUE}[1/2]${NC} 检查 PostgreSQL 服务..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if ! brew services list | grep postgresql | grep "started" > /dev/null 2>&1; then
        echo -e "${YELLOW}[警告]${NC} PostgreSQL 服务未运行"
        echo "尝试启动服务..."
        brew services start postgresql@14
    fi
else
    # Linux
    if ! sudo service postgresql status | grep "online" > /dev/null 2>&1; then
        echo -e "${YELLOW}[警告]${NC} PostgreSQL 服务未运行"
        echo "尝试启动服务..."
        sudo service postgresql start
    fi
fi

echo -e "${GREEN}[✓]${NC} PostgreSQL 服务运行中"

echo ""
echo -e "${BLUE}[2/2]${NC} 启动开发服务器..."
echo ""
echo "服务器地址: http://localhost:5000"
echo "按 Ctrl+C 停止服务器"
echo ""

pnpm run dev
