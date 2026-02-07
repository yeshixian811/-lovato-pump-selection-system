@echo off
REM 快速测试脚本 - 验证系统是否正常运行

echo ========================================
echo   洛瓦托水泵选型系统 - 快速测试
echo ========================================
echo.

color 0B

REM 设置项目目录
set "PROJECT_DIR=C:\lovato-pump"
set "DB_HOST=localhost"
set "DB_PORT=5432"
set "DB_NAME=lovato_pump_selection"
set "DB_USER=postgres"
set "DB_PASSWORD=postgres"

echo [测试 1/5] 检查项目目录...
if exist "%PROJECT_DIR%" (
    echo [✓] 项目目录存在: %PROJECT_DIR%
) else (
    echo [✗] 项目目录不存在: %PROJECT_DIR%
    echo 请先运行部署脚本创建项目
    pause
    exit /b 1
)
echo.

echo [测试 2/5] 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [✗] Node.js 未安装
    pause
    exit /b 1
)
echo [✓] Node.js 已安装
node --version
echo.

echo [测试 3/5] 检查 PostgreSQL 连接...
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -c "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo [✗] 无法连接到数据库
    echo 请检查:
    echo   1. PostgreSQL 服务是否启动
    echo   2. 数据库 %DB_NAME% 是否存在
    echo   3. 用户名和密码是否正确
    pause
    exit /b 1
)
echo [✓] 数据库连接成功
echo.

echo [测试 4/5] 检查数据库数据...
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -c "SELECT COUNT(*) as pump_count FROM pumps;" -t | findstr /r "[0-9]" > temp_count.txt
set /p PUMP_COUNT=<temp_count.txt
del temp_count.txt

echo 水泵产品数量: %PUMP_COUNT%
if %PUMP_COUNT% GEQ 20 (
    echo [✓] 数据库数据正常
) else (
    echo [!] 数据库数据不足（至少需要20个产品）
    echo 请运行: psql -U %DB_USER% -d %DB_NAME% -f migrations\003_insert_sample_pumps.sql
)
echo.

echo [测试 5/5] 检查应用文件...
set "MISSING_FILES=0"

if not exist "%PROJECT_DIR%\src\app\selection\page.tsx" (
    echo [✗] 缺少: src\app\selection\page.tsx
    set /a MISSING_FILES+=1
) else (
    echo [✓] src\app\selection\page.tsx
)

if not exist "%PROJECT_DIR%\src\app\api\pump\match\route.ts" (
    echo [✗] 缺少: src\app\api\pump\match\route.ts
    set /a MISSING_FILES+=1
) else (
    echo [✓] src\app\api\pump\match\route.ts
)

if not exist "%PROJECT_DIR%\migrations\002_create_pump_tables.sql" (
    echo [✗] 缺少: migrations\002_create_pump_tables.sql
    set /a MISSING_FILES+=1
) else (
    echo [✓] migrations\002_create_pump_tables.sql
)

if not exist "%PROJECT_DIR%\migrations\003_insert_sample_pumps.sql" (
    echo [✗] 缺少: migrations\003_insert_sample_pumps.sql
    set /a MISSING_FILES+=1
) else (
    echo [✓] migrations\003_insert_sample_pumps.sql
)

echo.

if %MISSING_FILES% GTR 0 (
    echo [✗] 缺少 %MISSING_FILES% 个必需文件
    echo 请复制所有必需文件到项目目录
    pause
    exit /b 1
) else (
    echo [✓] 所有必需文件都存在
)
echo.

echo ========================================
echo   测试完成！
echo ========================================
echo.
echo 系统状态: 正常 ✓
echo.
echo 启动应用:
echo   cd %PROJECT_DIR%
echo   pnpm run dev
echo.
echo 访问地址: http://localhost:5000
echo.

set /p "choice=是否立即启动应用？(Y/N): "
if /i "%choice%"=="Y" (
    echo.
    echo 正在启动应用...
    echo 按 Ctrl+C 停止服务器
    echo.
    cd /d "%PROJECT_DIR%"
    pnpm run dev
) else (
    echo 稍后可以手动启动应用
    pause
)

exit /b 0
