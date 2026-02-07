@echo off
chcp 65001 >nul
title 部署到本地电脑 - 环境检查
color 0E

echo.
echo ==========================================
echo   部署洛瓦托水泵选型系统到本地电脑
echo   第1步：环境检查
echo ==========================================
echo.

:: 检查 Node.js
echo [检查 1/3] Node.js...
where node >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo [✓] Node.js 已安装: %NODE_VER%
) else (
    echo [✗] Node.js 未安装
    echo.
    echo 请先安装 Node.js:
    echo   1. 访问 https://nodejs.org/
    echo   2. 下载并安装 LTS 版本
    echo   3. 安装后重新运行此脚本
    echo.
    pause
    exit /b 1
)
echo.

:: 检查 pnpm
echo [检查 2/3] pnpm...
where pnpm >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VER=%%i
    echo [✓] pnpm 已安装: %PNPM_VER%
) else (
    echo [✗] pnpm 未安装
    echo.
    echo 正在安装 pnpm...
    call npm install -g pnpm
    if %errorLevel% neq 0 (
        echo [✗] pnpm 安装失败
        pause
        exit /b 1
    )
    echo [✓] pnpm 安装成功
    pnpm --version
)
echo.

:: 检查 PostgreSQL
echo [检查 3/3] PostgreSQL...
where psql >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%i in ('psql --version') do set PG_VER=%%i
    echo [✓] PostgreSQL 已安装: %PG_VER%

    :: 检查服务
    sc query postgresql-x64-14 | findstr "RUNNING" >nul 2>&1
    if %errorLevel% equ 0 (
        echo [✓] PostgreSQL 服务运行中
    ) else (
        echo [⚠] PostgreSQL 服务未运行
        echo 正在启动...
        net start postgresql-x64-14 >nul 2>&1
        if %errorLevel% equ 0 (
            echo [✓] PostgreSQL 服务已启动
        ) else (
            echo [✗] 无法启动 PostgreSQL 服务
        )
    )
) else (
    echo [✗] PostgreSQL 未安装
    echo.
    echo 请先安装 PostgreSQL:
    echo   1. 访问 https://www.postgresql.org/download/windows/
    echo   2. 下载并安装
    echo   3. 设置密码为: postgres
    echo   4. 安装后重新运行此脚本
    echo.
    pause
    exit /b 1
)
echo.

echo ==========================================
echo   环境检查完成！
echo ==========================================
echo.
echo 检查结果:
echo   Node.js: %NODE_VER%
echo   pnpm: %PNPM_VER%
echo   PostgreSQL: %PG_VER%
echo.
echo 所有必需软件已安装，可以继续部署。
echo.
set /p continue="按 Enter 继续，或输入 'exit' 退出: "
if /i "%continue%"=="exit" exit /b 0

:: 进入第2步：创建项目
echo.
echo ==========================================
echo   第2步：创建项目
echo ==========================================
echo.

set /p project_path="请输入项目安装路径 (默认: C:\lovato-pump): "
if "%project_path%"=="" set project_path=C:\lovato-pump

echo.
echo 正在创建项目目录...
if exist "%project_path%" (
    echo [警告] 目录已存在
    set /p overwrite="是否覆盖? (Y/N): "
    if /i not "%overwrite%"=="Y" (
        echo 取消操作
        pause
        exit /b 0
    )
)

mkdir "%project_path%" 2>nul
cd /d "%project_path%"

if %errorLevel% neq 0 (
    echo [错误] 无法创建目录
    pause
    exit /b 1
)

echo [✓] 项目目录: %project_path%
echo.

echo 正在创建项目结构...
mkdir src 2>nul
mkdir src\app 2>nul
mkdir src\components 2>nul
mkdir src\lib 2>nul
mkdir public 2>nul
mkdir migrations 2>nul
echo [✓] 目录结构创建完成
echo.

echo 正在创建配置文件...
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
echo     "typescript": "^5",
echo     "tailwindcss": "^4"
echo   }
echo }
) > package.json

