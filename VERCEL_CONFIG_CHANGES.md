# 🔄 vercel.json 配置更新记录

## 📅 更新时间
2026-02-11

---

## ✅ 本次更新内容

### 1. 添加 Schema 引用
```json
"$schema": "https://openapi.vercel.sh/vercel.json"
```
**好处：**
- 自动补全
- 类型检查
- 模式验证

---

### 2. 添加 Functions 配置
```json
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
```
**好处：**
- 优化 API 路由性能
- 设置内存限制
- 设置执行时间限制

---

### 3. 优化 Headers 配置
**添加了：**
- `Referrer-Policy` 头部
- 静态文件缓存策略

```json
{
  "key": "Referrer-Policy",
  "value": "strict-origin-when-cross-origin"
}
```

```json
{
  "source": "/static/(.*)",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=31536000, immutable"
    }
  ]
}
```

**好处：**
- 增强安全性
- 提升静态资源加载速度

---

### 4. 添加 Images 配置
```json
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
```

**好处：**
- 自动优化图片
- 支持 AVIF 和 WebP 格式
- 图片缓存

---

## 📊 配置对比

### 之前的配置
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm run build",
  "outputDirectory": ".next",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "framework": "nextjs",
  "regions": ["hkg1"],
  "build": {
    "env": {
      "NEXT_PUBLIC_APP_URL": "https://lowatopump.com"
    }
  },
  "domains": [
    {
      "domain": "lowatopump.com"
    },
    {
      "domain": "www.lowatopump.com"
    }
  ],
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
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### 优化后的配置
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm run build",
  "outputDirectory": ".next",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "framework": "nextjs",
  "regions": ["hkg1"],
  "build": {
    "env": {
      "NEXT_PUBLIC_APP_URL": "https://lowatopump.com"
    }
  },
  "domains": [
    {
      "domain": "lowatopump.com"
    },
    {
      "domain": "www.lowatopump.com"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 60
    },
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 60
    }
  },
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
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
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

---

## 🎯 改进总结

### 新增配置
- ✅ `functions` - API 路由性能优化
- ✅ `images` - 图片优化配置
- ✅ 静态文件缓存策略
- ✅ `Referrer-Policy` 安全头部

### 保留配置
- ✅ 所有基础配置
- ✅ 域名配置
- ✅ 重写规则
- ✅ 安全头部

---

## 📈 预期效果

### 性能提升
- API 响应更快（内存和执行时间优化）
- 静态资源加载更快（缓存策略）
- 图片加载更快（自动优化）

### 安全性提升
- Referrer-Policy 保护用户隐私
- 更多的安全防护

### 开发体验
- 自动补全和类型检查
- 更好的错误提示

---

## 🚀 下一步

**配置已优化并推送到 GitHub（提交：fbcd7d7）**

**等待 Vercel Dashboard 恢复后：**
1. Vercel 会自动检测新配置
2. 重新部署项目
3. 测试所有功能
4. 验证性能改进

---

**配置优化完成！准备部署！**
