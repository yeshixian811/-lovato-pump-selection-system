@echo off
chcp 65001 >nul
title PostgreSQL 迁移到J盘 - 本地服务器部署
color 0A

echo ==========================================
echo   PostgreSQL 迁移到J盘
echo   本地Windows服务器部署
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
set POSTGRES_BIN=C:\Program Files\PostgreSQL\14\bin
set POSTGRES_DATA=C:\Program Files\PostgreSQL\14\data
set NEW_DATA_DIR=J:\postgresql\data
set BACKUP_DIR=J:\postgresql\backups
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo 开始时间: %date% %time%
echo.
echo 目标目录: %NEW_DATA_DIR%
echo 备份目录: %BACKUP_DIR%
echo.

pause

:: 阶段 1: 检查环境
echo ==========================================
echo   阶段 1/6: 检查环境
echo ==========================================
echo.

echo [1/5] 检查J盘...
dir J:\ >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] J盘不存在！
    echo 请确保J盘已正确挂载
    pause
    exit /b 1
)
echo [✓] J盘存在
dir J:\ | findstr "可用字节"

echo.
echo [2/5] 检查PostgreSQL服务...
sc query postgresql-x64-14 | findstr "RUNNING" >nul
if %errorLevel% neq 0 (
    echo [错误] PostgreSQL服务未运行！
    pause
    exit /b 1
)
echo [✓] PostgreSQL服务运行中

echo.
echo [3/5] 检查PostgreSQL安装...
if not exist "%POSTGRES_BIN%\psql.exe" (
    echo [错误] PostgreSQL未安装或路径不正确！
    echo 预期路径: %POSTGRES_BIN%
    pause
    exit /b 1
)
echo [✓] PostgreSQL已安装
"%POSTGRES_BIN%\psql.exe" --version

echo.
echo [4/5] 检查当前数据目录...
if not exist "%POSTGRES_DATA%\PG_VERSION" (
    echo [警告] 当前数据目录不存在: %POSTGRES_DATA%
    set SKIP_COPY=1
) else (
    echo [✓] 当前数据目录存在: %POSTGRES_DATA%
    set SKIP_COPY=0
)

echo.
echo [5/5] 创建目录结构...
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%NEW_DATA_DIR%" mkdir "%NEW_DATA_DIR%"
echo [✓] 目录创建完成

pause
echo.

:: 阶段 2: 创建备份
echo ==========================================
echo   阶段 2/6: 创建备份
echo ==========================================
echo.

echo [1/3] 创建完整数据库备份...
"%POSTGRES_BIN%\pg_dumpall.exe" -U postgres > "%BACKUP_DIR%\full_backup_%TIMESTAMP%.sql"
if %errorLevel% neq 0 (
    echo [错误] 备份失败！
    pause
    exit /b 1
)
echo [✓] 备份完成: %BACKUP_DIR%\full_backup_%TIMESTAMP%.sql

echo.
echo [2/3] 备份配置文件...
if exist "%POSTGRES_DATA%\postgresql.conf" (
    copy "%POSTGRES_DATA%\postgresql.conf" "%BACKUP_DIR%\postgresql.conf" >nul
    echo [✓] postgresql.conf 已备份
)
if exist "%POSTGRES_DATA%\pg_hba.conf" (
    copy "%POSTGRES_DATA%\pg_hba.conf" "%BACKUP_DIR%\pg_hba.conf" >nul
    echo [✓] pg_hba.conf 已备份
)

echo.
echo [3/3] 验证备份文件...
for %%F in ("%BACKUP_DIR%\*.sql") do set BACKUP_SIZE=%%~zF
set /a BACKUP_SIZE_MB=%BACKUP_SIZE%/1048576
echo [✓] 备份文件大小: %BACKUP_SIZE_MB% MB

pause
echo.

:: 阶段 3: 停止服务
echo ==========================================
echo   阶段 3/6: 停止服务
echo ==========================================
echo.

echo [1/2] 停止PostgreSQL服务...
net stop postgresql-x64-14
if %errorLevel% neq 0 (
    echo [警告] 服务停止失败或已停止
) else (
    echo [✓] PostgreSQL服务已停止
)

echo.
echo [2/2] 验证服务已停止...
timeout /t 3 >nul
sc query postgresql-x64-14 | findstr "STOPPED" >nul
if %errorLevel% equ 0 (
    echo [✓] 服务已完全停止
) else (
    echo [警告] 服务可能未完全停止，继续执行...
)

pause
echo.

