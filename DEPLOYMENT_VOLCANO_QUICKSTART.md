# 火山云快速部署指南

**⏱️ 预计时间：30 分钟**

---

## 📋 前置条件

在开始之前，请确保你已经准备好：
- ✅ 火山云服务器（ECS）
- ✅ 已购买并解析的域名
- ✅ 火山云 PostgreSQL 实例
- ✅ SSH 密钥文件（.pem）
- ✅ 本地电脑已安装 SSH 客户端

---

## 🚀 快速部署步骤

### 第 1 步：连接服务器（5 分钟）

在你的本地电脑终端执行：

```bash
# 使用 SSH 密钥连接
ssh -i /path/to/your-ssh-key.pem root@你的服务器公网IP

# 示例：
# ssh -i ~/.ssh/volcano-key.pem root@123.456.789.0
```

---

### 第 2 步：上传项目（10 分钟）

在你的本地电脑终端执行（新开一个窗口）：

```bash
# 进入项目目录
cd /path/to/luowato-selection

# 上传项目到服务器
scp -i /path/to/your-ssh-key.pem -r . root@你的服务器公网IP:/var/www/luowato-selection

# 示例：
# scp -i ~/.ssh/volcano-key.pem -r . root@123.456.789.0:/var/www/luowato-selection
```

---

### 第 3 步：运行部署脚本（5 分钟）

回到服务器终端执行：

```bash
# 进入项目目录
cd /var/www/luowato-selection

# 修改部署脚本中的域名和邮箱
nano deploy-volcano.sh

# 找到并修改这两行：
# DOMAIN="your-domain.com"  改为你的实际域名
# EMAIL="your-email@example.com"  改为你的邮箱

# 保存退出：Ctrl+O → Enter → Ctrl+X

# 运行部署脚本
bash deploy-volcano.sh
```

---

### 第 4 步：配置环境变量（3 分钟）

```bash
# 编辑环境变量文件
nano /var/www/luowato-selection/.env.production

# 修改以下配置：
DATABASE_URL=postgresql://用户名:密码@内网地址:5432/数据库名
NEXT_PUBLIC_WECHAT_APP_ID=你的微信AppID
NEXT_PUBLIC_APP_URL=https://your-domain.com

# 保存退出：Ctrl+O → Enter → Ctrl+X
```

---

### 第 5 步：上传 SSL 证书（5 分钟）

#### 方式 A：使用火山云 SSL 证书

1. 登录火山云控制台，申请免费 SSL 证书
2. 下载 Nginx 格式的证书
3. 解压得到 `fullchain.pem` 和 `privkey.pem`

在你的本地电脑终端执行：

```bash
# 创建 SSL 目录
ssh -i /path/to/your-ssh-key.pem root@你的服务器公网IP "mkdir -p /etc/nginx/ssl/your-domain.com"

# 上传证书
scp -i /path/to/your-ssh-key.pem fullchain.pem root@你的服务器公网IP:/etc/nginx/ssl/your-domain.com/
scp -i /path/to/your-ssh-key.pem privkey.pem root@你的服务器公网IP:/etc/nginx/ssl/your-domain.com/
```

#### 方式 B：使用 Certbot 自动获取（推荐新手）

在服务器终端执行：

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书
certbot --nginx -d your-domain.com

# 按提示操作即可
```

---

### 第 6 步：重启服务（2 分钟）

```bash
# 重启 Nginx
systemctl restart nginx

# 重启应用
pm2 restart luowato-selection

# 检查状态
pm2 status
systemctl status nginx
```

---

### 第 7 步：测试访问

在你的本地电脑执行：

```bash
# 测试 HTTPS 访问
curl -I https://your-domain.com

# 应该看到：HTTP/1.1 200 OK
```

在浏览器中访问：
- `http://your-domain.com` - 应该自动跳转到 HTTPS
- `https://your-domain.com` - 应该正常显示网站

---

## ✅ 验证清单

- [ ] 服务器连接成功
- [ ] 项目上传成功
- [ ] 部署脚本执行成功
- [ ] 环境变量配置完成
- [ ] SSL 证书配置完成
- [ ] 服务重启成功
- [ ] 网站访问正常
- [ ] 智能选型功能正常
- [ ] 产品库密码登录正常（admin123）

---

## 🔥 火山云特有配置

### 获取火山云 PostgreSQL 连接信息

1. 登录火山云控制台
2. 进入「云数据库 PostgreSQL」
3. 选择你的实例
4. 查看连接信息：
   - 内网地址：`10.0.x.x`
   - 端口：`5432`
   - 数据库名：`postgres`
   - 用户名：`your-username`
   - 密码：`your-password`

**连接字符串格式：**
```
postgresql://your-username:your-password@10.0.x.x:5432/postgres
```

### 配置安全组

1. 登录火山云控制台
2. 进入「云服务器 ECS」
3. 选择你的实例
4. 点击「安全组」
5. 确保已开放以下端口：
   - 80（HTTP）
   - 443（HTTPS）
   - 22（SSH，建议限制 IP）

---

## 🆘 常见问题

### Q1: 连接服务器失败
```bash
# 检查密钥权限
chmod 600 /path/to/your-ssh-key.pem

# 使用详细模式
ssh -v -i /path/to/your-ssh-key.pem root@你的服务器公网IP
```

### Q2: 上传文件失败
```bash
# 检查服务器磁盘空间
ssh root@你的服务器公网IP "df -h"
```

### Q3: 访问 502 Bad Gateway
```bash
# 查看应用状态
pm2 status
pm2 logs luowato-selection

# 重启应用
pm2 restart luowato-selection
```

### Q4: SSL 证书错误
```bash
# 使用 Certbot 重新获取
certbot --nginx -d your-domain.com --force-renewal
```

### Q5: 数据库连接失败
```bash
# 检查环境变量
cat /var/www/luowato-selection/.env.production | grep DATABASE_URL

# 测试数据库连接
psql -h 内网地址 -U 用户名 -d 数据库名
```

---

## 📞 需要更多帮助？

- 📖 **详细步骤指南**：[火山云详细步骤指南](DEPLOYMENT_VOLCANO_STEP_BY_STEP.md)
- 📋 **部署检查清单**：[部署检查清单](DEPLOYMENT_CHECKLIST.md)
- 🔧 **火山云部署指南**：[火山云部署指南](DEPLOYMENT_GUIDE.md)
- 📚 **文档索引**：[部署文档索引](DEPLOYMENT_INDEX.md)

---

## 💰 成本估算

| 服务 | 配置 | 价格/月 |
|-----|------|--------|
| 云服务器 ECS | 2核4GB | 200元 |
| PostgreSQL | 4GB | 150元 |
| 带宽 | 5Mbps | 150元 |
| SSL 证书 | 火山云免费 | 0元 |
| 域名 | .com | 5元 |
| **总计** | | **~500元** |

---

**🎉 恭喜！你已经完成了火山云部署！**

如果遇到问题，请查看详细步骤指南或提供错误信息，我会帮你排查。
