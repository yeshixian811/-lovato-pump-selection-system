@echo off
chcp 65001 >nul
title 安装 Windows 服务 - Cloudflare Tunnel
color 0C

echo ==========================================
echo   Cloudflare Tunnel 服务安装脚本
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
echo [1/5] 检查 cloudflared 安装状态...
where cloudflared >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] cloudflared 未安装！
    echo 请先运行 install-cloudflared.bat
    pause
    exit /b 1
)

echo [✓] cloudflared 已安装
echo.

:: 检查配置文件
echo [2/5] 检查配置文件...
if not exist "%USERPROFILE%\.cloudflared\config.yml" (
    echo [错误] 配置文件不存在！
    echo 请先运行 setup-cloudflare.bat
    pause
    exit /b 1
)

echo [✓] 配置文件已找到
echo.

:: 检查证书文件
echo [3/5] 检查证书文件...
if not exist "%USERPROFILE%\.cloudflared\*.json" (
    echo [错误] 证书文件不存在！
    echo 请先运行 setup-cloudflare.bat
    pause
    exit /b 1
)

echo [✓] 证书文件已找到
echo.

:: 检查是否已安装服务
echo [4/5] 检查服务状态...
sc query cloudflared >nul 2>&1
if %errorLevel% equ 0 (
    echo [信息] cloudflared 服务已安装
    echo.
    sc query cloudflared
    echo.
    echo 是否重新安装？(Y/N)
    set /p reinstall=
    
    if /i "%reinstall%"=="Y" (
        echo.
        echo [信息] 停止并删除旧服务...
        net stop cloudflared
        sc delete cloudflared
        timeout /t 3 >nul
    ) else (
        echo.
        echo 服务已安装，无需重新安装
        pause
        exit /b 0
    )
) else (
    echo [信息] cloudflared 服务未安装
)

echo.

:: 获取隧道ID
echo [5/5] 安装服务...
for /f "tokens=2" %%i in ('type "%USERPROFILE%\.cloudflared\config.yml" ^| findstr "tunnel:"') do set TUNNEL_ID=%%i
if "%TUNNEL_ID%"=="" (
    echo [错误] 无法获取隧道ID！
    pause
    exit /b 1
)

echo 隧道ID: %TUNNEL_ID%
echo.

:: 创建日志目录
set LOG_DIR=C:\ProgramData\cloudflared\logs
if not exist "%LOG_DIR%" (
    mkdir "%LOG_DIR%"
    echo [✓] 日志目录已创建: %LOG_DIR%
)

echo.
echo [信息] 正在安装服务...
echo.

:: 安装服务
cloudflared service install %TUNNEL_ID%

if %errorLevel% neq 0 (
    echo [错误] 服务安装失败！
    echo.
    echo 请手动执行以下命令：
    echo cloudflared service install %TUNNEL_ID%
    pause
    exit /b 1
)

echo [✓] 服务安装成功
echo.

:: 配置服务
echo [信息] 配置服务...
sc config cloudflared start= auto
sc description cloudflared "Cloudflare Tunnel - 洛瓦托水泵选型系统"

echo [✓] 服务配置完成
echo.

:: 启动服务
echo [信息] 启动服务...
net start cloudflared

if %errorLevel% equ 0 (
    echo [✓] 服务启动成功！
) else (
    echo [警告] 服务启动失败！
    echo 请查看日志：%LOG_DIR%\cloudflared.log
)

echo.
echo ==========================================
echo   服务安装完成！
echo ==========================================
echo.
echo 服务信息：
sc query cloudflared
echo.
echo 日志位置：%LOG_DIR%\cloudflared.log
echo.
echo 管理命令：
echo   启动服务:   net start cloudflared
echo   停止服务:   net stop cloudflared
echo   查看状态:   sc query cloudflared
echo   查看日志:   type "%LOG_DIR%\cloudflared.log"
echo   删除服务:   sc delete cloudflared
echo.
pause
