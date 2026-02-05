# 会员制功能实现指南

## 📋 功能概述

本文档说明洛瓦托水泵选型系统的会员制功能实现方案。

---

## 🎯 会员等级设计

### 1. 免费会员（Free）
- ✅ 基础选型功能
- ✅ 浏览产品库
- ❌ 限制：每月10次选型
- ❌ 不能保存选型历史
- ❌ 不能导出数据

### 2. 基础会员（Basic）
- ✅ 无限次选型
- ✅ 保存选型历史（30天）
- ✅ 导出CSV格式
- ✅ 标准技术支持
- 💰 月付：¥29/月，年付：¥290/年

### 3. 高级会员（Pro）
- ✅ 所有基础会员功能
- ✅ 永久保存选型历史
- ✅ 导出CSV + Excel格式
- ✅ 优先技术支持
- ✅ API访问权限
- 💰 月付：¥99/月，年付：¥990/年

### 4. 企业会员（Enterprise）
- ✅ 所有功能
- ✅ 多用户管理
- ✅ 定制化功能
- ✅ 专属技术支持
- 💰 定制价格

---

## 🏗️ 技术实现

### 已创建的文件：

#### 1. 数据库Schema

**`src/db/schema/users.ts`**
- 用户表（users）
- 邮箱验证表（email_verifications）
- 密码重置表（password_resets）

**`src/db/schema/subscriptions.ts`**
- 订阅计划表（subscription_plans）
- 订阅表（subscriptions）
- 选型历史表（selection_history）
- 使用统计表（usage_stats）

#### 2. 核心逻辑

**`src/lib/auth.ts`**
- JWT token创建和验证
- 用户认证
- 权限检查

**`src/lib/subscription.ts`**
- 订阅权限管理
- 选型次数限制
- 历史记录管理
- 订阅升级/降级
- 导出权限检查

#### 3. 前端页面

**`src/app/pricing/page.tsx`**
- 订阅计划展示页面
- 价格对比
- 功能对比
- FAQ

**`src/app/checkout/page.tsx`**
- 支付页面
- 支付方式选择
- 订单确认

**`src/app/dashboard/page.tsx`**
- 用户中心
- 订阅状态
- 使用统计
- 历史记录
- 账户设置

---

## 🔧 需要完成的步骤

### 第1步：创建数据库表

在PostgreSQL中运行以下SQL：

```sql
-- 创建订阅状态枚举
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired', 'past_due', 'trialing');

-- 创建用户角色枚举
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- 创建用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role user_role NOT NULL DEFAULT 'user',
  subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',
  subscription_status subscription_status NOT NULL DEFAULT 'active',
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建订阅计划表
CREATE TABLE subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL,
  features JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建订阅表
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
  status subscription_status NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_subscription_id VARCHAR(255),
  wechat_transaction_id VARCHAR(255),
  alipay_transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建选型历史表
CREATE TABLE selection_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  flow_rate DECIMAL(10, 2),
  head DECIMAL(10, 2),
  selected_pump_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建使用统计表
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  selection_count INTEGER NOT NULL DEFAULT 0,
  last_reset_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建邮箱验证表
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建密码重置表
CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 第2步：插入订阅计划数据

```sql
-- 插入订阅计划
INSERT INTO subscription_plans (id, name, description, price, billing_cycle, features) VALUES
(
  'free',
  '免费会员',
  '体验基础功能',
  0,
  'monthly',
  '{
    "maxSelections": 10,
    "historyRetention": 0,
    "exportFormats": [],
    "supportPriority": "none",
    "apiAccess": false,
    "maxUsers": 1
  }'
),
(
  'basic',
  '基础会员',
  '适合个人用户',
  29,
  'monthly',
  '{
    "maxSelections": null,
    "historyRetention": 30,
    "exportFormats": ["csv"],
    "supportPriority": "standard",
    "apiAccess": false,
    "maxUsers": 1
  }'
),
(
  'basic',
  '基础会员',
  '适合个人用户（年付）',
  290,
  'yearly',
  '{
    "maxSelections": null,
    "historyRetention": 30,
    "exportFormats": ["csv"],
    "supportPriority": "standard",
    "apiAccess": false,
    "maxUsers": 1
  }'
),
(
  'pro',
  '高级会员',
  '适合专业用户',
  99,
  'monthly',
  '{
    "maxSelections": null,
    "historyRetention": null,
    "exportFormats": ["csv", "excel"],
    "supportPriority": "priority",
    "apiAccess": true,
    "maxUsers": 1
  }'
),
(
  'pro',
  '高级会员',
  '适合专业用户（年付）',
  990,
  'yearly',
  '{
    "maxSelections": null,
    "historyRetention": null,
    "exportFormats": ["csv", "excel"],
    "supportPriority": "priority",
    "apiAccess": true,
    "maxUsers": 1
  }'
);
```

---

### 第3步：安装必要的依赖

```bash
pnpm add jose
pnpm add bcryptjs
pnpm add @types/bcryptjs -D
```

---

### 第4步：创建API路由

需要创建以下API路由：

**1. 用户注册**
- `src/app/api/auth/register/route.ts`

**2. 用户登录**
- `src/app/api/auth/login/route.ts`

**3. 获取当前用户信息**
- `src/app/api/user/me/route.ts`

**4. 创建支付订单**
- `src/app/api/payment/create/route.ts`

**5. 支付回调**
- `src/app/api/payment/callback/route.ts`

**6. 查询订阅状态**
- `src/app/api/subscription/status/route.ts`

---

### 第5步：集成支付系统

#### 选项A：微信支付

1. **注册微信支付商户**
   - 访问：https://pay.weixin.qq.com/
   - 提交资料审核

2. **获取API密钥**
   - 商户号
   - API密钥
   - AppID

3. **安装SDK**
   ```bash
   pnpm add wechatpay-node-v3
   ```

4. **实现支付逻辑**

---

#### 选项B：支付宝

1. **注册支付宝商户**
   - 访问：https://open.alipay.com/
   - 创建应用

2. **获取应用信息**
   - AppID
   - 应用私钥
   - 支付宝公钥

3. **安装SDK**
   ```bash
   pnpm add alipay-sdk
   ```

4. **实现支付逻辑**

---

#### 选项C：Stripe（国际支付）

1. **注册Stripe账户**
   - 访问：https://stripe.com/
   - 获取API密钥

2. **安装SDK**
   ```bash
   pnpm add stripe
   ```

3. **实现支付逻辑**

---

### 第6步：实现用户认证

#### 使用NextAuth.js

1. **安装NextAuth.js**
   ```bash
   pnpm add next-auth
   ```

2. **配置NextAuth.js**
   - `src/app/api/auth/[...nextauth]/route.ts`

3. **实现认证逻辑**

---

### 第7步：添加中间件权限检查

创建中间件来保护需要登录或付费的页面：

**`src/middleware.ts`**

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  // 检查是否需要登录
  if (request.nextUrl.pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 检查是否需要付费会员
  if (request.nextUrl.pathname.startsWith('/premium') && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/premium/:path*']
}
```