echo 创建 .env...
(
echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lovato_pump
echo POSTGRES_DATA_DIR=C:\Program Files\PostgreSQL\14\data
echo POSTGRES_BACKUP_DIR=C:\Program Files\PostgreSQL\14\backups
) > .env

echo 创建 tsconfig.json...
(
echo {
echo   "compilerOptions": {
echo     "target": "ES2020",
echo     "lib": ["dom", "dom.iterable", "esnext"],
echo     "allowJs": true,
echo     "skipLibCheck": true,
echo     "strict": true,
echo     "noEmit": true,
echo     "esModuleInterop": true,
echo     "module": "esnext",
echo     "moduleResolution": "bundler",
echo     "resolveJsonModule": true,
echo     "isolatedModules": true,
echo     "jsx": "preserve",
echo     "incremental": true,
echo     "plugins": [
echo       {
echo         "name": "next"
echo       }
echo     ],
echo     "paths": {
echo       "@/*": ["./src/*"]
echo     }
echo   },
echo   "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
echo   "exclude": ["node_modules"]
echo }
) > tsconfig.json

echo 创建 next.config.ts...
(
echo import type { NextConfig } from 'next'
echo.
echo const nextConfig: NextConfig = {
echo   reactStrictMode: true,
echo }
echo.
echo export default nextConfig
) > next.config.ts

echo [✓] 配置文件创建完成
echo.

echo 正在创建基础页面...
echo 创建首页...
(
echo import type { Metadata } from 'next'
echo import './globals.css'
echo.
echo export const metadata: Metadata = {
echo   title: '洛瓦托智能水泵选型系统',
echo   description: '智能水泵选型工具',
echo }
echo.
echo export default function RootLayout({
echo   children,
echo }: {
echo   children: React.ReactNode
echo }) {
echo   return (
echo     ^<html lang="zh-CN"^>
echo       ^<body^>{children}^</body^>
echo     ^</html^>
echo   )
echo }
) > src\app\layout.tsx

(
echo export default function Home() {
echo   return (
echo     ^<div className="min-h-screen flex items-center justify-center"^>
echo       ^<div className="text-center"^>
echo         ^<h1 className="text-4xl font-bold mb-4"^>
echo           洛瓦托智能水泵选型系统
echo         ^</h1^>
echo         ^<p className="text-gray-600"^>
echo           系统已成功部署！
echo         ^</p^>
echo         ^<p className="text-green-600 mt-4"^>
echo           ✓ 环境正常
echo         ^</p^>
echo       ^</div^>
echo     ^</div^>
echo   )
echo }
) > src\app\page.tsx

(
echo @tailwind base;
echo @tailwind components;
echo @tailwind utilities;
) > src\app\globals.css

echo [✓] 基础页面创建完成
echo.

echo ==========================================
echo   第3步：安装依赖
echo ==========================================
echo.

echo 正在安装依赖，这可能需要几分钟...
pnpm install

if %errorLevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo [✓] 依赖安装完成
echo.

echo ==========================================
echo   第4步：配置数据库
echo ==========================================
echo.

echo 正在创建数据库...
psql -U postgres -c "CREATE DATABASE lovato_pump;" >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] 数据库创建成功
) else (
    echo [信息] 数据库可能已存在
)
echo.

echo ==========================================
echo   部署完成！
echo ==========================================
echo.
echo 项目位置: %project_path%
echo.
echo 启动应用:
echo   1. 进入项目目录: cd /d "%project_path%"
echo   2. 启动开发服务器: pnpm run dev
echo   3. 访问: http://localhost:5000
echo.
echo 现在是否启动应用？ (Y/N)
set /p start_app=

if /i "%start_app%"=="Y" (
    echo.
    echo 正在启动开发服务器...
    echo 按 Ctrl+C 停止服务器
    echo.
    pnpm run dev
) else (
    echo.
    echo 您可以稍后手动启动:
    echo   cd /d "%project_path%"
    echo   pnpm run dev
    echo.
)

pause
