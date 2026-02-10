#!/bin/bash
# 快速安装 PostgreSQL 数据库脚本
# 使用方法: bash quick-install-db.sh

set -e

echo "🗄️  开始安装 PostgreSQL 数据库..."

# 更新包列表
echo "📦 更新包列表..."
sudo apt update

# 安装 PostgreSQL
echo "📦 安装 PostgreSQL 14..."
sudo apt install postgresql-14 postgresql-contrib-14 -y

# 启动 PostgreSQL 服务
echo "🚀 启动 PostgreSQL 服务..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 设置 postgres 用户密码
echo "🔐 设置 postgres 用户密码..."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'yezi100243..';"

# 创建数据库用户
echo "👤 创建数据库用户 lovato_user..."
sudo -u postgres psql -c "CREATE USER lovato_user WITH PASSWORD 'lovato_db_password_2024';"

# 创建数据库
echo "🗄️  创建数据库 lovato_pump..."
sudo -u postgres psql -c "CREATE DATABASE lovato_pump OWNER lovato_user;"

# 授予权限
echo "🔑 授予权限..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lovato_pump TO lovato_user;"

# 配置远程访问
echo "🌐 配置远程访问..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/14/main/postgresql.conf

# 添加 pg_hba.conf 规则
echo "host    all             all             0.0.0.0/0               scram-sha-256" | sudo tee -a /etc/postgresql/14/main/pg_hba.conf

# 重启 PostgreSQL
echo "🔄 重启 PostgreSQL 服务..."
sudo systemctl restart postgresql

# 配置防火墙
echo "🔥 配置防火墙..."
sudo ufw allow 5432/tcp || echo "UFW 未安装，跳过防火墙配置"

# 显示连接信息
echo ""
echo "✅ PostgreSQL 安装完成！"
echo ""
echo "📋 数据库信息："
echo "   主机: 122.51.22.101"
echo "   端口: 5432"
echo "   数据库: lovato_pump"
echo "   用户: lovato_user"
echo "   密码: lovato_db_password_2024"
echo ""
echo "🔗 连接字符串："
echo "   postgresql://lovato_user:lovato_db_password_2024@122.51.22.101:5432/lovato_pump"
echo ""
echo "🧪 测试连接："
echo "   sudo -u postgres psql -U lovato_user -d lovato_pump"
echo ""
