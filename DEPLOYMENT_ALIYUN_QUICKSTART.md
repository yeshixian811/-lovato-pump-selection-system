# ☁️ 阿里云部署 - 快速开始

**⏱️ 预计时间：30 分钟**

---

## 📋 前置条件

在开始之前，请确保你已经准备好：
- ✅ 阿里云服务器（ECS）
- ✅ 已购买并解析的域名（lowato-hvac.com）
- ✅ 阿里云 RDS PostgreSQL 实例
- ✅ SSH 密钥文件（.pem）
- ✅ 本地电脑已安装 SSH 客户端

---

## 🚀 快速部署步骤

### 第 1 步：连接服务器（5 分钟）

在你的本地电脑终端执行：

```bash
# 设置密钥文件权限
chmod 600 aliyun-key.pem

# 连接到服务器
ssh -i aliyun-key.pem root@47.96.123.45

# 首次连接输入 yes 接受指纹
```

---

### 第 2 步：上传项目（10 分钟）

在你的本地电脑终端执行（新开一个窗口）：

```bash
# 进入项目目录
cd /path/to/luowato-selection

# 上传项目到服务器
scp -i aliyun-key.pem -r . root@47.96.123.45:/var/www/luowato-selection
```

---

### 第 3 步：运行部署脚本（5 分钟）

回到服务器终端执行：

```bash
# 进入项目目录
cd /var/www/luowato-selection

# 修改部署脚本中的域名和邮箱
nano deploy-aliyun.sh

# 找到并修改这两行：
# DOMAIN="your-domain.com"  改为 DOMAIN="lowato-hvac.com"
# EMAIL="your-email@example.com"  改为你的邮箱

# 保存退出：Ctrl+O → Enter → Ctrl+X

# 运行部署脚本
bash deploy-aliyun.sh
```

---

### 第 4 步：配置 RDS 白名单（重要！）

在阿里云控制台执行：

1. 访问：https://rdsnext.console.aliyun.com/
2. 选择你的 PostgreSQL 实例
3. 点击"数据安全性" → "白名单设置"
4. 添加 ECS 内网 IP 或 `0.0.0.0/0`
5. 点击"确定"

**查看连接信息：**
- 内网地址：`rm-xxxxxx.pg.rds.aliyuncs.com`
- 端口：`1921`（注意：不是 5432！）

---

### 第 5 步：配置环境变量（3 分钟）

在服务器终端执行：

```bash
# 编辑环境变量文件
nano /var/www/luowato-selection/.env.production

# 修改以下配置：

# 数据库配置（注意端口是 1921）
DATABASE_URL=postgresql://用户名:密码@内网地址:1921/数据库名

# 示例：
# DATABASE_URL=postgresql://root:MyPassword123@rm-bp12345.pg.rds.aliyuncs.com:1921/postgres

# 微信小程序配置
NEXT_PUBLIC_WECHAT_APP_ID=你的微信AppID

# 应用配置
NEXT_PUBLIC_APP_URL=https://lowato-hvac.com

# 保存退出：Ctrl+O → Enter → Ctrl+X

# 重启应用
pm2 restart luowato-selection
```

---

### 第 6 步：配置域名解析（2 分钟）

在阿里云控制台执行：

1. 访问：https://dc.console.aliyun.com/next/index
2. 找到你的域名 `lowato-hvac.com`
3. 点击"解析"
4. 添加记录：
   - 记录类型：A
   - 主机记录：@
   - 记录值：47.96.123.45（你的服务器公网 IP）
   - TTL：10 分钟
5. 点击"确定"

---

### 第 7 步：重启服务并验证（2 分钟）

在服务器终端执行：

```bash
# 重启 Nginx
systemctl restart nginx

# 重启应用
pm2 restart luowato-selection

# 检查状态
pm2 status
systemctl status nginx
```

在你的本地电脑执行：

```bash
# 测试 HTTPS 访问
curl -I https://lowato-hvac.com

# 应该看到：HTTP/1.1 200 OK
```

在浏览器中访问：
- `http://lowato-hvac.com` - 应该自动跳转到 HTTPS
- `https://lowato-hvac.com` - 应该正常显示网站

