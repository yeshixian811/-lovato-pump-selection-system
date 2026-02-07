@echo off
chcp 65001 >nul
title 洛瓦托智能水泵选型系统 - 一键启动
color 0B

echo.
echo ==========================================
echo   洛瓦托智能水泵选型系统
echo   一键启动程序
echo ==========================================
echo.

:: 检查是否在项目根目录
if not exist "package.json" (
    echo [错误] 未找到 package.json 文件
    echo.
    echo 请确保在项目根目录下运行此脚本
    echo 或先进入项目目录:
    echo   cd lovato-pump-selection
    echo   start.bat
    echo.
    pause
    exit /b 1
)

:: 检查 Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] Node.js 未安装！
    echo.
    echo 请先安装 Node.js:
    echo   1. 访问 https://nodejs.org/
    echo   2. 下载并安装 LTS 版本
    echo   3. 重启命令提示符
    echo.
    pause
    exit /b 1
)

:: 显示 Node.js 版本
echo [✓] Node.js 已安装
node --version

:: 检查 pnpm
where pnpm >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] pnpm 未安装！
    echo.
    echo 请安装 pnpm:
    echo   npm install -g pnpm
    echo.
    pause
    exit /b 1
)

:: 显示 pnpm 版本
echo [✓] pnpm 已安装
pnpm --version

:: 检查依赖
if not exist "node_modules" (
    echo.
    echo [信息] 依赖未安装，正在安装...
    echo 这可能需要几分钟...
    echo.
    pnpm install

    if %errorLevel% neq 0 (
        echo [错误] 依赖安装失败！
        echo.
        echo 请尝试:
        echo   1. 检查网络连接
        echo   2. 清除缓存: pnpm store prune
        echo   3. 重新安装: pnpm install
        echo.
        pause
        exit /b 1
    )

    echo [✓] 依赖安装成功
)

:: 检查 .env 文件
if not exist ".env" (
    echo [错误] .env 配置文件不存在！
    echo.
    echo 请先创建配置文件:
    echo   copy .env.example .env
    echo.
    pause
    exit /b 1
)

echo [✓] 配置文件已找到

:: 检查 PostgreSQL
where psql >nul 2>&1
if %errorLevel% neq 0 (
    echo [警告] PostgreSQL 未安装或未添加到 PATH
    echo.
    echo 如果数据库已安装，请确保已将 PostgreSQL 添加到系统 PATH
    echo.
)

:: 检查 PostgreSQL 服务
echo.
echo [1/2] 检查 PostgreSQL 服务...
sc query postgresql-x64-14 | findstr "RUNNING" >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] PostgreSQL 服务运行中
) else (
    echo [警告] PostgreSQL 服务未运行
    echo 尝试启动服务...

    net start postgresql-x64-14 >nul 2>&1
    if %errorLevel% equ 0 (
        echo [✓] PostgreSQL 服务已启动
    ) else (
        echo [警告] 无法启动 PostgreSQL 服务
        echo.
        echo 请手动检查:
        echo   1. PostgreSQL 是否已安装
        echo   2. 使用服务名称是否正确
        echo   3. 运行: sc query postgresql-x64-14
        echo.
        set /p continue="是否继续启动应用？(Y/N): "
        if /i not "%continue%"=="Y" (
            exit /b 0
        )
    )
)

:: 检查数据库连接
echo.
echo [2/2] 检查数据库连接...
psql -U postgres -d lovato_pump -c "SELECT 1;" >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] 数据库连接成功
) else (
    echo [警告] 数据库连接失败
    echo.
    echo 可能原因:
    echo   1. 数据库 lovato_pump 不存在
    echo   2. 密码不正确
    echo   3. 服务未运行
    echo.
    echo 如需创建数据库，请运行:
    echo   psql -U postgres -c "CREATE DATABASE lovato_pump;"
    echo   psql -U postgres -d lovato_pump < migrations\001_add_membership_tables.sql
    echo.
    set /p continue="是否继续启动应用？(Y/N): "
    if /i not "%continue%"=="Y" (
        exit /b 0
    )
)

:: 启动应用
echo.
echo ==========================================
echo   启动开发服务器
echo ==========================================
echo.
echo 服务器信息:
echo   地址: http://localhost:5000
echo   环境: development
echo   模式: development
echo.
echo 提示:
echo   - 按 Ctrl+C 停止服务器
echo   - 修改代码会自动热更新
echo   - 在浏览器中按 F12 查看控制台
echo.
echo ==========================================
echo.

pnpm run dev

:: 如果服务器异常退出
echo.
echo ==========================================
echo   服务器已停止
echo ==========================================
echo.
echo 如需重新启动，请运行:
echo   start.bat
echo.
pause
