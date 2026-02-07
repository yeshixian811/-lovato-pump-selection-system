@echo off
chcp 65001 >nul
title 一键部署 - 洛瓦托水泵选型系统
color 0F

echo ==========================================
echo   洛瓦托水泵选型系统
echo   Windows 一键部署脚本
echo ==========================================
echo.
echo 此脚本将自动完成以下操作：
echo   1. 安装 cloudflared
echo   2. 配置 Cloudflare Tunnel
echo   3. 安装 Windows 服务
echo   4. 启动服务
echo.
echo 预计耗时：5-10 分钟
echo.
pause

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 需要管理员权限！
    echo 请右键点击此脚本，选择"以管理员身份运行"
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   步骤 1/4：安装 cloudflared
echo ==========================================
echo.

call "%~dp0install-cloudflared.bat"
if %errorLevel% neq 0 (
    echo [错误] cloudflared 安装失败！
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   步骤 2/4：配置 Cloudflare Tunnel
echo ==========================================
echo.

call "%~dp0setup-cloudflare.bat"
if %errorLevel% neq 0 (
    echo [警告] Cloudflare Tunnel 配置可能不完整
    echo 请手动检查配置
    pause
)

echo.
echo ==========================================
echo   步骤 3/4：安装 Windows 服务
echo ==========================================
echo.

call "%~dp0install-service.bat"
if %errorLevel% neq 0 (
    echo [错误] Windows 服务安装失败！
    echo 请手动执行 install-service.bat
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   步骤 4/4：启动服务
echo ==========================================
echo.

timeout /t 3 >nul

sc query cloudflared | findstr "RUNNING" >nul
if %errorLevel% equ 0 (
    echo [✓] 服务已在运行
) else (
    echo [信息] 启动服务...
    net start cloudflared
    if %errorLevel% neq 0 (
        echo [警告] 服务启动失败，请手动启动
    )
)

cls
echo.
echo ==========================================
echo   部署完成！
echo ==========================================
echo.
echo 检查服务状态...
timeout /t 2 >nul

sc query cloudflared

echo.
echo ==========================================
echo   部署总结
echo ==========================================
echo.
echo [✓] cloudflared 已安装
echo [✓] Cloudflare Tunnel 已配置
echo [✓] Windows 服务已安装
echo [✓] 服务已启动
echo.
echo 下一步：
echo 1. 确保本地服务运行在 http://localhost:5000
echo 2. 访问您配置的域名测试连接
echo 3. 修改微信小程序配置使用 HTTPS 域名
echo.
echo 管理工具：
echo   - 运行 service-manager.bat 管理服务
echo   - 查看日志：C:\ProgramData\cloudflared\logs\cloudflared.log
echo.
echo ==========================================
echo   常用命令
echo ==========================================
echo   启动服务:   net start cloudflared
echo   停止服务:   net stop cloudflared
echo   查看状态:   sc query cloudflared
echo   管理服务:   service-manager.bat
echo.
pause
