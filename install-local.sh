#!/bin/bash
#
# 洛瓦托智能水泵选型系统 - 本地环境自动安装 (Linux/Mac)
#

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

log_step() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

# 检查操作系统
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO=$ID
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        log_error "不支持的操作系统: $OSTYPE"
        exit 1
    fi
}

# 检查命令是否存在
command_exists() {
    command -v "$1" &> /dev/null
}

# 检查 sudo 权限
check_sudo() {
    if [ "$EUID" -ne 0 ]; then
        log_warning "某些操作需要 sudo 权限"
        SUDO="sudo"
    else
        SUDO=""
    fi
}

# 安装 Node.js
install_nodejs() {
    log_step "安装 Node.js"

    if command_exists node; then
        NODE_VERSION=$(node --version)
        log_info "Node.js 已安装: $NODE_VERSION"
        return 0
    fi

    log_info "安装 Node.js..."

    if [ "$OS" == "macos" ]; then
        if ! command_exists brew; then
            log_info "安装 Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi

        brew install node
    else
        # Linux
        if [ "$DISTRO" == "ubuntu" ] || [ "$DISTRO" == "debian" ]; then
            curl -fsSL https://deb.nodesource.com/setup_24.x | $SUDO -E bash -
            $SUDO apt-get install -y nodejs
        elif [ "$DISTRO" == "centos" ] || [ "$DISTRO" == "rhel" ]; then
            $SUDO yum install -y nodejs
        else
            log_error "不支持的 Linux 发行版: $DISTRO"
            exit 1
        fi
    fi

    if command_exists node; then
        log_success "Node.js 安装成功: $(node --version)"
    else
        log_error "Node.js 安装失败"
        exit 1
    fi
}

# 安装 pnpm
install_pnpm() {
    log_step "安装 pnpm"

    if command_exists pnpm; then
        PNPM_VERSION=$(pnpm --version)
        log_info "pnpm 已安装: $PNPM_VERSION"
        return 0
    fi

    log_info "安装 pnpm..."
    npm install -g pnpm

    if command_exists pnpm; then
        log_success "pnpm 安装成功: $(pnpm --version)"
    else
        log_error "pnpm 安装失败"
        exit 1
    fi
}

# 安装 PostgreSQL
install_postgresql() {
    log_step "安装 PostgreSQL"

    if command_exists psql; then
        PG_VERSION=$(psql --version)
        log_info "PostgreSQL 已安装: $PG_VERSION"
        return 0
    fi

    log_info "安装 PostgreSQL..."

    if [ "$OS" == "macos" ]; then
        brew install postgresql@14
        brew services start postgresql@14
    else
        # Linux
        if [ "$DISTRO" == "ubuntu" ] || [ "$DISTRO" == "debian" ]; then
            $SUDO apt-get update
            $SUDO apt-get install -y postgresql postgresql-contrib
            $SUDO service postgresql start
        elif [ "$DISTRO" == "centos" ] || [ "$DISTRO" == "rhel" ]; then
            $SUDO yum install -y postgresql-server postgresql-contrib
            $SUDO postgresql-setup initdb
            $SUDO systemctl start postgresql
            $SUDO systemctl enable postgresql
        else
            log_error "不支持的 Linux 发行版: $DISTRO"
            exit 1
        fi
    fi

    if command_exists psql; then
        log_success "PostgreSQL 安装成功: $(psql --version)"
    else
        log_error "PostgreSQL 安装失败"
        exit 1
    fi
}

# 配置数据库
configure_database() {
    log_step "配置数据库"

    DB_NAME="lovato_pump"
    DB_USER="postgres"
    DB_PASSWORD="postgres"

    log_info "设置 postgres 用户密码..."
    if [ "$OS" == "macos" ]; then
        $SUDO -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    else
        $SUDO -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    fi

    log_info "创建数据库 $DB_NAME..."
    $SUDO -u postgres createdb $DB_NAME

    log_info "安装 UUID 扩展..."
    $SUDO -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

    log_success "数据库配置成功"
}

