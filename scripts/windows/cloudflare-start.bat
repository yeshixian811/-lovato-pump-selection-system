@echo off
chcp 65001 >nul
title Cloudflare Tunnel - 洛瓦托水泵选型系统
color 0A

echo ==========================================
echo   Cloudflare Tunnel 启动脚本
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
    echo.
    echo 请先运行 install-cloudflared.bat 进行安装
    pause
    exit /b 1
)

echo [✓] cloudflared 已安装
echo.

:: 检查配置文件是否存在
echo [2/5] 检查配置文件...
if not exist "%USERPROFILE%\.cloudflared\config.yml" (
    echo [错误] 配置文件不存在！
    echo 请先运行 setup-cloudflare.bat 进行配置
    pause
    exit /b 1
)

echo [✓] 配置文件已找到
echo.

:: 检查证书文件是否存在
echo [3/5] 检查证书文件...
if not exist "%USERPROFILE%\.cloudflared\*.json" (
    echo [错误] 证书文件不存在！
    echo 请先运行 setup-cloudflare.bat 进行配置
    pause
    exit /b 1
)

echo [✓] 证书文件已找到
echo.

:: 检查 tunnel 名称
echo [4/5] 检查隧道配置...
for /f "tokens=2" %%i in ('type "%USERPROFILE%\.cloudflared\config.yml" ^| findstr "tunnel:"') do set TUNNEL_ID=%%i
if "%TUNNEL_ID%"=="" (
    echo [错误] 无法获取隧道ID！
    pause
    exit /b 1
)

echo [✓] 隧道ID: %TUNNEL_ID%
echo.

:: 检查隧道是否已存在
echo [5/5] 启动 Cloudflare Tunnel...
echo.
echo ==========================================
echo   正在启动隧道...
echo ==========================================
echo.

:: 尝试以服务方式启动
sc query cloudflared >nul 2>&1
if %errorLevel% equ 0 (
    echo [信息] 检测到 cloudflared 服务
    echo.
    echo 选择启动方式：
    echo   1. 作为服务启动（推荐）
    echo   2. 直接启动
    echo.
    set /p choice="请选择 (1/2): "
    
    if "%choice%"=="1" (
        echo.
        echo [信息] 启动服务...
        net start cloudflared
        if %errorLevel% equ 0 (
            echo [✓] 服务启动成功！
            echo.
            echo 查看服务状态：sc query cloudflared
            echo 查看日志：type C:\ProgramData\cloudflared\logs\cloudflared.log
        ) else (
            echo [错误] 服务启动失败！
            echo 请检查日志：type C:\ProgramData\cloudflared\logs\cloudflared.log
        )
    ) else (
        goto direct_start
    )
) else (
    goto direct_start
)

goto end

:direct_start
echo.
echo [信息] 直接启动隧道...
echo.
echo 隧道启动中，请保持此窗口打开...
echo 按 Ctrl+C 停止
echo.
cloudflared tunnel run %TUNNEL_ID%

:end
echo.
echo ==========================================
echo   按任意键退出...
echo ==========================================
pause >nul
