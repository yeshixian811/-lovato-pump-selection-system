# 安全检查清单

## 概述

本文档详细记录了洛瓦托水泵选型系统的全面安全审计结果，包括已修复的漏洞、已实施的安全措施和后续建议。

**审计日期**: 2025-01-15
**最后更新**: 2025-01-15
**审计范围**: 全栈应用代码、数据库配置、API 端点、文件上传、依赖项
**严重程度分级**: 
- 🔴 **严重 (Critical)**: 立即修复
- 🟠 **高 (High)**: 尽快修复
- 🟡 **中 (Medium)**: 计划修复
- 🟢 **低 (Low)**: 可选修复

---

## 已修复的安全漏洞

### 1. SQL 注入漏洞 🔴

**严重程度**: 严重
**状态**: ✅ 已修复
**影响文件**:
- `src/app/api/pumps/init-performance/route.ts`
- `src/storage/database/pumpManager.ts`

**问题描述**:
原始代码使用字符串拼接构建 SQL 语句，存在 SQL 注入风险：

```typescript
// ❌ 原始代码（危险）
await db.execute(
  `DELETE FROM pump_performance_points WHERE pump_id = '${pumpId}'`
);
```

**修复方案**:
使用 Drizzle ORM 的参数化查询，完全避免 SQL 注入：

```typescript
// ✅ 修复后的代码（安全）
// 1. 在 pumpManager.ts 中新增安全方法
deletePerformancePoints: async (pumpId: string) => {
  await db.delete(pumpPerformancePoints)
    .where(eq(pumpPerformancePoints.pumpId, pumpId));
}

// 2. 在 route.ts 中调用安全方法
await pumpManager.deletePerformancePoints(pumpId);

// 3. 使用参数化插入
await db.insert(pumpPerformancePoints).values(
  points.map(p => ({
    pumpId: pumpId,
    flowRate: p.flowRate,
    head: p.head,
  }))
);
```

**验证方法**:
```sql
-- 尝试注入测试（应失败或被拒绝）
SELECT * FROM pump_performance_points WHERE pump_id = '1; DROP TABLE users;--';
```

---

### 2. 文件上传凭证未配置 🟠

**严重程度**: 高
**状态**: ✅ 已修复
**影响文件**:
- `src/app/api/storage/upload/route.ts`

**问题描述**:
文件上传 API 的访问凭证硬编码为空字符串，导致上传功能无法正常工作：

```typescript
// ❌ 原始代码
const accessKey = '';  // 应该从环境变量读取
const secretKey = '';  // 应该从环境变量读取
```

**修复方案**:
从环境变量读取凭证，并添加安全警告：

```typescript
// ✅ 修复后的代码
const accessKey = process.env.COZE_BUCKET_ACCESS_KEY;
const secretKey = process.env.COZE_BUCKET_SECRET_KEY;

// 安全检查
if (!accessKey || !secretKey) {
  throw new Error('Missing required environment variables: COZE_BUCKET_ACCESS_KEY, COZE_BUCKET_SECRET_KEY');
}

// ⚠️ 重要提示：请在 .env 文件中配置正确的凭证
// COZE_BUCKET_ACCESS_KEY=your_access_key
// COZE_BUCKET_SECRET_KEY=your_secret_key
```

**配置步骤**:
1. 编辑 `.env` 文件
2. 添加有效的对象存储凭证
3. 重启应用服务

---

## 已实施的安全措施

### 1. 输入验证与消毒 ✅

**实施范围**: 所有 API 端点
**技术方案**: 
- Zod Schema 验证
- TypeScript 类型检查
- 白名单验证

**示例代码**:
```typescript
import { z } from 'zod';

// 定义严格的输入 schema
const pumpSchema = z.object({
  model: z.string().min(1).max(100).regex(/^[a-zA-Z0-9-]+$/),
  maxFlowRate: z.number().min(0).max(10000),
  maxHead: z.number().min(0).max(1000),
});

// 在 API 路由中验证
export async function POST(request: Request) {
  const body = await request.json();
  const validated = pumpSchema.parse(body);
  // 继续处理...
}
```

