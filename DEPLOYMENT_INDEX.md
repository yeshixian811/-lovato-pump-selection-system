# 部署文档索引

本系统支持多种云服务提供商部署，请根据你的需求选择合适的部署方式。

---

## 📋 快速选择

| 云服务商 | 推荐场景 | 月度成本 | 部署难度 |
|---------|---------|---------|---------|
| [腾讯云](#腾讯云部署) | 国内业务优先 | ~500元 | ⭐⭐ 中等 |
| [火山云](#火山云部署) | 开发测试 | ~500元 | ⭐⭐ 中等 |

---

## 🚀 腾讯云部署

### 适用场景
- 国内业务，需要快速访问
- 使用腾讯云其他服务（如 COS、CDN）
- 需要腾讯云技术支持

### 部署文档
1. **快速开始**：[腾讯云快速部署指南](DEPLOYMENT_TENCENT_QUICKSTART.md)
2. **详细指南**：[腾讯云部署指南](DEPLOYMENT_GUIDE_TENCENT.md)

### 部署脚本
- `deploy-tencent.sh` - 腾讯云自动部署脚本

### 腾讯云服务
- 云服务器 CVM
- 云数据库 PostgreSQL
- SSL 证书（免费）
- 对象存储 COS（可选）
- 内容分发网络 CDN（可选）

### 成本估算
- 云服务器 CVM（2核4GB）：200元/月
- PostgreSQL（4GB）：150元/月
- 带宽（5Mbps）：150元/月
- **总计：约500元/月**

---

## 🔥 火山云部署

### 适用场景
- 开发测试环境
- 国际业务
- 使用火山云其他服务

### 部署文档
1. **详细指南**：[火山云部署指南](DEPLOYMENT_GUIDE.md)
2. **检查清单**：[部署检查清单](DEPLOYMENT_CHECKLIST.md)

### 部署脚本
- `deploy-volcano.sh` - 火山云自动部署脚本

### 火山云服务
- 云服务器 ECS
- 云数据库 PostgreSQL
- 对象存储 TOS（可选）

### 成本估算
- 云服务器 ECS（2核4GB）：200元/月
- PostgreSQL（4GB）：150元/月
- 带宽（5Mbps）：150元/月
- **总计：约500元/月**

---

## 📦 部署前准备

### 通用要求
- [x] TypeScript 编译通过
- [x] 项目构建成功
- [x] 所有功能正常

### 服务器要求
- CPU：2核
- 内存：4GB
- 系统：Ubuntu 20.04/22.04 LTS
- 磁盘：40GB SSD
- 带宽：5Mbps

### 软件要求
- Node.js 24
- pnpm 9.0+
- PM2
- Nginx
- PostgreSQL 14+

---

## 🔧 通用配置文件

### PM2 配置
- `ecosystem.config.js` - PM2 进程管理配置

### Nginx 配置
- `nginx-config` - Nginx 反向代理配置

### 环境变量
- `.env.example` - 环境变量示例
- `.env.production.example` - 生产环境变量模板

---

## ✅ 验证检查

### 通用验证清单
- [ ] 应用正常启动（PM2 status）
- [ ] 端口正常监听（5000）
- [ ] HTTP 访问正常
- [ ] HTTPS 访问正常
- [ ] 页面功能正常
- [ ] 微信访问正常

### 详细检查清单
- [部署错误检查报告](DEPLOYMENT_ERROR_CHECK.md)
- [部署检查清单](DEPLOYMENT_CHECKLIST.md)

---

## 🛠️ 常见运维命令

### PM2 管理
```bash
pm2 status              # 查看状态
pm2 logs luowato-selection  # 查看日志
pm2 restart luowato-selection  # 重启应用
pm2 stop luowato-selection   # 停止应用
pm2 save               # 保存配置
```

### Nginx 管理
```bash
systemctl status nginx # 查看状态
nginx -t              # 测试配置
systemctl restart nginx # 重启 Nginx
systemctl reload nginx  # 重新加载配置
```

### 系统监控
```bash
free -h               # 查看内存
df -h                 # 查看磁盘
top                   # 查看 CPU
ss -lptn              # 查看端口
```

---

## 📞 获取帮助

### 文档资源
- [腾讯云快速部署指南](DEPLOYMENT_TENCENT_QUICKSTART.md)
- [腾讯云部署指南](DEPLOYMENT_GUIDE_TENCENT.md)
- [火山云部署指南](DEPLOYMENT_GUIDE.md)
- [部署错误检查报告](DEPLOYMENT_ERROR_CHECK.md)
- [部署检查清单](DEPLOYMENT_CHECKLIST.md)

### 问题排查
1. 查看 PM2 日志：`pm2 logs luowato-selection`
2. 查看 Nginx 日志：`tail -100 /var/log/nginx/luowato-selection-error.log`
3. 检查应用日志：`cat logs/app.log`
4. 查看构建日志：`cat logs/dev.log`

---

## 🎯 推荐部署流程

### 新手推荐
1. 阅读 [腾讯云快速部署指南](DEPLOYMENT_TENCENT_QUICKSTART.md)
2. 准备腾讯云服务器和域名
3. 使用自动部署脚本 `deploy-tencent.sh`
4. 配置环境变量和 SSL 证书
5. 验证部署结果

### 高级用户
1. 选择合适的云服务商
2. 阅读 [腾讯云部署指南](DEPLOYMENT_GUIDE_TENCENT.md) 或 [火山云部署指南](DEPLOYMENT_GUIDE.md)
3. 手动部署或使用自动部署脚本
4. 配置 CDN、备份、监控
5. 优化性能和安全性

---

## 📝 部署后建议

### 安全加固
- [ ] 配置防火墙（UFW）
- [ ] 禁用 root 远程登录
- [ ] 使用 SSH 密钥登录
- [ ] 定期更新系统
- [ ] 配置监控告警

### 性能优化
- [ ] 启用 Gzip 压缩
- [ ] 配置 CDN 加速
- [ ] 启用静态资源缓存
- [ ] 使用 PM2 集群模式
- [ ] 优化数据库查询

### 监控维护
- [ ] 配置云监控告警
- [ ] 定期备份数据库
- [ ] 定期检查日志
- [ ] 定期更新依赖
- [ ] 定期检查 SSL 证书有效期

---

**选择合适的部署方式，按照对应文档操作，即可快速部署到生产环境！**
