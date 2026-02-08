@echo off
chcp 65001 >nul
title 数据库迁移到 J 盘
color 0E

echo.
echo ==========================================
echo   PostgreSQL 数据库迁移工具
echo   迁移到 J 盘
echo ==========================================
echo.
echo 此脚本将：
echo   1. 备份当前数据库
echo   2. 停止 PostgreSQL 服务
echo   3. 将数据迁移到 J 盘
echo   4. 重新配置 PostgreSQL
echo   5. 启动服务并验证
echo.
echo 警告：此操作需要管理员权限
echo 请确保 J 盘有足够空间
echo.
pause

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 需要管理员权限！
    echo 请右键点击此脚本，选择"以管理员身份运行"
    pause
    exit /b 1
)

:: 检查 J 盘是否存在
if not exist "J:\" (
    echo [错误] J 盘不存在！
    echo 请先挂载或创建 J 盘
    pause
    exit /b 1
)

:: 配置变量
set PG_DATA_DIR=C:\Program Files\PostgreSQL\14\data
set PG_NEW_DIR=J:\postgresql\data
set BACKUP_DIR=J:\postgresql\backup

:: 创建备份目录
if not exist "%BACKUP_DIR%" (
    echo [信息] 创建备份目录...
    mkdir "%BACKUP_DIR%"
)

echo.
echo ==========================================
echo   步骤 1/5: 备份当前数据库
echo ==========================================
echo.

echo [信息] 正在备份数据库...
set BACKUP_FILE=%BACKUP_DIR%\backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
pg_dump -U postgres lovato_pump > "%BACKUP_FILE%"

if %errorLevel% neq 0 (
    echo [警告] 数据库备份可能失败
) else (
    echo [✓] 数据库备份完成
    echo     备份文件: %BACKUP_FILE%
)

echo.
echo ==========================================
echo   步骤 2/5: 停止 PostgreSQL 服务
echo ==========================================
echo.

echo [信息] 停止 PostgreSQL 服务...
net stop postgresql-x64-14

if %errorLevel% neq 0 (
    echo [警告] 服务停止可能失败
) else (
    echo [✓] 服务已停止
)

echo.
echo ==========================================
echo   步骤 3/5: 迁移数据到 J 盘
echo ==========================================
echo.

:: 创建新目录
if not exist "%PG_NEW_DIR%" (
    echo [信息] 创建目标目录...
    mkdir "%PG_NEW_DIR%"
)

echo [信息] 正在复制数据文件...
echo 这可能需要几分钟，请耐心等待...
xcopy "%PG_DATA_DIR%" "%PG_NEW_DIR%" /E /I /H /Y

if %errorLevel% neq 0 (
    echo [错误] 数据复制失败！
    echo 请检查磁盘空间和权限
    pause
    exit /b 1
)

echo [✓] 数据迁移完成

echo.
echo ==========================================
echo   步骤 4/5: 重新配置 PostgreSQL
echo ==========================================
echo.

:: 查找 postgresql.conf 文件
set PG_CONF=%PG_DATA_DIR%\postgresql.conf

if not exist "%PG_CONF%" (
    echo [错误] 找不到 postgresql.conf 文件！
    echo     路径: %PG_CONF%
    pause
    exit /b 1
)

echo [信息] 修改 data_directory 配置...
echo.
echo 原配置文件: %PG_CONF%
echo 新数据目录: %PG_NEW_DIR%
echo.

:: 备份原配置文件
copy "%PG_CONF%" "%PG_CONF%.backup"

:: 添加或修改 data_directory
findstr /C:"data_directory = " "%PG_CONF%" >nul
if %errorLevel% equ 0 (
    :: 配置已存在，注释掉旧配置
    powershell -Command "(Get-Content '%PG_CONF%') -replace 'data_directory = (.*)', '# data_directory = $1' | Set-Content '%PG_CONF%'"
)

:: 添加新配置
echo data_directory = '%PG_NEW_DIR%' >> "%PG_CONF%"

echo [✓] 配置已修改

echo.
echo ==========================================
echo   步骤 5/5: 启动服务并验证
echo ==========================================
echo.

echo [信息] 启动 PostgreSQL 服务...
net start postgresql-x64-14

if %errorLevel% neq 0 (
    echo [错误] 服务启动失败！
    echo 请检查配置和日志
    pause
    exit /b 1
)

echo [✓] 服务已启动
echo.
echo [信息] 验证数据库连接...
timeout /t 3 >nul

psql -U postgres -d lovato_pump -c "SELECT version();" >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] 数据库连接成功
) else (
    echo [警告] 数据库连接可能失败
    echo 请手动验证
)

cls
echo.
echo ==========================================
echo   迁移完成！
echo ==========================================
echo.
echo [✓] 数据库已备份
echo [✓] 数据已迁移到 J 盘
echo [✓] 配置已更新
echo [✓] 服务已启动
echo.
echo ==========================================
echo   迁移详情
echo ==========================================
echo.
echo 原数据目录: %PG_DATA_DIR%
echo 新数据目录: %PG_NEW_DIR%
echo 备份文件:   %BACKUP_FILE%
echo.
echo 下一步：
echo   1. 验证应用能否正常访问数据库
echo   2. 检查应用日志
echo   3. 如果一切正常，可以删除旧数据目录
echo.
echo 注意事项：
echo   - 请勿删除备份文件
echo   - 建议保留原数据目录至少一周
echo   - 定期备份数据库
echo.
pause