---

### 2. XSS 防护 ✅

**实施范围**: 全站
**技术方案**:
- React 自动转义（默认启用）
- 内容安全策略 (CSP)
- DOMPurify（如有富文本）

**CSP 配置示例**:
```typescript
// src/app/layout.tsx
export const metadata = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://trusted.cdn.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
};
```

---

### 3. 依赖项安全 ✅

**实施范围**: 项目依赖
**技术方案**:
- 定期运行 `pnpm audit`
- 使用 `pnpm audit --fix` 自动修复
- 锁定依赖版本（pnpm-lock.yaml）

**安全审计命令**:
```bash
# 检查依赖漏洞
pnpm audit

# 自动修复可修复的漏洞
pnpm audit --fix

# 检查过时的依赖
pnpm outdated
```

---

### 4. 数据库安全 ✅

**实施范围**: PostgreSQL 配置
**已实施措施**:
- 参数化查询（Drizzle ORM）
- 最小权限原则（应用数据库用户）
- 禁止数据库远程访问（localhost only）
- 定期备份机制

**数据库用户权限**:
```sql
-- 仅授予必要的权限
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lovato_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO lovato_app_user;
```

---

### 5. 错误处理与日志 ✅

**实施范围**: 全站
**技术方案**:
- 统一的错误处理中间件
- 不泄露敏感信息（堆栈跟踪、数据库凭证）
- 结构化日志记录

**错误处理示例**:
```typescript
// 统一错误响应
function handleError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Invalid input', details: error.errors },
      { status: 400 }
    );
  }
  
  // 生产环境不返回详细错误
  if (process.env.NODE_ENV === 'production') {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
  
  // 开发环境返回详细错误
  return NextResponse.json(
    { error: 'Internal server error', details: String(error) },
    { status: 500 }
  );
}
```

---

### 6. JWT 认证与授权 ✅

**实施范围**: 管理后台 API
**技术方案**:
- JWT 令牌认证
- 基于角色的访问控制（RBAC）
- 多级权限（admin, manager, user）
- 访问令牌和刷新令牌

**实施文件**:
- `src/lib/auth.ts` - 认证工具函数
- `src/lib/auth-middleware.ts` - 认证中间件
- `src/lib/admin-auth.ts` - 管理员认证中间件
- `src/app/api/auth/login/route.ts` - 登录 API

**功能特性**:
- 密码哈希（bcrypt，12 轮加盐）
- JWT 签名和验证（HMAC SHA256）
- 令牌过期控制（访问令牌 1 小时，刷新令牌 7 天）
- 权限检查（admin > manager > user）

**使用示例**:
```typescript
// 使用认证中间件保护 API
import { withAuth } from '@/lib/auth-middleware';

export const GET = withAuth(
  async (request, user) => {
    // user 包含用户信息
    return NextResponse.json({ data: '...' });
  },
  { requireRole: 'admin' } // 可选：要求特定角色
);
```

---

### 7. HTTPS 强制配置 ✅

**实施范围**: 全站
**技术方案**:
- HSTS (HTTP Strict Transport Security)
- 安全 HTTP 头
- 内容安全策略 (CSP)
- Cookie 安全设置

**实施文件**:
- `next.config.ts` - Next.js 配置

**安全头**:
- `Strict-Transport-Security`: 强制 HTTPS，有效期 2 年
- `Content-Security-Policy`: 防止 XSS 和数据注入攻击
- `X-Content-Type-Options`: 防止 MIME 类型嗅探
- `X-Frame-Options`: 防止点击劫持
- `X-XSS-Protection`: 启用浏览器 XSS 过滤器
- `Referrer-Policy`: 控制 Referer 信息泄露
- `Permissions-Policy`: 控制浏览器功能访问

**配置示例**:
```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline'; ...",
        },
      ],
    },
  ];
}
```

---

### 8. 敏感数据加密 ✅

**实施范围**: 全站
**技术方案**:
- AES-256-GCM 加密算法
- PBKDF2 密钥派生
- 随机盐和 IV
- 认证标签（GCM）

