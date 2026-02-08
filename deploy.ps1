# 洛瓦托水泵选型系统 - 一键部署脚本 (PowerShell)

param(
    [string]$PostgresPassword = "",
    [string]$JwtSecret = "",
    [string]$EncryptionKey = "",
    [switch]$SkipDatabase = $false
)

# 设置控制台编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 颜色输出函数
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# 显示欢迎信息
Write-ColorOutput "`n====================================" "Cyan"
Write-ColorOutput "  洛瓦托水泵选型系统 - 一键部署" "Cyan"
Write-ColorOutput "====================================`n" "Cyan"

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-ColorOutput "⚠️  建议以管理员身份运行此脚本" "Yellow"
    Write-ColorOutput "`n按任意键继续，或按 Ctrl+C 取消..." "Gray"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# 步骤1：检查 Node.js
Write-ColorOutput "`n[步骤 1/7] 检查 Node.js..." "Yellow"
try {
    $nodeVersion = node --version
    Write-ColorOutput "✓ Node.js 已安装: $nodeVersion" "Green"
} catch {
    Write-ColorOutput "✗ Node.js 未安装" "Red"
    Write-ColorOutput "  请从 https://nodejs.org/ 下载并安装 Node.js 24 LTS" "Gray"
    exit 1
}

# 步骤2：检查 pnpm
Write-ColorOutput "`n[步骤 2/7] 检查 pnpm..." "Yellow"
try {
    $pnpmVersion = pnpm --version
    Write-ColorOutput "✓ pnpm 已安装: $pnpmVersion" "Green"
} catch {
    Write-ColorOutput "✗ pnpm 未安装，正在安装..." "Yellow"
    npm install -g pnpm@latest
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ pnpm 安装成功" "Green"
    } else {
        Write-ColorOutput "✗ pnpm 安装失败" "Red"
        exit 1
    }
}

# 步骤3：检查 PostgreSQL
Write-ColorOutput "`n[步骤 3/7] 检查 PostgreSQL..." "Yellow"
try {
    $psqlVersion = psql --version
    Write-ColorOutput "✓ PostgreSQL 已安装: $psqlVersion" "Green"

    # 检查 PostgreSQL 服务是否运行
    try {
        $service = Get-Service postgresql-x64-14 -ErrorAction SilentlyContinue
        if ($service -and $service.Status -eq 'Running') {
            Write-ColorOutput "✓ PostgreSQL 服务正在运行" "Green"
        } elseif ($service -and $service.Status -eq 'Stopped') {
            Write-ColorOutput "⚠️  PostgreSQL 服务已停止，正在启动..." "Yellow"
            Start-Service postgresql-x64-14
            Write-ColorOutput "✓ PostgreSQL 服务已启动" "Green"
        } else {
            Write-ColorOutput "✗ PostgreSQL 服务未找到" "Red"
            Write-ColorOutput "  请从 https://www.postgresql.org/download/windows/ 下载并安装 PostgreSQL 14" "Gray"
            exit 1
        }
    } catch {
        Write-ColorOutput "✗ 无法检查 PostgreSQL 服务状态" "Red"
        Write-ColorOutput "  请确保 PostgreSQL 14 已安装并正在运行" "Gray"
        exit 1
    }
} catch {
    Write-ColorOutput "✗ PostgreSQL 未安装" "Red"
    Write-ColorOutput "  请从 https://www.postgresql.org/download/windows/ 下载并安装 PostgreSQL 14" "Gray"
    exit 1
}

# 步骤4：输入配置信息
Write-ColorOutput "`n[步骤 4/7] 配置部署信息..." "Yellow"

if ([string]::IsNullOrEmpty($PostgresPassword)) {
    $PostgresPassword = Read-Host "请输入 PostgreSQL 密码" -AsSecureString
    $PostgresPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($PostgresPassword))
}

if ([string]::IsNullOrEmpty($JwtSecret)) {
    $useAutoJwt = Read-Host "是否自动生成 JWT 密钥? (Y/n)"
    if ($useAutoJwt -eq 'Y' -or $useAutoJwt -eq '' -or $useAutoJwt -eq 'y') {
        $JwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
        Write-ColorOutput "✓ JWT 密钥已自动生成" "Green"
    } else {
        $JwtSecret = Read-Host "请输入 JWT 密钥（至少32字符）"
        while ($JwtSecret.Length -lt 32) {
            Write-ColorOutput "⚠️  JWT 密钥长度不足32字符，请重新输入" "Yellow"
            $JwtSecret = Read-Host "请输入 JWT 密钥（至少32字符）"
        }
    }
}

