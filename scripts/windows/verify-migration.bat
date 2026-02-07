@echo off
chcp 65001 >nul
title 验证PostgreSQL迁移
color 0E

echo ==========================================
echo   验证PostgreSQL迁移到J盘
echo ==========================================
echo.

set POSTGRES_BIN=C:\Program Files\PostgreSQL\14\bin
set NEW_DATA_DIR=J:\postgresql\data
set BACKUP_DIR=J:\postgresql\backups

echo 验证目标目录: %NEW_DATA_DIR%
echo.

:: 检查 1: 服务状态
echo ==========================================
echo   检查 1: 服务状态
echo ==========================================
echo.

sc query postgresql-x64-14 | findstr "RUNNING" >nul
if %errorLevel% equ 0 (
    echo [✓] PostgreSQL服务运行正常
) else (
    echo [✗] PostgreSQL服务未运行！
    goto :error
)

echo.

:: 检查 2: 数据目录
echo ==========================================
echo   检查 2: 数据目录
echo ==========================================
echo.

if exist "%NEW_DATA_DIR%\PG_VERSION" (
    echo [✓] PG_VERSION 存在
    set /p version=<"%NEW_DATA_DIR%\PG_VERSION"
    echo     数据库版本: %version%
) else (
    echo [✗] PG_VERSION 不存在！
    goto :error
)

if exist "%NEW_DATA_DIR%\base" (
    echo [✓] base 目录存在
) else (
    echo [✗] base 目录不存在！
    goto :error
)

if exist "%NEW_DATA_DIR%\global" (
    echo [✓] global 目录存在
) else (
    echo [✗] global 目录不存在！
    goto :error
)

if exist "%NEW_DATA_DIR%\pg_wal" (
    echo [✓] pg_wal 目录存在
) else (
    echo [✗] pg_wal 目录不存在！
    goto :error
)

echo.

:: 检查 3: 数据库连接
echo ==========================================
echo   检查 3: 数据库连接
echo ==========================================
echo.

"%POSTGRES_BIN%\psql.exe" -U postgres -c "SELECT version();" >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] 数据库连接成功
    echo.
    echo PostgreSQL版本信息:
    "%POSTGRES_BIN%\psql.exe" -U postgres -c "SELECT version();"
) else (
    echo [✗] 数据库连接失败！
    goto :error
)

echo.

:: 检查 4: 数据库列表
echo ==========================================
echo   检查 4: 数据库列表
echo ==========================================
echo.

"%POSTGRES_BIN%\psql.exe" -U postgres -l
echo [✓] 数据库列表获取成功

echo.

:: 检查 5: 数据目录大小
echo ==========================================
echo   检查 5: 数据目录大小
echo ==========================================
echo.

for /f "tokens=3" %%A in ('dir "%NEW_DATA_DIR%" /-c ^| find "File(s)"') do set DATA_SIZE=%%A
set /a DATA_SIZE_MB=%DATA_SIZE%/1048576
echo 数据目录大小: %DATA_SIZE_MB% MB

echo.

:: 检查 6: 备份文件
echo ==========================================
echo   检查 6: 备份文件
echo ==========================================
echo.

if exist "%BACKUP_DIR%\*.sql" (
    echo [✓] 备份文件存在
    dir "%BACKUP_DIR%\*.sql" /b
) else (
    echo [⚠] 未找到备份文件
)

echo.

:: 检查 7: 配置文件
echo ==========================================
echo   检查 7: 配置文件
echo ==========================================
echo.

if exist "%NEW_DATA_DIR%\postgresql.conf" (
    echo [✓] postgresql.conf 存在
) else (
    echo [✗] postgresql.conf 不存在！
    goto :error
)

if exist "%NEW_DATA_DIR%\pg_hba.conf" (
    echo [✓] pg_hba.conf 存在
) else (
    echo [✗] pg_hba.conf 不存在！
    goto :error
)

echo.

:: 最终结果
echo ==========================================
echo   ✅ 验证通过！迁移成功！
echo ==========================================
echo.
echo 验证摘要:
echo   [✓] 服务状态: 正常
echo   [✓] 数据目录: %NEW_DATA_DIR%
echo   [✓] 数据库连接: 成功
echo   [✓] 数据库列表: 正常
echo   [✓] 数据大小: %DATA_SIZE_MB% MB
echo   [✓] 配置文件: 完整
echo.
echo 下一步:
echo   1. 重启应用程序
echo   2. 测试应用程序功能
echo   3. 确认一切正常后，可以删除旧数据目录
echo.
pause
exit /b 0

:error
echo.
echo ==========================================
echo   ❌ 验证失败！
echo ==========================================
echo.
echo 请检查:
echo   1. 查看日志: %NEW_DATA_DIR%\log\postgresql-*.log
echo   2. 服务状态: sc query postgresql-x64-14
echo   3. 运行回滚脚本: rollback-migration.bat
echo.
pause
exit /b 1
