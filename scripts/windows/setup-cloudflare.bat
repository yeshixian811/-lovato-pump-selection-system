@echo off
chcp 65001 >nul
title 配置 Cloudflare Tunnel - 洛瓦托水泵选型系统
color 0E

echo ==========================================
echo   Cloudflare Tunnel 配置向导
echo   洛瓦托水泵选型系统
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

:: 检查 cloudflared 是否已安装
echo [1/6] 检查 cloudflared 安装状态...
where cloudflared >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] cloudflared 未安装！
    echo 请先运行 install-cloudflared.bat
    pause
    exit /b 1
)

echo [✓] cloudflared 已安装
echo.

:: 登录 Cloudflare
echo [2/6] 登录 Cloudflare...
echo.
echo 此操作将打开浏览器，请登录您的 Cloudflare 账号
echo.
pause

cloudflared tunnel login

if %errorLevel% neq 0 (
    echo [错误] 登录失败！
    pause
    exit /b 1
)

echo [✓] 登录成功
echo.

:: 获取隧道名称
echo [3/6] 输入隧道信息...
echo.
set TUNNEL_NAME=luowato-pump
echo 默认隧道名称: %TUNNEL_NAME%
set /p TUNNEL_NAME="是否使用默认名称？(Y/N): "

if /i "%TUNNEL_NAME%"=="N" (
    set /p TUNNEL_NAME="请输入隧道名称: "
)

echo.
echo [信息] 创建隧道: %TUNNEL_NAME%
echo.

:: 创建隧道
echo [4/6] 创建隧道...
cloudflared tunnel create %TUNNEL_NAME%

if %errorLevel% neq 0 (
    echo [错误] 创建隧道失败！
    echo 可能原因：
    echo 1. 隧道名称已存在
    echo 2. 网络连接问题
    echo.
    echo 如果隧道已存在，请继续配置
    pause
) else (
    echo [✓] 隧道创建成功
)

echo.

:: 获取隧道ID
for /f "tokens=*" %%i in ('cloudflared tunnel list 2^>nul ^| findstr "%TUNNEL_NAME%"') do set TUNNEL_LINE=%%i
for /f "tokens=1" %%j in ("%TUNNEL_LINE%") do set TUNNEL_ID=%%j

if "%TUNNEL_ID%"=="" (
    echo [错误] 无法获取隧道ID！
    echo 请手动在 Cloudflare Dashboard 查看隧道ID
    pause
    exit /b 1
)

echo [✓] 隧道ID: %TUNNEL_ID%
echo.

:: 获取域名
echo [5/6] 配置域名...
echo.
set DOMAIN=luowato.yourdomain.com
echo 默认域名: %DOMAIN%
echo.
set /p DOMAIN="请输入您的域名 (例如: luowato.example.com): "

if "%DOMAIN%"=="" (
    set DOMAIN=luowato.yourdomain.com
)

echo.
echo [信息] 域名: %DOMAIN%
echo.

:: 配置DNS
echo [信息] 配置DNS记录...
cloudflared tunnel route dns %TUNNEL_ID% %DOMAIN%

if %errorLevel% neq 0 (
    echo [警告] DNS配置失败！
    echo 可能需要手动在 Cloudflare Dashboard 配置
) else (
    echo [✓] DNS配置成功
)

echo.

:: 创建配置文件
echo [6/6] 创建配置文件...
set CONFIG_FILE=%USERPROFILE%\.cloudflared\config.yml

echo 创建配置文件: %CONFIG_FILE%
echo.

(
echo tunnel: %TUNNEL_ID%
echo credentials-file: %USERPROFILE%\.cloudflared\%TUNNEL_ID%.json
echo.
echo ingress:
echo   - hostname: %DOMAIN%
echo     service: http://localhost:5000
echo   - service: http_status:404
) > "%CONFIG_FILE%"

echo [✓] 配置文件已创建
echo.

:: 显示配置内容
echo ==========================================
echo   配置文件内容
echo ==========================================
type "%CONFIG_FILE%"
echo.
echo ==========================================
echo.

:: 测试配置
echo [测试] 验证配置...
cloudflared tunnel ingress validate

if %errorLevel% neq 0 (
    echo [警告] 配置验证失败！
    echo 请检查配置文件内容
) else (
    echo [✓] 配置验证通过
)

echo.
echo ==========================================
echo   配置完成！
echo ==========================================
echo.
echo 配置信息：
echo   - 隧道名称: %TUNNEL_NAME%
echo   - 隧道ID: %TUNNEL_ID%
echo   - 域名: %DOMAIN%
echo   - 配置文件: %CONFIG_FILE%
echo.
echo 下一步：
echo 1. 确保本地服务运行在 http://localhost:5000
echo 2. 运行 install-service.bat 安装 Windows 服务（推荐）
echo 3. 或运行 cloudflare-start.bat 手动启动
echo.
pause
