# 腾讯云部署指南 - 微信小程序网站格式

## 项目信息

- **项目名称**: 洛瓦托水泵选型系统
- **技术栈**: Next.js 16 + React 19 + TypeScript 5
- **部署目标**: 腾讯云服务器
- **格式要求**: 微信小程序网站格式

---

## 部署前准备

### 1. 腾讯云服务器配置

#### 推荐配置
- **CPU**: 2核
- **内存**: 4GB
- **带宽**: 5Mbps
- **系统**: Ubuntu 20.04 / 22.04 LTS
- **磁盘**: 40GB SSD

#### 购买腾讯云服务器
1. 登录腾讯云控制台
2. 选择「云服务器 CVM」
3. 点击「新建」
4. 选择配置：
   - 地域：选择离用户最近的地域
   - 实例类型：标准型 S2
   - 镜像：Ubuntu 22.04
   - 系统盘：40GB SSD
   - 带宽：5Mbps
5. 设置安全组：
   - 开放端口：22（SSH）、80（HTTP）、443（HTTPS）、5000（应用）
6. 设置登录方式：使用 SSH 密钥
7. 完成购买

### 2. 数据库配置（可选）

#### 腾讯云 PostgreSQL
1. 登录腾讯云控制台
2. 选择「云数据库 PostgreSQL」
3. 点击「新建实例」
4. 选择配置：
   - 数据库版本：PostgreSQL 14
   - 内存：4GB
   - 存储：100GB
   - 架构：基础版
5. 设置账号密码
6. 获取连接信息：
   - 内网地址
   - 端口（默认 5432）
   - 数据库名称
   - 用户名
   - 密码

#### 环境变量配置
```bash
DATABASE_URL=postgresql://用户名:密码@内网地址:5432/数据库名
```

### 3. SSL 证书配置

#### 腾讯云 SSL 证书（推荐）
1. 登录腾讯云控制台
2. 选择「SSL 证书」
3. 点击「申请免费证书」
4. 填写域名信息：
   - 证书类型：免费证书（TrustAsia）
   - 域名：your-domain.com
5. 验证域名（DNS 验证或文件验证）
6. 下载证书（选择 Nginx 格式）
7. 上传到服务器：
   - fullchain.pem → /etc/nginx/ssl/your-domain.com/
   - privkey.pem → /etc/nginx/ssl/your-domain.com/

---

## 快速部署

### 方式一：自动部署脚本（推荐）

```bash
# 1. 上传项目到服务器
scp -r /path/to/project root@your-server-ip:/var/www/luowato-selection

# 2. 登录服务器
ssh root@your-server-ip

# 3. 进入项目目录
cd /var/www/luowato-selection

# 4. 修改 deploy-tencent.sh 中的域名和邮箱
nano deploy-tencent.sh

# 5. 运行自动部署脚本
bash deploy-tencent.sh

# 6. 修改环境变量
nano .env.production

# 7. 上传 SSL 证书
mkdir -p /etc/nginx/ssl/your-domain.com
# 上传 fullchain.pem 和 privkey.pem

# 8. 重启 Nginx
systemctl restart nginx
```

### 方式二：手动部署

```bash
# 1. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs

# 2. 安装 pnpm
npm install -g pnpm

# 3. 安装 PM2
npm install -g pm2

# 4. 克隆或上传项目
cd /var/www/luowato-selection
# 上传项目文件

# 5. 安装依赖
pnpm install

# 6. 构建项目
pnpm run build

# 7. 配置环境变量
nano .env.production
```

`.env.production` 配置示例：
```bash
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/luowato_selection

# 微信小程序配置
NEXT_PUBLIC_WECHAT_APP_ID=your-wechat-app-id

# 应用配置
NODE_ENV=production
PORT=5000
NEXT_PUBLIC_APP_URL=https://your-domain.com

# 腾讯云 COS 配置（可选）
COS_SECRET_ID=your-tencent-cos-secret-id
COS_SECRET_KEY=your-tencent-cos-secret-key
COS_BUCKET=your-bucket-name
COS_REGION=ap-beijing
```

```bash
# 8. 启动应用
pm2 start ecosystem.config.js
pm2 save

# 9. 配置 Nginx
nano /etc/nginx/sites-available/luowato-selection
```

Nginx 配置：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书
    ssl_certificate /etc/nginx/ssl/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/your-domain.com/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 反向代理
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 10. 启用配置
ln -s /etc/nginx/sites-available/luowato-selection /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 腾讯云域名配置

### 1. 域名解析
1. 登录腾讯云控制台
2. 选择「域名解析」
3. 选择你的域名
4. 添加记录：
   - 记录类型：A
   - 主机记录：@
   - 记录值：你的服务器公网 IP
   - TTL：600

### 2. 微信小程序业务域名配置
1. 登录微信公众平台
2. 进入「开发」→「开发管理」→「开发设置」
3. 找到「业务域名」
4. 点击「配置」
5. 添加你的域名：
   - 域名：your-domain.com
6. 下载校验文件，上传到服务器根目录
7. 点击「确认」

---

## 验证部署

### 1. 基础访问检查
```bash
# 检查 HTTP 访问
curl -I http://your-domain.com

# 检查 HTTPS 访问
curl -I https://your-domain.com
```

### 2. 应用状态检查
```bash
# 检查 PM2 进程
pm2 status

# 查看应用日志
pm2 logs luowato-selection

# 检查端口监听
ss -lptn 'sport = :5000'
```

### 3. 页面功能验证
- [ ] 首页自动跳转到智能选型
- [ ] 智能选型页面正常
- [ ] 产品库页面需要密码才能访问（admin123）
- [ ] 所有页面在手机上正常显示
- [ ] 在微信中访问正常

