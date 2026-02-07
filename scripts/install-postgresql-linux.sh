#!/bin/bash
#
# PostgreSQL 安装脚本 - Linux 环境
# 适用于 Ubuntu/Debian 系统
#

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否以root权限运行
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 sudo 运行此脚本"
        log_info "命令: sudo $0"
        exit 1
    fi
}

# 检查PostgreSQL是否已安装
check_postgresql() {
    if command -v psql &> /dev/null; then
        log_warning "PostgreSQL 已安装"
        psql --version
        read -p "是否重新安装？(y/N): " reinstall
        if [[ ! $reinstall =~ ^[Yy]$ ]]; then
            log_info "跳过安装"
            exit 0
        fi
    fi
}

# 更新系统
update_system() {
    log_info "更新系统包管理器..."
    apt-get update -qq
    log_success "系统更新完成"
}

# 安装 PostgreSQL
install_postgresql() {
    log_info "安装 PostgreSQL 及相关工具..."

    # 设置非交互式安装
    export DEBIAN_FRONTEND=noninteractive

    # 安装 PostgreSQL
    apt-get install -y \
        postgresql \
        postgresql-contrib \
        postgresql-14 \
        postgresql-client-14 \
        libpq-dev

    log_success "PostgreSQL 安装完成"
}

# 启动 PostgreSQL 服务
start_postgresql() {
    log_info "启动 PostgreSQL 服务..."

    # 尝试使用 systemctl (如果可用)
    if command -v systemctl &> /dev/null; then
        systemctl start postgresql
        systemctl enable postgresql
    else
        # 如果 systemctl 不可用，使用 service
        service postgresql start
    fi

    log_success "PostgreSQL 服务已启动"
}

# 配置 PostgreSQL
configure_postgresql() {
    log_info "配置 PostgreSQL..."

    # 设置 postgres 用户密码
    log_info "设置 postgres 用户密码..."
    sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

    # 创建数据库
    log_info "创建 lovato_pump 数据库..."
    sudo -u postgres createdb lovato_pump

    # 创建扩展
    log_info "安装 UUID 扩展..."
    sudo -u postgres psql -d lovato_pump -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

    log_success "PostgreSQL 配置完成"
}

# 显示连接信息
show_connection_info() {
    log_info "数据库连接信息:"
    echo "----------------------------------------"
    echo "  主机: localhost"
    echo "  端口: 5432"
    echo "  数据库: lovato_pump"
    echo "  用户: postgres"
    echo "  密码: postgres"
    echo "----------------------------------------"
    echo ""
    echo "连接字符串:"
    echo "  postgresql://postgres:postgres@localhost:5432/lovato_pump"
    echo ""
}

# 验证安装
verify_installation() {
    log_info "验证 PostgreSQL 安装..."

    # 检查 psql 命令
    if command -v psql &> /dev/null; then
        log_success "psql 命令可用: $(psql --version)"
    else
        log_error "psql 命令不可用"
        exit 1
    fi

    # 检查服务状态
    if command -v systemctl &> /dev/null; then
        systemctl status postgresql --no-pager -l
    fi

    # 测试数据库连接
    log_info "测试数据库连接..."
    if sudo -u postgres psql -d lovato_pump -c "SELECT version();" > /dev/null 2>&1; then
        log_success "数据库连接成功"
    else
        log_error "数据库连接失败"
        exit 1
    fi

    # 显示数据库列表
    log_info "数据库列表:"
    sudo -u postgres psql -l
}

# 更新 .env 文件
update_env_file() {
    log_info "更新 .env 文件..."

    if [ -f ".env" ]; then
        # 备份原文件
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

        # 更新配置
        sed -i 's|^POSTGRES_DATA_DIR=.*|POSTGRES_DATA_DIR=/var/lib/postgresql/14/main|' .env
        sed -i 's|^POSTGRES_BACKUP_DIR=.*|POSTGRES_BACKUP_DIR=/var/lib/postgresql/backups|' .env

        log_success ".env 文件已更新"
    else
        log_warning ".env 文件不存在，跳过"
    fi
}

# 运行数据库迁移
run_migrations() {
    log_info "运行数据库迁移..."

    if [ -f "migrations/001_add_membership_tables.sql" ]; then
        log_info "执行迁移脚本..."
        sudo -u postgres psql -d lovato_pump < migrations/001_add_membership_tables.sql

        if [ $? -eq 0 ]; then
            log_success "数据库迁移完成"
        else
            log_error "数据库迁移失败"
            exit 1
        fi
    else
        log_warning "迁移脚本不存在: migrations/001_add_membership_tables.sql"
        log_info "跳过迁移"
    fi

    # 显示表列表
    log_info "数据库表列表:"
    sudo -u postgres psql -d lovato_pump -c "\dt"
}

# 显示使用说明
show_usage_instructions() {
    echo ""
    echo "=========================================="
    echo "  安装完成！"
    echo "=========================================="
    echo ""
    echo "常用命令:"
    echo ""
    echo "  连接数据库:"
    echo "    sudo -u postgres psql -d lovato_pump"
    echo ""
    echo "  使用 postgres 用户连接:"
    echo "    psql -U postgres -d lovato_pump"
    echo ""
    echo "  重启服务:"
    echo "    sudo service postgresql restart"
    echo ""
    echo "  查看日志:"
    echo "    tail -f /var/log/postgresql/postgresql-14-main.log"
    echo ""
    echo "  备份数据库:"
    echo "    sudo -u postgres pg_dump lovato_pump > backup.sql"
    echo ""
    echo "  恢复数据库:"
    echo "    sudo -u postgres psql -d lovato_pump < backup.sql"
    echo ""
    echo "=========================================="
    echo ""
}

# 主函数
main() {
    echo ""
    echo "=========================================="
    echo "  PostgreSQL 安装脚本"
    echo "  Linux 环境"
    echo "=========================================="
    echo ""

    check_root
    check_postgresql
    update_system
    install_postgresql
    start_postgresql
    configure_postgresql
    verify_installation
    show_connection_info
    update_env_file
    run_migrations
    show_usage_instructions

    log_success "所有步骤完成！"
}

# 运行主函数
main
