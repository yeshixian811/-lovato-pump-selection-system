# 🚀 部署到 Vercel - 详细步骤指南

## ✅ 已完成的准备

Git仓库已准备就绪，包含所有必要的文件和配置！

## 📝 下一步操作指南

---

## 第一步：在GitHub上创建仓库

### 1. 创建GitHub账号（如果没有）
访问：https://github.com/signup

### 2. 创建新仓库

1. **访问GitHub新仓库页面**
   - 访问：https://github.com/new

2. **配置仓库信息**

   | 配置项 | 值 |
   |--------|-----|
   | Repository name | `luowato-pump-selection` |
   | Description | `洛瓦托水泵选型系统 - 智能水泵选型工具` |
   | Public/Private | ✅ Public (推荐，Vercel免费) |
   | Initialize with | ⬜ 不勾选（已有代码） |

3. **点击 "Create repository"**

4. **复制仓库URL**
   - 你的仓库URL会是：`https://github.com/YOUR_USERNAME/luowato-pump-selection.git`

---

## 第二步：连接本地代码到GitHub

### 在终端执行以下命令（替换YOUR_USERNAME）：

```bash
# 1. 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/luowato-pump-selection.git

# 2. 推送代码到GitHub
git push -u origin main
```

### 示例（假设你的GitHub用户名是example）：

```bash
git remote add origin https://github.com/example/luowato-pump-selection.git
git push -u origin main
```

### 如果遇到问题：

**问题1：推送时提示错误**
```bash
# 强制推送（谨慎使用）
git push -u origin main --force
```

**问题2：认证失败**
- 如果是第一次推送，GitHub会要求你进行身份验证
- 使用 Personal Access Token (推荐) 或 SSH密钥
- 访问：https://github.com/settings/tokens

---

## 第三步：在Vercel部署

### 1. 注册/登录Vercel

访问：https://vercel.com/signup

- 使用你的GitHub账号登录（推荐）
- 或使用其他方式注册

### 2. 导入GitHub仓库

1. **访问Vercel新项目页面**
   - 访问：https://vercel.com/new

2. **授权Vercel访问GitHub**
   - 如果是第一次使用，Vercel会请求访问你的GitHub
   - 点击 "Authorize Vercel"

3. **选择仓库**

   找到并选择：`luowato-pump-selection`

4. **配置项目设置**

   Vercel会自动检测并配置：

   | 配置项 | 值（自动检测） |
   |--------|----------------|
   | Framework Preset | Next.js |
   | Root Directory | `./` |
   | Build Command | `pnpm run build` |
   | Output Directory | `.next` |
   | Install Command | `pnpm install` |

   **✅ 保持默认配置即可**

5. **（可选）配置环境变量**

   如果你有数据库或其他服务，可以添加环境变量：

   - 点击 "Environment Variables"
   - 添加你的变量（参考 `.env.example`）

   目前项目可以开箱即用，不需要额外配置。

6. **点击 "Deploy"**

   - 等待2-3分钟
   - Vercel会自动构建和部署

7. **部署成功！**

   你会看到：
   - ✅ 部署成功的绿色对勾
   - 🌐 一个 `.vercel.app` 域名，例如：
     ```
     https://luowato-pump-selection-xxx.vercel.app
     ```

8. **访问你的网站**

   点击部署链接，你的网站现在在线了！

---

## 🎉 完成！你的网站已上线

### 你现在拥有：

- ✅ **在线网站**：`.vercel.app` 域名
- ✅ **自动HTTPS**：SSL证书自动配置
- ✅ **全球CDN**：香港区域部署
- ✅ **自动备份**：每次部署自动备份
- ✅ **持续部署**：Git推送自动部署

---

## 🔄 如何更新网站

### 方法1：自动部署（推荐）

每次推送代码到GitHub，Vercel会自动部署：

```bash
# 修改代码
git add .
git commit -m "update: 新功能"
git push origin main

# Vercel自动检测并部署！
```

### 方法2：手动触发部署

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 点击 "Deployments"
4. 点击 "Redeploy"

---

## 📊 监控和管理

### 查看部署日志

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 点击 "Deployments"
4. 点击具体的部署记录查看日志

### 查看访问统计

1. 在项目页面点击 "Analytics"
2. 查看访问量、访问者、地理位置等数据

### 查看性能指标

1. 在项目页面点击 "Speed Insights"
2. 查看页面加载速度、Core Web Vitals等

---

## 🌟 高级配置（可选）

### 绑定自定义域名

1. 在Vercel Dashboard选择项目
2. 点击 "Settings" > "Domains"
3. 添加你的域名（如 `app.luowato.com`）
4. 按照提示配置DNS记录

### 配置数据库

如果你需要PostgreSQL数据库：

1. 在Vercel Dashboard添加环境变量
2. 添加 `DATABASE_URL`
3. 格式：`postgresql://user:password@host:5432/database`

### 添加对象存储

如果你需要对象存储：

1. 添加AWS相关的环境变量
2. 参考 `.env.example` 中的配置

---

## 🆘 常见问题

### Q: 部署失败怎么办？

**A**:
1. 查看Vercel部署日志
2. 检查错误信息
3. 修复问题后重新推送代码

### Q: 如何配置自定义域名？

**A**:
1. 在Vercel Dashboard > Settings > Domains
2. 添加域名
3. 配置DNS记录（CNAME）

### Q: 如何回滚到上一个版本？

**A**:
1. 在Deployments页面找到要回滚的版本
2. 点击 "..." > "Promote to Production"

### Q: 免费额度够用吗？

**A**:
- 100GB带宽/月
- 6000分钟构建时间/月
- 无限部署次数
- 对于小型项目完全够用

---

## 📚 参考文档

- **Vercel官方文档**: https://vercel.com/docs
- **快速部署指南**: `README_DEPLOYMENT.md`
- **完整部署文档**: `VERCEL_DEPLOYMENT_GUIDE.md`

---

## 🎯 快速检查清单

部署前检查：

- [ ] 已创建GitHub仓库
- [ ] 本地代码已推送到GitHub
- [ ] 已注册Vercel账号
- [ ] 在Vercel导入GitHub仓库
- [ ] 部署成功
- [ ] 访问网站正常

---

## 🚀 立即开始

现在就开始部署吧！

1. **创建GitHub仓库**: https://github.com/new
2. **推送代码**: `git remote add origin ... && git push -u origin main`
3. **在Vercel部署**: https://vercel.com/new

**祝你部署顺利！** 🎉
