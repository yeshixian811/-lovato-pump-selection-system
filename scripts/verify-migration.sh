#!/bin/bash
# 迁移后验证脚本 - PostgreSQL J盘迁移

set -e

echo "=========================================="
echo "  PostgreSQL 迁移后验证脚本"
echo "  验证 J 盘迁移结果"
echo "=========================================="
echo

# 定义变量
POSTGRES_BIN="/usr/lib/postgresql/14/bin"
NEW_DATA_DIR="/mnt/j/postgresql/data"
BACKUP_DIR="/mnt/j/postgresql/backups"
LOG_FILE="$BACKUP_DIR/migration_verification.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "验证开始时间: $(date)"
echo "日志文件: $LOG_FILE"
echo

# 创建日志文件
{
    echo "========================================="
    echo "PostgreSQL 迁移验证日志"
    echo "验证时间: $(date)"
    echo "========================================="
    echo
} > "$LOG_FILE"

# 验证结果统计
PASS_COUNT=0
FAIL_COUNT=0

# 函数：记录通过
record_pass() {
    ((PASS_COUNT++))
    echo "[✓] $1"
    echo "[✓] $1" >> "$LOG_FILE"
}

# 函数：记录失败
record_fail() {
    ((FAIL_COUNT++))
    echo "[✗] $1"
    echo "[✗] $1" >> "$LOG_FILE"
}

# 函数：记录信息
record_info() {
    echo "[ℹ] $1"
    echo "[ℹ] $1" >> "$LOG_FILE"
}

# 1. 检查服务状态
echo "=========================================="
echo "  验证 1/8: PostgreSQL 服务状态"
echo "=========================================="
echo

if systemctl is-active --quiet postgresql; then
    record_pass "PostgreSQL 服务正在运行"
    systemctl status postgresql >> "$LOG_FILE"
else
    record_fail "PostgreSQL 服务未运行"
    systemctl status postgresql >> "$LOG_FILE"
fi

echo

# 2. 检查数据目录
echo "=========================================="
echo "  验证 2/8: 数据目录"
echo "=========================================="
echo

if [ -f "$NEW_DATA_DIR/PG_VERSION" ]; then
    record_pass "数据目录存在: $NEW_DATA_DIR"
    ls -la "$NEW_DATA_DIR" >> "$LOG_FILE"
    
    # 检查数据目录内容
    for dir in base global pg_wal; do
        if [ -d "$NEW_DATA_DIR/$dir" ]; then
            echo "  - $dir: 存在" >> "$LOG_FILE"
        else
            record_fail "缺少目录: $dir"
        fi
    done
    
    if [ -f "$NEW_DATA_DIR/postgresql.conf" ]; then
        echo "  - postgresql.conf: 存在" >> "$LOG_FILE"
    else
        record_fail "缺少文件: postgresql.conf"
    fi
else
    record_fail "数据目录不存在: $NEW_DATA_DIR"
fi

echo

# 3. 检查服务配置
echo "=========================================="
echo "  验证 3/8: 服务配置"
echo "=========================================="
echo

DATA_DIR_CONFIG=$(sudo -u postgres psql -t -c "SHOW data_directory;")
if [ "$DATA_DIR_CONFIG" == "$NEW_DATA_DIR" ]; then
    record_pass "服务配置指向 J 盘: $DATA_DIR_CONFIG"
else
    record_fail "服务配置未指向 J 盘: $DATA_DIR_CONFIG"
fi

echo "配置值: $DATA_DIR_CONFIG" >> "$LOG_FILE"
echo

# 4. 测试数据库连接
echo "=========================================="
echo "  验证 4/8: 数据库连接"
echo "=========================================="
echo

if sudo -u postgres psql -c "SELECT version();" > /dev/null 2>&1; then
    record_pass "数据库连接正常"
    sudo -u postgres psql -c "SELECT version();" >> "$LOG_FILE"
else
    record_fail "数据库连接失败"
fi

echo

# 5. 验证数据库存在
echo "=========================================="
echo "  验证 5/8: 数据库完整性"
echo "=========================================="
echo

if sudo -u postgres psql -l | grep -q "lovato_pump"; then
    record_pass "数据库 lovato_pump 存在"
    
    # 检查表数量
    TABLE_COUNT=$(sudo -u postgres psql -d lovato_pump -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
    record_info "表数量: $TABLE_COUNT"
else
    record_fail "数据库 lovato_pump 不存在"
fi

echo

# 6. 检查备份文件
echo "=========================================="
echo "  验证 6/8: 备份文件"
echo "=========================================="
echo

if [ "$(ls -A $BACKUP_DIR/*.sql 2>/dev/null)" ]; then
    record_pass "备份文件存在"
    ls -lh "$BACKUP_DIR"/*.sql >> "$LOG_FILE"
else
    record_info "备份文件不存在（可能已清理）"
fi

echo

# 7. 检查数据文件大小
echo "=========================================="
echo "  验证 7/8: 数据文件大小"
echo "=========================================="
echo

if [ -d "$NEW_DATA_DIR/base" ]; then
    DATA_SIZE=$(du -sh "$NEW_DATA_DIR" | cut -f1)
    record_info "数据目录总大小: $DATA_SIZE"
    du -h --max-depth=1 "$NEW_DATA_DIR" >> "$LOG_FILE"
else
    record_fail "无法计算数据目录大小"
fi

echo

# 8. 执行完整测试查询
echo "=========================================="
echo "  验证 8/8: 数据查询测试"
echo "=========================================="
echo.

if sudo -u postgres psql -d lovato_pump -c "\dt" > /dev/null 2>&1; then
    record_pass "数据查询测试通过"
    sudo -u postgres psql -d lovato_pump -c "\dt" >> "$LOG_FILE"
else
    record_fail "数据查询测试失败"
fi

echo

# 生成验证报告
echo "=========================================="
echo "  验证报告"
echo "=========================================="
echo

echo "验证时间: $(date)"
echo
echo "通过项: $PASS_COUNT"
echo "失败项: $FAIL_COUNT"
echo

echo "验证结果:"
if [ $FAIL_COUNT -eq 0 ]; then
    echo "[✓] 所有验证通过！迁移成功完成。"
    echo
    echo "下一步:"
    echo "  1. 重启应用程序"
    echo "  2. 测试应用程序功能"
    echo "  3. 监控系统性能"
    echo "  4. 清理旧数据目录（可选）"
else
    echo "[✗] 发现 $FAIL_COUNT 个问题，需要处理。"
    echo
    echo "建议操作:"
    echo "  1. 查看日志文件: $LOG_FILE"
    echo "  2. 检查失败项"
    echo "  3. 必要时执行回滚"
fi

echo
echo "=========================================="
echo "  详细日志"
echo "=========================================="
cat "$LOG_FILE"
echo "=========================================="

# 保存验证结果
{
    echo
    echo "========================================="
    echo "验证结果统计"
    echo "通过项: $PASS_COUNT"
    echo "失败项: $FAIL_COUNT"
    echo "验证完成时间: $(date)"
    echo "========================================="
} >> "$LOG_FILE"

echo
echo "验证完成！"
echo "日志已保存到: $LOG_FILE"
echo
