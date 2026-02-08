@echo off
chcp 65001 >nul
title 系统健康检查
color 0B

echo.
echo ==========================================
echo   洛瓦托水泵选型系统
echo   系统健康检查
echo ==========================================
echo.

set ERROR_COUNT=0
set WARNING_COUNT=0

:: 检查 1: Node.js
echo [1/10] 检查 Node.js...
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [✗] Node.js 未安装
    set /a ERROR_COUNT+=1
) else (
    echo [✓] Node.js 已安装
    node --version
)
echo.

:: 检查 2: pnpm
echo [2/10] 检查 pnpm...
where pnpm >nul 2>&1
if %errorLevel% neq 0 (
    echo [✗] pnpm 未安装
    set /a ERROR_COUNT+=1
) else (
    echo [✓] pnpm 已安装
    pnpm --version
)
echo.

:: 检查 3: PostgreSQL
echo [3/10] 检查 PostgreSQL...
where psql >nul 2>&1
if %errorLevel% neq 0 (
    echo [✗] PostgreSQL 未安装或不在 PATH 中
    set /a ERROR_COUNT+=1
) else (
    echo [✓] PostgreSQL 已安装
    psql --version
)
echo.

:: 检查 4: PostgreSQL 服务
echo [4/10] 检查 PostgreSQL 服务...
sc query postgresql-x64-14 | findstr "RUNNING" >nul
if %errorLevel% neq 0 (
    echo [!] PostgreSQL 服务未运行
    set /a WARNING_COUNT+=1
) else (
    echo [✓] PostgreSQL 服务正在运行
)
echo.

:: 检查 5: 项目依赖
echo [5/10] 检查项目依赖...
if not exist "node_modules\" (
    echo [✗] 项目依赖未安装
    set /a ERROR_COUNT+=1
) else (
    echo [✓] 项目依赖已安装
    dir node_modules | find "个文件" >nul
)
echo.

:: 检查 6: 环境变量文件
echo [6/10] 检查环境变量配置...
if not exist ".env" (
    echo [!] .env 文件不存在
    set /a WARNING_COUNT+=1
) else (
    echo [✓] .env 文件存在
    findstr /C:"DATABASE_URL" .env >nul
    if %errorLevel% neq 0 (
        echo [!] .env 中缺少 DATABASE_URL 配置
        set /a WARNING_COUNT+=1
    )
)
echo.

:: 检查 7: 端口 5000
echo [7/10] 检查端口 5000...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
if %errorLevel% equ 0 (
    echo [!] 端口 5000 已被占用
    set /a WARNING_COUNT+=1
    netstat -ano | findstr ":5000" | findstr "LISTENING"
) else (
    echo [✓] 端口 5000 可用
)
echo.

:: 检查 8: 数据库连接
echo [8/10] 检查数据库连接...
where psql >nul 2>&1
if %errorLevel% equ 0 (
    psql -U postgres -d lovato_pump -c "SELECT 1;" >nul 2>&1
    if %errorLevel% equ 0 (
        echo [✓] 数据库连接成功
    ) else (
        echo [!] 数据库连接失败
        set /a WARNING_COUNT+=1
    )
)
echo.

:: 检查 9: 构建文件
echo [9/10] 检查构建文件...
if not exist ".next\" (
    echo [!] 项目尚未构建（开发模式可忽略）
    set /a WARNING_COUNT+=1
) else (
    echo [✓] 项目已构建
)
echo.

:: 检查 10: 文件系统
echo [10/10] 检查文件系统...
if exist "J:\" (
    echo [✓] J 盘已挂载（数据库迁移可用）
) else (
    echo [!] J 盘不存在（如果需要迁移数据库）
    set /a WARNING_COUNT+=1
)
echo.

:: 显示总结
echo ==========================================
echo   检查结果
echo ==========================================
echo.
if %ERROR_COUNT% equ 0 (
    echo [成功] 未发现严重错误
) else (
    echo [错误] 发现 %ERROR_COUNT% 个严重错误
)
echo.
if %WARNING_COUNT% equ 0 (
    echo [成功] 未发现警告
) else (
    echo [警告] 发现 %WARNING_COUNT% 个警告
)
echo.

:: 提供建议
if %ERROR_COUNT% gt 0 (
    echo ==========================================
    echo   修复建议
    echo ==========================================
    echo.
    if not exist "node_modules\" (
        echo - 运行: pnpm install
    )
    if not exist ".env" (
        echo - 复制: copy .env.example .env
        echo - 编辑: 配置数据库连接信息
    )
    echo.
)

if %WARNING_COUNT% gt 0 (
    echo ==========================================
    echo   注意事项
    echo ==========================================
    echo.
    sc query postgresql-x64-14 | findstr "RUNNING" >nul
    if %errorLevel% neq 0 (
        echo - 启动 PostgreSQL 服务: net start postgresql-x64-14
    )
    echo.
)

if %ERROR_COUNT% equ 0 (
    echo ==========================================
    echo   系统状态良好
    echo ==========================================
    echo.
    echo 您可以启动服务：
    echo   - 开发模式: pnpm run dev
    echo   - 生产模式: pnpm run build ^&^& pnpm run start
    echo   - 或运行: quick-start.bat
    echo.
)

pause
