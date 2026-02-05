# 🚀 洛瓦托水泵选型系统 - Vercel部署指南

## 📖 部署概述

本指南将帮助你将洛瓦托水泵选型系统部署到 Vercel 平台。

Vercel 是一个现代化的前端部署平台，提供：
- ✅ **免费部署**：小型项目完全免费
- ✅ **自动化部署**：连接GitHub后自动部署
- ✅ **全球CDN**：全球加速访问
- ✅ **HTTPS**：自动配置SSL证书
- ✅ **自定义域名**：支持绑定自己的域名

---

## 方法1：一键部署（推荐，最简单）

### 🎯 一键部署按钮

点击下方按钮，将项目部署到你的Vercel账号：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/luowato-pump-selection)

### 📝 部署步骤

1. **点击上面的部署按钮**
2. **登录/注册 Vercel 账号**
   - 使用 GitHub、GitLab 或 Bitbucket 账号登录
   - 如果没有账号，会自动创建一个免费账号

3. **配置项目**
   - Project Name: `luowato-pump-selection`（可自定义）
   - Framework Preset: `Next.js`（自动检测）
   - Root Directory: `./`（保持默认）
   - Build Command: `pnpm run build`（自动配置）
   - Output Directory: `.next`（自动配置）
   - Install Command: `pnpm install`（自动配置）

4. **配置环境变量（可选）**
   - 如果需要配置数据库，添加 `DATABASE_URL`
   - 如果需要配置对象存储，添加相关配置
   - 参考 `.env.example` 文件

5. **点击 Deploy 按钮**
   - 等待约2-3分钟
   - 部署完成后会获得一个 `.vercel.app` 域名

6. **访问你的网站**
   - 部署完成后，点击访问链接
   - 你的网站现在已经上线了！

---

## 方法2：通过GitHub连接部署

### 📝 前置准备

1. **准备GitHub仓库**
   - 将项目代码推送到GitHub仓库
   - 确保仓库是公开的（免费账户）

2. **注册Vercel账号**
   - 访问 https://vercel.com/signup
   - 使用GitHub账号登录

### 🚀 部署步骤

#### 步骤1：连接GitHub仓库

1. 登录 Vercel 后，点击 **"Add New"** > **"Project"**
2. 在 **"Import Git Repository"** 部分，点击 **"Continue"**
3. 授权 Vercel 访问你的 GitHub 账号
4. 选择你的 `luowato-pump-selection` 仓库

#### 步骤2：配置项目设置

```
Framework Preset: Next.js
Root Directory: ./
Build Command: pnpm run build
Output Directory: .next
Install Command: pnpm install
```

#### 步骤3：配置环境变量（可选）

在 **Environment Variables** 部分添加：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL数据库连接字符串 | `postgresql://user:pass@host:5432/db` |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | `洛瓦托水泵选型系统` |
| `NEXT_PUBLIC_APP_URL` | 应用URL | `https://your-app.vercel.app` |

#### 步骤4：部署

1. 点击 **"Deploy"** 按钮
2. 等待部署完成（约2-3分钟）
3. 部署成功后会显示访问链接

---

## 方法3：通过Vercel CLI部署

### 📝 前置准备

1. **安装Node.js 18+**
2. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

### 🚀 部署步骤

#### 1. 登录Vercel

```bash
vercel login
```

按照提示选择登录方式（GitHub推荐）。

#### 2. 部署项目

```bash
# 在项目根目录执行
vercel
```

按照提示配置：

```
? Set up and deploy "~/luowato-pump-selection"? [Y/n] Y
? Which scope do you want to deploy to? Your Name
? Link to existing project? [y/N] N
? What's your project's name? luowato-pump-selection
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

#### 3. 生产环境部署

```bash
vercel --prod
```

#### 4. 管理部署

```bash
# 查看部署列表
vercel list

# 查看部署详情
vercel inspect [deployment-url]

# 查看日志
vercel logs [deployment-url]

