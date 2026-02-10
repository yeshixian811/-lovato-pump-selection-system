# 🚀 洛瓦托水泵选型系统 - 部署指南

欢迎使用洛瓦托水泵选型系统的部署指南！本系统支持腾讯云和火山云两种部署方式。

---

## 📦 快速开始

### 选择你的云服务商

| 云服务商 | 适用场景 | 月度成本 | 文档链接 |
|---------|---------|---------|---------|
| 🔵 **腾讯云** | 国内业务优先 | ~500元 | [快速部署](DEPLOYMENT_TENCENT_QUICKSTART.md) |
| 🔴 **火山云** | 开发测试 | ~500元 | [快速部署](DEPLOYMENT_VOLCANO_QUICKSTART.md) |

---

## 📋 部署前检查清单

在开始部署之前，请确保你已经准备好：

### 通用要求
- ✅ 已购买域名并解析到服务器 IP
- ✅ 已购买云服务器（ECS/CVM）
- ✅ 已购买 PostgreSQL 数据库
- ✅ 已获取微信小程序 AppID
- ✅ 本地电脑已安装 SSH 客户端
- ✅ 已下载服务器 SSH 密钥文件

### 腾讯云专用
- ✅ 腾讯云服务器公网 IP
- ✅ 腾讯云 PostgreSQL 连接信息
- ✅ 腾讯云 SSL 证书或准备使用 Certbot

### 火山云专用
- ✅ 火山云服务器公网 IP
- ✅ 火山云 PostgreSQL 连接信息
- ✅ 火山云 SSL 证书或准备使用 Certbot

---

## 🎯 部署流程

### 腾讯云部署

1. **阅读文档**：[腾讯云快速部署指南](DEPLOYMENT_TENCENT_QUICKSTART.md)（预计 30 分钟）
2. **连接服务器**：使用 SSH 密钥连接到腾讯云服务器
3. **上传项目**：将项目文件上传到服务器
4. **运行脚本**：执行 `deploy-tencent.sh` 自动部署脚本
5. **配置环境**：配置 `.env.production` 环境变量
6. **配置 SSL**：上传 SSL 证书或使用 Certbot 自动获取
7. **验证部署**：测试 HTTP/HTTPS 访问和功能

**详细文档**：[腾讯云详细步骤指南](DEPLOYMENT_STEP_BY_STEP.md)

---

### 火山云部署

1. **阅读文档**：[火山云快速部署指南](DEPLOYMENT_VOLCANO_QUICKSTART.md)（预计 30 分钟）
2. **连接服务器**：使用 SSH 密钥连接到火山云服务器
3. **上传项目**：将项目文件上传到服务器
4. **运行脚本**：执行 `deploy-volcano.sh` 自动部署脚本
5. **配置环境**：配置 `.env.production` 环境变量
6. **配置 SSL**：上传 SSL 证书或使用 Certbot 自动获取
7. **验证部署**：测试 HTTP/HTTPS 访问和功能

**详细文档**：[火山云详细步骤指南](DEPLOYMENT_VOLCANO_STEP_BY_STEP.md)

---

## 📚 完整文档索引

### 部署文档
- [部署文档索引](DEPLOYMENT_INDEX.md) - 所有部署文档的总入口
- [部署检查清单](DEPLOYMENT_CHECKLIST.md) - 部署前后检查清单

### 腾讯云文档
- [腾讯云快速部署指南](DEPLOYMENT_TENCENT_QUICKSTART.md) ⭐ **推荐新手**
- [腾讯云详细步骤指南](DEPLOYMENT_STEP_BY_STEP.md) - 完整的分步教程
- [腾讯云部署指南](DEPLOYMENT_GUIDE_TENCENT.md) - 详细技术指南

### 火山云文档
- [火山云快速部署指南](DEPLOYMENT_VOLCANO_QUICKSTART.md) ⭐ **推荐新手**
- [火山云详细步骤指南](DEPLOYMENT_VOLCANO_STEP_BY_STEP.md) - 完整的分步教程
- [火山云部署指南](DEPLOYMENT_GUIDE.md) - 详细技术指南

