#!/bin/bash

# ============================================
# 洛瓦托水泵选型系统 - 腾讯云自动部署脚本
# ============================================
# 适配腾讯云轻量服务器 + 腾讯云轻量数据库
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# 配置变量
APP_NAME="lovato-pump"
APP_DIR="/opt/lovato-pump"
DOCKER_IMAGE="${APP_NAME}:latest"
CONTAINER_NAME="${APP_NAME}-app"

# 腾讯云轻量数据库配置
DB_HOST="122.51.22.101"
DB_PORT=5433
DB_USER="admin"
DB_PASSWORD="Tencent@123"
DB_NAME="mydb"

# 打印欢迎信息
echo "=========================================="
log_info "洛瓦托水泵选型系统 - 腾讯云部署"
echo "=========================================="
echo ""
log_info "服务器: 腾讯云轻量服务器"
log_info "数据库: 腾讯云轻量数据库 PostgreSQL"
log_info "数据库地址: ${DB_HOST}:${DB_PORT}"
echo ""

# ============================================
# 步骤 1: 检查系统环境
# ============================================
log_step "步骤 1: 检查系统环境..."

# 检查操作系统
if [[ ! -f /etc/os-release ]]; then
    log_error "无法检测操作系统"
    exit 1
fi

source /etc/os-release
log_info "操作系统: ${PRETTY_NAME}"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    log_warn "Docker 未安装，开始安装..."
    curl -fsSL https://get.docker.com | sh
    sudo systemctl start docker
    sudo systemctl enable docker
    log_info "✅ Docker 安装完成"
else
    log_info "✅ Docker 已安装: $(docker --version)"
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_warn "Docker Compose 未安装，开始安装..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log_info "✅ Docker Compose 安装完成"
else
    log_info "✅ Docker Compose 已安装"
fi