**实施文件**:
- `src/lib/encryption.ts` - 加密工具函数

**功能特性**:
- 文本加密/解密
- 对象加密/解密
- 数据库字段加密助手
- 安全随机数生成
- 哈希和 HMAC

**使用示例**:
```typescript
import { encrypt, decrypt, createDBEncryption } from '@/lib/encryption';

// 加密敏感数据
const encrypted = encrypt('sensitive-data', 'encryption-password');

// 解密数据
const decrypted = decrypt(encrypted, 'encryption-password');

// 加密数据库字段
const dbEncryption = createDBEncryption();
const encryptedField = dbEncryption.encryptField('sensitive-value');
```

---

### 9. CORS 配置 ✅

**实施范围**: API 端点
**技术方案**:
- CORS 白名单
- 预检请求处理
- 凭证支持
- 自定义配置

**实施文件**:
- `src/lib/cors.ts` - CORS 中间件

**功能特性**:
- 源白名单验证
- 方法白名单
- 头白名单
- 凭证支持（cookies, authorization headers）
- 预检请求缓存

**使用示例**:
```typescript
import { withCors, withAuthAndCors } from '@/lib/cors';

// 基本 CORS
export const GET = withCors(async (request) => {
  return NextResponse.json({ data: '...' });
});

// CORS + 认证
export const POST = withAuthAndCors(
  async (request, user) => {
    return NextResponse.json({ data: '...' });
  },
  { requireRole: 'admin', cors: { credentials: true } }
);

// 微信小程序 CORS
export const GET = withWeChatCORS(
  async (request) => {
    return NextResponse.json({ data: '...' });
  },
  'https://your-weixin-app.com'
);
```

---

## 待实施的安全建议

### 1. API 认证与授权 ✅ 已完成

**优先级**: 高
**状态**: ✅ 已实施
**实施日期**: 2025-01-15
**实施文件**:
- `src/lib/auth.ts`
- `src/lib/auth-middleware.ts`
- `src/lib/admin-auth.ts`
- `src/app/api/auth/login/route.ts`

**已实施功能**:
- ✅ JWT 令牌认证
- ✅ 基于角色的访问控制（RBAC）
- ✅ 多级权限（admin, manager, user）
- ✅ 访问令牌和刷新令牌
- ✅ 密码哈希（bcrypt）
- ✅ 认证中间件

**使用方法**: 见上方"已实施的安全措施"第 6 节。

---

### 2. API 速率限制 🟡

**优先级**: 中
**状态**: ⏳ 待实施
**建议方案**: `@upstash/ratelimit`

**实施步骤**:
1. 安装依赖: `pnpm add @upstash/ratelimit @upstash/redis`
2. 配置速率限制: `src/lib/ratelimit.ts`
3. 在 API 路由中应用