---

### 第 8 步：配置微信小程序业务域名（可选）

在微信公众平台执行：

1. 登录 https://mp.weixin.qq.com/
2. 进入"开发" → "开发管理" → "开发设置"
3. 配置业务域名：`lowato-hvac.com`
4. 下载校验文件并上传到服务器：

```bash
# 在本地电脑执行
scp -i aliyun-key.pem MP_verify_xxxxxx.txt root@47.96.123.45:/var/www/luowato-selection/public/
```

5. 点击"验证"完成配置

---

## ✅ 验证清单

- [ ] 服务器连接成功
- [ ] 项目上传成功
- [ ] 部署脚本执行成功
- [ ] RDS 白名单配置完成
- [ ] 环境变量配置完成
- [ ] 域名解析完成
- [ ] SSL 证书配置完成
- [ ] 服务重启成功
- [ ] 网站访问正常
- [ ] 智能选型功能正常
- [ ] 产品库密码登录正常（admin123）

---

## 🔥 阿里云特有配置

### RDS PostgreSQL 连接信息获取

1. 登录阿里云控制台
2. 进入"RDS 管理控制台"
3. 选择你的 PostgreSQL 实例
4. 查看连接信息：
   - 内网地址：`rm-xxxxxx.pg.rds.aliyuncs.com`
   - 端口：**1921**（重要！不是 5432）
   - 数据库名：`postgres`
   - 用户名：你的用户名
   - 密码：你的密码

### RDS 白名单配置（必须！）

1. 进入 RDS 控制台
2. 选择你的实例
3. 点击"数据安全性" → "白名单设置"
4. 添加以下之一：
   - ECS 内网 IP（推荐，最安全）
   - `0.0.0.0/0`（允许所有，不推荐生产环境）
5. 点击"确定"

### 连接字符串格式

```bash
# 格式：postgresql://用户名:密码@内网地址:1921/数据库名
DATABASE_URL=postgresql://root:MyPassword123@rm-bp12345.pg.rds.aliyuncs.com:1921/postgres
```

**注意：**
- 端口是 1921，不是 5432
- 使用内网地址，不要用公网地址
- 必须先配置白名单，否则无法连接

---

## 🆘 常见问题

### Q1: 连接服务器失败
```bash
# 检查密钥权限
chmod 600 /path/to/aliyun-key.pem

# 使用详细模式
ssh -v -i aliyun-key.pem root@47.96.123.45
```

### Q2: 数据库连接失败
```bash
# 检查环境变量
cat /var/www/luowato-selection/.env.production | grep DATABASE_URL

# 确认端口是 1921
# 确认已配置 RDS 白名单
# 确认使用内网地址

# 测试数据库连接
psql -h 内网地址 -p 1921 -U 用户名 -d 数据库名
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
certbot --nginx -d lowato-hvac.com --force-renewal

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

---

## 💰 成本估算

| 项目 | 配置 | 价格/月 |
|-----|------|--------|
| 云服务器 ECS | 2核4GB | 200元 |
| RDS PostgreSQL | 4GB | 150元 |
| 带宽 | 5Mbps | 150元 |
| SSL 证书 | 阿里云免费 | 0元 |
| 域名 | .com | 5元 |
| **总计** | | **~500元** |

---

## 📞 需要更多帮助？

- 📖 **详细教程**：[阿里云一步一步教程](DEPLOYMENT_ALIYUN_TUTORIAL.md)
- 📋 **部署检查清单**：[部署检查清单](DEPLOYMENT_CHECKLIST.md)
- 📚 **文档索引**：[部署文档索引](DEPLOYMENT_INDEX.md)

---

## 🎯 阿里云控制台快捷链接

- **ECS 控制台**：https://ecs.console.aliyun.com/
- **RDS 控制台**：https://rdsnext.console.aliyun.com/
- **域名解析**：https://dc.console.aliyun.com/next/index
- **SSL 证书**：https://yundun.console.aliyun.com/
- **云监控**：https://cms.console.aliyun.com/

---

**🎉 恭喜！你已经完成了阿里云快速部署！**

如果遇到问题，请查看详细教程或提供错误信息，我会帮你排查。
