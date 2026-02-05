@echo off
echo ====================================
echo 洛瓦托水泵选型系统 - Windows Server 部署脚本
echo ====================================
echo.

:: 设置变量
set PROJECT_DIR=C:\projects\lovato-pump
set PORT=3000

:: 1. 创建项目目录
echo [1/6] 创建项目目录...
if not exist "%PROJECT_DIR%" mkdir "%PROJECT_DIR%"
cd /d "%PROJECT_DIR%"
echo ✓ 项目目录已创建
echo.

:: 2. 安装依赖
echo [2/6] 安装依赖...
call pnpm install --ignore-scripts
echo ✓ 依赖已安装
echo.

:: 3. 构建项目
echo [3/6] 构建项目...
call pnpm run build
echo ✓ 项目已构建
echo.

:: 4. 停止旧进程
echo [4/6] 停止旧进程...
call pm2 stop lovato-pump 2>nul
call pm2 delete lovato-pump 2>nul
echo ✓ 旧进程已停止
echo.

:: 5. 启动新进程
echo [5/6] 启动新进程...
call pm2 start npm --name "lovato-pump" -- start
echo ✓ 新进程已启动
echo.

:: 6. 保存配置
echo [6/6] 保存配置...
call pm2 save
echo ✓ 配置已保存
echo.

echo ====================================
echo 部署完成！
echo ====================================
echo.
echo 项目已启动在端口 %PORT%
echo.
echo 访问地址：
echo http://localhost:%PORT%
echo http://你的服务器IP:%PORT%
echo.
echo 运行 pm2 status 查看状态
echo 运行 pm2 logs lovato-pump 查看日志
echo.

pause