**示例代码**:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // 继续处理...
}
```

---

### 3. CORS 配置 ✅ 已完成

**优先级**: 中
**状态**: ✅ 已实施
**实施日期**: 2025-01-15
**实施文件**:
- `src/lib/cors.ts` - CORS 中间件

**已实施功能**:
- ✅ CORS 白名单
- ✅ 预检请求处理
- ✅ 凭证支持
- ✅ 自定义配置
- ✅ 微信小程序专用配置

**使用方法**: 见上方"已实施的安全措施"第 9 节。

---

### 4. HTTPS 强制 ✅ 已完成

**优先级**: 高
**状态**: ✅ 已实施
**实施日期**: 2025-01-15
**实施文件**:
- `next.config.ts` - Next.js 配置

**已实施功能**:
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ 安全 HTTP 头
- ✅ 内容安全策略 (CSP)
- ✅ Cookie 安全设置

**使用方法**: 见上方"已实施的安全措施"第 7 节。

**额外配置**:
- Cloudflare Tunnel 配置：参考 `DEPLOYMENT.md` 中的内网穿透配置章节

---

### 5. 敏感数据加密 ✅ 已完成

**优先级**: 高
**状态**: ✅ 已实施
**实施日期**: 2025-01-15
**实施文件**:
- `src/lib/encryption.ts` - 加密工具函数

**已实施功能**:
- ✅ AES-256-GCM 加密算法
- ✅ PBKDF2 密钥派生
- ✅ 随机盐和 IV
- ✅ 认证标签（GCM）
- ✅ 文本加密/解密
- ✅ 对象加密/解密
- ✅ 数据库字段加密助手
- ✅ 安全随机数生成
- ✅ 哈希和 HMAC

**使用方法**: 见上方"已实施的安全措施"第 8 节。

---

## 安全最佳实践

### 1. 密码安全
- ✅ 使用 bcrypt 加密存储
- ✅ 强制最小密码长度（8+ 字符）
- ✅ 密码复杂度要求（大写、小写、数字、特殊字符）
- 📋 定期强制密码更新

### 2. 会话管理
- ✅ 使用 JWT 无状态认证
- ✅ 短过期时间（1 小时）
- ✅ Refresh Token 机制
- 📋 会话撤销功能

### 3. 文件上传
- ✅ 文件类型白名单验证
- ✅ 文件大小限制
- ✅ 病毒扫描（可选）
- 📋 文件内容验证

### 4. 日志记录
- ✅ 结构化日志（JSON 格式）
- ✅ 敏感信息过滤
- ✅ 日志轮转
- 📋 异常行为告警

### 5. 数据备份
- ✅ 定期自动备份（每日）
- ✅ 备份加密
- ✅ 异地备份
- 📋 备份恢复测试

---

## 安全检查清单

### 开发环境
- [x] 禁用错误详细输出（生产环境）
- [x] 环境变量分离（.env 文件）
- [x] 依赖项安全审计
- [x] 代码扫描工具（ESLint, TypeScript）
- [ ] 单元测试覆盖率 > 80%
- [ ] 集成测试
- [ ] 渗透测试

### 生产环境
- [x] HTTPS 强制
- [x] HSTS 配置
- [x] CSP 配置
- [x] CORS 白名单
- [x] 数据库参数化查询
- [x] 输入验证与消毒
- [ ] JWT 认证实施
- [ ] API 速率限制实施
- [ ] 防火墙配置
- [ ] 入侵检测系统 (IDS)

### 运维安全
- [x] 定期备份
- [ ] 备份恢复测试
- [ ] 日志监控与告警
- [ ] 安全更新管理
- [ ] 访问控制（最小权限）
- [ ] 审计日志

---

## 安全事件响应

### 发现安全漏洞时的处理流程

1. **立即隔离**
   - 关闭受影响的服务
   - 切换到备份系统（如有）

2. **评估影响**
   - 确定漏洞范围
   - 评估数据泄露风险
   - 评估业务影响

3. **修复漏洞**
   - 实施紧急修复补丁
   - 测试修复方案
   - 部署到生产环境

4. **通知相关方**
   - 通知技术团队
   - 通知管理层
   - （必要时）通知用户

5. **事后复盘**
   - 根本原因分析
   - 改进安全措施
   - 更新安全文档

---

## 安全资源

### 学习资源
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

### 工具
- 依赖审计: `pnpm audit`
- 静态代码分析: ESLint, TypeScript
- 安全扫描: Snyk, Dependabot
- 渗透测试: OWASP ZAP, Burp Suite

---

## 总结

### 已完成的安全措施 ✅
1. SQL 注入防护（参数化查询）
2. XSS 防护（React + CSP）
3. 输入验证（Zod Schema）
4. 依赖项安全管理
5. 错误处理与日志
6. 数据库访问控制
7. 文件上传凭证配置

### 待实施的安全建议 📋
1. JWT 认证与授权（高优先级）
2. API 速率限制（中优先级）
3. CORS 配置（中优先级）
4. HTTPS 强制（高优先级）
5. 敏感数据加密（高优先级）

### 定期维护
- 每月运行依赖审计
- 每季度进行安全审计
- 每年进行渗透测试
- 持续监控安全公告

---

**文档版本**: v1.0.0
**最后更新**: 2025-01-15
**维护者**: 洛瓦托水泵选型系统团队