if ([string]::IsNullOrEmpty($EncryptionKey)) {
    $useAutoEnc = Read-Host "是否自动生成加密密钥? (Y/n)"
    if ($useAutoEnc -eq 'Y' -or $useAutoEnc -eq '' -or $useAutoEnc -eq 'y') {
        $EncryptionKey = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
        Write-ColorOutput "✓ 加密密钥已自动生成" "Green"
    } else {
        $EncryptionKey = Read-Host "请输入加密密钥（至少32字符）"
        while ($EncryptionKey.Length -lt 32) {
            Write-ColorOutput "⚠️  加密密钥长度不足32字符，请重新输入" "Yellow"
            $EncryptionKey = Read-Host "请输入加密密钥（至少32字符）"
        }
    }
}

Write-ColorOutput "`n配置信息汇总:" "Cyan"
Write-ColorOutput "  PostgreSQL 密码: ***" "Gray"
Write-ColorOutput "  JWT 密钥: $($JwtSecret.Substring(0, 10))..." "Gray"
Write-ColorOutput "  加密密钥: $($EncryptionKey.Substring(0, 10))..." "Gray"

# 步骤5：创建 .env 文件
Write-ColorOutput "`n[步骤 5/7] 创建配置文件..." "Yellow"
$envContent = @"
# ============================================
# 洛瓦托水泵选型系统 - 环境变量配置
# ============================================

# JWT 认证配置
JWT_SECRET=$JwtSecret
JWT_ACCESS_TOKEN_EXPIRY=3600
JWT_REFRESH_TOKEN_EXPIRY=604800

# 数据加密配置
ENCRYPTION_KEY=$EncryptionKey
ENCRYPTION_ALGORITHM=aes-256-gcm

# 数据库配置
DATABASE_URL=postgresql://postgres:$PostgresPassword@localhost:5432/lovato_pump

# CORS 配置
ALLOWED_ORIGINS=http://localhost:5000,http://localhost:3000

# 应用配置
NODE_ENV=development
PORT=5000

# 日志配置
LOG_LEVEL=info
LOG_VERBOSE=true
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-ColorOutput "✓ .env 文件已创建" "Green"

# 步骤6：安装依赖
Write-ColorOutput "`n[步骤 6/7] 安装项目依赖..." "Yellow"
Write-ColorOutput "  这可能需要几分钟，请耐心等待..." "Gray"
pnpm install
if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "✓ 依赖安装成功" "Green"
} else {
    Write-ColorOutput "✗ 依赖安装失败" "Red"
    Write-ColorOutput "  请检查网络连接或手动运行: pnpm install" "Gray"
    exit 1
}

# 步骤7：数据库操作
if (-not $SkipDatabase) {
    Write-ColorOutput "`n[步骤 7/7] 配置数据库..." "Yellow"

    # 创建数据库
    Write-ColorOutput "  正在创建数据库..." "Gray"
    $createDbScript = "CREATE DATABASE lovato_pump;"
    $createDbScript | psql -U postgres -w
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ 数据库创建成功" "Green"
    } else {
        Write-ColorOutput "⚠️  数据库可能已存在，继续执行..." "Yellow"
    }

    # 运行数据库迁移
    Write-ColorOutput "  正在运行数据库迁移..." "Gray"
    pnpm run db:push
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ 数据库迁移成功" "Green"
    } else {
        Write-ColorOutput "✗ 数据库迁移失败" "Red"
        Write-ColorOutput "  请检查数据库连接或手动运行: pnpm run db:push" "Gray"
        exit 1
    }
}

# 完成
Write-ColorOutput "`n====================================" "Cyan"
Write-ColorOutput "  部署完成！" "Green"
Write-ColorOutput "====================================`n" "Cyan"

Write-ColorOutput "下一步操作:" "Yellow"
Write-ColorOutput "  1. 启动应用:" "Gray"
Write-ColorOutput "     pnpm run dev" "Cyan"
Write-ColorOutput "`n  2. 访问应用:" "Gray"
Write-ColorOutput "     http://localhost:5000" "Cyan"
Write-ColorOutput "`n  3. 默认登录账户:" "Gray"
Write-ColorOutput "     用户名: admin" "Cyan"
Write-ColorOutput "     密码: admin123" "Cyan"
Write-ColorOutput "`n  4. 访问诊断页面:" "Gray"
Write-ColorOutput "     http://localhost:5000/diagnostic" "Cyan"

Write-ColorOutput "`n是否现在启动应用? (Y/n)" "Yellow"
$startApp = Read-Host
if ($startApp -eq 'Y' -or $startApp -eq '' -or $startApp -eq 'y') {
    Write-ColorOutput "`n正在启动应用..." "Yellow"
    Write-ColorOutput "启动后请访问: http://localhost:5000`n" "Green"
    Write-ColorOutput "按 Ctrl + C 停止应用`n" "Gray"
    pnpm run dev
} else {
    Write-ColorOutput "`n您稍后可以运行以下命令启动应用:" "Gray"
    Write-ColorOutput "  pnpm run dev`n" "Cyan"
}

Write-ColorOutput "`n部署脚本执行完成！`n" "Green"
