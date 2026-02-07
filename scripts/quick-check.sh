#!/bin/bash
#
# 快速环境检查和修复脚本
#

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "=========================================="
echo "  环境快速检查和修复"
echo "=========================================="
echo ""

# 1. 检查 Node.js
echo -n "检查 Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗${NC} 未安装"
fi

# 2. 检查 pnpm
echo -n "检查 pnpm... "
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✓${NC} $PNPM_VERSION"
else
    echo -e "${RED}✗${NC} 未安装"
fi

# 3. 检查 PostgreSQL
echo -n "检查 PostgreSQL... "
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    echo -e "${GREEN}✓${NC} $PG_VERSION"
else
    echo -e "${RED}✗${NC} 未安装"
fi

# 4. 检查数据库连接
echo -n "检查数据库连接... "
if sudo -u postgres psql -d lovato_pump -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 可连接"
else
    echo -e "${YELLOW}⚠${NC} 不可连接"
fi

# 5. 检查 Web 服务
echo -n "检查 Web 服务 (5000端口)... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 | grep -q "200"; then
    echo -e "${GREEN}✓${NC} 运行中"
else
    echo -e "${RED}✗${NC} 未运行"
fi

# 6. 检查磁盘空间
echo -n "检查磁盘空间... "
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
if [ $DISK_USAGE -lt 90 ]; then
    echo -e "${GREEN}✓${NC} 已使用 ${DISK_USAGE}%"
else
    echo -e "${YELLOW}⚠${NC} 已使用 ${DISK_USAGE}% (空间紧张)"
fi

# 7. 检查内存
echo -n "检查内存... "
MEM_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3/$2*100}')
if [ $MEM_USAGE -lt 80 ]; then
    echo -e "${GREEN}✓${NC} 已使用 ${MEM_USAGE}%"
else
    echo -e "${YELLOW}⚠${NC} 已使用 ${MEM_USAGE}% (内存紧张)"
fi

echo ""
echo "=========================================="
echo "  建议操作"
echo "=========================================="
echo ""

# 根据检查结果给出建议
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}[需要]${NC} 安装 PostgreSQL"
    echo "  运行: sudo bash scripts/install-postgresql-linux.sh"
    echo ""
fi

if ! sudo -u postgres psql -d lovato_pump -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${YELLOW}[需要]${NC} 配置数据库"
    echo "  运行: sudo -u postgres createdb lovato_pump"
    echo ""
fi

if [ -f ".env" ] && grep -q "J:/" .env; then
    echo -e "${YELLOW}[建议]${NC} 更新 .env 配置"
    echo "  当前配置使用 Windows 路径 (J:/)"
    echo "  建议更新为 Linux 路径"
    echo ""
fi

echo -e "${GREEN}[可选]${NC} 运行数据库迁移"
echo "  运行: sudo -u postgres psql -d lovato_pump < migrations/001_add_membership_tables.sql"
echo ""

echo "=========================================="
echo "  快速修复命令"
echo "=========================================="
echo ""

# 提供一键修复命令
echo "如果 PostgreSQL 未安装，运行:"
echo ""
echo "  sudo bash scripts/install-postgresql-linux.sh"
echo ""

echo "如果 PostgreSQL 已安装但数据库不存在:"
echo ""
echo "  sudo -u postgres createdb lovato_pump"
echo "  sudo -u postgres psql -d lovato_pump < migrations/001_add_membership_tables.sql"
echo ""

echo "查看完整报告:"
echo ""
echo "  cat SYSTEM_ENVIRONMENT_CHECK_REPORT.md"
echo ""

echo "=========================================="
echo ""