# 配置 Docker 镜像加速
log_info "配置 Docker 镜像加速..."
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
  "registry-mirrors": ["https://mirror.ccs.tencentyun.com"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
log_info "✅ Docker 配置已更新"

echo ""

# ============================================
# 步骤 2: 检查项目文件
# ============================================
log_step "步骤 2: 检查项目文件..."

if [ -d "${APP_DIR}" ]; then
    log_info "项目目录已存在: ${APP_DIR}"
else
    log_warn "项目目录不存在: ${APP_DIR}"
    log_info "请先上传项目文件到 ${APP_DIR}"
    exit 1
fi

cd "${APP_DIR}"

# 检查必要文件
if [ ! -f "package.json" ]; then
    log_error "package.json 不存在"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    log_error "Dockerfile 不存在"
    exit 1
fi

log_info "✅ 项目文件检查通过"

echo ""

# ============================================
# 步骤 3: 测试数据库连接
# ============================================
log_step "步骤 3: 测试腾讯云轻量数据库连接..."

log_info "数据库配置:"
log_info "  地址: ${DB_HOST}:${DB_PORT}"
log_info "  用户: ${DB_USER}"
log_info "  数据库: ${DB_NAME}"

# 使用 nc 检查端口
if command -v nc &> /dev/null; then
    if nc -z -w5 ${DB_HOST} ${DB_PORT} 2>/dev/null; then
        log_info "✅ 数据库端口可访问"
    else
        log_error "❌ 无法连接到数据库端口 ${DB_PORT}"
        log_warn "请检查:"
        log_warn "  1. 数据库是否已启动"
        log_warn "  2. 防火墙是否开放 ${DB_PORT} 端口"
        log_warn "  3. 数据库白名单配置"
        exit 1
    fi
fi

# 使用 psql 测试连接（如果已安装）
if command -v psql &> /dev/null; then
    log_info "使用 psql 测试连接..."
    if PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -c "SELECT 1;" > /dev/null 2>&1; then
        log_info "✅ 数据库连接测试成功"
    else
        log_warn "psql 连接测试失败（可能是网络原因），继续部署..."
    fi
else
    log_warn "psql 未安装，跳过连接测试"
fi

echo ""

# ============================================
# 步骤 4: 构建镜像
# ============================================
log_step "步骤 4: 构建 Docker 镜像..."

# 停止并删除旧容器
log_info "清理旧容器和镜像..."
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true
docker rmi ${DOCKER_IMAGE} 2>/dev/null || true

# 构建镜像
log_info "开始构建镜像..."
log_warn "这可能需要 8-12 分钟，请耐心等待..."

BUILD_LOG="/tmp/${APP_NAME}-build.log"

if docker build -t ${DOCKER_IMAGE} . 2>&1 | tee ${BUILD_LOG}; then
    log_info "✅ 镜像构建成功"
else
    log_error "❌ 镜像构建失败"
    log_error "查看构建日志: tail -n 100 ${BUILD_LOG}"
    exit 1
fi

# 显示镜像信息
log_info "镜像信息:"
docker images ${DOCKER_IMAGE}

echo ""

# ============================================
# 步骤 5: 启动应用
# ============================================
log_step "步骤 5: 启动应用容器..."

# 检查 docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    log_info "使用 docker-compose 启动..."

    # 启动服务
    docker-compose up -d

    # 等待容器启动
    log_info "等待容器启动..."
    sleep 15

    # 检查容器状态
    if docker ps | grep -q "${CONTAINER_NAME}"; then
        log_info "✅ 容器启动成功"
    else
        log_error "❌ 容器启动失败"
        docker logs ${CONTAINER_NAME}
        exit 1
    fi
else
    log_info "使用 docker run 启动..."

    # 创建必要的目录
    mkdir -p ${APP_DIR}/public/uploads

    # 运行容器
    docker run -d \
        --name ${CONTAINER_NAME} \
        --restart unless-stopped \
        -p 5000:3000 \
        -e NODE_ENV=production \
        -e DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" \
        -e JWT_SECRET=lovato-jwt-secret-key-production-2024-secure \
        -e NEXT_PUBLIC_APP_URL="http://122.51.22.101" \
        -v ${APP_DIR}/public/uploads:/app/public/uploads \
        ${DOCKER_IMAGE}

    # 等待容器启动
    log_info "等待容器启动..."
    sleep 15

    # 检查容器状态
    if docker ps | grep -q "${CONTAINER_NAME}"; then
        log_info "✅ 容器启动成功"
    else
        log_error "❌ 容器启动失败"
        docker logs ${CONTAINER_NAME}
        exit 1
    fi
fi

echo ""

# ============================================
# 步骤 6: 配置防火墙
# ============================================
log_step "步骤 6: 配置防火墙..."

if command -v ufw &> /dev/null; then
    log_info "使用 ufw 配置防火墙..."
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    log_info "✅ 防火墙规则已添加"
elif command -v firewall-cmd &> /dev/null; then
    log_info "使用 firewalld 配置防火墙..."
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    log_info "✅ 防火墙规则已添加"
else
    log_warn "未找到防火墙工具，请在腾讯云控制台配置防火墙"
    log_warn "需要开放端口: 80, 443"
fi

echo ""

# ============================================
# 步骤 7: 健康检查
# ============================================
log_step "步骤 7: 执行健康检查..."

# 等待应用完全启动
log_info "等待应用完全启动..."
sleep 10

# 检查容器状态
log_info "容器状态:"
docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""

# 检查应用日志
log_info "应用日志（最新 30 行）:"
docker logs --tail 30 ${CONTAINER_NAME}

echo ""

# 测试应用接口
log_info "测试应用接口..."

# 测试健康检查
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    log_info "✅ 健康检查通过"
else
    log_warn "健康检查失败（应用可能还在启动中）"
fi

# 测试首页
if curl -s http://localhost:5000/ > /dev/null 2>&1; then
    log_info "✅ 首页访问正常"
else
    log_warn "首页访问失败"
fi

echo ""

# ============================================
# 步骤 8: 显示部署信息
# ============================================
log_step "步骤 8: 显示部署信息..."

echo "=========================================="
log_info "部署完成！"
echo "=========================================="
echo ""
log_info "🌐 应用访问地址:"
echo "   http://122.51.22.101"
echo ""
log_info "📊 主要 API 接口:"
echo "   - GET  /api/pumps              - 获取水泵列表"
echo "   - POST /api/pumps              - 创建水泵"
echo "   - POST /api/pump/match         - 智能选型"
echo "   - POST /api/upload             - 文件上传"
echo "   - GET  /api/website/products   - 网站产品展示"
echo ""
log_info "🗄️  数据库配置:"
echo "   地址: ${DB_HOST}:${DB_PORT}"
echo "   用户: ${DB_USER}"
echo "   数据库: ${DB_NAME}"
echo ""
log_info "📊 管理命令:"
echo "   查看应用日志:     docker logs -f ${CONTAINER_NAME}"
echo "   重启应用:         cd ${APP_DIR} && docker-compose restart"
echo "   查看容器状态:     cd ${APP_DIR} && docker-compose ps"
echo "   查看应用日志:     docker logs -f ${CONTAINER_NAME}"
echo "   查看 Nginx 日志:  sudo tail -f /var/log/nginx/lovato-pump-error.log"
echo ""
log_info "🔧 故障排查:"
echo "   如果无法访问应用，请检查:"
echo "   1. 容器是否运行: docker ps"
echo "   2. 应用日志: docker logs ${CONTAINER_NAME}"
echo "   3. 数据库连接: 检查防火墙和白名单"
echo "   4. 防火墙规则: sudo ufw status"
echo ""
log_warn "⚠️  重要提示:"
echo "   1. 请在腾讯云控制台配置防火墙，开放 80/443 端口"
echo "   2. 确保数据库白名单包含服务器 IP"
echo "   3. 生产环境请修改 JWT_SECRET 和 ENCRYPTION_KEY"
echo ""

# 保存部署日志
DEPLOY_LOG="/tmp/${APP_NAME}-deploy-$(date +%Y%m%d-%H%M%S).log"
{
    echo "部署时间: $(date)"
    echo "应用名称: ${APP_NAME}"
    echo "容器名称: ${CONTAINER_NAME}"
    echo "镜像名称: ${DOCKER_IMAGE}"
    echo ""
    echo "容器状态:"
    docker ps --filter "name=${CONTAINER_NAME}"
    echo ""
    echo "应用日志（最新 50 行）:"
    docker logs --tail 50 ${CONTAINER_NAME}
} > ${DEPLOY_LOG}

log_info "部署日志已保存: ${DEPLOY_LOG}"

echo ""
log_info "🎉 部署成功！请访问 http://122.51.22.101"
