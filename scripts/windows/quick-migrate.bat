@echo off
chcp 65001 >nul
title 快速迁移PostgreSQL到J盘
color 0B

echo ==========================================
echo   快速迁移PostgreSQL到J盘
echo ==========================================
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 需要管理员权限！
    pause
    exit /b 1
)

set POSTGRES_BIN=C:\Program Files\PostgreSQL\14\bin
set POSTGRES_DATA=C:\Program Files\PostgreSQL\14\data
set NEW_DATA_DIR=J:\postgresql\data
set BACKUP_DIR=J:\postgresql\backups
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo 目标目录: %NEW_DATA_DIR%
echo 备份目录: %BACKUP_DIR%
echo.
pause

:: 1. 检查J盘
echo [1/7] 检查J盘...
dir J:\ >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] J盘不存在！
    pause
    exit /b 1
)
echo [✓] J盘存在

:: 2. 创建备份
echo [2/7] 创建备份...
mkdir "%BACKUP_DIR%" 2>nul
"%POSTGRES_BIN%\pg_dumpall.exe" -U postgres > "%BACKUP_DIR%\backup_%TIMESTAMP%.sql"
if %errorLevel% neq 0 (
    echo [错误] 备份失败！
    pause
    exit /b 1
)
echo [✓] 备份完成

:: 3. 停止服务
echo [3/7] 停止服务...
net stop postgresql-x64-14
timeout /t 3 >nul
echo [✓] 服务已停止

:: 4. 创建目录
echo [4/7] 创建数据目录...
mkdir "%NEW_DATA_DIR%" 2>nul
echo [✓] 目录已创建

:: 5. 复制数据
echo [5/7] 复制数据...
xcopy "%POSTGRES_DATA%" "%NEW_DATA_DIR%\" /E /I /H /Y >nul
if %errorLevel% neq 0 (
    echo [错误] 数据复制失败！
    pause
    exit /b 1
)
echo [✓] 数据已复制

:: 6. 更新配置
echo [6/7] 更新服务配置...
sc config postgresql-x64-14 binPath= "\"%POSTGRES_BIN%\pg_ctl.exe\" runservice -N \"postgresql-x64-14\" -D \"%NEW_DATA_DIR%\" -w"
echo [✓] 配置已更新

:: 7. 启动服务
echo [7/7] 启动服务...
net start postgresql-x64-14
timeout /t 5 >nul
echo [✓] 服务已启动

:: 验证
echo.
echo ==========================================
echo   验证结果
echo ==========================================
echo.

sc query postgresql-x64-14
echo.

"%POSTGRES_BIN%\psql.exe" -U postgres -c "SELECT version();"

echo.
echo ==========================================
echo   ✅ 迁移完成！
echo ==========================================
echo.
echo 备份文件: %BACKUP_DIR%\backup_%TIMESTAMP%.sql
echo 数据目录: %NEW_DATA_DIR%
echo.
pause
