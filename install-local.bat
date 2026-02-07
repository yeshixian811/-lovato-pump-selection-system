@echo off
chcp 65001 >nul
title 洛瓦托智能水泵选型系统 - 本地环境自动安装
color 0A

echo ==========================================
echo   洛瓦托智能水泵选型系统
echo   本地环境自动安装程序
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
set NODE_VERSION=24
set POSTGRES_VERSION=14
set DATABASE_NAME=lovato_pump
set DB_USER=postgres
set DB_PASSWORD=postgres

echo 开始安装...
echo.
echo 将安装以下软件：
echo   - Node.js v%NODE_VERSION%
echo   - PostgreSQL v%POSTGRES_VERSION%
echo   - pnpm 包管理器
echo.
pause

:: 阶段 1: 检查系统
echo ==========================================
echo   阶段 1/5: 检查系统环境
echo ==========================================
echo.

echo [1/4] 检查操作系统...
ver
echo [✓] Windows系统

echo.
echo [2/4] 检查磁盘空间...
wmic logicaldisk where "DeviceID='C:'" get FreeSpace,Size | findstr /V "FreeSpace"
echo [✓] 磁盘空间检查完成

echo.
echo [3/4] 检查 Node.js...
where node >nul 2>&1
if %errorLevel% equ 0 (
    node --version
    echo [✓] Node.js 已安装
    set NODE_INSTALLED=1
) else (
    echo [ ] Node.js 未安装
    set NODE_INSTALLED=0
)

echo.
echo [4/4] 检查 PostgreSQL...
where psql >nul 2>&1
if %errorLevel% equ 0 (
    psql --version
    echo [✓] PostgreSQL 已安装
    set POSTGRES_INSTALLED=1
) else (
    echo [ ] PostgreSQL 未安装
    set POSTGRES_INSTALLED=0
)

pause
echo.

:: 阶段 2: 安装 Node.js
if %NODE_INSTALLED%==0 (
    echo ==========================================
    echo   阶段 2/5: 安装 Node.js
    echo ==========================================
    echo.

    echo [1/3] 下载 Node.js...
    echo 请手动下载 Node.js v%NODE_VERSION% LTS:
    echo   https://nodejs.org/
    echo.
    echo 下载完成后，双击 .msi 文件进行安装
    echo.
    pause

    echo [2/3] 验证 Node.js 安装...
    node --version
    if %errorLevel% neq 0 (
        echo [错误] Node.js 安装失败！
        pause
        exit /b 1
    )
    echo [✓] Node.js 安装成功

    echo [3/3] 验证 npm 安装...
    npm --version
    echo [✓] npm 安装成功
    echo.
)

:: 阶段 3: 安装 pnpm
echo ==========================================
echo   阶段 3/5: 安装 pnpm
echo ==========================================
echo.

where pnpm >nul 2>&1
if %errorLevel% neq 0 (
    echo [1/2] 使用 npm 安装 pnpm...
    call npm install -g pnpm
    if %errorLevel% neq 0 (
        echo [错误] pnpm 安装失败！
        pause
        exit /b 1
    )
    echo [✓] pnpm 安装成功

    echo [2/2] 验证 pnpm 版本...
    pnpm --version
) else (
    echo [✓] pnpm 已安装
    pnpm --version
)

echo.
pause

:: 阶段 4: 安装 PostgreSQL
if %POSTGRES_INSTALLED%==0 (
    echo ==========================================
    echo   阶段 4/5: 安装 PostgreSQL
    echo ==========================================
    echo.

    echo [1/4] PostgreSQL 安装说明...
    echo 请手动下载 PostgreSQL v%POSTGRES_VERSION%:
    echo   https://www.postgresql.org/download/windows/
    echo.
    echo 安装设置:
    echo   - 密码: %DB_PASSWORD%
    echo   - 端口: 5432
    echo   - Locale: C
    echo.
    pause

    echo [2/4] 验证 PostgreSQL 安装...
    psql --version
    if %errorLevel% neq 0 (
        echo [错误] PostgreSQL 安装失败！
        echo 请确保:
        echo   1. 已正确安装 PostgreSQL
        echo   2. 已将 PostgreSQL 添加到系统 PATH
        echo   3. 已重启命令提示符
        pause
        exit /b 1
    )
    echo [✓] PostgreSQL 安装成功

    echo [3/4] 启动 PostgreSQL 服务...
    net start postgresql-x64-%POSTGRES_VERSION% >nul 2>&1
    if %errorLevel% neq 0 (
        echo [警告] 服务启动失败或已在运行
    ) else (
        echo [✓] PostgreSQL 服务已启动
    )

    echo [4/4] 验证服务状态...
    sc query postgresql-x64-%POSTGRES_VERSION%
    echo.
)

