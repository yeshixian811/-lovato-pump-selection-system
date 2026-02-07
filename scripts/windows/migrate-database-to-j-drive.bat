@echo off
chcp 65001 >nul
title PostgreSQL 数据库迁移到 J 盘
color 0B

echo ==========================================
echo   PostgreSQL 数据库迁移脚本
echo   迁移到 J: 盘
echo ==========================================
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 需要管理员权限！
    echo 请右键点击此脚本，选择"以管理员身份运行"
    pause
    exit /b 1
)

:: 定义变量
set POSTGRES_USER=postgres
set POSTGRES_DB=lovato_pump
set POSTGRES_INSTALL_DIR=C:\Program Files\PostgreSQL\14
set POSTGRES_BIN=%POSTGRES_INSTALL_DIR%\bin
set OLD_DATA_DIR=C:\Program Files\PostgreSQL\14\data
set NEW_DATA_DIR=J:\postgresql\data
set BACKUP_DIR=J:\postgresql\backups
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=%BACKUP_DIR%\postgres_backup_%TIMESTAMP%.sql

:: 1. 检查 PostgreSQL 安装
echo [1/9] 检查 PostgreSQL 安装...
if not exist "%POSTGRES_BIN%\pg_dump.exe" (
    echo [错误] PostgreSQL 未安装或路径不正确
    echo 请确认 PostgreSQL 安装目录: %POSTGRES_INSTALL_DIR%
    pause
    exit /b 1
)

echo [✓] PostgreSQL 已安装
echo   安装目录: %POSTGRES_INSTALL_DIR%
echo.

:: 2. 检查 PostgreSQL 服务
echo [2/9] 检查 PostgreSQL 服务...
sc query postgresql-x64-14 >nul 2>&1
if %errorLevel% neq 0 (
    echo [警告] PostgreSQL 服务未找到
    echo 请确认服务名称
    set /p SERVICE_NAME="请输入 PostgreSQL 服务名称 (默认: postgresql-x64-14): "
    if "!SERVICE_NAME!"=="" set SERVICE_NAME=postgresql-x64-14
) else (
    set SERVICE_NAME=postgresql-x64-14
    echo [✓] 服务已找到: %SERVICE_NAME%
)
echo.

:: 3. 创建 J 盘目录结构
echo [3/9] 创建 J 盘目录结构...
if not exist "J:\" (
    echo [错误] J 盘不存在！
    echo 请确认 J 盘已正确挂载
    pause
    exit /b 1
)

if not exist "%NEW_DATA_DIR%" (
    mkdir "%NEW_DATA_DIR%"
    echo [✓] 数据目录已创建: %NEW_DATA_DIR%
)

if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
    echo [✓] 备份目录已创建: %BACKUP_DIR%
)

echo.

:: 4. 停止 PostgreSQL 服务
echo [4/9] 停止 PostgreSQL 服务...
net stop %SERVICE_NAME%

if %errorLevel% equ 0 (
    echo [✓] 服务已停止
) else (
    echo [警告] 服务停止失败或已停止
)

timeout /t 3 >nul
echo.

:: 5. 备份现有数据
echo [5/9] 备份现有数据...
if exist "%OLD_DATA_DIR%" (
    echo [信息] 使用 pg_dumpall 备份所有数据库...
    
    "%POSTGRES_BIN%\pg_dumpall" -U postgres -f "%BACKUP_FILE%"
    
    if %errorLevel% equ 0 (
        echo [✓] 备份完成: %BACKUP_FILE%
    ) else (
        echo [错误] 备份失败！
        pause
        exit /b 1
    )
) else (
    echo [警告] 旧数据目录不存在，跳过备份
    set SKIP_RESTORE=1
)

echo.

