@echo off
chcp 65001 >nul
title 快速创建项目
color 0A

echo.
echo ==========================================
echo   在本地创建洛瓦托水泵选型项目
echo ==========================================
echo.

:: 询问用户选择
echo 请选择创建方式：
echo.
echo 1. 从 GitHub/Gitee 克隆（需要已有仓库）
echo 2. 下载 ZIP 文件（需要先下载）
echo 3. 手动创建基本结构
echo 4. 退出
echo.

set /p choice="请输入选择 (1-4): "

if "%choice%"=="1" goto CLONE
if "%choice%"=="2" goto DOWNLOAD
if "%choice%"=="3" goto MANUAL
if "%choice%"=="4" exit /b 0

echo 无效选择
pause
exit /b 1

:CLONE
echo.
echo [方式1] 克隆项目
echo.
echo 请提供仓库地址：
echo   GitHub: https://github.com/用户名/项目名.git
echo   Gitee:  https://gitee.com/用户名/项目名.git
echo.

set /p repo="请输入仓库地址: "
if "%repo%"=="" (
    echo 错误：仓库地址不能为空
    pause
    exit /b 1
)

set /p folder="请输入项目文件夹名称 (默认: lovato-pump-selection): "
if "%folder%"=="" set folder=lovato-pump-selection

echo.
echo 正在克隆项目...
git clone %repo% %folder%

if %errorLevel% neq 0 (
    echo.
    echo 克隆失败！
    echo.
    echo 可能原因：
    echo   1. Git 未安装
    echo   2. 仓库地址错误
    echo   3. 网络连接问题
    echo.
    echo 建议：使用方式3手动创建
    pause
    exit /b 1
)

echo.
echo [✓] 项目克隆成功！
echo.
echo 下一步：
echo   1. cd %folder%
echo   2. pnpm install
echo   3. 按照文档继续配置
echo.
goto END

:DOWNLOAD
echo.
echo [方式2] 下载 ZIP 文件
echo.
echo 请按照以下步骤操作：
echo.
echo 1. 访问项目页面（GitHub 或 Gitee）
echo 2. 点击 "Code" 按钮
echo 3. 选择 "Download ZIP"
echo 4. 等待下载完成
echo 5. 解压到您想要的位置
echo.
echo 解压后：
echo   1. 进入解压的文件夹
echo   2. 运行: pnpm install
echo   3. 按照文档继续配置
echo.
goto END

:MANUAL
echo.
echo [方式3] 手动创建基本结构
echo.

set /p folder="请输入项目文件夹名称 (默认: lovato-pump-selection): "
if "%folder%"=="" set folder=lovato-pump-selection

echo.
echo 正在创建项目文件夹...
mkdir "%folder%" 2>nul
cd "%folder%"

echo.
echo 创建文件夹结构...
mkdir src 2>nul
mkdir src\app 2>nul
mkdir src\components 2>nul
mkdir src\lib 2>nul
mkdir public 2>nul
mkdir migrations 2>nul

echo.
echo 创建 package.json...
(
echo {
echo   "name": "lovato-pump-selection",
echo   "version": "1.0.0",
echo   "private": true,
echo   "scripts": {
echo     "dev": "next dev",
echo     "build": "next build",
echo     "start": "next start",
echo     "lint": "next lint"
echo   },
echo   "dependencies": {
echo     "next": "16.1.1",
echo     "react": "19.2.3",
echo     "react-dom": "19.2.3",
echo     "pg": "^8.16.3",
echo     "drizzle-orm": "^0.45.1"
echo   },
echo   "devDependencies": {
echo     "@types/node": "^20",
echo     "@types/react": "^19",
echo     "@types/react-dom": "^19",
echo     "typescript": "^5"
echo   }
echo }
) > package.json

echo.
echo 创建 .env.example...
(
echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump
echo POSTGRES_DATA_DIR=C:\Program Files\PostgreSQL\14\data
echo POSTGRES_BACKUP_DIR=C:\Program Files\PostgreSQL\14\backups
) > .env.example

echo.
echo 创建 README.md...
(
echo # 洛瓦托智能水泵选型系统
echo.
echo ## 快速开始
echo.
echo 1. 安装依赖：pnpm install
echo 2. 创建配置：copy .env.example .env
echo 3. 创建数据库：psql -U postgres -c "CREATE DATABASE lovato_pump;"
echo 4. 启动应用：pnpm run dev
echo 5. 访问：http://localhost:5000
) > README.md

echo.
echo [✓] 基本结构创建完成！
echo.
echo 当前目录: %CD%
echo.
echo 下一步：
echo   1. pnpm install
echo   2. copy .env.example .env
echo   3. 按照需要添加源代码文件
echo.
goto END

:END
echo.
echo ==========================================
echo   完成！
echo ==========================================
echo.
pause
