# 部署脚本说明

本目录包含用于洛瓦托水泵选型系统本地部署的辅助脚本。

## 脚本列表

### 1. `quick-start.bat` - 快速启动脚本
一键启动开发服务器，自动检查环境并安装依赖。

**功能：**
- 检查 Node.js 和 pnpm 安装
- 检查端口占用
- 自动安装依赖
- 启动开发服务器

**使用方法：**
```batch
quick-start.bat
```

### 2. `deploy-local.bat` - 本地部署脚本
完整的本地部署向导，引导用户完成所有配置步骤。

**功能：**
- 检查系统环境（Node.js、pnpm、PostgreSQL）
- 检查数据库连接
- 安装项目依赖
- 配置环境变量
- 初始化数据库
- 启动服务（开发或生产模式）

**使用方法：**
```batch
deploy-local.bat
```

**注意：** 需要以管理员身份运行。

### 3. `migrate-to-j-drive.bat` - 数据库迁移脚本
将 PostgreSQL 数据库从默认位置迁移到 J 盘。

**功能：**
- 备份当前数据库
- 停止 PostgreSQL 服务
- 将数据文件迁移到 J 盘（`J:\postgresql\data`）
- 重新配置 PostgreSQL
- 启动服务并验证

**使用方法：**
```batch
migrate-to-j-drive.bat
```

**注意事项：**
- 必须以管理员身份运行
- 确保 J 盘有足够空间
- 迁移过程可能需要几分钟
- 迁移前会自动备份

### 4. `health-check.bat` - 系统健康检查脚本
检查系统环境和配置状态。

**功能：**
- 检查 Node.js 和 pnpm 安装
- 检查 PostgreSQL 安装和服务状态
- 检查项目依赖和环境变量
- 检查端口占用情况
- 检查数据库连接
- 检查构建状态

**使用方法：**
```batch
health-check.bat
```

## 推荐的部署流程

### 首次部署
1. 运行 `health-check.bat` 检查系统环境
2. 运行 `deploy-local.bat` 完成完整部署

### 需要将数据库迁移到 J 盘
1. 运行 `migrate-to-j-drive.bat` 迁移数据库
2. 运行 `health-check.bat` 验证迁移结果

### 日常启动
1. 运行 `quick-start.bat` 快速启动开发服务器

### 遇到问题时
1. 运行 `health-check.bat` 诊断问题
2. 根据检查结果修复问题
3. 参考详细的部署文档：`DEPLOYMENT.md`

## 环境要求

- Windows 操作系统
- Node.js 24.x
- pnpm
- PostgreSQL 14+
- 至少 10GB 可用磁盘空间

## 常见问题

### 问题 1: 脚本运行失败
**解决方法：**
- 右键点击脚本，选择"以管理员身份运行"
- 检查 PowerShell 执行策略：`Set-ExecutionPolicy RemoteSigned`

### 问题 2: 数据库连接失败
**解决方法：**
- 检查 PostgreSQL 服务是否启动
- 验证 `.env` 文件中的数据库配置
- 运行 `health-check.bat` 诊断

### 问题 3: 端口 5000 被占用
**解决方法：**
- 查找占用进程：`netstat -ano | findstr :5000`
- 结束占用进程或更改应用端口

### 问题 4: 依赖安装失败
**解决方法：**
- 清理缓存：`pnpm store prune`
- 删除 `node_modules` 目录后重试
- 检查网络连接

## 技术支持

如果遇到无法解决的问题，请：
1. 运行 `health-check.bat` 并截图输出
2. 查看应用日志文件
3. 参考详细的部署文档：`DEPLOYMENT.md`

## 安全注意事项

1. **数据库安全**
   - 修改默认数据库密码
   - 定期备份数据库
   - 限制数据库远程访问

2. **应用安全**
   - 配置 HTTPS
   - 修改默认管理员密码
   - 定期更新依赖

3. **网络安全**
   - 配置防火墙规则
   - 使用 Cloudflare Tunnel 进行内网穿透
   - 不要暴露不必要的服务端口

## 更新日志

### v1.0.0 (2025-01-15)
- 初始版本
- 添加快速启动脚本
- 添加本地部署脚本
- 添加数据库迁移脚本
- 添加系统健康检查脚本
