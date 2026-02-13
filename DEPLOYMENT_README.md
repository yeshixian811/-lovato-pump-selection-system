# 🚀 洛瓦托水泵选型系统 - 部署指南

欢迎使用洛瓦托水泵选型系统的部署指南！本系统支持火山云部署。

---

## 📦 快速开始

### 选择你的云服务商

| 云服务商 | 适用场景 | 月度成本 | 文档链接 |
|---------|---------|---------|---------|
| 🔴 **火山云** ⭐ | 生产环境，推荐选择 | ~500元 | [快速部署](DEPLOYMENT_VOLCANO_QUICKSTART.md) |

---

## 📋 部署前检查清单

在开始部署之前，请确保你已经准备好：

### 通用要求
- ✅ 已购买域名并解析到服务器 IP
- ✅ 已购买火山云服务器（ECS）
- ✅ 已购买火山云 PostgreSQL 数据库
- ✅ 已获取微信小程序 AppID
- ✅ 本地电脑已安装 SSH 客户端
- ✅ 已下载服务器 SSH 密钥文件

### 火山云专用
- ✅ 火山云服务器公网 IP
- ✅ 火山云 PostgreSQL 连接信息
- ✅ 火山云 SSL 证书或准备使用 Certbot

---

## 🎯 部署流程

### 火山云部署 ⭐

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
