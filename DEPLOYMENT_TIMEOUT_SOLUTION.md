# 🚀 阿里云部署超时问题 - 完整解决方案

## 📋 问题总结

### 错误信息
```
2026-02-10T18:16:24+08:00 error: [build] [runtime] BuildFaasRuntimePkg timeout
```

### 问题原因
- **构建超时**：20分钟后被终止（17:56:24 → 18:16:24）
- **根本原因**：项目依赖过多，node_modules 体积大，自动化部署平台不适合

---

## ✅ 推荐解决方案

### 方案 1：手动部署（强烈推荐）⭐⭐⭐

**为什么推荐：**
- ✅ 完全可控，可以看到详细错误
- ✅ 不受平台超时限制
- ✅ 适合生产环境
- ✅ 构建时间可控

**如何执行：**

#### 步骤 1：连接到服务器
```cmd
ssh root@47.110.127.87
```

#### 步骤 2：上传项目到服务器
```cmd
# 在本地 Windows 电脑执行
cd C:\Users\ASUS\Downloads
scp "pack_project (3).tar.gz" root@47.110.127.87:/tmp/
```

#### 步骤 3：在服务器上部署
```bash
# 更新系统
apt update

# 安装 Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs git nginx

# 安装 pnpm 和 PM2
npm install -g pnpm pm2

# 创建项目目录
mkdir -p /var/www/luowato-selection

# 解压项目
tar -xzf /tmp/pack_project\ \(3\).tar.gz -C /var/www/luowato-selection

# 进入项目目录
cd /var/www/luowato-selection

# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 配置环境变量
cat > .env.production << 'EOF'
DATABASE_URL=postgresql://用户名:密码@内网地址:1921/数据库名
NEXT_PUBLIC_WECHAT_APP_ID=你的微信AppID
NODE_ENV=production
PORT=5000
NEXT_PUBLIC_APP_URL=https://lowato-pumps.com
EOF

# 启动应用
pm2 start .next/standalone/server.js --name luowato-selection
pm2 save

# 配置 Nginx
cat > /etc/nginx/sites-available/luowato-selection << 'EOF'
server {
    listen 80;
    server_name lowato-pumps.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/luowato-selection /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 配置 SSL（可选）
apt install -y certbot python3-certbot-nginx
certbot --nginx -d lowato-pumps.com
```

**详细步骤请查看：`MANUAL_DEPLOYMENT.md`**

---

### 方案 2：优化项目配置（如果必须使用自动化部署）

我已经对项目进行了以下优化：

#### 2.1 修改 `next.config.ts`

添加了构建优化配置：
```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // 启用独立输出，减少部署包大小
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'], // 优化包导入
  },
  // ... 其他配置
};
```

#### 2.2 创建 `.dockerignore`

排除不必要的文件，减少镜像大小。

#### 2.3 创建优化版 `Dockerfile`

使用多阶段构建，优化构建时间和镜像大小。

---

### 方案 3：使用阿里云 ECS + 手动部署（推荐）

如果不使用阿里云自动化部署平台，可以：

1. **购买阿里云 ECS**（已有：47.110.127.87）
2. **购买阿里云 RDS PostgreSQL**（需要配置）
3. **手动部署**（参考方案 1）

**优势：**
- ✅ 完全控制
- ✅ 不受平台限制
- ✅ 性能更好
- ✅ 成本更低

---

## 🔧 其他优化建议

### 1. 减少依赖体积

```bash
# 查看依赖大小
pnpm list --depth=0

# 分析构建产物
pnpm build -- --analyze

# 移除未使用的依赖
pnpm remove 未使用的包名
```

### 2. 使用 CDN 加速

将静态资源（图片、字体等）上传到 OSS 或 CDN。

### 3. 启用 Gzip 压缩

在 Nginx 中启用 Gzip 压缩，减少传输时间。

```nginx
# 在 Nginx 配置中添加
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

---

## 📊 方案对比

| 方案 | 难度 | 时间 | 稳定性 | 推荐 |
|-----|------|------|--------|------|
| 手动部署 | ⭐⭐ | 30 分钟 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 优化配置 | ⭐⭐⭐ | 需要测试 | ⭐⭐⭐ | ⭐⭐ |
| ECS + 手动 | ⭐⭐ | 30 分钟 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎯 下一步建议

### 立即执行：手动部署

1. **连接到服务器**
   ```cmd
   ssh root@47.110.127.87
   ```

2. **按照方案 1 的步骤执行**

3. **参考 `MANUAL_DEPLOYMENT.md` 获取详细步骤**

---

## 💡 重要提示

### 为什么自动化部署失败？

阿里云自动化部署平台（可能是 Serverless 或云开发平台）通常有以下限制：
- ⏱️ 构建时间限制（通常 20-30 分钟）
- 💾 部署包大小限制
- 🔧 构建环境限制

**本项目使用 Next.js + TypeScript + React，依赖较多，不适合自动化部署平台。**

### 最佳实践

对于 Next.js 项目，推荐：
1. ✅ 使用 **VPS/ECS 手动部署**
2. ✅ 使用 **Docker + Nginx**
3. ❌ 避免使用 Serverless 平台（除非项目很小）

---

## 📞 需要帮助？

如果手动部署遇到问题：

1. **查看日志**
   ```bash
   pm2 logs luowato-selection
   tail -100 /var/log/nginx/luowato-selection-error.log
   ```

2. **检查配置**
   ```bash
   cat /var/www/luowato-selection/.env.production
   nginx -t
   ```

3. **提供错误信息**
   - 完整的错误输出
   - 执行的命令
   - 遇到的步骤

---

## 🎉 总结

**最佳解决方案：使用手动部署到阿里云 ECS**

- 已准备完整的部署文档：`MANUAL_DEPLOYMENT.md`
- 服务器已就绪：47.110.127.87
- 域名已准备：lowato-pumps.com

**现在就可以开始手动部署！** 🚀

**详细步骤请查看：`MANUAL_DEPLOYMENT.md`**