# 运行迁移
run_migrations() {
    log_step "运行数据库迁移"

    if [ ! -f "migrations/001_add_membership_tables.sql" ]; then
        log_error "迁移文件不存在: migrations/001_add_membership_tables.sql"
        exit 1
    fi

    log_info "执行迁移脚本..."
    $SUDO -u postgres psql -d lovato_pump < migrations/001_add_membership_tables.sql

    if [ $? -eq 0 ]; then
        log_success "数据库迁移成功"
    else
        log_error "数据库迁移失败"
        exit 1
    fi

    log_info "数据库表列表:"
    $SUDO -u postgres psql -d lovato_pump -c "\dt"
}

# 创建 .env 文件
create_env_file() {
    log_step "创建 .env 配置文件"

    if [ ! -f ".env.example" ]; then
        log_error ".env.example 文件不存在"
        exit 1
    fi

    if [ -f ".env" ]; then
        log_info ".env 文件已存在，备份中..."
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    fi

    cp .env.example .env

    # 更新路径配置
    if [ "$OS" == "macos" ]; then
        sed -i '' 's|^POSTGRES_DATA_DIR=.*|POSTGRES_DATA_DIR=/usr/local/var/postgres|' .env
        sed -i '' 's|^POSTGRES_BACKUP_DIR=.*|POSTGRES_BACKUP_DIR=/usr/local/var/postgres/backups|' .env
    else
        sed -i 's|^POSTGRES_DATA_DIR=.*|POSTGRES_DATA_DIR=/var/lib/postgresql/14/main|' .env
        sed -i 's|^POSTGRES_BACKUP_DIR=.*|POSTGRES_BACKUP_DIR=/var/lib/postgresql/backups|' .env
    fi

    log_success ".env 文件创建成功"
}

# 安装项目依赖
install_dependencies() {
    log_step "安装项目依赖"

    if [ ! -f "package.json" ]; then
        log_error "package.json 文件不存在"
        exit 1
    fi

    log_info "运行 pnpm install..."
    pnpm install

    if [ $? -eq 0 ]; then
        log_success "依赖安装成功"
    else
        log_error "依赖安装失败"
        exit 1
    fi
}

# 验证安装
verify_installation() {
    log_step "验证安装"

    echo "系统环境:"
    echo "  操作系统: $OS"
    if [ -n "$DISTRO" ]; then
        echo "  发行版: $DISTRO"
    fi
    echo ""

    echo "已安装软件:"
    echo "  Node.js: $(node --version)"
    echo "  npm: $(npm --version)"
    echo "  pnpm: $(pnpm --version)"
    echo "  PostgreSQL: $(psql --version)"
    echo ""

    echo "数据库信息:"
    echo "  主机: localhost"
    echo "  端口: 5432"
    echo "  数据库: lovato_pump"
    echo "  用户: postgres"
    echo ""

    log_success "所有组件安装成功！"
}

# 显示使用说明
show_usage_instructions() {
    log_step "安装完成"

    echo "下一步操作:"
    echo ""
    echo "1. 启动开发服务器:"
    echo "   pnpm run dev"
    echo ""
    echo "2. 打开浏览器访问:"
    echo "   http://localhost:5000"
    echo ""
    echo "3. 常用命令:"
    echo "   pnpm run dev      # 启动开发服务器"
    echo "   pnpm run build    # 构建生产版本"
    echo "   pnpm run start    # 启动生产服务器"
    echo ""
    echo "4. 数据库管理:"
    echo "   psql -d lovato_pump                    # 连接数据库"
    echo "   sudo -u postgres psql -d lovato_pump  # 以 postgres 用户连接"
    echo "   pg_dump lovato_pump > backup.sql      # 备份数据库"
    echo "   psql -d lovato_pump < backup.sql      # 恢复数据库"
    echo ""
    echo "文档:"
    echo "  LOCAL_PC_INSTALLATION_GUIDE.md  # 详细安装指南"
    echo "  README.md                       # 项目介绍"
    echo ""
}

# 主函数
main() {
    clear
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  洛瓦托智能水泵选型系统${NC}"
    echo -e "${CYAN}  本地环境自动安装${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""

    detect_os
    check_sudo

    log_info "检测到操作系统: $OS"
    if [ -n "$DISTRO" ]; then
        log_info "发行版: $DISTRO"
    fi

    install_nodejs
    install_pnpm
    install_postgresql
    configure_database
    run_migrations
    create_env_file
    install_dependencies
    verify_installation
    show_usage_instructions

    log_success "安装流程完成！"
}

# 运行主函数
main
