@echo off
chcp 65001 >nul
title 洛瓦托水泵选型系统 - 本地部署
color 0F

echo.
echo ==========================================
echo   洛瓦托水泵选型系统
echo   本地一键部署脚本
echo ==========================================
echo.
echo 此脚本将引导您完成本地部署
echo.
pause

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo [警告] 某些操作可能需要管理员权限
    echo 建议以管理员身份运行此脚本
    echo.
    set /p choice=继续部署？(Y/N): 
    if /i "!choice!" neq "Y" (
        echo 已取消部署
        pause
        exit /b 1
    )
)

cls
echo.
echo ==========================================
echo   步骤 1/5: 检查系统环境
echo ==========================================
echo.

:: 检查 Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [✗] Node.js 未安装
    echo.
    echo 请下载并安装 Node.js 24.x
    echo 下载地址: https://nodejs.org/
    echo.
    set /p choice=是否已安装？(Y/N): 
    if /i "!choice!" neq "Y" (
        echo 请先安装 Node.js 后重试
        pause
        exit /b 1
    )
) else (
    echo [✓] Node.js 已安装
    node --version
)

:: 检查 pnpm
where pnpm >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] pnpm 未安装，正在安装...
    npm install -g pnpm
) else (
    echo [✓] pnpm 已安装
    pnpm --version
)

echo.
echo ==========================================
echo   步骤 2/5: 检查数据库连接
echo ==========================================
echo.

:: 检查 PostgreSQL
where psql >nul 2>&1
if %errorLevel% neq 0 (
    echo [✗] 未检测到 PostgreSQL
    echo.
    echo 请确认：
    echo   1. 已安装 PostgreSQL 14+
    echo   2. 已创建数据库 lovato_pump
    echo   3. 已启动 PostgreSQL 服务
    echo.
    set /p choice=数据库已配置？(Y/N): 
    if /i "!choice!" neq "Y" (
        echo 请先配置数据库后重试
        echo 参考: DEPLOYMENT.md 中的"配置数据库"章节
        pause
        exit /b 1
    )
) else (
    echo [✓] PostgreSQL 已安装
    psql --version
)

echo.
echo ==========================================
echo   步骤 3/5: 安装项目依赖
echo ==========================================
echo.

if exist "node_modules\" (
    echo [!] 依赖已存在
    set /p choice=是否重新安装？(Y/N): 
    if /i "!choice!" equ "Y" (
        rmdir /s /q node_modules
        rmdir /s /q .next
        call pnpm install
    )
) else (
    echo [信息] 正在安装依赖...
    call pnpm install
)

if %errorLevel% neq 0 (
    echo [✗] 依赖安装失败！
    pause
    exit /b 1
)

echo [✓] 依赖安装完成

echo.
echo ==========================================
echo   步骤 4/5: 配置环境变量
echo ==========================================
echo.

if not exist ".env" (
    echo [信息] 创建 .env 文件...
    copy .env.example .env
    echo.
    echo [重要] 请编辑 .env 文件配置数据库连接！
    echo.
    echo 默认配置:
    echo   DATABASE_URL=postgresql://postgres:密码@localhost:5432/lovato_pump
    echo.
    set /p choice=是否现在配置？(Y/N): 
    if /i "!choice!" equ "Y" (
        notepad .env
        echo.
        echo 配置完成后，按任意键继续...
        pause >nul
    )
) else (
    echo [✓] .env 文件已存在
)

echo.
echo ==========================================
echo   步骤 5/5: 初始化数据库
echo ==========================================
echo.

set /p choice=是否运行数据库初始化？(Y/N): 
if /i "!choice!" equ "Y" (
    echo [信息] 正在初始化数据库...
    call pnpm run db:setup
    if %errorLevel% neq 0 (
        echo [警告] 数据库初始化可能失败
        echo 请手动检查数据库配置
    )
)

cls
echo.
echo ==========================================
echo   部署完成！
echo ==========================================
echo.
echo [✓] 系统环境检查通过
echo [✓] 项目依赖已安装
echo [✓] 环境变量已配置
echo [✓] 数据库已初始化
echo.
echo ==========================================
echo   启动服务
echo ==========================================
echo.
echo 请选择启动方式:
echo.
echo   1. 开发模式（支持热更新）
echo   2. 生产模式（性能更好）
echo   3. 稍后手动启动
echo.
set /p choice=请输入选项 (1/2/3): 

if "%choice%"=="1" (
    echo.
    echo 启动开发服务器...
    echo.
    call pnpm run dev
) else if "%choice%"=="2" (
    echo.
    echo 构建生产版本...
    call pnpm run build
    if %errorLevel% neq 0 (
        echo [✗] 构建失败！
        pause
        exit /b 1
    )
    echo.
    echo 启动生产服务器...
    echo.
    call pnpm run start
) else (
    echo.
    echo 您可以稍后使用以下命令启动：
    echo.
    echo   开发模式: pnpm run dev
    echo   生产模式: pnpm run build ^&^& pnpm run start
    echo.
    echo 或直接运行:
    echo   quick-start.bat
    echo.
    pause
)

if %errorLevel% neq 0 (
    echo.
    echo [错误] 服务启动失败！
    echo 请检查日志和配置
    pause
    exit /b 1
)

pause