---

### 第8步：在选型功能中添加权限检查

在选型页面中添加权限检查：

```typescript
import { canPerformSelection, recordSelectionUsage } from '@/lib/subscription'

// 在选型前检查权限
const canSelect = await canPerformSelection(userId)
if (!canSelect) {
  // 显示升级提示
  return <UpgradePrompt />
}

// 执行选型后记录使用
await recordSelectionUsage(userId)
```

---

### 第9步：添加导出功能权限检查

```typescript
import { canExport } from '@/lib/subscription'

// 在导出前检查权限
const canExportData = await canExport(userId, 'csv')
if (!canExportData) {
  // 显示升级提示
  return <UpgradePrompt />
}
```

---

## 📊 功能权限矩阵

| 功能 | 免费会员 | 基础会员 | 高级会员 | 企业会员 |
|------|----------|----------|----------|----------|
| 基础选型 | ✅ | ✅ | ✅ | ✅ |
| 无限选型 | ❌ (10次/月) | ✅ | ✅ | ✅ |
| 选型历史(30天) | ❌ | ✅ | ✅ | ✅ |
| 选型历史(永久) | ❌ | ❌ | ✅ | ✅ |
| 导出CSV | ❌ | ✅ | ✅ | ✅ |
| 导出Excel | ❌ | ❌ | ✅ | ✅ |
| 技术支持 | ❌ | ✅ | ✅ | ✅ |
| API访问 | ❌ | ❌ | ✅ | ✅ |
| 多用户 | ❌ | ❌ | ❌ | ✅ |

---

## 🎨 UI优化建议

### 1. 添加会员标识

在导航栏显示会员等级：
```tsx
<Badge variant={tierColor}>
  <Crown className="w-4 h-4 mr-1" />
  {tierName}
</Badge>
```

### 2. 添加升级提示

当免费用户达到限制时，显示升级提示：
```tsx
<Alert>
  <Crown className="w-4 h-4" />
  <AlertDescription>
    您已达到本月选型次数限制，<Link href="/pricing">升级会员</Link>继续使用
  </AlertDescription>
</Alert>
```

### 3. 添加会员专属功能标签

在功能卡片上添加会员标识：
```tsx
{feature.tier === 'pro' && (
  <Badge className="ml-2">
    <Crown className="w-3 h-3 mr-1" />
    Pro
  </Badge>
)}
```

---

## 🚀 部署注意事项

### 环境变量配置

在`.env.local`中添加：

```env
# JWT Secret
JWT_SECRET=your-secret-key-here

# 微信支付
WECHAT_PAY_APP_ID=your_app_id
WECHAT_PAY_MCH_ID=your_mch_id
WECHAT_PAY_API_KEY=your_api_key

# 支付宝
ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=your_public_key

# Stripe
STRIPE_SECRET_KEY=your_secret_key
STRIPE_PUBLISHABLE_KEY=your_publishable_key

# 数据库
DATABASE_URL=your_database_url
```

---

## 📞 技术支持

如有问题，请参考：
- NextAuth.js文档：https://next-auth.js.org/
- Stripe文档：https://stripe.com/docs
- 微信支付文档：https://pay.weixin.qq.com/wiki/doc/api/index.html
- 支付宝文档：https://opendocs.alipay.com/

---

## ✅ 总结

会员制功能已经完成了核心架构设计，包括：

✅ 数据库Schema设计
✅ 认证逻辑
✅ 订阅管理逻辑
✅ 前端页面（定价、支付、用户中心）

**下一步需要完成：**

1. 执行数据库迁移
2. 实现用户注册/登录API
3. 集成支付系统
4. 在现有功能中添加权限检查
5. 测试完整流程

完成后，你的选型系统将拥有完整的会员制功能！
