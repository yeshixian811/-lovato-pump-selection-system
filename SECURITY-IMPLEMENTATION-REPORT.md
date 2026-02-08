# 安全措施实施报告

## 概述

**实施日期**: 2025-01-15
**实施人员**: 洛瓦托水泵选型系统团队
**实施范围**: 全站安全措施加固
**目标**: 提升系统安全性，满足生产环境要求

---

## 已实施的安全措施

### 1. JWT 认证与授权 ✅

**优先级**: 高
**状态**: ✅ 已完成

#### 实施内容

**核心文件**:
- `src/lib/auth.ts` - 认证工具函数
- `src/lib/auth-middleware.ts` - 认证中间件
- `src/lib/admin-auth.ts` - 管理员认证中间件
- `src/app/api/auth/login/route.ts` - 登录 API（已更新）

**功能特性**:
- ✅ JWT 令牌认证（使用 HMAC SHA256）
- ✅ 基于角色的访问控制（RBAC）
- ✅ 三级权限系统（admin, manager, user）
- ✅ 访问令牌（有效期 1 小时）
- ✅ 刷新令牌（有效期 7 天）
- ✅ 密码哈希（bcrypt，12 轮加盐）
- ✅ 支持从 Authorization header 和 Cookie 获取令牌
- ✅ 令牌验证和错误处理

#### 使用示例

```typescript
// 1. 基本认证
import { withAuth } from '@/lib/auth-middleware';

export const GET = withAuth(async (request, user) => {
  // user 包含用户信息
  return NextResponse.json({ user });
});

// 2. 带角色要求的认证
export const DELETE = withAuth(
  async (request, user) => {
    // 只有 admin 可以访问
    return NextResponse.json({ success: true });
  },
  { requireRole: 'admin' }
);

// 3. 使用管理后台认证中间件
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const user = await verifyAdminAuth(request);
  if (user instanceof NextResponse) {
    return user; // 认证失败
  }
  // user 是管理员，继续处理...
}
```

#### 权限等级

| 角色 | 权限等级 | 描述 |
|------|----------|------|
| admin | 3 | 最高权限，可访问所有功能 |
| manager | 2 | 管理权限，可访问大部分功能 |
| user | 1 | 普通用户，只能访问基础功能 |

---

### 2. HTTPS 强制配置 ✅

**优先级**: 高
**状态**: ✅ 已完成

#### 实施内容

**实施文件**:
- `next.config.ts` - Next.js 配置

**安全头配置**:
- ✅ **Strict-Transport-Security**: `max-age=63072000; includeSubDomains; preload`
  - 强制使用 HTTPS 连接
  - 有效期 2 年
  - 包含所有子域名
  - 启用 HSTS 预加载

- ✅ **Content-Security-Policy**: 完整的 CSP 策略
  - 防止 XSS 攻击
  - 防止数据注入攻击
  - 限制脚本、样式、图片等资源来源

- ✅ **X-Content-Type-Options**: `nosniff`
  - 防止 MIME 类型嗅探攻击

- ✅ **X-Frame-Options**: `DENY`
  - 防止点击劫持攻击

- ✅ **X-XSS-Protection**: `1; mode=block`
  - 启用浏览器 XSS 过滤器

- ✅ **Referrer-Policy**: `strict-origin-when-cross-origin`
  - 控制 Referer 信息泄露

- ✅ **Permissions-Policy**: `camera=(), microphone=(), geolocation=()`
  - 控制浏览器功能和 API 的使用

#### 额外配置

**Cloudflare Tunnel 配置**:
参考 `DEPLOYMENT.md` 中的内网穿透配置章节，使用 Cloudflare Tunnel 提供 HTTPS 访问。

---

### 3. 敏感数据加密 ✅

**优先级**: 高
**状态**: ✅ 已完成

#### 实施内容

**实施文件**:
- `src/lib/encryption.ts` - 加密工具函数

**加密算法**:
- ✅ **AES-256-GCM**: 高级加密标准，256 位密钥
- ✅ **PBKDF2**: 密钥派生函数，100,000 次迭代
- ✅ **随机盐**: 64 字节
- ✅ **随机 IV**: 16 字节
- ✅ **认证标签**: 16 字节（GCM 模式）

