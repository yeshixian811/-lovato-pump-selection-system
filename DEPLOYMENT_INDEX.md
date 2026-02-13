# 部署文档索引

本系统支持火山云部署，请根据你的需求选择合适的部署方式。

---

## 📋 快速选择

| 云服务商 | 推荐场景 | 月度成本 | 部署难度 |
|---------|---------|---------|---------|
| [火山云](#火山云部署) | 生产环境，推荐选择 | ~500元 | ⭐⭐ 中等 |

---

## 🔥 火山云部署

### 适用场景
- 生产环境，推荐选择
- 国际业务
- 使用火山云其他服务

### 部署文档
1. **⭐⭐⭐ 超详细教程**：[火山云一步一步教程](DEPLOYMENT_VOLCANO_TUTORIAL.md) ⭐⭐⭐ **最强推荐！**
2. **快速开始**：[火山云快速部署指南](DEPLOYMENT_VOLCANO_QUICKSTART.md)
3. **详细步骤**：[火山云详细步骤指南](DEPLOYMENT_VOLCANO_STEP_BY_STEP.md)
4. **详细指南**：[火山云部署指南](DEPLOYMENT_GUIDE.md)
5. **检查清单**：[部署检查清单](DEPLOYMENT_CHECKLIST.md)

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

### 火山云特有注意事项
- PostgreSQL 默认端口：**5432**
- 必须配置数据库白名单
- 内网地址格式：`postgresxxxxxx.rds-pg.ivolces.com`

---

## 📚 相关文档

### 通用文档
- **[部署 README](DEPLOYMENT_README.md)** - 部署概览和快速选择
- **[DNS 配置指南](DNS_CONFIG_CURRENT.md)** - 域名解析配置
- **[SSL 证书配置](SSL_CONFIG.md)** - HTTPS 配置说明
- **[超时问题解决方案](DEPLOYMENT_TIMEOUT_SOLUTION.md)** - 部署超时问题解决

### 进阶文档
- **[性能优化指南](PERFORMANCE_OPTIMIZATION.md)** - 系统性能优化
- **[监控和维护](MONITORING.md)** - 系统监控和维护
- **[备份和恢复](BACKUP_RESTORE.md)** - 数据备份和恢复
- **[故障排查](TROUBLESHOOTING.md)** - 常见问题解决

---

## 🎯 快速开始

### 新手推荐
1. 阅读 [火山云一步一步教程](DEPLOYMENT_VOLCANO_TUTORIAL.md)
2. 准备火山云服务器和域名
3. 按照教程逐步部署
4. 遇到问题查看 [故障排查](TROUBLESHOOTING.md)

### 有经验用户推荐
1. 阅读 [火山云快速部署指南](DEPLOYMENT_VOLCANO_QUICKSTART.md)
2. 使用自动部署脚本
3. 查看详细配置说明

---

## 📞 技术支持

- 邮件：support@lowato.com
- 电话：400-888-8888
- 工单系统：在火山云控制台提交工单

---

## 📖 文档更新记录

- 2024-02-14: 更新为仅支持火山云部署
- 2024-01-15: 删除阿里云和腾讯云部署文档
- 2024-01-10: 添加火山云部署文档
