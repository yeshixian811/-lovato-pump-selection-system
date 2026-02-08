@echo off
chcp 65001 >nul
title 洛瓦托水泵选型系统 - 快速启动
color 0A

echo.
echo ==========================================
echo   洛瓦托水泵选型系统
echo   快速启动脚本
echo ==========================================
echo.

:: 检查 Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 未检测到 Node.js！
    echo 请先安装 Node.js 24.x: https://nodejs.org/
    pause
    exit /b 1
)

node --version
echo.

:: 检查 pnpm
where pnpm >nul 2>&1
if %errorLevel% neq 0 (
    echo [警告] 未检测到 pnpm，正在安装...
    npm install -g pnpm
)

pnpm --version
echo.

:: 检查依赖
if not exist "node_modules\" (
    echo [信息] 正在安装依赖...
    call pnpm install
    if %errorLevel% neq 0 (
        echo [错误] 依赖安装失败！
        pause
        exit /b 1
    )
    echo.
)

:: 检查端口 5000
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
if %errorLevel% equ 0 (
    echo [警告] 端口 5000 已被占用！
    echo.
    set /p choice=是否继续启动？(Y/N): 
    if /i "!choice!" neq "Y" (
        echo 已取消启动
        pause
        exit /b 0
    )
)

:: 启动服务
echo.
echo ==========================================
echo   正在启动服务...
echo ==========================================
echo.
echo 访问地址: http://localhost:5000
echo 按 Ctrl+C 停止服务
echo.

call pnpm run dev

if %errorLevel% neq 0 (
    echo.
    echo [错误] 服务启动失败！
    pause
    exit /b 1
)

pause
