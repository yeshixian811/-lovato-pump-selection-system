# 📋 vercel.json 配置指南

## 🚀 优化后的配置

### 1. Schema 引用
```json
"$schema": "https://openapi.vercel.sh/vercel.json"
```
**作用：**
- 提供自动补全
- 启用类型检查
- 添加模式验证

---

### 2. 构建配置
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": ".next",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "framework": "nextjs"
}
```

**说明：**
- `buildCommand`: 使用 pnpm 执行构建
- `outputDirectory`: 输出目录为 .next
- `devCommand`: 开发命令
- `installCommand`: 使用 pnpm 安装依赖，不使用 frozen-lockfile
- `framework`: Next.js 框架

---

### 3. 区域配置
```json
{
  "regions": ["hkg1"]
}
```

**说明：**
- 部署到香港区域（hkg1）
- 减少中国用户的访问延迟
- Pro 计划可以选择多个区域

---

### 4. 构建环境变量
```json
{
  "build": {
    "env": {
      "NEXT_PUBLIC_APP_URL": "https://lowatopump.com"
    }
  }
}
```

**说明：**
- 构建时的环境变量
- 仅影响构建过程，不影响运行时

---

### 5. 域名配置
```json
{
  "domains": [
    {
      "domain": "lowatopump.com"
    },
    {
      "domain": "www.lowatopump.com"
    }
  ]
}
```

**说明：**
- 主域名：lowatopump.com
- www 域名：www.lowatopump.com

---

### 6. 函数配置（新增）
```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 60
    },
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

**说明：**
- `memory`: 1024 MB（1 GB）内存
- `maxDuration`: 60 秒最大执行时间
- 适用于所有 API 路由

**Hobby 计划限制：**
- 最大内存：1024 MB
- 最大持续时间：60 秒

**Pro 计划限制：**
- 最大内存：3008 MB
- 最大持续时间：300 秒（5 分钟）

---

### 7. HTTP 头部配置（优化）
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**安全头部：**
- `X-Content-Type-Options`: 防止 MIME 类型嗅探
- `X-Frame-Options`: 防止点击劫持
- `X-XSS-Protection`: 启用 XSS 过滤器
- `Referrer-Policy`: 控制 Referer 信息泄露

**缓存头部：**
- `/static/*`: 静态文件永久缓存（1 年）

---

### 8. 图片优化配置（新增）
```json
{
  "images": {
    "remotePatterns": [
      {
        "protocol": "https",
        "hostname": "lf-coze-web-cdn.coze.cn",
        "pathname": "/**"
      },
      {
        "protocol": "https",
        "hostname": "images.unsplash.com",
        "pathname": "/**"
      },
      {
        "protocol": "https",
        "hostname": "source.unsplash.com",
        "pathname": "/**"
      }
    ],
    "sizes": [256, 384, 512, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    "formats": ["image/avif", "image/webp"],
    "minimumCacheTTL": 60
  }
}
```

**说明：**
- `remotePatterns`: 允许的远程图片域名
- `sizes`: 支持的图片尺寸
- `formats`: 支持的图片格式（AVIF 和 WebP）
- `minimumCacheTTL`: 最小缓存时间（60 秒）

---

### 9. 重写规则
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

**说明：**
- 保持 API 路由的路径
- 确保所有 API 请求都能正确路由

---

## 📊 配置对比

### 之前 vs 现在

| 配置项 | 之前 | 现在 | 改进 |
|--------|------|------|------|
| Schema | ❌ 无 | ✅ 有 | 自动补全和类型检查 |
| Functions | ❌ 无 | ✅ 有 | 优化函数性能 |
| Images | ❌ 无 | ✅ 有 | 图片优化 |
| Headers | 基础 | 优化 | 添加缓存和更多安全头部 |

---

## 🎯 最佳实践建议

### 1. 函数性能优化
```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

**根据 API 路由的复杂度调整：**
- 简单路由：512 MB 内存
- 复杂路由：1024 MB 内存
- 数据库查询：1024 MB + 60 秒

### 2. 图片优化
```json
{
  "images": {
    "remotePatterns": [
      {
        "protocol": "https",
        "hostname": "your-cdn.com",
        "pathname": "/**"
      }
    ],
    "sizes": [256, 512, 1024, 2048],
    "formats": ["image/avif", "image/webp"]
  }
}
```

**添加所有需要的图片源：**
- CDN 域名
- 外部图片服务
- 社交媒体图片

### 3. 缓存策略
```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**根据文件类型设置不同的缓存策略：**
- 静态资源：1 年
- HTML 文件：1 小时
- API 响应：根据数据更新频率

---

## 🔧 其他可选配置

### cleanUrls
```json
{
  "cleanUrls": true
}
```

**移除 HTML 扩展名：**
- `/about.html` → `/about`
- 自动重定向

### public
```json
{
  "public": true
}
```

**公开源代码和日志：**
- 仅用于开源项目
- 企业项目不建议使用

### redirects
```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

**配置 URL 重定向：**
- 迁移旧路径
- SEO 优化

---

## 📋 检查清单

在部署前确认：

- [ ] Schema 引用已添加
- [ ] 构建配置正确
- [ ] 区域配置合适
- [ ] 域名配置正确
- [ ] 函数配置优化
- [ ] 安全头部完整
- [ ] 图片优化配置
- [ ] 缓存策略合理

---

## 🚀 部署

**配置完成后：**

1. 提交代码到 Git
2. Vercel 自动检测配置
3. 部署到生产环境
4. 测试所有功能

---

**详细配置参考：**
- Vercel 官方文档：https://vercel.com/docs
- 配置参考：https://vercel.com/docs/projects/project-configuration

**当前配置已优化，准备好部署！**
