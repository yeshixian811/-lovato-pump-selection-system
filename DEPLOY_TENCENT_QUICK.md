# 腾讯云快速部署指南

## 部署信息

- 服务器 IP：122.51.22.101
- SSH 用户名：lowato
- SSH 密码：lhkp-gbdknawa
- 域名：lowatopump.com

---

## 🚀 部署步骤

### 步骤 1：SSH 连接到服务器

在你的本地电脑上执行：

```bash
ssh lowato@122.51.22.101
```

输入密码：`lhkp-gbdknawa`

---

### 步骤 2：下载部署脚本

在服务器上执行：

```bash
cd /tmp
curl -O https://raw.githubusercontent.com/yeshixian811/-lovato-pump-selection-system/main/deploy-tencent-auto.sh
```

或者使用 wget：

```bash
cd /tmp
wget https://raw.githubusercontent.com/yeshixian811/-lovato-pump-selection-system/main/deploy-tencent-auto.sh
```

---

### 步骤 3：添加执行权限

```bash
chmod +x deploy-tencent-auto.sh
```

---

### 步骤 4：执行部署脚本

```bash
sudo bash deploy-tencent-auto.sh
```

**部署脚本将自动完成：**

1. ✅ 更新系统包
2. ✅ 安装基础工具
3. ✅ 安装 Node.js 24
4. ✅ 安装 pnpm
5. ✅ 安装 PM2
6. ✅ 克隆项目
7. ✅ 安装项目依赖
8. ✅ 构建项目
9. ✅ 配置环境变量
10. ✅ 配置 PM2 并启动应用
11. ✅ 安装和配置 Nginx
12. ✅ 配置防火墙

---

### 步骤 5：配置域名 DNS 解析

**在域名管理平台（阿里云、腾讯云等）：**

1. 找到域名 `lowatopump.com`
2. 添加 A 记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | @ | 122.51.22.101 | 600 |
| A | www | 122.51.22.101 | 600 |

3. 保存并等待 DNS 生效（10-20 分钟）

---

### 步骤 6：检查 DNS 解析

**在你的本地电脑上执行：**

```bash
nslookup lowatopump.com
```

**或者访问：**
- https://dnschecker.org/#A/lowatopump.com

---

### 步骤 7：获取 SSL 证书

**DNS 生效后，在服务器上执行：**

```bash
sudo certbot --nginx -d lowatopump.com -d www.lowatopump.com
```

**按照提示输入邮箱地址并同意服务条款**

---

### 步骤 8：验证部署

**在浏览器中访问：**

- https://lowatopump.com
- https://www.lowatopump.com

---

## 🔍 常用命令

### 应用管理

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs luowato-selection

# 查看实时日志
pm2 logs luowato-selection --lines 100

# 重启应用
pm2 restart luowato-selection

# 停止应用
pm2 stop luowato-selection

# 删除应用
pm2 delete luowato-selection
```

### Nginx 管理

```bash
# 查看 Nginx 状态
sudo systemctl status nginx

# 重启 Nginx
sudo systemctl restart nginx

# 重新加载 Nginx 配置
sudo systemctl reload nginx

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/luowato-selection-access.log
sudo tail -f /var/log/nginx/luowato-selection-error.log

# 测试 Nginx 配置
sudo nginx -t
```

### 防火墙管理

```bash
# 查看防火墙状态
sudo ufw status

# 开放端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 重载防火墙
sudo ufw reload
```

---

## 🛠️ 故障排查

### 应用无法访问

```bash
# 1. 检查应用状态
pm2 status

# 2. 检查应用日志
pm2 logs luowato-selection

# 3. 检查 Nginx 状态
sudo systemctl status nginx

# 4. 检查 Nginx 配置
sudo nginx -t

# 5. 检查端口是否开放
sudo netstat -tuln | grep 3000
```

### DNS 解析未生效

1. 等待 10-20 分钟后再次检查
2. 清除本地 DNS 缓存：
   ```bash
   # Windows
   ipconfig /flushdns

   # Linux
   sudo systemd-resolve --flush-caches

   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   ```

### SSL 证书获取失败

```bash
# 1. 检查 DNS 解析是否生效
nslookup lowatopump.com

# 2. 停止 Nginx（如果端口被占用）
sudo systemctl stop nginx

# 3. 使用 standalone 模式获取证书
sudo certbot certonly --standalone -d lowatopump.com -d www.lowatopump.com

# 4. 重启 Nginx
sudo systemctl start nginx
```

---

## 📊 部署完成后检查清单

- [ ] 应用成功启动（PM2 状态正常）
- [ ] Nginx 配置正确且运行正常
- [ ] 可以通过 IP 访问：http://122.51.22.101
- [ ] DNS 解析已生效
- [ ] 可以通过域名访问：http://lowatopump.com
- [ ] SSL 证书已安装
- [ ] 可以通过 HTTPS 访问：https://lowatopump.com
- [ ] 智能选型功能正常
- [ ] 产品库功能正常（密码：admin123）

---

## 📞 支持

如遇到问题，请提供以下信息：

1. 服务器 IP：122.51.22.101
2. 域名：lowatopump.com
3. 错误信息
4. 相关日志

---

**祝部署顺利！** 🚀
