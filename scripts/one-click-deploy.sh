#!/bin/bash

# ============================================
# 洛瓦托水泵选型系统 - 一键部署脚本
# ============================================
# 服务器：122.51.22.101
# 数据库：122.51.22.101:5433
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 日志函数
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }
log_success() { echo -e "${CYAN}[SUCCESS]${NC} $1"; }

# 配置变量
APP_NAME="lovato-pump"
APP_DIR="/opt/lovato-pump"
DEPLOY_FILE="lovato-pump-deploy.tar.gz"
REMOTE_HOST="122.51.22.101"
REMOTE_USER="root"

# 欢迎信息
echo ""
echo "=========================================="
log_info "洛瓦托水泵选型系统 - 一键部署"
echo "=========================================="
echo ""
log_info "目标服务器: ${REMOTE_HOST}"
log_info "应用目录: ${APP_DIR}"
echo ""

# ============================================
# 步骤 1: 检查部署文件
# ============================================
log_step "步骤 1: 检查部署文件..."

if [ ! -f "${DEPLOY_FILE}" ]; then
    log_error "部署文件不存在: ${DEPLOY_FILE}"
    log_error "请先下载部署文件到当前目录"
    exit 1
fi

log_success "部署文件检查通过"
log_info "文件大小: $(du -h ${DEPLOY_FILE} | cut -f1)"

echo ""

# ============================================
# 步骤 2: 上传文件到服务器
# ============================================
log_step "步骤 2: 上传文件到服务器..."

if ! command -v scp &> /dev/null; then
    log_error "scp 命令不可用"
    log_error "请先安装 openssh-client"
    exit 1
fi

log_info "上传文件到服务器..."
scp "${DEPLOY_FILE}" ${REMOTE_USER}@${REMOTE_HOST}:/tmp/

if [ $? -eq 0 ]; then
    log_success "文件上传成功"
else
    log_error "文件上传失败"
    log_error "请检查:"
    log_error "1. 服务器地址是否正确: ${REMOTE_HOST}"
    log_error "2. SSH 连接是否正常"
    log_error "3. 是否有上传权限"
    exit 1
fi

echo ""

# ============================================
# 步骤 3: 在服务器上执行部署
# ============================================
log_step "步骤 3: 在服务器上执行部署..."

log_info "创建远程部署脚本..."
cat > /tmp/remote-deploy.sh << 'REMOTE_SCRIPT'
#!/bin/bash

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

APP_DIR="/opt/lovato-pump"
DEPLOY_FILE="/tmp/lovato-pump-deploy.tar.gz"

echo ""
echo "=========================================="
log_info "服务器端部署开始"
echo "=========================================="
echo ""

# 1. 创建备份
log_info "创建备份..."
if [ -d "${APP_DIR}" ]; then
    BACKUP_DIR="/opt/backup-$(date +%Y%m%d-%H%M%S)"
    cp -r ${APP_DIR} ${BACKUP_DIR}
    log_info "备份已创建: ${BACKUP_DIR}"
fi

# 2. 清理旧文件
log_info "清理旧文件..."
rm -rf ${APP_DIR}
mkdir -p ${APP_DIR}

# 3. 解压部署文件
log_info "解压部署文件..."
cd ${APP_DIR}
tar -xzf ${DEPLOY_FILE}
mv projects/* .
rm -rf projects
log_success "文件解压完成"

# 4. 执行自动部署
log_info "执行自动部署脚本..."
if [ -f "scripts/deploy-tencent-cloud.sh" ]; then
    bash scripts/deploy-tencent-cloud.sh
else
    log_error "部署脚本不存在"
    exit 1
fi

# 5. 验证部署
log_info "验证部署..."
sleep 5

if curl -s http://localhost:5000/api/health > /dev/null; then
    log_success "部署验证成功"
else
    log_warn "应用可能还在启动中，请稍后访问"
fi

echo ""
echo "=========================================="
log_success "服务器端部署完成"
echo "=========================================="
echo ""

REMOTE_SCRIPT

chmod +x /tmp/remote-deploy.sh

# 上传并执行远程脚本
scp /tmp/remote-deploy.sh ${REMOTE_USER}@${REMOTE_HOST}:/tmp/
ssh ${REMOTE_USER}@${REMOTE_HOST} "bash /tmp/remote-deploy.sh"

echo ""

# ============================================
# 步骤 4: 验证部署
# ============================================
log_step "步骤 4: 验证部署..."

log_info "等待应用启动..."
sleep 10

# 测试健康检查接口
if curl -s http://${REMOTE_HOST}:5000/api/health > /dev/null; then
    log_success "应用健康检查通过"
else
    log_warn "应用健康检查失败"
    log_warn "应用可能还在启动中，请稍后手动测试"
fi

echo ""

# ============================================
# 部署完成
# ============================================
echo "=========================================="
log_success "部署完成！"
echo "=========================================="
echo ""
log_info "🌐 应用访问地址:"
echo "   http://122.51.22.101"
echo ""
log_info "📊 管理面板地址:"
echo "   http://122.51.22.101/admin"
echo ""
log_info "🔧 管理命令:"
echo "   SSH 登录: ssh root@122.51.22.101"
echo "   查看日志: ssh root@122.51.22.101 'docker logs -f lovato-pump-app'"
echo "   重启应用: ssh root@122.51.22.101 'cd /opt/lovato-pump && docker-compose restart'"
echo ""
log_info "📝 验证命令:"
echo "   健康检查: curl http://122.51.22.101/api/health"
echo "   查看首页: curl http://122.51.22.101"
echo ""
log_warn "⚠️  首次访问可能需要等待 1-2 分钟"
log_warn "⚠️  如果无法访问，请检查防火墙配置"
echo ""
