#!/bin/bash
# 数据库迁移脚本 - 将 PostgreSQL 数据迁移到 J 盘

set -e

echo "=========================================="
echo "  PostgreSQL 数据库迁移脚本"
echo "  迁移到 J: 盘"
echo "=========================================="
echo

# 检查是否以 root 权限运行
if [ "$EUID" -ne 0 ]; then 
    echo "[错误] 请使用 root 权限运行此脚本"
    echo "使用: sudo $0"
    exit 1
fi

# 定义变量
POSTGRES_USER=postgres
POSTGRES_DB=lovato_pump
OLD_DATA_DIR="/var/lib/postgresql/14/main"
NEW_DATA_DIR="/mnt/j/postgresql/data"
BACKUP_DIR="/mnt/j/postgresql/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/postgres_backup_$TIMESTAMP.sql"

# 1. 检查旧数据目录是否存在
echo "[1/8] 检查现有数据库..."
if [ ! -d "$OLD_DATA_DIR" ]; then
    echo "[警告] 旧数据目录不存在: $OLD_DATA_DIR"
    echo "可能数据库未安装或已在其他位置"
fi

# 2. 创建 J 盘目录
echo "[2/8] 创建 J 盘目录结构..."
mkdir -p "$NEW_DATA_DIR"
mkdir -p "$BACKUP_DIR"

# 设置权限
chown -R $POSTGRES_USER:$POSTGRES_USER "$NEW_DATA_DIR"
chown -R $POSTGRES_USER:$POSTGRES_USER "$BACKUP_DIR"
chmod 700 "$NEW_DATA_DIR"
chmod 755 "$BACKUP_DIR"

echo "[✓] 目录创建完成"

# 3. 停止 PostgreSQL 服务
echo "[3/8] 停止 PostgreSQL 服务..."
systemctl stop postgresql
if [ $? -eq 0 ]; then
    echo "[✓] PostgreSQL 服务已停止"
else
    echo "[警告] PostgreSQL 服务停止失败，继续执行..."
fi

# 4. 备份现有数据
echo "[4/8] 备份现有数据..."
if [ -d "$OLD_DATA_DIR" ]; then
    echo "[信息] 使用 pg_dumpall 备份所有数据库..."
    sudo -u $POSTGRES_USER pg_dumpall > "$BACKUP_FILE"
    echo "[✓] 备份完成: $BACKUP_FILE"
else
    echo "[信息] 跳过备份（旧数据目录不存在）"
fi

# 5. 初始化新数据目录
echo "[5/8] 初始化新数据目录..."
if [ ! -f "$NEW_DATA_DIR/PG_VERSION" ]; then
    sudo -u $POSTGRES_USER /usr/lib/postgresql/14/bin/initdb -D "$NEW_DATA_DIR" --encoding=UTF8 --locale=zh_CN.UTF-8
    echo "[✓] 数据目录初始化完成"
else
    echo "[信息] 数据目录已存在，跳过初始化"
fi

# 6. 复制旧数据（如果存在）
echo "[6/8] 复制现有数据..."
if [ -d "$OLD_DATA_DIR" ] && [ -f "$BACKUP_FILE" ]; then
    echo "[信息] 恢复备份数据..."
    
    # 创建临时配置文件启动数据库
    TEMP_CONFIG="$NEW_DATA_DIR/postgresql.conf"
    echo "unix_socket_directories = '/tmp'" >> "$TEMP_CONFIG"
    
    # 启动 PostgreSQL 服务
    systemctl start postgresql
    
    # 等待服务启动
    sleep 5
    
    # 恢复数据
    sudo -u $POSTGRES_USER psql < "$BACKUP_FILE"
    
    echo "[✓] 数据恢复完成"
else
    echo "[信息] 跳过数据恢复"
fi

# 7. 更新 PostgreSQL 配置
echo "[7/8] 更新 PostgreSQL 配置..."
CONFIG_FILE="/etc/postgresql/14/main/postgresql.conf"

if [ -f "$CONFIG_FILE" ]; then
    # 备份原配置
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$TIMESTAMP"
    
    # 更新数据目录
    sed -i "s|^data_directory =.*|data_directory = '$NEW_DATA_DIR'|" "$CONFIG_FILE"
    
    echo "[✓] 配置文件已更新"
else
    echo "[警告] 配置文件不存在: $CONFIG_FILE"
fi

# 8. 重启服务
echo "[8/8] 重启 PostgreSQL 服务..."
systemctl restart postgresql

if [ $? -eq 0 ]; then
    echo "[✓] PostgreSQL 服务已重启"
else
    echo "[错误] PostgreSQL 服务重启失败"
    echo "请检查日志: journalctl -u postgresql"
    exit 1
fi

# 验证
echo
echo "=========================================="
echo "  验证迁移结果"
echo "=========================================="

# 检查服务状态
echo -n "[1] 服务状态: "
if systemctl is-active --quiet postgresql; then
    echo "✓ 运行中"
else
    echo "✗ 未运行"
    exit 1
fi

# 检查数据目录
echo -n "[2] 数据目录: "
if [ -d "$NEW_DATA_DIR" ]; then
    echo "✓ $NEW_DATA_DIR"
else
    echo "✗ 不存在"
    exit 1
fi

# 检查数据库连接
echo -n "[3] 数据库连接: "
if sudo -u $POSTGRES_USER psql -c "SELECT version();" > /dev/null 2>&1; then
    echo "✓ 正常"
else
    echo "✗ 失败"
    exit 1
fi

echo
echo "=========================================="
echo "  迁移完成！"
echo "=========================================="
echo
echo "新数据目录: $NEW_DATA_DIR"
echo "备份文件:   $BACKUP_FILE"
echo
echo "清理建议:"
echo "  - 确认迁移成功后，可以删除旧数据目录"
echo "  - 命令: rm -rf $OLD_DATA_DIR"
echo
echo "管理命令:"
echo "  - 查看状态: systemctl status postgresql"
echo "  - 查看日志: journalctl -u postgresql"
echo "  - 数据库连接: sudo -u postgres psql"
echo