---

## 常用运维命令

### PM2 管理
```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs luowato-selection

# 重启应用
pm2 restart luowato-selection

# 停止应用
pm2 stop luowato-selection

# 删除应用
pm2 delete luowato-selection
```

### Nginx 管理
```bash
# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx

# 重新加载配置
systemctl reload nginx

# 查看 Nginx 日志
tail -f /var/log/nginx/luowato-selection-access.log
tail -f /var/log/nginx/luowato-selection-error.log
```

### 系统监控
```bash
# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看 CPU 使用
top

# 查看端口占用
ss -lptn
```

---

## 腾讯云备份策略

### 数据库备份
```bash
# 手动备份 PostgreSQL
pg_dump -h 内网地址 -U 用户名 -d 数据库名 > backup.sql

# 恢复数据库
psql -h 内网地址 -U 用户名 -d 数据库名 < backup.sql
```

### 应用备份
```bash
# 备份应用代码
tar -czf app-backup-$(date +%Y%m%d).tar.gz /var/www/luowato-selection

# 备份 PM2 配置
pm2 save
```

### 自动备份脚本
创建 `/var/backup/backup.sh`：
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/var/backup"

# 备份数据库
pg_dump -h 内网地址 -U 用户名 -d 数据库名 > $BACKUP_DIR/db-$DATE.sql

# 备份应用
tar -czf $BACKUP_DIR/app-$DATE.tar.gz /var/www/luowato-selection

# 保留最近7天的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

设置定时任务：
```bash
crontab -e
# 添加：每天凌晨2点执行备份
0 2 * * * /var/backup/backup.sh
```

---

## 常见问题排查

### 问题1：无法访问网站
```bash
# 检查 Nginx 状态
systemctl status nginx

# 检查应用状态
pm2 status

# 检查端口监听
ss -lptn 'sport = :5000'

# 查看 Nginx 错误日志
tail -100 /var/log/nginx/luowato-selection-error.log
```

### 问题2：SSL 证书错误
```bash
# 检查证书文件
ls -la /etc/nginx/ssl/your-domain.com/

# 重新上传证书
# 将 fullchain.pem 和 privkey.pem 上传到 /etc/nginx/ssl/your-domain.com/

# 重启 Nginx
systemctl restart nginx
```

### 问题3：应用启动失败
```bash
# 查看应用日志
pm2 logs luowato-selection --lines 100

# 检查环境变量
cat /var/www/luowato-selection/.env.production

# 重新构建
cd /var/www/luowato-selection
pnpm run build

# 重启应用
pm2 restart luowato-selection
```

### 问题4：数据库连接失败
```bash
# 检查数据库连接
psql -h 内网地址 -U 用户名 -d 数据库名

# 检查环境变量
cat /var/www/luowato-selection/.env.production | grep DATABASE_URL

# 检查防火墙
ufw status
```

---

## 性能优化建议

### 1. 启用 Gzip 压缩
在 Nginx 配置中添加：
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
```

### 2. 配置缓存
```nginx
# 静态资源缓存
location /_next/static {
    proxy_pass http://localhost:5000;
    proxy_cache_valid 200 60m;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

location /static {
    proxy_pass http://localhost:5000;
    proxy_cache_valid 200 60m;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

### 3. 启用 PM2 集群模式
修改 `ecosystem.config.js`：
```javascript
instances: 2,
exec_mode: 'cluster',
```

### 4. 使用 CDN
1. 登录腾讯云控制台
2. 选择「内容分发网络 CDN」
3. 添加加速域名
4. 配置回源到服务器

---

## 安全建议

### 1. 配置防火墙
```bash
# 安装 UFW
apt install -y ufw

# 允许 SSH
ufw allow 22

# 允许 HTTP
ufw allow 80

# 允许 HTTPS
ufw allow 443

# 启用防火墙
ufw enable
```

### 2. 禁用 root 远程登录
```bash
# 创建新用户
adduser admin
usermod -aG sudo admin

# 配置 SSH 密钥
mkdir -p /home/admin/.ssh
cp /root/.ssh/authorized_keys /home/admin/.ssh/
chown -R admin:admin /home/admin/.ssh

# 禁用 root 登录
nano /etc/ssh/sshd_config
# 设置：PermitRootLogin no

# 重启 SSH
systemctl restart sshd
```

### 3. 定期更新系统
```bash
# 更新系统
apt update && apt upgrade -y

# 设置自动更新
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

---

## 监控告警

### 1. 腾讯云云监控
1. 登录腾讯云控制台
2. 选择「云监控」
3. 创建告警策略：
   - CPU 使用率 > 80%
   - 内存使用率 > 80%
   - 磁盘使用率 > 80%
   - 应用进程不存在

### 2. 应用监控
使用 PM2 监控：
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 成本估算

### 月度成本
- 云服务器 CVM（2核4GB）：约 200 元
- PostgreSQL（4GB）：约 150 元
- 带宽（5Mbps）：约 150 元
- SSL 证书（免费）：0 元
- 域名：约 60 元/年
- CDN（按流量）：约 0.24 元/GB

**总计**：约 500 元/月

---

## 总结

✅ **部署完成检查清单**
- [ ] 腾讯云服务器已购买并配置
- [ ] PostgreSQL 数据库已创建
- [ ] SSL 证书已申请并上传
- [ ] 域名已解析到服务器
- [ ] 微信小程序业务域名已配置
- [ ] 应用已启动并运行正常
- [ ] HTTPS 访问正常
- [ ] 所有页面功能正常
- [ ] 备份策略已配置
- [ ] 监控告警已配置

**部署完成后，你的洛瓦托水泵选型系统就可以在腾讯云上稳定运行了！**
