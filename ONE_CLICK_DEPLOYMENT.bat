@echo off
REM 洛瓦托水泵选型系统 - 一键部署脚本
REM 用于本地 Windows 电脑快速部署

echo ========================================
echo   洛瓦托水泵选型系统 - 一键部署
echo ========================================
echo.

REM 设置项目目录
set "PROJECT_DIR=C:\lovato-pump"

REM 设置颜色
color 0A

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [✓] 已获得管理员权限
) else (
    echo [!] 建议以管理员身份运行此脚本
    echo.
)

echo [步骤 1/7] 检查环境...
echo ----------------------------------------
call :check_nodejs
if errorlevel 1 goto :error
call :check_pnpm
call :check_postgres
if errorlevel 1 goto :error
echo.

echo [步骤 2/7] 创建项目目录...
echo ----------------------------------------
if exist "%PROJECT_DIR%" (
    echo [!] 项目目录已存在
    set /p "choice=是否删除并重建？(Y/N): "
    if /i "%choice%"=="Y" (
        echo 正在删除旧目录...
        rmdir /s /q "%PROJECT_DIR%" 2>nul
        timeout /t 2 >nul
    ) else (
        echo 保留现有目录
    )
)

if not exist "%PROJECT_DIR%" (
    echo 正在创建项目目录: %PROJECT_DIR%
    mkdir "%PROJECT_DIR%"
)

cd /d "%PROJECT_DIR%"

REM 创建必要的子目录
if not exist "src\app\selection" mkdir "src\app\selection"
if not exist "src\app\api\pump\match" mkdir "src\app\api\pump\match"
if not exist "migrations" mkdir "migrations"
if not exist "public" mkdir "public"

echo [✓] 项目目录创建完成
echo.

echo [步骤 3/7] 安装项目依赖...
echo ----------------------------------------
call npm init -y
call npm pkg set type="module"
call npm pkg set scripts.dev="next dev --port 5000"
call npm pkg set scripts.build="next build"
call npm pkg set scripts.start="next start --port 5000"

echo 正在安装 Next.js...
call npm install next@latest react@latest react-dom@latest

echo 正在安装 UI 组件...
call npm install lucide-react clsx tailwind-merge

echo 正在安装 TypeScript...
call npm install -D typescript @types/node @types/react @types/react-dom

echo [✓] 依赖安装完成
echo.

echo [步骤 4/7] 配置数据库...
echo ----------------------------------------
set /p "db_host=请输入数据库主机 (默认: localhost): "
if "%db_host%"=="" set "db_host=localhost"

set /p "db_port=请输入数据库端口 (默认: 5432): "
if "%db_port%"=="" set "db_port=5432"

set /p "db_name=请输入数据库名称 (默认: lovato_pump_selection): "
if "%db_name%"=="" set "db_name=lovato_pump_selection"

set /p "db_user=请输入数据库用户名 (默认: postgres): "
if "%db_user%"=="" set "db_user=postgres"

set /p "db_password=请输入数据库密码: "

REM 创建 .env 文件
echo DB_HOST=%db_host%> .env
echo DB_PORT=%db_port%>> .env
echo DB_NAME=%db_name%>> .env
echo DB_USER=%db_user%>> .env
echo DB_PASSWORD=%db_password%>> .env

echo [✓] 数据库配置完成
echo.

echo [步骤 5/7] 初始化数据库...
echo ----------------------------------------
echo 正在创建数据库...
psql -U %db_user% -h %db_host% -p %db_port% -c "CREATE DATABASE %db_name%;" 2>nul
if errorlevel 1 (
    echo [!] 数据库可能已存在，继续执行...
)

echo 正在执行数据库迁移...
if exist "migrations\002_create_pump_tables.sql" (
    psql -U %db_user% -h %db_host% -p %db_port% -d %db_name% -f migrations\002_create_pump_tables.sql
    if errorlevel 1 (
        echo [✗] 数据库表创建失败
        pause
        exit /b 1
    )
) else (
    echo [!] 未找到数据库表结构文件，请手动复制
)

if exist "migrations\003_insert_sample_pumps.sql" (
    psql -U %db_user% -h %db_host% -p %db_port% -d %db_name% -f migrations\003_insert_sample_pumps.sql
    if errorlevel 1 (
        echo [✗] 样本数据插入失败
        pause
        exit /b 1
    )
) else (
    echo [!] 未找到样本数据文件，请手动复制
)

echo [✓] 数据库初始化完成
echo.

echo [步骤 6/7] 复制源代码文件...
echo ----------------------------------------
if exist "src\app\page.tsx" (
    echo [✓] 首页文件已存在
) else (
    echo [!] 首页文件不存在，请手动复制 src\app\page.tsx
)

if exist "src\app\selection\page.tsx" (
    echo [✓] 选型页面已存在
) else (
    echo [!] 选型页面不存在，请手动复制 src\app\selection\page.tsx
)

if exist "src\app\api\pump\match\route.ts" (
    echo [✓] API 接口已存在
) else (
    echo [!] API 接口不存在，请手动复制 src\app\api\pump\match\route.ts
)

echo.
echo [步骤 7/7] 启动应用...
echo ----------------------------------------
echo.
echo ========================================
echo   部署完成！
echo ========================================
echo.
echo 项目目录: %PROJECT_DIR%
echo 访问地址: http://localhost:5000
echo.
echo 正在启动开发服务器...
echo 按 Ctrl+C 停止服务器
echo.

call npm run dev

goto :end

:error
echo.
echo [✗] 部署失败！
echo 请检查错误信息并重试
echo.
pause
exit /b 1

:end
pause
exit /b 0

REM ==================== 函数定义 ====================

:check_nodejs
echo 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [✗] Node.js 未安装！
    echo 请访问 https://nodejs.org 下载安装
    exit /b 1
)
echo [✓] Node.js 已安装
goto :eof

:check_pnpm
echo 检查 pnpm...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo [!] pnpm 未安装，正在安装...
    call npm install -g pnpm
    if errorlevel 1 (
        echo [✗] pnpm 安装失败
        exit /b 1
    )
)
echo [✓] pnpm 已安装
goto :eof

:check_postgres
echo 检查 PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo [✗] PostgreSQL 未安装！
    echo 请访问 https://www.postgresql.org/download/windows/ 下载安装
    echo.
    echo 安装后请将 PostgreSQL bin 目录添加到系统 PATH:
    echo C:\Program Files\PostgreSQL\14\bin
    exit /b 1
)
echo [✓] PostgreSQL 已安装
goto :eof
