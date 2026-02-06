# 🚀 本地服务器部署指南

## 📋 概述

本指南帮助您部署洛瓦托水泵选型系统的本地服务器，并创建 HTTPS 隧道供微信小程序访问。

## 🎯 部署方案

### 方案 A：本地开发 + HTTPS 隧道（推荐用于测试）
- ✅ 快速测试
- ✅ 免费使用
- ⚠️ URL 会变化
- ⚠️ 适合开发阶段

### 方案 B：部署到 Vercel（推荐用于生产）
- ✅ 永久 HTTPS 域名
- ✅ 自动部署
- ✅ 免费额度
- ✅ 适合生产环境

---

## 方案 A：本地开发 + HTTPS 隧道

### 步骤 1：确认项目运行

```bash
# 检查服务是否在 5000 端口运行
ss -lptn 'sport = :5000'

# 如果没有运行，启动服务
coze dev > /app/work/logs/bypass/dev.log 2>&1 &
```

### 步骤 2：安装 ngrok

#### macOS
```bash
brew install ngrok
```

#### Linux
```bash
# 下载 ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok -y
```

#### Windows
1. 访问 https://ngrok.com/download
2. 下载 Windows 版本
3. 解压到任意目录
4. 将 ngrok.exe 所在目录添加到 PATH

### 步骤 3：配置 ngrok（可选）

```bash
# 注册账号并获取 authtoken
# 访问：https://dashboard.ngrok.com/signup
# 登录后获取 authtoken

# 配置 authtoken
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 步骤 4：启动 HTTPS 隧道

```bash
# 启动隧道，指向本地 5000 端口
ngrok http 5000

# 您将看到类似输出：
# Forwarding  https://abc123.ngrok.io -> http://localhost:5000
# Forwarding  https://abc123.ngrok-free.app -> http://localhost:5000
```

### 步骤 5：记录 HTTPS URL

复制 ngrok 生成的 HTTPS URL，例如：
```
https://abc123.ngrok-free.app
```

### 步骤 6：配置小程序

修改小程序配置文件：

#### 1. `wechat-miniprogram/project.private.config.json`
```json
{
  "setting": {
    "urlCheck": false  // 开发阶段关闭域名校验
  }
}
```

#### 2. `wechat-miniprogram/app.js`
```javascript
globalData: {
  systemInfo: null,
  baseUrl: 'https://abc123.ngrok-free.app'  // 替换为 ngrok URL
}
```

#### 3. `wechat-miniprogram/pages/index/index.js`
```javascript
data: {
  webviewUrl: 'https://abc123.ngrok-free.app'  // 替换为 ngrok URL
}
```

### 步骤 7：测试小程序

1. 打开微信开发者工具
2. 导入 `wechat-miniprogram` 项目
3. 点击「编译」
4. 在模拟器中查看效果

---

## 方案 B：部署到 Vercel（推荐）

### 步骤 1：安装 Vercel CLI

```bash
# 使用 pnpm 安装
pnpm add -g vercel

# 或使用 npm
npm install -g vercel
```

### 步骤 2：登录 Vercel

```bash
vercel login
```

按提示登录：
1. 选择邮箱登录
2. 检查邮箱验证链接
3. 完成登录

### 步骤 3：部署项目

```bash
# 在项目根目录执行
cd /workspace/projects

# 初次部署
vercel

# 按提示操作：
# ? Set up and deploy “~/projects”? [Y/n] Y
# ? Which scope do you want to deploy to? (选择您的账号)
# ? Link to existing project? [y/N] N
# ? What's your project's name? luowato-pump-selection
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] N
```

### 步骤 4：记录部署 URL

部署成功后，Vercel 会提供一个 HTTPS URL，例如：
```
https://luowato-pump-selection.vercel.app
```

### 步骤 5：配置生产环境域名

#### 选项 1：使用 Vercel 提供的域名
直接使用 Vercel 提供的免费域名（如：`*.vercel.app`）

#### 选项 2：使用自定义域名
1. 登录 https://vercel.com/dashboard
2. 选择项目
3. 进入 Settings → Domains
4. 添加您的域名
5. 按提示配置 DNS

### 步骤 6：配置小程序

修改小程序配置文件：

#### 1. `wechat-miniprogram/app.js`
```javascript
globalData: {
  systemInfo: null,
  baseUrl: 'https://luowato-pump-selection.vercel.app'  // 替换为 Vercel URL
}
```

#### 2. `wechat-miniprogram/pages/index/index.js`
```javascript
data: {
  webviewUrl: 'https://luowato-pump-selection.vercel.app'  // 替换为 Vercel URL
}
```

#### 3. `wechat-miniprogram/project.private.config.json`
```bash
{
  "setting": {
    "urlCheck": true  # 生产环境开启域名校验
  }
}
```

### 步骤 7：配置微信小程序业务域名

1. 登录微信公众平台
2. 进入：开发 → 开发管理 → 开发设置 → 业务域名
3. 添加 Vercel 域名（如：`luowato-pump-selection.vercel.app`）
4. 下载验证文件
5. 部署验证文件到 Vercel

#### 上传验证文件到 Vercel

创建验证文件：
```bash
# 创建 public 目录（如果不存在）
mkdir -p public

