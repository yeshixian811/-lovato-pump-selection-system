# 腾讯云快速部署指南

## 快速开始（5分钟部署）

### 前提条件
- [ ] 已购买腾讯云 CVM 服务器
- [ ] 已购买域名并解析到服务器
- [ ] 已申请腾讯云 SSL 证书

### 一键部署命令

```bash
# 1. 上传项目到服务器
scp -r /path/to/project root@your-server-ip:/var/www/luowato-selection

# 2. SSH 登录服务器
ssh root@your-server-ip

# 3. 进入项目目录
cd /var/www/luowato-selection

# 4. 修改配置（替换你的域名和邮箱）
sed -i 's/your-domain.com/your-domain.com/g' deploy-tencent.sh
sed -i 's/your-email@example.com/your-email@example.com/g' deploy-tencent.sh

# 5. 运行部署脚本
bash deploy-tencent.sh

# 6. 配置环境变量（重要！）
nano .env.production
# 更新以下配置：
# - DATABASE_URL=postgresql://用户名:密码@内网地址:5432/数据库名
# - NEXT_PUBLIC_WECHAT_APP_ID=你的微信AppID

# 7. 上传 SSL 证书
mkdir -p /etc/nginx/ssl/your-domain.com
# 上传 fullchain.pem 和 privkey.pem 到该目录

# 8. 重启服务
systemctl restart nginx
pm2 restart luowato-selection
```

### 验证部署

```bash
# 检查应用状态
pm2 status

# 检查 Nginx 状态
systemctl status nginx

# 检查端口监听
ss -lptn 'sport = :5000'

# 测试访问
curl -I https://your-domain.com
```

## 常见问题快速解决

### 问题1：访问 502 Bad Gateway
```bash
# 检查应用是否运行
pm2 status

# 重启应用
pm2 restart luowato-selection

# 查看日志
pm2 logs luowato-selection
```

### 问题2：SSL 证书错误
```bash
# 检查证书文件
ls -la /etc/nginx/ssl/your-domain.com/

# 重新上传证书
# 确保 fullchain.pem 和 privkey.pem 都在

# 重启 Nginx
systemctl restart nginx
```

### 问题3：数据库连接失败
```bash
# 检查环境变量
cat .env.production | grep DATABASE_URL

# 测试数据库连接
psql -h 内网地址 -U 用户名 -d 数据库名

# 更新配置后重启
pm2 restart luowato-selection
```

## 下一步

- 📖 详细文档：[腾讯云部署指南](DEPLOYMENT_GUIDE_TENCENT.md)
- ✅ 检查清单：[部署检查清单](DEPLOYMENT_CHECKLIST.md)
- 🔧 排错文档：[部署错误检查](DEPLOYMENT_ERROR_CHECK.md)

## 技术支持

如遇问题，请提供以下信息：
1. 服务器 IP 和域名
2. PM2 日志：`pm2 logs luowato-selection --lines 100`
3. Nginx 日志：`tail -100 /var/log/nginx/luowato-selection-error.log`
4. 系统版本：`cat /etc/os-release`
5. Node.js 版本：`node -v`