:: 6. 初始化新数据目录
echo [6/9] 初始化新数据目录...
if not exist "%NEW_DATA_DIR%\PG_VERSION" (
    echo [信息] 初始化新的数据目录...
    "%POSTGRES_BIN%\initdb" -D "%NEW_DATA_DIR%" -U postgres -E UTF8 --locale=zh_CN
    
    if %errorLevel% equ 0 (
        echo [✓] 数据目录初始化完成
    ) else (
        echo [错误] 数据目录初始化失败！
        pause
        exit /b 1
    )
) else (
    echo [信息] 数据目录已存在，跳过初始化
)

echo.

:: 7. 恢复数据
if not defined SKIP_RESTORE (
    echo [7/9] 恢复备份数据...
    
    :: 启动 PostgreSQL 服务（使用新数据目录）
    sc config %SERVICE_NAME% binPath= "\"%POSTGRES_BIN%\pg_ctl.exe\" runservice -N \"%SERVICE_NAME%\" -D \"%NEW_DATA_DIR%\" -w"
    
    net start %SERVICE_NAME%
    
    if %errorLevel% neq 0 (
        echo [错误] 服务启动失败！
        pause
        exit /b 1
    )
    
    timeout /t 5 >nul
    
    :: 恢复数据
    "%POSTGRES_BIN%\psql" -U postgres -f "%BACKUP_FILE%"
    
    if %errorLevel% equ 0 (
        echo [✓] 数据恢复完成
    ) else (
        echo [警告] 数据恢复可能有问题，请手动检查"
    )
) else (
    echo [7/9] 跳过数据恢复"
    :: 配置新数据目录
    sc config %SERVICE_NAME% binPath= "\"%POSTGRES_BIN%\pg_ctl.exe\" runservice -N \"%SERVICE_NAME%\" -D \"%NEW_DATA_DIR%\" -w"
    echo [✓] 服务配置已更新
)

echo.

:: 8. 重启服务
echo [8/9] 重启服务...
net stop %SERVICE_NAME%
timeout /t 2 >nul
net start %SERVICE_NAME%

if %errorLevel% equ 0 (
    echo [✓] 服务已重启
) else (
    echo [错误] 服务启动失败！
    echo 请检查服务配置和日志
    pause
    exit /b 1
)

echo.

:: 9. 验证迁移
echo [9/9] 验证迁移结果...
echo.
echo ==========================================
echo   验证迁移结果
echo ==========================================
echo.

:: 检查服务状态
set SERVICE_RUNNING=0
sc query %SERVICE_NAME% | findstr "RUNNING" >nul
if %errorLevel% equ 0 (
    echo [✓] 服务状态: 运行中
    set SERVICE_RUNNING=1
) else (
    echo [✗] 服务状态: 未运行"
)

:: 检查数据目录
if exist "%NEW_DATA_DIR%\PG_VERSION" (
    echo [✓] 数据目录: %NEW_DATA_DIR%
) else (
    echo [✗] 数据目录: 不存在"
)

:: 检查数据库连接
if %SERVICE_RUNNING%==1 (
    timeout /t 3 >nul
    "%POSTGRES_BIN%\psql" -U postgres -c "SELECT version();" >nul 2>&1
    if %errorLevel% equ 0 (
        echo [✓] 数据库连接: 正常"
    ) else (
        echo [✗] 数据库连接: 失败"
    )
)

echo.
echo ==========================================
echo   迁移完成！
echo ==========================================
echo.
echo 新数据目录: %NEW_DATA_DIR%
echo 备份文件:   %BACKUP_FILE%
echo 服务名称:   %SERVICE_NAME%
echo.
echo 清理建议:
echo   - 确认迁移成功后，可以删除旧数据目录
echo   - 目录: %OLD_DATA_DIR%
echo   - 建议先备份到其他位置"
echo.
echo 管理命令:
echo   - 查看状态:   sc query %SERVICE_NAME%
echo   - 启动服务:   net start %SERVICE_NAME%
echo   - 停止服务:   net stop %SERVICE_NAME%"
echo   - 数据库连接: %POSTGRES_BIN%\psql -U postgres"
echo.
pause