:: 阶段 4: 迁移数据
echo ==========================================
echo   阶段 4/6: 迁移数据
echo ==========================================
echo.

if %SKIP_COPY%==0 (
    echo [1/3] 复制数据目录...
    echo 正在复制，请稍候...
    echo 源目录: %POSTGRES_DATA%
    echo 目标目录: %NEW_DATA_DIR%
    
    xcopy "%POSTGRES_DATA%" "%NEW_DATA_DIR%\" /E /I /H /Y >nul
    
    if %errorLevel% neq 0 (
        echo [错误] 数据复制失败！
        pause
        exit /b 1
    )
    echo [✓] 数据复制完成
) else (
    echo [1/3] 初始化新数据目录...
    "%POSTGRES_BIN%\initdb.exe" -D "%NEW_DATA_DIR%" -U postgres -E UTF8 --locale=C
    if %errorLevel% neq 0 (
        echo [错误] 数据目录初始化失败！
        pause
        exit /b 1
    )
    echo [✓] 数据目录初始化完成
)

echo.
echo [2/3] 设置权限...
icacls "%NEW_DATA_DIR%" /grant "postgres:(OI)(CI)F" /T >nul 2>&1
echo [✓] 权限设置完成

echo.
echo [3/3] 验证数据目录...
if exist "%NEW_DATA_DIR%\PG_VERSION" (
    echo [✓] PG_VERSION 存在
) else (
    echo [错误] PG_VERSION 不存在！
    pause
    exit /b 1
)

if exist "%NEW_DATA_DIR%\base" (
    echo [✓] base 目录存在
) else (
    echo [错误] base 目录不存在！
    pause
    exit /b 1
)

pause
echo.

:: 阶段 5: 更新配置
echo ==========================================
echo   阶段 5/6: 更新配置
echo ==========================================
echo.

echo [1/2] 更新服务配置...
sc config postgresql-x64-14 binPath= "\"%POSTGRES_BIN%\pg_ctl.exe\" runservice -N \"postgresql-x64-14\" -D \"%NEW_DATA_DIR%\" -w"
if %errorLevel% neq 0 (
    echo [错误] 服务配置更新失败！
    pause
    exit /b 1
)
echo [✓] 服务配置已更新

echo.
echo [2/2] 设置服务描述...
sc description postgresql-x64-14 "PostgreSQL Database Server - Data on J: drive"
echo [✓] 服务描述已设置

pause
echo.

:: 阶段 6: 启动和验证
echo ==========================================
echo   阶段 6/6: 启动和验证
echo ==========================================
echo.

echo [1/4] 启动PostgreSQL服务...
net start postgresql-x64-14
if %errorLevel% neq 0 (
    echo [错误] 服务启动失败！
    echo.
    echo 请检查日志: %NEW_DATA_DIR%\log\postgresql-*.log
    pause
    exit /b 1
)
echo [✓] PostgreSQL服务已启动

echo.
echo [2/4] 等待服务就绪...
timeout /t 5 >nul
echo [✓] 服务就绪

echo.
echo [3/4] 验证数据库连接...
"%POSTGRES_BIN%\psql.exe" -U postgres -c "SELECT version();" >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 数据库连接失败！
    echo.
    echo 请检查日志: %NEW_DATA_DIR%\log\postgresql-*.log
    pause
    exit /b 1
)
echo [✓] 数据库连接成功

echo.
echo [4/4] 显示PostgreSQL版本...
"%POSTGRES_BIN%\psql.exe" -U postgres -c "SELECT version();"

echo.
echo ==========================================
echo   迁移完成！
echo ==========================================
echo.
echo 迁移摘要:
echo   源目录: %POSTGRES_DATA%
echo   目标目录: %NEW_DATA_DIR%
echo   备份文件: %BACKUP_DIR%\full_backup_%TIMESTAMP%.sql
echo   备份大小: %BACKUP_SIZE_MB% MB
echo.
echo 下一步:
echo   1. 重启应用程序
echo   2. 测试应用程序功能
echo   3. 确认一切正常后，可以删除旧数据目录
echo.
echo 清理命令（可选）:
echo   rmdir /s /q "%POSTGRES_DATA%"
echo.

set /p choice="是否现在重启应用程序？(Y/N): "
if /i "%choice%"=="Y" (
    echo.
    echo 重启应用程序...
    net stop nodejs-service
    timeout /t 2 >nul
    net start nodejs-service
    echo [✓] 应用程序已重启
    echo.
    echo 请访问 http://localhost:5000 测试应用程序
)

echo.
echo 迁移完成时间: %date% %time%
echo.
pause
