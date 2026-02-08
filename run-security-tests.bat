@echo off
REM ============================================
REM 安全功能测试运行脚本
REM ============================================

echo.
echo ========================================
echo   洛瓦托水泵选型系统 - 安全功能测试
echo ========================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] 检查环境变量配置...
node scripts/validate-env.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [失败] 环境变量配置检查未通过
    echo 请先配置 .env 文件后再运行测试
    pause
    exit /b 1
)

echo.
echo [2/5] 测试加密/解密功能...
node scripts/test-encryption.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [警告] 加密/解密功能测试未通过
)

echo.
echo [3/5] 检查开发服务器是否运行...
curl -s -o nul -w "%%{http_code}" http://localhost:5000 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [成功] 开发服务器正在运行
) else (
    echo.
    echo [警告] 开发服务器未运行，将跳过 API 测试
    echo 请先运行开发服务器: pnpm run dev
    echo.
    pause
    exit /b 0
)

echo.
echo [4/5] 测试认证和授权功能...
node scripts/test-security.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [警告] 认证和授权功能测试未通过
)

echo.
echo [5/5] 测试完成
echo.

echo ========================================
echo   测试总结
echo ========================================
echo.
echo 如果所有测试都通过，您可以：
echo 1. 配置 Cloudflare Tunnel
echo 2. 部署到生产环境
echo 3. 执行完整的安全审计
echo.

pause
