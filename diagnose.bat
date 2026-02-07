@echo off
chcp 65001 >nul
title 环境诊断工具
color 0E

echo.
echo ==========================================
echo   环境诊断工具
echo   洛瓦托智能水泵选型系统
echo ==========================================
echo.

:: 1. 检查操作系统
echo [检查 1/8] 操作系统信息
echo ----------------------------------------
ver
echo.

:: 2. 检查 Node.js
echo [检查 2/8] Node.js
echo ----------------------------------------
where node >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] Node.js 已安装
    node --version
    echo   位置: where node
) else (
    echo [✗] Node.js 未安装
    echo   请访问 https://nodejs.org/ 安装
)
echo.

:: 3. 检查 npm
echo [检查 3/8] npm
echo ----------------------------------------
where npm >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] npm 已安装
    npm --version
) else (
    echo [✗] npm 未安装
)
echo.

:: 4. 检查 pnpm
echo [检查 4/8] pnpm
echo ----------------------------------------
where pnpm >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] pnpm 已安装
    pnpm --version
) else (
    echo [✗] pnpm 未安装
    echo   请运行: npm install -g pnpm
)
echo.

:: 5. 检查 PostgreSQL
echo [检查 5/8] PostgreSQL
echo ----------------------------------------
where psql >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] PostgreSQL 已安装
    psql --version
) else (
    echo [✗] PostgreSQL 未安装或未添加到 PATH
    echo   请访问 https://www.postgresql.org/download/windows/
)
echo.

:: 6. 检查 PostgreSQL 服务
echo [检查 6/8] PostgreSQL 服务
echo ----------------------------------------
sc query postgresql-x64-14 | findstr "RUNNING" >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] PostgreSQL 服务运行中
    sc query postgresql-x64-14 | findstr "STATE"
) else (
    echo [✗] PostgreSQL 服务未运行
    echo   请运行: net start postgresql-x64-14
)
echo.

:: 7. 检查数据库连接
echo [检查 7/8] 数据库连接
echo ----------------------------------------
psql -U postgres -d lovato_pump -c "SELECT 1;" >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] 数据库连接成功
    psql -U postgres -d lovato_pump -c "SELECT current_database(), current_user, version();" 2>nul
) else (
    echo [✗] 数据库连接失败
    echo.
    echo 可能原因:
    echo   1. 数据库 lovato_pump 不存在
    echo   2. 密码不正确（应为 postgres）
    echo   3. PostgreSQL 服务未运行
    echo.
    echo 解决方案:
    echo   psql -U postgres -c "CREATE DATABASE lovato_pump;"
    echo   psql -U postgres -d lovato_pump < migrations\001_add_membership_tables.sql
)
echo.

:: 8. 检查项目文件
echo [检查 8/8] 项目文件
echo ----------------------------------------
if exist "package.json" (
    echo [✓] package.json 存在
) else (
    echo [✗] package.json 不存在
    echo   请确保在项目根目录下
)

if exist ".env" (
    echo [✓] .env 配置文件存在
) else (
    echo [✗] .env 配置文件不存在
    echo   请运行: copy .env.example .env
)

if exist "node_modules" (
    echo [✓] node_modules 依赖已安装
) else (
    echo [✗] node_modules 依赖未安装
    echo   请运行: pnpm install
)

if exist "migrations\001_add_membership_tables.sql" (
    echo [✓] 数据库迁移文件存在
) else (
    echo [✗] 数据库迁移文件不存在
)
echo.

:: 网络检查
echo [网络检查] 端口占用
echo ----------------------------------------
netstat -ano | findstr ":5000" >nul 2>&1
if %errorLevel% equ 0 (
    echo [⚠] 端口 5000 已被占用
    echo   占用进程:
    netstat -ano | findstr ":5000"
) else (
    echo [✓] 端口 5000 可用
)
echo.

:: 磁盘空间
echo [系统信息] 磁盘空间
echo ----------------------------------------
wmic logicaldisk where "DeviceID='C:'" get DeviceID,FreeSpace,Size /format:list 2>nul | findstr "="
echo.

:: 内存信息
echo [系统信息] 内存
echo ----------------------------------------
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /format:list 2>nul | findstr "="
echo.

:: 诊断总结
echo ==========================================
echo   诊断总结
echo ==========================================
echo.

set /a SCORE=0

:: 统计
where node >nul 2>&1 && set /a SCORE+=1
where pnpm >nul 2>&1 && set /a SCORE+=1
where psql >nul 2>&1 && set /a SCORE+=1
sc query postgresql-x64-14 | findstr "RUNNING" >nul 2>&1 && set /a SCORE+=1
psql -U postgres -d lovato_pump -c "SELECT 1;" >nul 2>&1 && set /a SCORE+=1
exist "package.json" && set /a SCORE+=1
exist ".env" && set /a SCORE+=1
exist "node_modules" && set /a SCORE+=1

echo 完成度: %SCORE% / 8

if %SCORE%==8 (
    echo 状态: ✅ 完美！所有检查通过
    echo.
    echo 您可以立即启动应用:
    echo   start.bat
) else if %SCORE% ge 6 (
    echo 状态: ✅ 基本就绪
    echo.
    echo 建议操作:
    if not exist "node_modules" echo   1. 运行: pnpm install
    if not exist ".env" echo   2. 运行: copy .env.example .env
    if %SCORE% lss 8 echo   3. 根据上述提示修复未完成的项
    echo   4. 运行: start.bat
) else if %SCORE% ge 4 (
    echo 状态: ⚠️ 需要配置
    echo.
    echo 请完成以下安装:
    where node >nul 2>&1 || echo   1. 安装 Node.js (https://nodejs.org/)
    where pnpm >nul 2>&1 || echo   2. 安装 pnpm (npm install -g pnpm)
    where psql >nul 2>&1 || echo   3. 安装 PostgreSQL (https://www.postgresql.org/download/windows/)
    echo   4. 运行此脚本重新检查
) else (
    echo 状态: ❌ 需要完整安装
    echo.
    echo 请参考完整安装指南:
    echo   WINDOWS_INSTALLATION_GUIDE.md
    echo.
    echo 或运行自动安装脚本:
    echo   install-local.bat
)

echo.
echo ==========================================
echo.

set /p action="选择操作 (1=启动, 2=重新检查, 3=退出): "

if "%action%"=="1" (
    if exist "start.bat" (
        start.bat
    ) else (
        echo [错误] start.bat 不存在
        pause
    )
) else if "%action%"=="2" (
    cls
    %0
)

echo.
