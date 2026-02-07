@echo off
REM 洛瓦托水泵选型系统 - 超简化部署脚本

echo ========================================
echo   洛瓦托水泵选型系统
echo   一键创建项目结构
echo ========================================
echo.

cd /d C:\
if not exist "lovato-pump" (
    mkdir lovato-pump
)
cd lovato-pump

echo [1/5] 创建目录结构...
mkdir migrations 2>nul
mkdir src\app\selection 2>nul
mkdir src\app\api\pump\match 2>nul
echo [✓] 目录创建完成
echo.

echo [2/5] 初始化项目...
call npm init -y
call npm pkg set type="module"
call npm pkg set scripts.dev="next dev --port 3002"
call npm pkg set scripts.build="next build"
call npm pkg set scripts.start="next start --port 3002"
echo [✓] 项目初始化完成
echo.

echo [3/5] 安装依赖（这可能需要几分钟）...
call npm install next@latest react@latest react-dom@latest
call npm install lucide-react clsx tailwind-merge class-variance-authority
call npm install -D typescript @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer
call npx tailwindcss init -p
echo [✓] 依赖安装完成
echo.

echo [4/5] 创建配置文件...
echo DB_HOST=localhost> .env
echo DB_PORT=5432>> .env
echo DB_NAME=lovato_pump_selection>> .env
echo DB_USER=postgres>> .env
echo DB_PASSWORD=postgres>> .env
echo [✓] 配置文件创建完成
echo.

echo [5/5] 创建 TypeScript 配置...
(
echo {
echo   "compilerOptions": {
echo     "target": "ES2017",
echo     "lib": ["dom", "dom.iterable", "esnext"],
echo     "allowJs": true,
echo     "skipLibCheck": true,
echo     "strict": true,
echo     "forceConsistentCasingInFileNames": true,
echo     "noEmit": true,
echo     "esModuleInterop": true,
echo     "module": "esnext",
echo     "moduleResolution": "bundler",
echo     "resolveJsonModule": true,
echo     "isolatedModules": true,
echo     "jsx": "preserve",
echo     "incremental": true,
echo     "plugins": [{ "name": "next" }],
echo     "paths": { "@/*": ["./src/*"] }
echo   },
echo   "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
echo   "exclude": ["node_modules"]
echo }
) > tsconfig.json
echo [✓] TypeScript 配置完成
echo.

echo ========================================
echo   项目结构创建完成！
echo ========================================
echo.
echo 项目目录: C:\lovato-pump
echo.
echo 下一步：
echo 1. 复制必需文件到对应目录（见下方清单）
echo 2. 初始化数据库
echo 3. 启动应用
echo.
echo ========================================
echo   需要复制的文件清单：
echo ========================================
echo.
echo 1. C:\lovato-pump\migrations\002_create_pump_tables.sql
echo 2. C:\lovato-pump\migrations\003_insert_sample_pumps.sql
echo 3. C:\lovato-pump\src\app\selection\page.tsx
echo 4. C:\lovato-pump\src\app\api\pump\match\route.ts
echo.
echo ========================================
echo   数据库初始化命令：
echo ========================================
echo.
echo psql -U postgres -c "CREATE DATABASE lovato_pump_selection;"
echo psql -U postgres -d lovato_pump_selection -f migrations\002_create_pump_tables.sql
echo psql -U postgres -d lovato_pump_selection -f migrations\003_insert_sample_pumps.sql
echo.
echo ========================================
echo   启动应用命令：
echo ========================================
echo.
echo cd C:\lovato-pump
echo npm run dev
echo.
echo 访问地址: http://localhost:3002
echo.

pause
