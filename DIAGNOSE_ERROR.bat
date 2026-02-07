@echo off
chcp 65001 >nul
title 诊断部署问题
color 0C

echo.
echo ==========================================
echo   部署失败诊断工具
echo ==========================================
echo.

echo [诊断 1/6] 检查 Node.js...
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [✗] Node.js 未安装
    echo.
    echo 解决方案：
    echo   访问 https://nodejs.org/
    echo   下载并安装 LTS 版本
) else (
    for /f "tokens=*" %%i in ('node --version') do echo [✓] Node.js: %%i
)
echo.

echo [诊断 2/6] 检查 pnpm...
where pnpm >nul 2>&1
if %errorLevel% neq 0 (
    echo [✗] pnpm 未安装
    echo.
    echo 解决方案：
    echo   npm install -g pnpm
) else (
    for /f "tokens=*" %%i in ('pnpm --version') do echo [✓] pnpm: %%i
)
echo.

echo [诊断 3/6] 检查 PostgreSQL...
where psql >nul 2>&1
if %errorLevel% neq 0 (
    echo [✗] PostgreSQL 未安装
    echo.
    echo 解决方案：
    echo   访问 https://www.postgresql.org/download/windows/
    echo   下载并安装 PostgreSQL
    echo   密码设置为：postgres
) else (
    for /f "tokens=*" %%i in ('psql --version') do echo [✓] PostgreSQL: 已安装

    sc query postgresql-x64-14 | findstr "RUNNING" >nul 2>&1
    if %errorLevel% equ 0 (
        echo [✓] PostgreSQL 服务运行中
    ) else (
        echo [✗] PostgreSQL 服务未运行
        echo.
        echo 解决方案：
        echo   net start postgresql-x64-14
    )
)
echo.

echo [诊断 4/6] 检查权限...
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [✗] 没有管理员权限
    echo.
    echo 解决方案：
    echo   右键脚本，选择"以管理员身份运行"
) else (
    echo [✓] 有管理员权限
)
echo.

echo [诊断 5/6] 检查磁盘空间...
for /f "tokens=3" %%a in ('wmic logicaldisk where "DeviceID='C:'" get FreeSpace ^| findstr [0-9]') do set FREE=%%a
set /a FREE_GB=%FREE%/1073741824
if %FREE_GB% lss 5 (
    echo [✗] C盘空间不足 (可用: %FREE_GB% GB)
) else (
    echo [✓] C盘空间充足 (可用: %FREE_GB% GB)
)
echo.

echo [诊断 6/6] 检查网络...
ping -n 1 8.8.8.8 >nul 2>&1
if %errorLevel% neq 0 (
    echo [✗] 网络连接异常
) else (
    echo [✓] 网络连接正常
)
echo.

echo ==========================================
echo   常见错误解决方案
echo ==========================================
echo.

echo 错误1: "不是内部或外部命令"
echo   原因: 软件未安装或未添加到PATH
echo   解决: 安装对应软件并重启命令提示符
echo.

echo 错误2: "拒绝访问"
echo   原因: 权限不足
echo   解决: 以管理员身份运行脚本
echo.

echo 错误3: "连接被拒绝"
echo   原因: PostgreSQL服务未运行
echo   解决: net start postgresql-x64-14
echo.

echo 错误4: "找不到路径"
echo   原因: 路径错误或不存在
echo   解决: 检查路径是否正确
echo.

echo 错误5: 依赖安装失败
echo   原因: 网络问题或缓存问题
echo   解决:
echo   pnpm store prune
echo   pnpm install
echo.

echo ==========================================
echo.
echo 请告诉我具体的错误信息，我将提供精确的解决方案。
echo.
pause
