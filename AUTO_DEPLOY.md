# 🚀 从沙箱自动更新部署

## ✅ 已完成的操作

### 1. 安装 Vercel CLI
```bash
pnpm add -g vercel
```

### 2. 创建生产环境变量文件
创建了 `.env.production` 文件，包含：
```env
NEXT_PUBLIC_APP_URL=https://lowatopump.com
```

### 3. 推送到 GitHub
```bash
git add .env.production
git commit -m "chore: 添加生产环境变量配置 NEXT_PUBLIC_APP_URL"
git push origin main
```

---

## ⏳ 自动部署触发

**Vercel 会自动检测到 GitHub 更新并触发新的部署！**

### 部署流程

1. ✅ 代码已推送到 GitHub
2. ⏳ Vercel 检测到更新（1-2 分钟）
3. ⏳ Vercel 开始构建（3-5 分钟）
4. ⏳ Vercel 开始部署（1-2 分钟）
5. ✅ 部署完成，环境变量自动应用

**预计总时间：5-10 分钟**

---

## 🔍 部署状态检查

### 方法 1：访问 Vercel Dashboard

1. 访问 https://vercel.com/dashboard
2. 选择项目：`luowato-pump-selection-system`
3. 点击 **Deployments** 标签
4. 查看最新的部署状态

**状态说明：**
- ⏳ **Queued** - 等待构建
- ⏳ **Building** - 正在构建
- ⏳ **Deploying** - 正在部署
- ✅ **Ready** - 部署完成
- ❌ **Error** - 构建失败

### 方法 2：查看部署日志

在 Vercel Dashboard 中：
1. 点击最新的部署记录
2. 查看 **Build Log**
3. 确认环境变量已正确加载

**预期日志：**
```
Loading env from .env.production
NEXT_PUBLIC_APP_URL=https://lowatopump.com
```

---

## 📋 验证部署成功

### 1. 检查 Vercel Dashboard

**确认以下信息：**
- [ ] 最新部署状态为 **Ready**
- [ ] 环境变量 `NEXT_PUBLIC_APP_URL` 显示为 `https://lowatopump.com`
- [ ] 域名状态为 **Valid Configuration**

### 2. 测试访问网站

**访问以下地址：**

1. ✅ **https://lowatopump.com**
   - 应该显示洛瓦托水泵选型系统
   - 检查浏览器控制台，确认 `NEXT_PUBLIC_APP_URL` 正确

2. ✅ **https://www.lowatopump.com**
   - 应该显示洛瓦托水泵选型系统

3. ✅ **https://luowato-pump-selection-system.vercel.app**
   - 应该显示洛瓦托水泵选型系统

### 3. 检查环境变量

在浏览器控制台中执行：
```javascript
console.log(process.env.NEXT_PUBLIC_APP_URL)
```

**预期输出：**
```
https://lowatopump.com
```

---

## 🔧 自动部署原理

### .env.production 文件

**作用：**
- 存放生产环境的公开环境变量
- 提交到 Git，Vercel 自动读取
- 覆盖 Vercel Dashboard 中的同名环境变量

**支持的变量：**
- ✅ `NEXT_PUBLIC_*` - 公开变量（客户端可访问）
- ❌ 其他变量 - 私有变量（不要提交到 Git）

### Vercel 自动部署流程

```
GitHub 更新
    ↓
Vercel Webhook 检测
    ↓
拉取代码
    ↓
读取 .env.production
    ↓
构建项目
    ↓
部署到生产环境
    ↓
完成 ✅
```

---

## 🎯 自动部署的优势

| 方式 | 操作步骤 | 时间 | 优点 |
|------|---------|------|------|
| **手动更新** | Dashboard → 修改 → Redeploy | 5-10 分钟 | 精确控制 |
| **自动部署** | 推送代码 → 自动触发 | 5-10 分钟 | 自动化、简化流程 |

**自动部署优势：**
- ✅ 无需手动操作
- ✅ 配置与代码同步
- ✅ 减少人为错误
- ✅ 符合 CI/CD 最佳实践

---

## 📝 其他环境变量配置

### 添加更多公开环境变量

在 `.env.production` 文件中添加：

```env
NEXT_PUBLIC_APP_URL=https://lowatopump.com
NEXT_PUBLIC_API_URL=https://lowatopump.com/api
NEXT_PUBLIC_SITE_NAME=洛瓦托水泵选型系统
```

提交后，Vercel 会自动应用所有配置。

---

## ⚠️ 注意事项

### 1. 私有变量不要提交到 Git

**不要在 `.env.production` 中添加：**
```env
# ❌ 错误示例
DATABASE_URL=postgres://...
JWT_SECRET=your-secret-key
API_KEY=your-api-key
```

**私有变量应该：**
- 在 Vercel Dashboard 中配置
- 使用 `.env.local`（不提交到 Git）

### 2. 环境变量优先级

**Vercel 环境变量优先级（从高到低）：**

1. Vercel Dashboard 环境变量
2. `.env.production` 文件
3. `.env` 文件

**注意：** Dashboard 中的环境变量会覆盖文件中的配置

---

## 🚀 未来自动化方案

### 方案 A：使用 Vercel CLI 脚本

创建自动化部署脚本：

```bash
#!/bin/bash
# scripts/deploy.sh

# 更新环境变量
vercel env add NEXT_PUBLIC_APP_URL production

# 触发部署
vercel --prod
```

### 方案 B：使用 GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📊 部署时间线

| 时间 | 状态 | 操作 |
|------|------|------|
| 0 分钟 | 代码推送 | `git push origin main` |
| 1-2 分钟 | 检测中 | Vercel 检测到更新 |
| 2-7 分钟 | 构建中 | 运行 `pnpm run build` |
| 7-9 分钟 | 部署中 | 部署到生产环境 |
| 9-10 分钟 | 完成 | 网站可访问 |

---

## 🎉 总结

**已完成：**
- ✅ 安装 Vercel CLI
- ✅ 创建 `.env.production` 文件
- ✅ 推送到 GitHub
- ✅ 触发自动部署

**等待中：**
- ⏳ Vercel 自动检测更新
- ⏳ 自动构建和部署
- ⏳ 应用环境变量

**验证：**
- ⏳ 访问 Vercel Dashboard 检查状态
- ⏳ 测试访问网站

---

**现在只需等待 5-10 分钟，Vercel 会自动完成部署！** 🚀

**完成后告诉我，我帮你验证！** 👍