#### 功能特性

1. **文本加密/解密**
```typescript
import { encrypt, decrypt } from '@/lib/encryption';

const encrypted = encrypt('sensitive-data', 'password');
const decrypted = decrypt(encrypted, 'password');
```

2. **对象加密/解密**
```typescript
import { encryptObject, decryptObject } from '@/lib/encryption';

const obj = { username: 'admin', apiKey: 'secret' };
const encrypted = encryptObject(obj, 'password');
const decrypted = decryptObject(encrypted, 'password');
```

3. **数据库字段加密**
```typescript
import { createDBEncryption } from '@/lib/encryption';

const dbEncryption = createDBEncryption('encryption-password');

// 加密单个字段
const encryptedField = dbEncryption.encryptField('sensitive-value');

// 加密对象的多个字段
const encryptedUser = dbEncryption.encryptFields(user, ['phone', 'address']);

// 解密
const decryptedUser = dbEncryption.decryptFields(encryptedUser, ['phone', 'address']);
```

4. **安全工具函数**
```typescript
import { generateSecureRandom, hash, verifyHash, generateHMAC, verifyHMAC } from '@/lib/encryption';

// 生成安全的随机字符串
const randomString = generateSecureRandom(32);

// 哈希数据
const hashed = hash('data-to-hash');

// 验证哈希
const isValid = verifyHash('data-to-hash', hashed);

// 生成 HMAC
const hmac = generateHMAC('data', 'secret-key');

// 验证 HMAC
const isValidHMAC = verifyHMAC('data', hmac, 'secret-key');
```

#### 环境变量配置

需要在 `.env` 文件中配置加密密钥：

```env
ENCRYPTION_KEY=your-super-secret-encryption-key-minimum-32-characters
```

---

### 4. CORS 配置 ✅

**优先级**: 中
**状态**: ✅ 已完成

#### 实施内容

**实施文件**:
- `src/lib/cors.ts` - CORS 中间件

**功能特性**:
- ✅ CORS 白名单
- ✅ 预检请求（OPTIONS）处理
- ✅ 凭证支持（cookies, authorization headers）
- ✅ 自定义配置
- ✅ 微信小程序专用配置

#### 默认允许的源

```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:5000',
  'http://localhost:3000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:3000',
  // 从环境变量读取
  ...(process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || []),
];
```

#### 使用示例

1. **基本 CORS**
```typescript
import { withCors } from '@/lib/cors';

export const GET = withCors(async (request) => {
  return NextResponse.json({ data: '...' });
});
```

2. **CORS + 认证**
```typescript
import { withAuthAndCors } from '@/lib/cors';

export const POST = withAuthAndCors(
  async (request, user) => {
    return NextResponse.json({ data: '...' });
  },
  { requireRole: 'admin', cors: { credentials: true } }
);
```

3. **微信小程序 CORS**
```typescript
import { withWeChatCORS } from '@/lib/cors';

export const GET = withWeChatCORS(
  async (request) => {
    return NextResponse.json({ data: '...' });
  },
  'https://your-weixin-app.com'
);
```

4. **自定义 CORS 配置**
```typescript
import { getCORSHeaders, addCORSHeaders } from '@/lib/cors';

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: '...' });
  return addCORSHeaders(response, request, {
    origins: ['https://yourdomain.com'],
    methods: ['GET', 'POST'],
    credentials: true,
    maxAge: 86400, // 24 小时
  });
}
```