# 删除部署
vercel remove [deployment-url]
```

---

## 🎨 自定义域名（可选）

### 添加自定义域名

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 点击 **Settings** > **Domains**
4. 输入你的域名（如 `app.luowato.com`）
5. 按照提示配置DNS记录

### DNS配置

如果使用自己的域名，需要在域名服务商处添加以下DNS记录：

| 类型 | 名称 | 值 |
|------|------|-----|
| CNAME | app | cname.vercel-dns.com |

---

## 📊 环境变量说明

### 必需的环境变量

目前项目不需要必需的环境变量，可以开箱即用。

### 可选的环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL数据库连接 | 否 |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | 否 |
| `NEXT_PUBLIC_APP_URL` | 应用URL | 否 |

### 配置环境变量

在Vercel Dashboard中：

1. 选择你的项目
2. 点击 **Settings** > **Environment Variables**
3. 点击 **"Add New"** 添加变量
4. 选择环境（Production / Preview / Development）
5. 点击 **"Save"**

---

## 🔧 常见问题

### 1. 构建失败：找不到模块

**问题**: `Module not found: Can't resolve 'xxx'`

**解决方案**:
```bash
# 清除缓存重新部署
vercel --force
```

### 2. 部署超时

**问题**: 部署过程中超时

**解决方案**:
- 检查网络连接
- 减少不必要的依赖
- 优化构建脚本

### 3. 环境变量不生效

**问题**: 环境变量在代码中读取不到

**解决方案**:
- 确保变量名正确（区分大小写）
- 确保在正确的环境（Production）中配置
- 重新部署项目

### 4. 自定义域名不工作

**问题**: 自定义域名无法访问

**解决方案**:
- 检查DNS记录是否正确
- 等待DNS生效（最多24小时）
- 检查Vercel中的域名状态

### 5. 构建成功但页面空白

**问题**: 部署成功但访问时页面空白

**解决方案**:
- 检查浏览器控制台错误
- 检查环境变量是否正确
- 查看Vercel部署日志

---

## 📈 监控和分析

### 查看部署日志

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 点击 **Deployments**
4. 选择具体的部署记录
5. 查看构建日志和运行日志

### 性能监控

Vercel 提供内置的性能监控：

1. **Analytics**: 访问量、访问者、地理位置
2. **Speed Insights**: 页面加载速度、Core Web Vitals
3. **Real User Monitoring**: 真实用户体验数据

### 使用方法

1. 在项目页面点击 **Analytics** 标签
2. 查看访问统计
3. 在项目页面点击 **Speed Insights** 标签
4. 查看性能指标

---

## 🔄 持续部署

### 自动部署（推荐）

连接GitHub后，每次推送到主分支都会自动部署：

```bash
# 提交代码
git add .
git commit -m "update: new feature"
git push origin main
```

Vercel会自动检测并部署最新代码。

### 手动部署

如果需要手动触发部署：

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 点击 **Deployments**
4. 点击 **"Redeploy"** 按钮

### 取消部署

如果部署出现问题，可以立即取消：

1. 在部署进行中，点击 **"Cancel Deployment"**
2. 部署会停止并回滚到上一个版本

---

## 💰 免费额度

Vercel免费套餐包括：

| 项目 | 限制 |
|------|------|
| 带宽 | 100GB/月 |
| 构建时间 | 6000分钟/月 |
| Serverless Function | 100GB小时/月 |
| 部署次数 | 无限 |
| 团队成员 | 无限 |
| 自定义域名 | 无限 |

对于小型项目，免费额度完全足够。

---

## 📚 参考资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Vercel CLI 文档](https://vercel.com/docs/cli)

---

## 🎉 总结

恭喜！你已经完成了Vercel部署配置。

### 快速回顾

1. ✅ 一键部署：点击按钮即可完成
2. ✅ GitHub集成：自动部署，零配置
3. ✅ CLI部署：完全控制部署过程
4. ✅ 自定义域名：支持绑定自己的域名
5. ✅ 环境变量：灵活配置不同环境
6. ✅ 持续部署：代码推送自动部署

### 下一步

1. **开始部署**：选择一种方法开始部署
2. **配置域名**：添加自定义域名（可选）
3. **监控性能**：使用Vercel Analytics
4. **持续优化**：根据性能数据优化应用

### 获取帮助

如果遇到问题：
- 查看 [Vercel文档](https://vercel.com/docs)
- 查看 [常见问题](#-常见问题)
- 联系 Vercel 支持

---

**祝你部署顺利！🚀**
