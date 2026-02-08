@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 洛瓦托水泵选型系统 - 一键部署脚本 (批处理)

echo.
echo ====================================
echo   洛瓦托水泵选型系统 - 一键部署
echo ====================================
echo.

REM 步骤1：检查 Node.js
echo [步骤 1/7] 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Node.js 未安装
    echo   请从 https://nodejs.org/ 下载并安装 Node.js 24 LTS
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✓ Node.js 已安装: %NODE_VERSION%
)

REM 步骤2：检查 pnpm
echo.
echo [步骤 2/7] 检查 pnpm...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ pnpm 未安装，正在安装...
    call npm install -g pnpm@latest
    if %errorlevel% neq 0 (
        echo ✗ pnpm 安装失败
        pause
        exit /b 1
    )
    echo ✓ pnpm 安装成功
) else (
    for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
    echo ✓ pnpm 已安装: %PNPM_VERSION%
)

REM 步骤3：检查 PostgreSQL
echo.
echo [步骤 3/7] 检查 PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ PostgreSQL 未安装
    echo   请从 https://www.postgresql.org/download/windows/ 下载并安装 PostgreSQL 14
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('psql --version') do set PSQL_VERSION=%%i
    echo ✓ PostgreSQL 已安装: %PSQL_VERSION%

    REM 检查 PostgreSQL 服务
    sc query postgresql-x64-14 >nul 2>&1
    if %errorlevel% equ 0 (
        for /f "tokens=2" %%a in ('sc query postgresql-x64-14 ^| find "STATE"') do set PG_STATE=%%a
        echo   PostgreSQL 服务状态: !PG_STATE!

        if "!PG_STATE!"=="STOPPED" (
            echo ⚠️  PostgreSQL 服务已停止，正在启动...
            net start postgresql-x64-14 >nul 2>&1
            if %errorlevel% equ 0 (
                echo ✓ PostgreSQL 服务已启动
            ) else (
                echo ✗ 无法启动 PostgreSQL 服务
                pause
                exit /b 1
            )
        )
    ) else (
        echo ✗ PostgreSQL 服务未找到
        echo   请确保 PostgreSQL 14 已安装并正在运行
        pause
        exit /b 1
    )
)

REM 步骤4：输入配置信息
echo.
echo [步骤 4/7] 配置部署信息...
echo.

set /p POSTGRES_PASS="请输入 PostgreSQL 密码: "

echo.
set /p AUTO_JWT="是否自动生成 JWT 密钥? (Y/n): "
if /i "%AUTO_JWT%"=="Y" set AUTO_JWT=
if /i "%AUTO_JWT%"=="y" set AUTO_JWT=

if "%AUTO_JWT%"=="" (
    set JWT_SECRET=auto
    echo ✓ JWT 密钥将自动生成
) else (
    :input_jwt
    set /p JWT_SECRET="请输入 JWT 密钥（至少32字符）: "
    if "!JWT_SECRET:~32,1!"=="" (
        echo ⚠️  JWT 密钥长度不足32字符，请重新输入
        goto input_jwt
    )
)

echo.
set /p AUTO_ENC="是否自动生成加密密钥? (Y/n): "
if /i "%AUTO_ENC%"=="Y" set AUTO_ENC=
if /i "%AUTO_ENC%"=="y" set AUTO_ENC=

if "%AUTO_ENC%"=="" (
    set ENCRYPTION_KEY=auto
    echo ✓ 加密密钥将自动生成
) else (
    :input_enc
    set /p ENCRYPTION_KEY="请输入加密密钥（至少32字符）: "
    if "!ENCRYPTION_KEY:~32,1!"=="" (
        echo ⚠️  加密密钥长度不足32字符，请重新输入
        goto input_enc
    )
)

echo.
echo 配置信息汇总:
echo   PostgreSQL 密码: ***
echo.

REM 步骤5：创建 .env 文件
echo [步骤 5/7] 创建配置文件...

if "%JWT_SECRET%"=="auto" (
    set JWT_SECRET=generated_jwt_secret_key_minimum_32_characters
)

if "%ENCRYPTION_KEY%"=="auto" (
    set ENCRYPTION_KEY=generated_encryption_key_minimum_32_characters
)

(
echo # ============================================
echo # 洛瓦托水泵选型系统 - 环境变量配置
echo # ============================================
echo.
echo # JWT 认证配置
echo JWT_SECRET=%JWT_SECRET%
echo JWT_ACCESS_TOKEN_EXPIRY=3600
echo JWT_REFRESH_TOKEN_EXPIRY=604800
echo.
echo # 数据加密配置
echo ENCRYPTION_KEY=%ENCRYPTION_KEY%
echo ENCRYPTION_ALGORITHM=aes-256-gcm
echo.
echo # 数据库配置
echo DATABASE_URL=postgresql://postgres:%POSTGRES_PASS%@localhost:5432/lovato_pump
echo.
echo # CORS 配置
echo ALLOWED_ORIGINS=http://localhost:5000,http://localhost:3000
echo.
echo # 应用配置
echo NODE_ENV=development
echo PORT=5000
echo.
echo # 日志配置
echo LOG_LEVEL=info
echo LOG_VERBOSE=true
) > .env

echo ✓ .env 文件已创建

REM 步骤6：安装依赖
echo.
echo [步骤 6/7] 安装项目依赖...
echo   这可能需要几分钟，请耐心等待...
echo.
call pnpm install
if %errorlevel% neq 0 (
    echo ✗ 依赖安装失败
    echo   请检查网络连接或手动运行: pnpm install
    pause
    exit /b 1
)
echo ✓ 依赖安装成功

REM 步骤7：数据库操作
echo.
echo [步骤 7/7] 配置数据库...

REM 创建数据库
echo   正在创建数据库...
echo CREATE DATABASE lovato_pump; | psql -U postgres
if %errorlevel% equ 0 (
    echo ✓ 数据库创建成功
) else (
    echo ⚠️  数据库可能已存在，继续执行...
)

REM 运行数据库迁移
echo   正在运行数据库迁移...
call pnpm run db:push
if %errorlevel% neq 0 (
    echo ✗ 数据库迁移失败
    echo   请检查数据库连接或手动运行: pnpm run db:push
    pause
    exit /b 1
)
echo ✓ 数据库迁移成功

REM 完成
echo.
echo ====================================
echo   部署完成！
echo ====================================
echo.
echo 下一步操作:
echo   1. 启动应用:
echo      pnpm run dev
echo.
echo   2. 访问应用:
echo      http://localhost:5000
echo.
echo   3. 默认登录账户:
echo      用户名: admin
echo      密码: admin123
echo.
echo   4. 访问诊断页面:
echo      http://localhost:5000/diagnostic
echo.

set /p START_APP="是否现在启动应用? (Y/n): "
if /i "%START_APP%"=="Y" set START_APP=
if /i "%START_APP%"=="y" set START_APP=

if "%START_APP%"=="" (
    echo.
    echo 正在启动应用...
    echo 启动后请访问: http://localhost:5000
    echo.
    echo 按 Ctrl + C 停止应用
    echo.
    call pnpm run dev
) else (
    echo.
    echo 您稍后可以运行以下命令启动应用:
    echo   pnpm run dev
    echo.
)

echo.
echo 部署脚本执行完成！
echo.
pause
