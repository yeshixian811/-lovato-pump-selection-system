@echo off
chcp 65001 >nul
title 安装 cloudflared - Cloudflare Tunnel
color 0B

echo ==========================================
echo   cloudflared 安装脚本
echo   Cloudflare Tunnel 客户端
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

:: 检查是否已安装
echo [1/4] 检查是否已安装 cloudflared...
where cloudflared >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] cloudflared 已安装
    cloudflared --version
    echo.
    echo 是否重新安装？(Y/N)
    set /p reinstall=
    if /i not "%reinstall%"=="Y" (
        exit /b 0
    )
) else (
    echo [信息] cloudflared 未安装
)

echo.
echo [2/4] 下载 cloudflared...
echo.

:: 下载 cloudflared
set DOWNLOAD_URL=https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
set TARGET_PATH=%LOCALAPPDATA%\Microsoft\WindowsApps\cloudflared.exe

if exist "%TARGET_PATH%" (
    echo [信息] 删除旧文件...
    del "%TARGET_PATH%"
)

echo 正在下载: %DOWNLOAD_URL%
echo 目标位置: %TARGET_PATH%
echo.

:: 使用 PowerShell 下载
powershell -Command "& {Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%TARGET_PATH%'}"

if %errorLevel% neq 0 (
    echo [错误] 下载失败！
    echo.
    echo 请手动下载：
    echo 1. 访问 https://github.com/cloudflare/cloudflared/releases/latest
    echo 2. 下载 cloudflared-windows-amd64.exe
    echo 3. 将文件复制到 %TARGET_PATH%
    pause
    exit /b 1
)

echo [✓] 下载成功
echo.

:: 验证安装
echo [3/4] 验证安装...
where cloudflared >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 安装验证失败！
    pause
    exit /b 1
)

echo.
cloudflared --version
echo.
echo [✓] 安装成功！
echo.

:: 创建配置目录
echo [4/4] 创建配置目录...
if not exist "%USERPROFILE%\.cloudflared" (
    mkdir "%USERPROFILE%\.cloudflared"
    echo [✓] 配置目录已创建
) else (
    echo [✓] 配置目录已存在
)

echo.
echo ==========================================
echo   安装完成！
echo ==========================================
echo.
echo 下一步：
echo 1. 运行 setup-cloudflare.bat 进行配置
echo 2. 运行 cloudflare-start.bat 启动隧道
echo.
pause
