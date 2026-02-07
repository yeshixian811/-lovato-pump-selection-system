@echo off
chcp 65001 >nul
title Cloudflare Tunnel 服务管理器
color 0D

:menu
cls
echo ==========================================
echo   Cloudflare Tunnel 服务管理器
echo   洛瓦托水泵选型系统
echo ==========================================
echo.
echo 服务状态：
sc query cloudflared 2>nul | findstr "STATE"
echo.
echo ==========================================
echo   请选择操作：
echo ==========================================
echo.
echo   [1] 启动服务
echo   [2] 停止服务
echo   [3] 重启服务
echo   [4] 查看状态
echo   [5] 查看日志
echo   [6] 查看配置
echo   [7] 测试连接
echo   [8] 删除服务
echo   [0] 退出
echo.
set /p choice="请输入选项 (0-8): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto status
if "%choice%"=="5" goto logs
if "%choice%"=="6" goto config
if "%choice%"=="7" goto test
if "%choice%"=="8" goto delete
if "%choice%"=="0" goto end
goto menu

:start
echo.
echo [信息] 启动 cloudflared 服务...
net start cloudflared

if %errorLevel% equ 0 (
    echo [✓] 服务启动成功！
) else (
    echo [✗] 服务启动失败！
)

pause
goto menu

:stop
echo.
echo [信息] 停止 cloudflared 服务...
net stop cloudflared

if %errorLevel% equ 0 (
    echo [✓] 服务停止成功！
) else (
    echo [✗] 服务停止失败！
)

pause
goto menu

:restart
echo.
echo [信息] 重启 cloudflared 服务...
net stop cloudflared
timeout /t 2 >nul
net start cloudflared

if %errorLevel% equ 0 (
    echo [✓] 服务重启成功！
) else (
    echo [✗] 服务重启失败！
)

pause
goto menu

:status
cls
echo ==========================================
echo   Cloudflare Tunnel 服务状态
echo ==========================================
echo.
sc query cloudflared
echo.
echo ==========================================
echo   进程信息
echo ==========================================
tasklist | findstr cloudflared
echo.
pause
goto menu

:logs
cls
echo ==========================================
echo   Cloudflare Tunnel 日志
echo ==========================================
echo.
set LOG_DIR=C:\ProgramData\cloudflared\logs

if exist "%LOG_DIR%\cloudflared.log" (
    echo [信息] 显示最后 50 行日志：
    echo.
    powershell -Command "Get-Content '%LOG_DIR%\cloudflared.log' -Tail 50"
) else (
    echo [错误] 日志文件不存在：%LOG_DIR%\cloudflared.log
)

echo.
pause
goto menu

:config
cls
echo ==========================================
echo   Cloudflare Tunnel 配置
echo ==========================================
echo.

set CONFIG_FILE=%USERPROFILE%\.cloudflared\config.yml
if exist "%CONFIG_FILE%" (
    type "%CONFIG_FILE%"
) else (
    echo [错误] 配置文件不存在：%CONFIG_FILE%
)

echo.
echo ==========================================
echo   隧道列表
echo ==========================================
cloudflared tunnel list
echo.
pause
goto menu

:test
cls
echo ==========================================
echo   测试 Cloudflare Tunnel 连接
echo ==========================================
echo.

set CONFIG_FILE=%USERPROFILE%\.cloudflared\config.yml
if exist "%CONFIG_FILE%" (
    echo [1/2] 验证配置文件...
    cloudflared tunnel ingress validate
    
    if %errorLevel% equ 0 (
        echo [✓] 配置验证通过
    ) else (
        echo [✗] 配置验证失败
    )
    echo.
    
    echo [2/2] 测试本地服务...
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000' -TimeoutSec 5; Write-Host '[✓] 本地服务运行正常' -ForegroundColor Green } catch { Write-Host '[✗] 本地服务无法访问' -ForegroundColor Red }"
) else (
    echo [错误] 配置文件不存在
)

echo.
pause
goto menu

:delete
cls
echo ==========================================
echo   删除 Cloudflare Tunnel 服务
echo ==========================================
echo.
echo [警告] 此操作将永久删除 Windows 服务！
echo.
set /p confirm="确认删除？(YES/NO): "

if /i not "%confirm%"=="YES" (
    echo [信息] 操作已取消
    pause
    goto menu
)

echo.
echo [1/2] 停止服务...
net stop cloudflared

echo [2/2] 删除服务...
sc delete cloudflared

if %errorLevel% equ 0 (
    echo [✓] 服务删除成功！
) else (
    echo [✗] 服务删除失败！
)

echo.
pause
goto menu

:end
exit /b 0