#### 环境变量配置

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://your-weixin-app.com
```

---

## 已保护的 API 路由

### 管理员权限（admin）

以下 API 路由需要管理员权限才能访问：

- `/api/admin/stats` - 统计数据
- `/api/admin/users/[id]/status` - 用户状态管理
- `/api/admin/users/[id]/upgrade` - 用户升级
- `/api/admin/users` - 用户管理
- `/api/pumps/batch-delete` - 批量删除水泵
- `/api/pumps/seed` - 数据库种子
- `/api/versions/backup` - 版本备份

### 管理员或经理权限（manager or admin）

以下 API 路由需要管理员或经理权限：

- `/api/inventory/customers` - 客户管理
- `/api/inventory/suppliers` - 供应商管理
- `/api/inventory/stock` - 库存管理
- `/api/inventory/purchase` - 采购管理
- `/api/inventory/sales` - 销售管理
- `/api/pumps` - 水泵管理（POST, DELETE）
- `/api/pumps/import` - 水泵导入
- `/api/pumps/init-performance` - 性能曲线初始化
- `/api/pumps/regenerate-performance` - 性能曲线重新生成
- `/api/versions/[id]/rollback` - 版本回滚
- `/api/versions/[id]/set-current` - 设置当前版本
- `/api/versions/backup` - 版本备份
- `/api/versions/init` - 版本初始化

### 用户认证（any authenticated user）

以下 API 路由需要用户登录：

- `/api/user/me` - 获取当前用户信息
- `/api/usage/stats` - 使用统计
- `/api/subscription/can-export` - 检查是否可以导出
- `/api/subscription/status` - 订阅状态

### 公开 API（无需认证）

以下 API 路由不需要认证：

- `/api/auth/login` - 登录
- `/api/auth/register` - 注册
- `/api/pump/match` - 水泵选型
- `/api/pumps` - 水泵列表（GET）
- `/api/pumps/[id]` - 水泵详情（GET）
- `/api/pumps/[id]/performance` - 性能曲线（GET）
- `/api/pumps/select` - 选型推荐
- `/api/pumps/export` - 导出（需要订阅验证）
- `/api/storage/upload` - 文件上传
- `/api/payment/*` - 支付相关

---

## 环境变量配置

需要在 `.env` 文件中配置以下环境变量：

```env
# JWT 认证
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 敏感数据加密
ENCRYPTION_KEY=your-super-secret-encryption-key-minimum-32-characters

# CORS 白名单
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# 数据库
DATABASE_URL=postgresql://postgres:password@localhost:5432/lovato_pump

# 对象存储
COZE_BUCKET_ACCESS_KEY=your_access_key
COZE_BUCKET_SECRET_KEY=your_secret_key
```

---

## 安全检查清单

### 开发环境

- ✅ JWT 认证机制已实施
- ✅ 权限系统已实施
- ✅ CORS 配置已实施
- ✅ HTTPS 安全头已配置
- ✅ 敏感数据加密工具已创建
- ✅ 输入验证（Zod Schema）
- ✅ SQL 注入防护（Drizzle ORM）
- ✅ XSS 防护（React + CSP）
- ⏳ API 速率限制（待实施）
- ⏳ 单元测试覆盖率 > 80%（待实施）

### 生产环境

- ✅ JWT 认证机制已实施
- ✅ 权限系统已实施
- ✅ CORS 配置已实施
- ✅ HTTPS 强制（HSTS）已配置
- ✅ 内容安全策略 (CSP) 已配置
- ✅ 安全 HTTP 头已配置
- ✅ 敏感数据加密工具已创建
- ⏳ HTTPS 证书配置（Cloudflare Tunnel）
- ⏳ 防火墙配置
- ⏳ 入侵检测系统 (IDS)

---

## 待实施的安全措施

### 高优先级

1. **API 速率限制**
   - 使用 `@upstash/ratelimit` 库
   - 防止 DDoS 攻击和滥用
   - 实施限制：登录接口 5 次/分钟，API 接口 100 次/分钟

2. **HTTPS 证书配置**
   - 配置 Cloudflare Tunnel
   - 验证 HTTPS 正常工作
   - 配置自动证书续期

### 中优先级

3. **单元测试**
   - 为所有安全功能编写单元测试
   - 测试认证中间件
   - 测试加密/解密功能
   - 测试 CORS 配置

4. **集成测试**
   - 测试完整的认证流程
   - 测试权限控制
   - 测试 API 端点

### 低优先级

5. **安全审计**
   - 第三方安全审计
   - 渗透测试
   - 代码审计

---

## 使用指南

### 1. 保护 API 路由

```typescript
// 在 API 路由文件中
import { withAuth } from '@/lib/auth-middleware';
import { withCors } from '@/lib/cors';

// 方式 1: 仅认证
export const GET = withAuth(async (request, user) => {
  return NextResponse.json({ user });
});

// 方式 2: 认证 + 角色要求
export const DELETE = withAuth(
  async (request, user) => {
    return NextResponse.json({ success: true });
  },
  { requireRole: 'admin' }
);

// 方式 3: 认证 + CORS
export const POST = withCors(
  withAuth(async (request, user) => {
    return NextResponse.json({ data: '...' });
  })
);

// 方式 4: 使用组合中间件
import { withAuthAndCors } from '@/lib/cors';

export const PUT = withAuthAndCors(
  async (request, user) => {
    return NextResponse.json({ data: '...' });
  },
  { requireRole: 'manager', cors: { credentials: true } }
);
```

### 2. 加密敏感数据

```typescript
import { encrypt, decrypt, createDBEncryption } from '@/lib/encryption';

// 方式 1: 简单加密
const encrypted = encrypt('sensitive-data', 'password');
const decrypted = decrypt(encrypted, 'password');

// 方式 2: 对象加密
const obj = { username: 'admin', apiKey: 'secret' };
const encrypted = encryptObject(obj, 'password');
const decrypted = decryptObject(encrypted, 'password');

// 方式 3: 数据库字段加密
const dbEncryption = createDBEncryption('encryption-password');

// 保存到数据库前加密
const userToSave = dbEncryption.encryptFields(user, ['phone', 'email']);

// 从数据库读取后解密
const decryptedUser = dbEncryption.decryptFields(userFromDB, ['phone', 'email']);
```

### 3. 配置 CORS

```typescript
import { withCors, withWeChatCORS, getCORSHeaders } from '@/lib/cors';

// 方式 1: 使用默认配置
export const GET = withCors(async (request) => {
  return NextResponse.json({ data: '...' });
});

// 方式 2: 微信小程序
export const GET = withWeChatCORS(
  async (request) => {
    return NextResponse.json({ data: '...' });
  },
  'https://your-weixin-app.com'
);

// 方式 3: 自定义配置
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: '...' });
  return addCORSHeaders(response, request, {
    origins: ['https://yourdomain.com'],
    methods: ['GET', 'POST'],
    credentials: true,
    maxAge: 86400,
  });
}
```

---

## 测试建议

### 1. 认证测试

```bash
# 测试登录
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# 测试受保护的 API（带 token）
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 测试无认证访问（应返回 401）
curl -X GET http://localhost:5000/api/admin/stats

# 测试权限不足（应返回 403）
curl -X DELETE http://localhost:5000/api/pumps/1 \
  -H "Authorization: Bearer USER_TOKEN_HERE"
```

### 2. 加密测试

```bash
# 测试加密功能
curl -X POST http://localhost:5000/api/test/encrypt \
  -H "Content-Type: application/json" \
  -d '{"text":"test-data"}'

# 测试解密功能
curl -X POST http://localhost:5000/api/test/decrypt \
  -H "Content-Type: application/json" \
  -d '{"encrypted":"encrypted-data"}'
```

### 3. CORS 测试

```bash
# 测试预检请求
curl -X OPTIONS http://localhost:5000/api/pumps \
  -H "Origin: https://yourdomain.com" \
  -H "Access-Control-Request-Method: GET" \
  -v

# 测试实际请求
curl -X GET http://localhost:5000/api/pumps \
  -H "Origin: https://yourdomain.com" \
  -v
```

---

## 总结

### 已完成的措施

✅ **高优先级**
- JWT 认证与授权
- HTTPS 强制配置
- 敏感数据加密

✅ **中优先级**
- CORS 配置

### 待完成的措施

⏳ **高优先级**
- API 速率限制
- HTTPS 证书配置（Cloudflare Tunnel）

⏳ **中优先级**
- 单元测试
- 集成测试

⏳ **低优先级**
- 第三方安全审计
- 渗透测试

### 下一步行动

1. **立即行动**
   - 配置 `.env` 文件中的环境变量
   - 测试所有认证流程
   - 测试加密/解密功能
   - 测试 CORS 配置

2. **本周完成**
   - 实施 API 速率限制
   - 配置 Cloudflare Tunnel
   - 验证 HTTPS 正常工作

3. **本月完成**
   - 编写单元测试
   - 编写集成测试
   - 进行安全审计

---

**报告生成时间**: 2025-01-15
**维护者**: 洛瓦托水泵选型系统团队
**版本**: v2.0.0
