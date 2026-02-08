@echo off
REM ============================================
REM Cloudflare Tunnel 快速配置脚本
REM ============================================

echo.
echo ========================================
echo   Cloudflare Tunnel 快速配置向导
echo ========================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查是否已安装 cloudflared
where cloudflared >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [1/5] 检测到 cloudflared 未安装
    echo.
    echo 请按照以下步骤安装 cloudflared:
    echo.
    echo 1. 访问下载页面:
    echo    https://github.com/cloudflare/cloudflared/releases/latest
    echo.
    echo 2. 下载 Windows 64 位版本:
    echo    cloudflared-windows-amd64.exe
    echo.
    echo 3. 将文件重命名为 cloudflared.exe
    echo.
    echo 4. 将 cloudflared.exe 移动到系统 PATH 目录之一:
    echo    - C:\Windows\System32\
    echo    - 或添加到环境变量 PATH
    echo.
    echo 安装完成后，请重新运行此脚本
    pause
    exit /b 1
)

echo [1/5] 检测到 cloudflared 已安装
echo.

REM 检查是否已登录
echo [2/5] 检查 Cloudflare 账户登录状态...
cloudflared tunnel list >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo 您需要先登录 Cloudflare 账户
    echo.
    echo 请执行以下命令:
    echo   cloudflared tunnel login
    echo.
    echo 这将打开浏览器进行授权
    pause
    exit /b 1
)

echo [2/5] 已登录到 Cloudflare 账户
echo.

REM 检查是否已创建 tunnel
echo [3/5] 检查现有隧道...
cloudflared tunnel list | findstr "lovato-pump" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 检测到现有隧道: lovato-pump
    set EXISTING_TUNNEL=1
) else (
    echo 未检测到现有隧道
    set EXISTING_TUNNEL=0
)
echo.

if %EXISTING_TUNNEL% EQU 0 (
    echo [4/5] 创建新隧道...
    echo.
    echo 请提供以下信息:
    echo.
    set /p TUNNEL_NAME="隧道名称 (默认: lovato-pump): "
    if "%TUNNEL_NAME%"=="" set TUNNEL_NAME=lovato-pump

    cloudflared tunnel create %TUNNEL_NAME%
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 创建隧道失败
        pause
        exit /b 1
    )

    echo [成功] 隧道创建成功
) else (
    set TUNNEL_NAME=lovato-pump
    echo [4/5] 使用现有隧道: %TUNNEL_NAME%
)

echo.
echo [5/5] 配置隧道...
echo.

REM 创建配置文件
set CONFIG_FILE=cloudflared-tunnel-config.yml

echo tunnel: %TUNNEL_NAME% > %CONFIG_FILE%
echo credentials-file: C:\Users\%USERNAME%\.cloudflared\%TUNNEL_NAME%.json >> %CONFIG_FILE%
echo. >> %CONFIG_FILE%
echo ingress: >> %CONFIG_FILE%
echo   - hostname: yourdomain.com >> %CONFIG_FILE%
echo     service: http://localhost:5000 >> %CONFIG_FILE%
echo   - service: http_status:404 >> %CONFIG_FILE%

echo [成功] 配置文件已创建: %CONFIG_FILE%
echo.

REM 显示配置说明
echo ========================================
echo   配置完成
echo ========================================
echo.
echo 下一步操作:
echo.
echo 1. 编辑配置文件，设置正确的域名:
echo    notepad %CONFIG_FILE%
echo.
echo    将 "yourdomain.com" 替换为您的实际域名
echo.
echo 2. 测试隧道连接（手动启动）:
echo    cloudflared tunnel run %TUNNEL_NAME%
echo.
echo 3. 将隧道注册为 Windows 服务（可选）:
echo    cloudflared service install
echo.
echo 4. 启动服务:
echo    net start cloudflared
echo.
echo 详细配置说明请参阅:
echo   CLOUDFLARE-TUNNEL-GUIDE.md
echo.

pause
