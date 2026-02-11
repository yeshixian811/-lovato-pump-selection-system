# 洛瓦托水泵选型系统 - 快速部署指南

## 🚀 快速开始（3 步部署）

### 前置条件
- ✅ 腾讯云轻量服务器（122.51.22.101）
- ✅ 腾讯云轻量数据库 PostgreSQL（122.51.22.101:5433）
- ✅ SSH 访问权限

---

## 📝 部署步骤

### 第 1 步：上传项目文件

```bash
# 在本地压缩项目
cd /workspace/projects
tar -czf lovato-pump.tar.gz \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='logs' \
  .

# 上传到服务器
scp lovato-pump.tar.gz root@122.51.22.101:/opt/

# 在服务器上解压
ssh root@122.51.22.101
cd /opt
tar -xzf lovato-pump.tar.gz
mv projects lovato-pump
cd lovato-pump
```

### 第 2 步：执行自动部署

```bash
# 在服务器上执行
bash /opt/lovato-pump/scripts/deploy-tencent-cloud.sh
```

**预计时间：8-12 分钟**

### 第 3 步：验证部署

```bash
# 在浏览器访问
http://122.51.22.101

# 或测试 API
curl http://122.51.22.101/api/health
```

---

## 🔧 关键配置

### 数据库配置
```env
DATABASE_URL=postgresql://admin:Tencent@123@122.51.22.101:5433/mydb
```

### 应用访问
```
URL: http://122.51.22.101
端口: 80, 443
```

---

## 📊 常用命令

```bash
# 查看应用状态
cd /opt/lovato-pump
docker-compose ps

# 查看日志
docker logs -f lovato-pump-app

# 重启应用
docker-compose restart

# 停止应用
docker-compose stop
```

---

## 🆘 常见问题

### Q1: 数据库连接失败
**解决：** 检查数据库白名单，添加服务器 IP 122.51.22.101

### Q2: 无法访问应用
**解决：** 检查腾讯云防火墙，开放 80/443 端口

### Q3: 应用启动失败
**解决：** 查看容器日志 `docker logs lovato-pump-app`

---

## 📞 获取帮助

查看详细文档：`DEPLOYMENT.md`

---

**部署完成后，访问 http://122.51.22.101 开始使用！**
