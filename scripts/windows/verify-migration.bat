@echo off
chcp 65001 >nul
title 迁移后验证脚本 - PostgreSQL J盘迁移
color 0A

echo ==========================================
echo   PostgreSQL 迁移后验证脚本
echo   验证 J 盘迁移结果
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
set NEW_DATA_DIR=J:\postgresql\data
set BACKUP_DIR=J:\postgresql\backups
set LOG_FILE=%BACKUP_DIR%\migration_verification.log
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo 验证开始时间: %date% %time%
echo 日志文件: %LOG_FILE%
echo.

:: 创建日志文件
echo ========================================== > "%LOG_FILE%"
echo PostgreSQL 迁移验证日志 >> "%LOG_FILE%"
echo 验证时间: %date% %time% >> "%LOG_FILE%"
echo ========================================== >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

:: 验证结果统计
set PASS_COUNT=0
set FAIL_COUNT=0

:: 函数：记录通过
:record_pass
set /a PASS_COUNT+=1
echo [✓] %~1
echo [✓] %~1 >> "%LOG_FILE%"
goto :eof

:: 函数：记录失败
:record_fail
set /a FAIL_COUNT+=1
echo [✗] %~1
echo [✗] %~1 >> "%LOG_FILE%"
goto :eof

:: 函数：记录信息
:record_info
echo [ℹ] %~1
echo [ℹ] %~1 >> "%LOG_FILE%"
goto :eof

:: 1. 检查服务状态
echo ==========================================
echo   验证 1/8: PostgreSQL 服务状态
echo ==========================================
echo.

sc query postgresql-x64-14 | findstr "RUNNING" >nul
if %errorLevel% equ 0 (
    call :record_pass "PostgreSQL 服务正在运行"
    sc query postgresql-x64-14 >> "%LOG_FILE%"
) else (
    call :record_fail "PostgreSQL 服务未运行"
    sc query postgresql-x64-14 >> "%LOG_FILE%"
)

echo.

:: 2. 检查数据目录
echo ==========================================
echo   验证 2/8: 数据目录
echo ==========================================
echo.

if exist "%NEW_DATA_DIR%\PG_VERSION" (
    call :record_pass "数据目录存在: %NEW_DATA_DIR%"
    dir "%NEW_DATA_DIR%" >> "%LOG_FILE%"
    
    :: 检查数据目录内容
    for %%f in (base global pg_wal postgresql.conf) do (
        if exist "%NEW_DATA_DIR%\%%f" (
            echo   - %%f: 存在 >> "%LOG_FILE%"
        ) else (
            call :record_fail "缺少目录或文件: %%f"
        )
    )
) else (
    call :record_fail "数据目录不存在: %NEW_DATA_DIR%"
)

echo.

:: 3. 检查服务配置
echo ==========================================
echo   验证 3/8: 服务配置
echo ==========================================
echo.

:: 获取当前服务配置
for /f "tokens=1,2,*" %%a in ('sc qc postgresql-x64-14 ^| findstr "BINARY_PATH_NAME"') do (
    echo %%c | findstr "J:\\postgresql\\data" >nul
    if !errorLevel! equ 0 (
        call :record_pass "服务配置指向 J 盘"
    ) else (
        call :record_fail "服务配置未指向 J 盘"
    )
)

echo %%c >> "%LOG_FILE%"
echo.

:: 4. 测试数据库连接
echo ==========================================
echo   验证 4/8: 数据库连接
echo ==========================================
echo.

"%POSTGRES_BIN%\psql.exe" -U postgres -c "SELECT version();" >nul 2>&1
if %errorLevel% equ 0 (
    call :record_pass "数据库连接正常"
    "%POSTGRES_BIN%\psql.exe" -U postgres -c "SELECT version();" >> "%LOG_FILE%"
) else (
    call :record_fail "数据库连接失败"
)

echo.

:: 5. 验证数据库存在
echo ==========================================
echo   验证 5/8: 数据库完整性
echo ==========================================
echo.

"%POSTGRES_BIN%\psql.exe" -U postgres -l | findstr "lovato_pump" >nul
if %errorLevel% equ 0 (
    call :record_pass "数据库 lovato_pump 存在"
    
    :: 检查表数量
    for /f %%i in ('"%POSTGRES_BIN%\psql.exe" -U postgres -d lovato_pump -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"') do (
        set TABLE_COUNT=%%i
    )
    call :record_info "表数量: !TABLE_COUNT!"
) else (
    call :record_fail "数据库 lovato_pump 不存在"
)

echo.

:: 6. 检查备份文件
echo ==========================================
echo   验证 6/8: 备份文件
echo ==========================================
echo.

if exist "%BACKUP_DIR%\*.sql" (
    call :record_pass "备份文件存在"
    dir "%BACKUP_DIR%\*.sql" >> "%LOG_FILE%"
) else (
    call :record_info "备份文件不存在（可能已清理）"
)

echo.

:: 7. 检查数据文件大小
echo ==========================================
echo   验证 7/8: 数据文件大小
echo ==========================================
echo.

if exist "%NEW_DATA_DIR%\base" (
    for /f %%a in ('dir "%NEW_DATA_DIR%" /s /-c ^| findstr "个文件"') do (
        set DATA_SIZE=%%a
    )
    call :record_info "数据目录总大小: %DATA_SIZE%"
    dir "%NEW_DATA_DIR%" /s >> "%LOG_FILE%"
) else (
    call :record_fail "无法计算数据目录大小"
)

echo.

:: 8. 执行完整测试查询
echo ==========================================
echo   验证 8/8: 数据查询测试
echo ==========================================
echo.

"%POSTGRES_BIN%\psql.exe" -U postgres -d lovato_pump -c "\dt" >nul 2>&1
if %errorLevel% equ 0 (
    call :record_pass "数据查询测试通过"
    "%POSTGRES_BIN%\psql.exe" -U postgres -d lovato_pump -c "\dt" >> "%LOG_FILE%"
) else (
    call :record_fail "数据查询测试失败"
)

echo.

:: 生成验证报告
echo ==========================================
echo   验证报告
echo ==========================================
echo.

echo 验证时间: %date% %time%
echo.
echo 通过项: %PASS_COUNT%
echo 失败项: %FAIL_COUNT%
echo.

echo 验证结果:
if %FAIL_COUNT% equ 0 (
    echo [✓] 所有验证通过！迁移成功完成。
    echo.
    echo 下一步:
    echo   1. 重启应用程序
    echo   2. 测试应用程序功能
    echo   3. 监控系统性能
    echo   4. 清理旧数据目录（可选）
) else (
    echo [✗] 发现 %FAIL_COUNT% 个问题，需要处理。
    echo.
    echo 建议操作:
    echo   1. 查看日志文件: %LOG_FILE%
    echo   2. 检查失败项
    echo   3. 必要时执行回滚
)

echo.
echo ==========================================
echo   详细日志
echo ==========================================
type "%LOG_FILE%"
echo.
echo ==========================================

:: 保存验证结果
echo. >> "%LOG_FILE%"
echo ========================================== >> "%LOG_FILE%"
echo 验证结果统计 >> "%LOG_FILE%"
echo 通过项: %PASS_COUNT% >> "%LOG_FILE%"
echo 失败项: %FAIL_COUNT% >> "%LOG_FILE%"
echo 验证完成时间: %date% %time% >> "%LOG_FILE%"
echo ========================================== >> "%LOG_FILE%"

echo.
echo 验证完成！
echo 日志已保存到: %LOG_FILE%
echo.
pause
