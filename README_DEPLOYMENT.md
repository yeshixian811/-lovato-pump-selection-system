# 🚀 快速部署到 Vercel

洛瓦托水泵选型系统已经配置好，可以一键部署到 Vercel！

## ⚡ 一键部署（推荐）

点击下方按钮，将项目部署到你的 Vercel 账号：

### 方式1：GitHub仓库部署（推荐）

1. **将项目推送到GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/luowato-pump-selection.git
   git push -u origin main
   ```

2. **访问 Vercel 部署页面**
   - 打开 https://vercel.com/new
   - 点击 "Import Git Repository"
   - 选择你的 `luowato-pump-selection` 仓库

3. **配置项目**
   - Framework: Next.js（自动检测）
   - Build Command: `pnpm run build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

4. **点击 Deploy**
   - 等待2-3分钟
   - 部署完成后即可访问！

### 方式2：使用Vercel CLI

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

---

## 📋 部署前检查清单

### ✅ 已配置完成

- ✅ Vercel配置文件 (`vercel.json`)
- ✅ 环境变量示例 (`.env.example`)
- ✅ Next.js构建配置
- ✅ PWA支持
- ✅ 包管理器配置 (pnpm)

### 📝 需要配置（可选）

- [ ] GitHub仓库（用于持续部署）
- [ ] 自定义域名（可选）
- [ ] 环境变量（如果需要数据库）
- [ ] Vercel账号（免费）

---

## 🎯 部署步骤详解

### 方法1：通过GitHub（推荐，自动部署）

#### 步骤1：准备GitHub仓库

```bash
# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: 洛瓦托水泵选型系统初始版本"

# 创建main分支
git branch -M main

# 连接到GitHub仓库
git remote add origin https://github.com/YOUR_USERNAME/luowato-pump-selection.git

# 推送代码
git push -u origin main
```

#### 步骤2：在Vercel部署

1. 访问 https://vercel.com/new
2. 点击 **"Import Git Repository"**
3. 选择你的 `luowato-pump-selection` 仓库
4. 确认配置：
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `.next`
5. 点击 **"Deploy"**
6. 等待2-3分钟，部署完成！

#### 步骤3：访问你的网站

部署成功后，你会得到一个类似这样的URL：
```
https://luowato-pump-selection-xxx.vercel.app
```

点击链接即可访问你的网站！

---

## 🌟 部署后配置

### 添加自定义域名（可选）

1. 在Vercel Dashboard中选择你的项目
2. 点击 **Settings** > **Domains**
3. 添加你的域名（如 `app.luowato.com`）
4. 按照提示配置DNS记录

### 配置环境变量（可选）

如果需要使用数据库或对象存储：

1. 在Vercel Dashboard中选择你的项目
2. 点击 **Settings** > **Environment Variables**
3. 添加变量：
   - `DATABASE_URL`（PostgreSQL连接字符串）
   - 其他必需的变量

参考 `.env.example` 文件了解所有可用的环境变量。

---

## 🔄 持续部署

连接GitHub后，每次推送代码都会自动部署：

```bash
# 修改代码后
git add .
git commit -m "fix: 修复bug"
git push origin main

# Vercel会自动检测并部署
```

---

## 📊 监控部署

### 查看部署日志

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 点击 **Deployments**
4. 查看部署历史和日志

### 查看性能

1. 在项目页面点击 **Analytics**
2. 查看访问量、性能指标等

---

## 💰 免费额度

Vercel免费套餐包括：

| 项目 | 限制 |
|------|------|
| 带宽 | 100GB/月 |
| 构建时间 | 6000分钟/月 |
| 部署次数 | 无限 |
| Serverless Function | 100GB小时/月 |

对于小型项目，完全免费！

---

## 🆘 常见问题

### Q: 部署失败怎么办？

**A**: 检查以下几点：
1. 确保 `package.json` 中的构建命令正确
2. 检查是否有缺少的依赖
3. 查看Vercel部署日志获取错误详情

### Q: 如何配置自定义域名？

**A**:
1. 在Vercel Dashboard中添加域名
2. 在域名服务商处添加CNAME记录
3. 等待DNS生效（最多24小时）

### Q: 环境变量如何配置？

**A**:
1. 在Vercel Dashboard > Settings > Environment Variables
2. 点击 "Add New"
3. 添加变量名和值
4. 重新部署项目

### Q: 如何回滚到上一个版本？

**A**:
1. 在Deployments页面找到要回滚的版本
2. 点击右上角 "..." 菜单
3. 选择 "Promote to Production"

---

## 📚 详细文档

查看完整的部署指南：[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

---

## 🎉 开始部署

选择一种方式开始部署：

1. **推荐方式**：推送到GitHub，然后在Vercel导入
2. **快速方式**：使用Vercel CLI直接部署
3. **详细方式**：查看完整部署文档

**准备好后，立即开始部署吧！** 🚀

---

**部署完成后，你的网站将拥有：**
- ✅ 全球CDN加速
- ✅ 自动HTTPS
- ✅ 自动备份
- ✅ 性能监控
- ✅ 持续部署

祝部署顺利！
