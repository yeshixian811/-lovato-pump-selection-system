@echo off
chcp 65001 >nul
title 启动洛瓦托智能水泵选型系统
color 0B

echo ==========================================
echo   启动洛瓦托智能水泵选型系统
echo ==========================================
echo.

:: 检查 Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] Node.js 未安装！
    echo 请先运行 install-local.bat 安装环境
    pause
    exit /b 1
)

:: 检查 pnpm
where pnpm >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] pnpm 未安装！
    echo 请先运行 install-local.bat 安装环境
    pause
    exit /b 1
)

:: 检查依赖
if not exist "node_modules" (
    echo [信息] 依赖未安装，正在安装...
    pnpm install
)

:: 检查 .env
if not exist ".env" (
    echo [错误] .env 文件不存在！
    echo 请先运行 install-local.bat 配置环境
    pause
    exit /b 1
)

echo [1/2] 检查 PostgreSQL 服务...
sc query postgresql-x64-14 | findstr "RUNNING" >nul 2>&1
if %errorLevel% neq 0 (
    echo [警告] PostgreSQL 服务未运行
    echo 尝试启动服务...
    net start postgresql-x64-14
    if %errorLevel% neq 0 (
        echo [错误] PostgreSQL 服务启动失败！
        echo 请手动启动 PostgreSQL 服务
        pause
        exit /b 1
    )
)
echo [✓] PostgreSQL 服务运行中

echo.
echo [2/2] 启动开发服务器...
echo.
echo 服务器地址: http://localhost:5000
echo 按 Ctrl+C 停止服务器
echo.

pnpm run dev

pause