### 其他文档
- [部署进度记录](DEPLOYMENT_PROGRESS.md) - 记录你的部署进度
- [部署错误检查报告](DEPLOYMENT_ERROR_CHECK.md) - 错误排查指南

---

## 🔧 部署脚本

项目包含以下自动部署脚本：

- `deploy-tencent.sh` - 腾讯云自动部署脚本
- `deploy-volcano.sh` - 火山云自动部署脚本
- `ecosystem.config.js` - PM2 进程管理配置
- `nginx-config` - Nginx 反向代理配置

---

## 🛠️ 常见运维命令

### PM2 应用管理
```bash
pm2 status              # 查看应用状态
pm2 logs luowato-selection  # 查看应用日志
pm2 restart luowato-selection  # 重启应用
pm2 stop luowato-selection   # 停止应用
pm2 save               # 保存 PM2 配置
```

### Nginx 服务管理
```bash
systemctl status nginx # 查看 Nginx 状态
nginx -t              # 测试 Nginx 配置
systemctl restart nginx # 重启 Nginx
systemctl reload nginx  # 重新加载 Nginx 配置
```

### 系统监控
```bash
free -h               # 查看内存使用
df -h                 # 查看磁盘使用
top                   # 查看 CPU 使用
ss -lptn              # 查看端口监听
```

---

## 🆘 常见问题

### Q1: 连接服务器失败
```bash
# 检查 SSH 密钥权限
chmod 600 /path/to/your-ssh-key.pem

# 使用详细模式连接
ssh -v -i /path/to/your-ssh-key.pem root@your-server-ip
```

### Q2: 应用无法启动（502 Bad Gateway）
```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs luowato-selection

# 重启应用
pm2 restart luowato-selection
```

### Q3: SSL 证书错误
```bash
# 使用 Certbot 重新获取
certbot --nginx -d your-domain.com --force-renewal

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

### Q4: 数据库连接失败
```bash
# 检查环境变量
cat /var/www/luowato-selection/.env.production | grep DATABASE_URL

# 测试数据库连接
psql -h 数据库地址 -U 用户名 -d 数据库名

# 重启应用
pm2 restart luowato-selection
```

---

## 💰 成本估算

### 月度成本（腾讯云或火山云）
| 项目 | 配置 | 价格/月 |
|-----|------|--------|
| 云服务器 | 2核4GB | 200元 |
| PostgreSQL | 4GB | 150元 |
| 带宽 | 5Mbps | 150元 |
| SSL 证书 | 免费 | 0元 |
| 域名 | .com | 5元 |
| **总计** | | **~500元** |

---

## 🔐 安全建议

部署完成后，建议进行以下安全加固：

- [ ] 配置防火墙（UFW）
- [ ] 禁用 root 远程登录
- [ ] 使用 SSH 密钥登录
- [ ] 定期更新系统
- [ ] 配置监控告警
- [ ] 定期备份数据库
- [ ] 使用强密码

---

## 📞 获取帮助

如果在部署过程中遇到问题：

1. **查看文档**：首先查阅相关部署文档
2. **检查日志**：查看 PM2 和 Nginx 日志
3. **问题排查**：参考 [部署错误检查报告](DEPLOYMENT_ERROR_CHECK.md)
4. **提供信息**：将错误信息发给我，我会帮你排查

---

## 📝 部署记录

请在 [部署进度记录](DEPLOYMENT_PROGRESS.md) 文件中记录你的部署进度，方便后续管理和维护。

---

**🎉 准备好了吗？选择你的云服务商，开始部署吧！**

- [腾讯云快速部署](DEPLOYMENT_TENCENT_QUICKSTART.md)
- [火山云快速部署](DEPLOYMENT_VOLCANO_QUICKSTART.md)
