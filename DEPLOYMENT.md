# 洛瓦托水泵选型系统 - 腾讯云部署指南

## 📋 环境说明

### 服务器配置
- **服务器类型**: 腾讯云轻量应用服务器
- **操作系统**: Ubuntu 22.04 LTS
- **IP 地址**: 122.51.22.101

### 数据库配置
- **数据库类型**: 腾讯云轻量数据库 PostgreSQL
- **数据库版本**: PostgreSQL 15
- **外网地址**: 122.51.22.101:5433
- **用户名**: admin
- **密码**: Tencent@123
- **数据库名**: mydb

---

## 🚀 部署步骤

### 1. SSH 登录服务器

```bash
ssh root@122.51.22.101
```

### 2. 上传项目文件

将项目文件上传到服务器的 `/opt/lovato-pump` 目录：

```bash
# 创建项目目录
mkdir -p /opt/lovato-pump
cd /opt/lovato-pump

# 上传项目文件（使用 scp 或其他方式）
# scp -r . root@122.51.22.101:/opt/lovato-pump/
```

### 3. 测试数据库连接

```bash
# 运行数据库连接测试脚本
node /opt/lovato-pump/scripts/test-db-connection.js

# 或使用 npm 脚本
cd /opt/lovato-pump
pnpm test:db
```

### 4. 执行自动部署

```bash
# 运行自动部署脚本
bash /opt/lovato-pump/scripts/deploy-tencent-cloud.sh

# 或使用 npm 脚本
cd /opt/lovato-pump
pnpm deploy:tencent
```

### 5. 验证部署

部署完成后，在浏览器中访问：

```
http://122.51.22.101
```

---

## 📊 管理命令

### 查看容器状态

```bash
cd /opt/lovato-pump
docker-compose ps
```

### 查看应用日志

```bash
# 实时查看日志
docker logs -f lovato-pump-app

# 查看最新 100 行日志
docker logs --tail 100 lovato-pump-app
```

### 重启应用

```bash
cd /opt/lovato-pump
docker-compose restart app
```

### 停止应用

```bash
cd /opt/lovato-pump
docker-compose stop
```

### 更新应用

```bash
cd /opt/lovato-pump

# 拉取最新代码
git pull

# 重新构建镜像
docker-compose build

# 重启服务
docker-compose up -d
```

---

## 🔧 故障排查

### 1. 应用无法启动

**检查容器日志**：
```bash
docker logs lovato-pump-app
```

**常见原因**：
- 数据库连接失败
- 环境变量配置错误
- 端口被占用

**解决方案**：
```bash
# 检查数据库连接
pnpm test:db

# 检查环境变量
docker exec lovato-pump-app env | grep DATABASE_URL

# 检查端口占用
sudo netstat -tlnp | grep 5000
```

### 2. 数据库连接失败

**检查数据库白名单**：
1. 登录腾讯云控制台
2. 进入"轻量数据库"服务
3. 找到 PostgreSQL 实例
4. 配置白名单，添加服务器 IP: 122.51.22.101

**测试数据库连接**：
```bash
# 安装 PostgreSQL 客户端
sudo apt-get install -y postgresql-client

# 测试连接
PGPASSWORD='Tencent@123' psql -h 122.51.22.101 -p 5433 -U admin -d mydb -c "SELECT 1;"
```

### 3. 无法访问应用

**检查防火墙规则**：
```bash
# 检查 ufw 状态
sudo ufw status

# 开放端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

**检查腾讯云防火墙**：
1. 登录腾讯云控制台
2. 进入"轻量应用服务器"
3. 找到防火墙规则
4. 添加规则：端口 80/443，来源 0.0.0.0/0

### 4. 性能问题

**检查容器资源使用**：
```bash
docker stats lovato-pump-app
```

**检查系统资源**：
```bash
# CPU 使用率
top

# 内存使用
free -h

# 磁盘使用
df -h
```

---

## 📊 API 接口说明

### 主要接口

| 接口 | 方法 | 功能 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/pumps` | GET | 获取水泵列表 |
| `/api/pumps` | POST | 创建水泵 |
| `/api/pumps/[id]` | GET | 获取单个水泵 |
| `/api/pumps/[id]` | PUT | 更新水泵 |
| `/api/pumps/[id]` | DELETE | 删除水泵 |
| `/api/pump/match` | POST | 智能选型 |
| `/api/upload` | POST | 文件上传 |
| `/api/pumps/import` | POST | 批量导入 |
| `/api/pumps/export` | GET | 批量导出 |
| `/api/website/products` | GET | 网站产品展示 |
| `/api/website/news` | GET | 新闻列表 |

### 测试接口

```bash
# 测试健康检查
curl http://122.51.22.101/api/health

# 测试水泵列表
curl http://122.51.22.101/api/pumps

# 测试智能选型
curl -X POST http://122.51.22.101/api/pump/match \
  -H "Content-Type: application/json" \
  -d '{
    "required_flow_rate": 10,
    "required_head": 20,
    "application_type": "工业供水",
    "fluid_type": "清水",
    "pump_type": "离心泵"
  }'
```

---

## 🔐 安全建议

### 1. 修改默认密码

```bash
# 在腾讯云控制台修改数据库密码
# 更新 .env.production 文件中的 DATABASE_URL
```

### 2. 修改 JWT_SECRET

```bash
# 生成随机密钥
openssl rand -base64 32

# 更新 .env.production 中的 JWT_SECRET
```

### 3. 启用 HTTPS

```nginx
# 安装 SSL 证书（使用 Let's Encrypt）
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d lowatopump.com
```

### 4. 配置数据库白名单

```bash
# 仅允许服务器 IP 访问数据库
# 不要使用 0.0.0.0/0
```

---

## 📝 环境变量说明

### 必需变量

```env
# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://122.51.22.101

# 数据库配置
DATABASE_URL=postgresql://admin:Tencent@123@122.51.22.101:5433/mydb

# JWT 认证
JWT_SECRET=lovato-jwt-secret-key-production-2024-secure
JWT_ACCESS_TOKEN_EXPIRY=3600
JWT_REFRESH_TOKEN_EXPIRY=604800

# 数据加密
ENCRYPTION_KEY=lovato-encryption-key-production-2024-secure-aes-256-gcm

# CORS 配置
ALLOWED_ORIGINS=http://122.51.22.101,https://lowatopump.com
```

### 可选变量

```env
# 日志配置
LOG_LEVEL=info
LOG_VERBOSE=false

# 上传配置
MAX_UPLOAD_SIZE=10485760

# 数据库连接池
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

---

## 🔄 更新流程

### 1. 备份当前版本

```bash
cd /opt/lovato-pump
docker-compose ps
docker-compose stop
```

### 2. 更新代码

```bash
git pull
# 或上传新文件
```

### 3. 重新构建和部署

```bash
bash scripts/deploy-tencent-cloud.sh
```

### 4. 验证更新

```bash
# 测试健康检查
curl http://localhost:5000/api/health

# 查看日志
docker logs --tail 50 lovato-pump-app
```

---

## 📞 技术支持

如果遇到问题，请提供以下信息：

1. 错误信息
2. 容器日志：`docker logs lovato-pump-app`
3. 容器状态：`docker-compose ps`
4. 数据库连接测试结果

---

## 📄 许可证

洛瓦托水泵选型系统 - 版权所有 © 2024