# 创建验证文件（文件名为下载的文件名，如：MP_verify_xxxxx.txt）
# 内容为下载文件中的内容
echo "your-verification-code" > public/MP_verify_xxxxx.txt
```

重新部署：
```bash
vercel --prod
```

### 步骤 8：测试小程序

1. 打开微信开发者工具
2. 导入 `wechat-miniprogram` 项目
3. 点击「编译」
4. 在模拟器中查看效果

---

## 🔄 自动部署

### 使用 Git + Vercel 自动部署

#### 步骤 1：初始化 Git 仓库

```bash
cd /workspace/projects

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"
```

#### 步骤 2：推送到 GitHub

```bash
# 添加远程仓库
git remote add origin https://github.com/your-username/your-repo.git

# 推送代码
git push -u origin main
```

#### 步骤 3：在 Vercel 中连接 GitHub

1. 访问 https://vercel.com/dashboard
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"
4. 选择您的 GitHub 仓库
5. 配置项目设置
6. 点击 "Deploy"

#### 步骤 4：自动部署

现在，每次您推送代码到 GitHub，Vercel 会自动部署：

```bash
# 修改代码后
git add .
git commit -m "Update feature"
git push

# Vercel 会自动部署新版本
```

---

## 📊 方案对比

| 特性 | 本地 + ngrok | Vercel 部署 |
|------|-------------|-------------|
| **HTTPS** | ✅ 支持 | ✅ 原生支持 |
| **域名** | ⚠️ 随机变化 | ✅ 稳定 |
| **速度** | ✅ 本地速度快 | ⚠️ 取决于服务器 |
| **成本** | ✅ 免费 | ✅ 免费额度 |
| **可靠性** | ⚠️ 本地网络限制 | ✅ 99.99% 在线率 |
| **适用场景** | 开发测试 | 生产环境 |

---

## 🔍 验证部署

### 检查本地服务

```bash
# 检查 5000 端口
ss -lptn 'sport = :5000'

# 测试 HTTP 响应
curl http://localhost:5000

# 查看日志
tail -f /app/work/logs/bypass/dev.log
```

### 检查 ngrok 隧道

```bash
# 访问 ngrok 控制面板
# 浏览器打开：http://localhost:4040

# 查看 HTTPS URL
# 在控制面板中查看当前的 Forwarding URL
```

### 检查 Vercel 部署

```bash
# 测试 HTTPS 响应
curl https://luowato-pump-selection.vercel.app

# 查看部署日志
# 访问：https://vercel.com/dashboard → 选择项目 → Deployments
```

---

## 🛠️ 常见问题

### Q1: ngrok URL 经常变化怎么办？
**A:**
- 注册 ngrok 账号（免费）
- 配置 authtoken
- 使用静态域名（需要付费计划）
- 或使用 Vercel 获取稳定域名

### Q2: Vercel 部署后 404 错误？
**A:**
- 确认 `package.json` 中有 `build` 脚本
- 检查 `next.config.js` 配置
- 查看部署日志
- 运行 `vercel logs` 查看实时日志

### Q3: 微信小程序提示「不在合法域名列表中」？
**A:**
- 登录微信公众平台
- 配置「业务域名」
- 上传验证文件
- 确认域名是 HTTPS

### Q4: 本地服务无法访问？
**A:**
```bash
# 检查服务状态
ss -lptn 'sport = :5000'

# 重启服务
pkill -f "next-server"
coze dev > /app/work/logs/bypass/dev.log 2>&1 &

# 检查防火墙
# 确保 5000 端口未被防火墙阻止
```

### Q5: 如何设置环境变量？
**A:**

#### Vercel
1. 访问 Vercel Dashboard
2. 选择项目 → Settings → Environment Variables
3. 添加环境变量
4. 重新部署

#### 本地
```bash
# 创建 .env.local 文件
echo "DATABASE_URL=your-database-url" > .env.local

# 在代码中访问
process.env.DATABASE_URL
```

---

## 📝 部署清单

### ngrok 方案
- [ ] 项目正在运行（5000 端口）
- [ ] 已安装 ngrok
- [ ] ngrok 隧道已启动
- [ ] 已记录 HTTPS URL
- [ ] 小程序配置已更新
- [ ] 小程序测试通过

### Vercel 方案
- [ ] 已安装 Vercel CLI
- [ ] 已登录 Vercel
- [ ] 项目已部署到 Vercel
- [ ] 已记录 HTTPS URL
- [ ] 业务域名已配置
- [ ] 验证文件已上传
- [ ] 小程序配置已更新
- [ ] 小程序测试通过

---

## 🚀 快速启动命令

```bash
# 本地开发
coze dev

# 使用 ngrok
ngrok http 5000

# Vercel 部署
vercel

# Vercel 生产部署
vercel --prod

# 查看日志
vercel logs

# 查看部署历史
vercel list
```

---

## 📞 需要帮助？

- Vercel 文档：https://vercel.com/docs
- ngrok 文档：https://ngrok.com/docs
- Next.js 部署：https://nextjs.org/docs/deployment
- 项目 README：查看项目文档

---

## 🎯 推荐方案

**开发阶段**：使用 ngrok
- 快速测试
- 无需配置域名

**生产环境**：使用 Vercel
- 稳定域名
- 自动部署
- 免费额度

**开始部署吧！** 🚀