pause

:: 阶段 5: 配置数据库
echo ==========================================
echo   阶段 5/5: 配置数据库
echo ==========================================
echo.

echo [1/6] 创建数据库...
psql -U %DB_USER% -c "CREATE DATABASE %DATABASE_NAME%;" 2>nul
if %errorLevel% equ 0 (
    echo [✓] 数据库 %DATABASE_NAME% 创建成功
) else (
    echo [信息] 数据库可能已存在，继续...
)

echo.
echo [2/6] 安装 UUID 扩展...
psql -U %DB_USER% -d %DATABASE_NAME% -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" >nul
echo [✓] UUID 扩展已安装

echo.
echo [3/6] 检查迁移文件...
if exist "migrations\001_add_membership_tables.sql" (
    echo [✓] 迁移文件存在
) else (
    echo [错误] 迁移文件不存在！
    echo 请确保在项目根目录下运行此脚本
    pause
    exit /b 1
)

echo.
echo [4/6] 运行数据库迁移...
psql -U %DB_USER% -d %DATABASE_NAME% < migrations\001_add_membership_tables.sql
if %errorLevel% equ 0 (
    echo [✓] 数据库迁移成功
) else (
    echo [错误] 数据库迁移失败！
    pause
    exit /b 1
)

echo.
echo [5/6] 创建 .env 文件...
if not exist ".env.example" (
    echo [错误] .env.example 文件不存在！
    pause
    exit /b 1
)

if exist ".env" (
    echo [信息] .env 文件已存在，备份中...
    copy .env .env.backup.%date:~0,4%%date:~5,2%%date:~8,2% >nul
)

copy .env.example .env >nul
echo [✓] .env 文件已创建

echo.
echo [6/6] 验证数据库配置...
psql -U %DB_USER% -d %DATABASE_NAME% -c "\dt" | findstr /C:"users" >nul
if %errorLevel% equ 0 (
    echo [✓] 数据库配置成功
    echo.
    echo 数据库表列表:
    psql -U %DB_USER% -d %DATABASE_NAME% -c "\dt"
) else (
    echo [警告] 无法验证表列表
)

echo.
pause

:: 安装项目依赖
echo ==========================================
echo   阶段 6: 安装项目依赖
echo ==========================================
echo.

echo [1/2] 检查 package.json...
if not exist "package.json" (
    echo [错误] package.json 不存在！
    echo 请确保在项目根目录下运行此脚本
    pause
    exit /b 1
)
echo [✓] package.json 存在

echo.
echo [2/2] 安装依赖...
echo 正在安装依赖，这可能需要几分钟...
pnpm install
if %errorLevel% neq 0 (
    echo [错误] 依赖安装失败！
    pause
    exit /b 1
)
echo [✓] 依赖安装成功

echo.
echo ==========================================
echo   安装完成！
echo ==========================================
echo.
echo 安装摘要:
echo   [✓] Node.js: 已安装
echo   [✓] pnpm: 已安装
echo   [✓] PostgreSQL: 已安装
echo   [✓] 数据库: %DATABASE_NAME%
echo   [✓] 数据库迁移: 已完成
echo   [✓] 项目依赖: 已安装
echo.
echo 数据库连接信息:
echo   主机: localhost
echo   端口: 5432
echo   数据库: %DATABASE_NAME%
echo   用户: %DB_USER%
echo   密码: %DB_PASSWORD%
echo.
echo 连接字符串:
echo   postgresql://%DB_USER%:%DB_PASSWORD%@localhost:5432/%DATABASE_NAME%
echo.
echo 下一步:
echo   1. 启动开发服务器: pnpm run dev
echo   2. 打开浏览器: http://localhost:5000
echo   3. 开始使用系统
echo.

set /p start="是否现在启动开发服务器？(Y/N): "
if /i "%start%"=="Y" (
    echo.
    echo 启动开发服务器...
    pnpm run dev
) else (
    echo.
    echo 稍后可以手动启动:
    echo   pnpm run dev
)

echo.
pause
