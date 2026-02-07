@echo off
chcp 65001 >nul
title 回滚PostgreSQL迁移
color 0C

echo ==========================================
echo   回滚PostgreSQL迁移
echo   恢复到原始配置
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
set ORIGINAL_DATA_DIR=C:\Program Files\PostgreSQL\14\data
set NEW_DATA_DIR=J:\postgresql\data
set BACKUP_DIR=J:\postgresql\backups

echo 警告：此操作将回滚到原始数据目录
echo 原始目录: %ORIGINAL_DATA_DIR%
echo 当前目录: %NEW_DATA_DIR%
echo.
pause

:: 确认
echo 请确认是否继续回滚操作？
echo 如果继续，PostgreSQL将恢复到原始数据目录
echo.
set /p confirm="继续回滚？(YES/NO): "
if /i not "%confirm%"=="YES" (
    echo 操作已取消
    pause
    exit /b 0
)

echo.

:: 1. 停止服务
echo [1/5] 停止PostgreSQL服务...
net stop postgresql-x64-14
timeout /t 3 >nul
echo [✓] 服务已停止

:: 2. 恢复原始配置
echo [2/5] 恢复原始服务配置...
sc config postgresql-x64-14 binPath= "\"%POSTGRES_BIN%\pg_ctl.exe\" runservice -N \"postgresql-x64-14\" -D \"%ORIGINAL_DATA_DIR%\" -w"
echo [✓] 配置已恢复

:: 3. 启动服务
echo [3/5] 启动PostgreSQL服务...
net start postgresql-x64-14
timeout /t 5 >nul
echo [✓] 服务已启动

:: 4. 验证
echo [4/5] 验证服务状态...
sc query postgresql-x64-14
echo.

"%POSTGRES_BIN%\psql.exe" -U postgres -c "SELECT version();"

echo [✓] 服务运行正常

:: 5. 显示回滚信息
echo [5/5] 显示回滚信息...
echo.
echo ==========================================
echo   ✅ 回滚完成！
echo ==========================================
echo.
echo 当前数据目录: %ORIGINAL_DATA_DIR%
echo.
echo 迁移数据仍保存在: %NEW_DATA_DIR%
echo 如果确认一切正常，可以手动删除此目录
echo.
set /p cleanup="是否删除迁移数据？(Y/N): "
if /i "%cleanup%"=="Y" (
    echo.
    echo 正在删除迁移数据...
    rmdir /s /q "%NEW_DATA_DIR%"
    echo [✓] 迁移数据已删除
) else (
    echo 迁移数据保留在: %NEW_DATA_DIR%
)

echo.
pause
