# 洛瓦托水泵选型系统 - 部署包说明

## 📦 部署包信息

**文件名**: `lovato-pump-deploy.tar.gz`
**文件大小**: 3.5MB
**目标服务器**: 122.51.22.101
**数据库**: 122.51.22.101:5433

---

## 🚀 快速开始

### 方式 1：一键部署（推荐）

```bash
# 1. 进入部署文件目录
cd /path/to/lovato-pump-deploy.tar.gz

# 2. 执行一键部署
bash scripts/one-click-deploy.sh

# 3. 等待部署完成（10-15 分钟）

# 4. 访问应用
# http://122.51.22.101
```

### 方式 2：手动部署

```bash
# 1. 上传文件
scp lovato-pump-deploy.tar.gz root@122.51.22.101:/tmp/

# 2. 登录服务器
ssh root@122.51.22.101

# 3. 解压并部署
mkdir -p /opt/lovato-pump
cd /opt/lovato-pump
tar -xzf /tmp/lovato-pump-deploy.tar.gz
mv projects/* .
rm -rf projects

# 4. 执行部署脚本
bash scripts/deploy-tencent-cloud.sh

# 5. 等待完成并访问
# http://122.51.22.101
```

---

## 📋 部署包内容

### 应用文件
- ✅ Docker 镜像构建文件（Dockerfile）
- ✅ 容器编排配置（docker-compose.yml）
- ✅ Nginx 反向代理配置（nginx/nginx.conf）
- ✅ 环境配置文件（.env, .env.production）
- ✅ 应用源代码（src/）

### 部署脚本
- ✅ 一键部署脚本（scripts/one-click-deploy.sh）
- ✅ 自动部署脚本（scripts/deploy-tencent-cloud.sh）
- ✅ 配置检查脚本（scripts/check-config.sh）
- ✅ 数据库测试脚本（scripts/test-db-connection.js）

### API 接口
- ✅ 容器管理 API（/api/admin/docker/*）
- ✅ 系统监控 API（/api/admin/system/*）
- ✅ 数据库状态 API（/api/admin/database/*）
- ✅ 健康检查 API（/api/health）
- ✅ 水泵管理 API（/api/pumps/*）
- ✅ 智能选型 API（/api/pump/match）

### 管理面板
- ✅ 部署管理面板（/admin）
- ✅ 容器管理功能
- ✅ 数据库监控功能
- ✅ 系统资源监控

### 文档
- ✅ 部署说明（DEPLOY_TO_122_51_22_101.md）
- ✅ 快速开始（QUICK_DEPLOY.md）
- ✅ 完整部署文档（DEPLOYMENT.md）
- ✅ 管理面板文档（ADMIN_PANEL.md）

---

## 📊 部署后访问地址

### 应用访问
```
主页: http://122.51.22.101
智能选型: http://122.51.22.101/selection
产品库: http://122.51.22.101/products
管理面板: http://122.51.22.101/admin
```

### API 接口
```
健康检查: http://122.51.22.101/api/health
水泵列表: http://122.51.22.101/api/pumps
智能选型: http://122.51.22.101/api/pump/match
文件上传: http://122.51.22.101/api/upload
```

---

## 🔧 管理命令

### SSH 登录
```bash
ssh root@122.51.22.101
```

### 查看应用状态
```bash
cd /opt/lovato-pump
docker-compose ps
```

### 查看日志
```bash
# 实时日志
docker logs -f lovato-pump-app

# 最新日志
docker logs --tail 100 lovato-pump-app
```

### 重启应用
```bash
cd /opt/lovato-pump
docker-compose restart
```

---

## 🔐 安全配置

### 数据库配置
```
地址: 122.51.22.101:5433
用户: admin
密码: Tencent@123
数据库: mydb
```

### 环境变量
```env
NODE_ENV=production
DATABASE_URL=postgresql://admin:Tencent@123@122.51.22.101:5433/mydb
JWT_SECRET=lovato-jwt-secret-key-production-2024-secure
SHOW_ADMIN_PANEL=true
```

---

## ⚠️ 重要提示

### 1. 防火墙配置
必须在腾讯云控制台配置防火墙规则：
- 端口 80（HTTP）
- 端口 443（HTTPS）

### 2. 数据库白名单
在腾讯云轻量数据库配置白名单，添加服务器 IP：122.51.22.101

### 3. 首次访问
应用启动需要 1-2 分钟，请耐心等待

### 4. 管理面板安全
生产环境建议：
- 添加认证保护
- 使用 HTTPS 协议
- 限制访问 IP
- 修改默认密码

---

## 📝 验证清单

部署完成后，请验证：

- [ ] 应用可以访问：http://122.51.22.101
- [ ] 智能选型功能正常
- [ ] 管理面板可以访问：http://122.51.22.101/admin
- [ ] 健康检查接口正常：http://122.51.22.101/api/health
- [ ] 容器运行正常：`docker ps`
- [ ] 数据库连接正常

---

## 🆘 故障排查

### 常见问题

1. **无法访问应用**
   - 检查容器状态：`docker ps`
   - 检查防火墙配置
   - 查看应用日志：`docker logs lovato-pump-app`

2. **数据库连接失败**
   - 检查数据库白名单
   - 测试数据库连接：`psql -h 122.51.22.101 -p 5433 -U admin -d mydb`

3. **容器启动失败**
   - 查看容器日志
   - 重新构建镜像：`docker-compose build`

详见：DEPLOY_TO_122_51_22_101.md

---

## 📞 技术支持

如有问题，请提供：
- 错误信息
- 容器日志：`docker logs lovato-pump-app`
- 容器状态：`docker ps`

---

**部署完成！访问 http://122.51.22.101 开始使用！** 🎉
