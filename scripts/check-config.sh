#!/bin/bash

# ============================================
# 配置检查脚本
# ============================================

echo "=========================================="
echo "洛瓦托水泵选型系统 - 配置检查"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_passed=0
check_failed=0

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((check_passed++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((check_failed++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ============================================
# 1. 检查必需文件
# ============================================
echo "检查必需文件..."

files=(
    "package.json"
    "Dockerfile"
    "docker-compose.yml"
    ".env"
    ".env.production"
    "nginx/nginx.conf"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$file 存在"
    else
        check_fail "$file 不存在"
    fi
done

echo ""

# ============================================
# 2. 检查环境变量
# ============================================
echo "检查环境变量..."

if [ -f ".env.production" ]; then
    source .env.production

    if [ -n "$DATABASE_URL" ]; then
        check_pass "DATABASE_URL 已配置"
    else
        check_fail "DATABASE_URL 未配置"
    fi

    if [ -n "$JWT_SECRET" ]; then
        check_pass "JWT_SECRET 已配置"
    else
        check_fail "JWT_SECRET 未配置"
    fi

    if [ -n "$NEXT_PUBLIC_APP_URL" ]; then
        check_pass "NEXT_PUBLIC_APP_URL 已配置: $NEXT_PUBLIC_APP_URL"
    else
        check_fail "NEXT_PUBLIC_APP_URL 未配置"
    fi
else
    check_fail ".env.production 文件不存在"
fi

echo ""

# ============================================
# 3. 检查 Docker
# ============================================
echo "检查 Docker 环境..."

if command -v docker &> /dev/null; then
    check_pass "Docker 已安装: $(docker --version)"
else
    check_fail "Docker 未安装"
fi

if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    check_pass "Docker Compose 已安装"
else
    check_fail "Docker Compose 未安装"
fi

if docker ps &> /dev/null; then
    check_pass "Docker 服务运行正常"
else
    check_fail "Docker 服务未运行"
fi

echo ""

# ============================================
# 4. 检查端口占用
# ============================================
echo "检查端口占用..."

ports=(80 443 5000)

for port in "${ports[@]}"; do
    if sudo netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        check_warn "端口 $port 已被占用: $(sudo netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}')"
    else
        check_pass "端口 $port 可用"
    fi
done

echo ""

# ============================================
# 5. 检查数据库配置
# ============================================
echo "检查数据库配置..."

DB_HOST="122.51.22.101"
DB_PORT=5433

if command -v nc &> /dev/null; then
    if nc -z -w5 ${DB_HOST} ${DB_PORT} 2>/dev/null; then
        check_pass "数据库端口 ${DB_PORT} 可访问"
    else
        check_fail "数据库端口 ${DB_PORT} 无法访问"
    fi
else
    check_warn "nc 命令不可用，跳过端口检查"
fi

echo ""

# ============================================
# 6. 检查防火墙
# ============================================
echo "检查防火墙..."

if command -v ufw &> /dev/null; then
    ufw_status=$(sudo ufw status 2>/dev/null | head -1)
    check_pass "ufw 状态: $ufw_status"

    if sudo ufw status | grep -q "80/tcp"; then
        check_pass "防火墙已开放 80 端口"
    else
        check_warn "防火墙未开放 80 端口"
    fi

    if sudo ufw status | grep -q "443/tcp"; then
        check_pass "防火墙已开放 443 端口"
    else
        check_warn "防火墙未开放 443 端口"
    fi
else
    check_warn "ufw 未安装"
fi

echo ""

# ============================================
# 7. 检查磁盘空间
# ============================================
echo "检查磁盘空间..."

disk_usage=$(df -h /opt | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $disk_usage -lt 80 ]; then
    check_pass "磁盘使用率: ${disk_usage}%"
else
    check_warn "磁盘使用率: ${disk_usage}% (建议清理)"
fi

echo ""

# ============================================
# 8. 检查内存
# ============================================
echo "检查内存..."

memory_usage=$(free | grep Mem | awk '{printf("%.1f", ($3/$2) * 100.0)}')
if (( $(echo "$memory_usage < 80" | bc -l) )); then
    check_pass "内存使用率: ${memory_usage}%"
else
    check_warn "内存使用率: ${memory_usage}%"
fi

echo ""

# ============================================
# 汇总
# ============================================
echo "=========================================="
echo "检查完成"
echo "=========================================="
echo -e "${GREEN}通过: $check_passed${NC}"
echo -e "${RED}失败: $check_failed${NC}"
echo ""

if [ $check_failed -eq 0 ]; then
    echo -e "${GREEN}✅ 所有检查通过，可以开始部署！${NC}"
    echo ""
    echo "执行部署命令："
    echo "  bash scripts/deploy-tencent-cloud.sh"
    exit 0
else
    echo -e "${RED}❌ 有 $check_failed 项检查失败，请修复后重试${NC}"
    exit 1
fi
