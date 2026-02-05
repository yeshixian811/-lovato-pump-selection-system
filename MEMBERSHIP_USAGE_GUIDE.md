# 洛瓦托水泵选型系统 - 会员制功能使用指南

## 目录
1. [系统概述](#系统概述)
2. [会员等级与权限](#会员等级与权限)
3. [安装与配置](#安装与配置)
4. [用户指南](#用户指南)
5. [管理员指南](#管理员指南)
6. [API文档](#api文档)
7. [常见问题](#常见问题)

---

## 系统概述

洛瓦托水泵选型系统会员制功能提供以下核心能力：

- **用户认证**：注册、登录、JWT令牌验证
- **订阅管理**：多等级会员计划（免费、基础、高级、企业）
- **权限控制**：基于会员等级的功能访问控制
- **使用统计**：选型次数、历史记录管理
- **支付集成**：支持微信支付、支付宝、银行卡
- **后台管理**：用户管理、数据统计、订阅管理

---

## 会员等级与权限

### 免费会员 (Free)
- **价格**：免费
- **选型次数**：10次/月
- **历史记录**：保留30天
- **导出格式**：仅CSV
- **高级功能**：❌

### 基础会员 (Basic)
- **价格**：¥29/月
- **选型次数**：100次/月
- **历史记录**：保留90天
- **导出格式**：CSV + Excel (基础)
- **高级功能**：❌

### 高级会员 (Pro)
- **价格**：¥99/月
- **选型次数**：无限
- **历史记录**：永久保留
- **导出格式**：CSV + Excel (完整) + PDF
- **高级功能**：✅

### 企业会员 (Enterprise)
- **价格**：定制
- **选型次数**：无限
- **历史记录**：永久保留 + 云备份
- **导出格式**：所有格式 + API接口
- **高级功能**：✅ + 企业支持

---

## 安装与配置

### 1. 安装依赖

```bash
pnpm add jose bcryptjs postgres drizzle-orm
```

### 2. 执行数据库迁移

将以下SQL文件导入PostgreSQL数据库：

```bash
psql -U your_user -d your_database -f migrations/001_add_membership_tables.sql
```

### 3. 配置环境变量

在 `.env.local` 文件中添加：

```env
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/your_database

# JWT密钥（请使用随机字符串）
JWT_SECRET=your_super_secret_jwt_key_here_min_32_characters

# 支付配置（后续集成）
WECHAT_PAY_APP_ID=your_wechat_pay_app_id
WECHAT_PAY_MCH_ID=your_wechat_pay_mch_id
WECHAT_PAY_API_KEY=your_wechat_pay_api_key

ALIPAY_APP_ID=your_alipay_app_id
ALIPAY_PRIVATE_KEY=your_alipay_private_key
ALIPAY_PUBLIC_KEY=your_alipay_public_key

STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 4. 生成Drizzle配置

```bash
pnpm drizzle-kit generate:pg
```

---

## 用户指南

### 注册账户

1. 访问 `/auth` 页面
2. 点击"注册"标签
3. 填写邮箱、姓名、密码
4. 点击"创建账户"
5. 系统自动登录并创建免费会员

### 登录系统

1. 访问 `/auth` 页面
2. 点击"登录"标签
3. 填写邮箱和密码
4. 点击"登录"
5. 登录成功后跳转到仪表盘

### 查看订阅状态

1. 访问 `/dashboard` 页面
2. 查看当前会员等级和有效期
3. 查看使用统计（选型次数、历史记录）
4. 查看可用功能

### 升级会员

1. 访问 `/pricing` 页面
2. 选择合适的会员等级
3. 点击"立即订阅"
4. 选择支付方式（微信支付/支付宝/银行卡）
5. 完成支付
6. 系统自动升级会员等级

### 查看历史记录

1. 访问 `/dashboard` 页面
2. 点击"历史记录"标签
3. 查看所有选型历史
4. 根据会员等级，历史记录保留时间不同

### 导出选型结果

1. 完成水泵选型
2. 点击"导出"按钮
3. 选择导出格式（根据会员等级）
4. 下载导出文件

---

## 管理员指南

### 访问管理员后台

1. 访问 `/admin/dashboard` 页面
2. 使用管理员账户登录
3. 查看会员管理面板

### 查看用户列表

1. 进入"会员管理"标签页
2. 查看所有注册用户
3. 使用搜索框按邮箱或姓名筛选
4. 使用过滤器按会员等级或状态筛选

### 升级用户会员

1. 在用户列表中找到目标用户
2. 点击"升级"下拉菜单
3. 选择新的会员等级
4. 确认升级

### 激活/停用用户

1. 在用户列表中找到目标用户
2. 点击状态图标按钮
3. 确认激活或停用

### 查看统计数据

1. 进入"数据统计"标签页
2. 查看核心指标（总用户数、活跃订阅、月收入、付费率）
3. 查看会员等级分布图表

---

## API文档

### 认证相关

#### POST /api/auth/register
注册新用户

**请求体**：
```json
{
  "email": "user@example.com",
  "name": "张三",
  "password": "password123"
}
```

**响应**：
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "张三",
    "subscriptionTier": "free"
  },
  "token": "jwt_token"
}
```

#### POST /api/auth/login
用户登录

**请求体**：
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**：
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "张三",
    "subscriptionTier": "pro"
  },
  "token": "jwt_token"
}
```

#### GET /api/user/me
获取当前用户信息

**请求头**：
```
Authorization: Bearer jwt_token
```

**响应**：
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "张三",
    "subscriptionTier": "pro",
    "subscriptionStatus": "active",
    "subscriptionEndDate": "2024-12-31"
  }
}
```

### 订阅相关

#### GET /api/subscription/status
获取订阅状态

**请求头**：
```
Authorization: Bearer jwt_token
```

**响应**：
```json
{
  "tier": "pro",
  "status": "active",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "selectionsThisMonth": 50,
  "maxSelections": 999999,
  "historyRetentionDays": 999999
}
```

#### POST /api/subscription/can-export
检查导出权限

**请求体**：
```json
{
  "format": "excel"
}
```

**响应**：
```json
{
  "canExport": true,
  "maxSelections": 10000,
  "currentSelections": 50
}
```

### 使用统计

#### GET /api/usage/stats
获取使用统计

**请求头**：
```
Authorization: Bearer jwt_token
```

**响应**：
```json
{
  "selectionsThisMonth": 50,
  "maxSelections": 999999,
  "historyRecords": 120,
  "historyRetentionDays": 999999,
  "subscription": {
    "tier": "pro",
    "status": "active",
    "endDate": "2024-12-31"
  }
}
```

### 支付相关

#### POST /api/payment/create
创建支付订单

**请求体**：
```json
{
  "tier": "pro",
  "billingCycle": "monthly",
  "paymentMethod": "wechat"
}
```

**响应**：
```json
{
  "success": true,
  "orderId": "order_id",
  "paymentUrl": "https://pay.example.com/...",
  "amount": 99
}
```

#### POST /api/payment/callback
支付回调

**请求体**：
```json
{
  "orderId": "order_id",
  "status": "success"
}
```

**响应**：
```json
{
  "success": true
}
```

### 管理员相关

#### GET /api/admin/users
获取用户列表（管理员）

**响应**：
```json
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "name": "张三",
      "role": "user",
      "subscriptionTier": "pro",
      "subscriptionStatus": "active"
    }
  ]
}
```

#### GET /api/admin/stats
获取统计数据（管理员）

**响应**：
```json
{
  "stats": {
    "totalUsers": 1000,
    "activeSubscriptions": 200,
    "monthlyRevenue": 15000,
    "tierDistribution": {
      "free": 800,
      "basic": 100,
      "pro": 95,
      "enterprise": 5
    }
  }
}
```

#### POST /api/admin/users/[id]/upgrade
升级用户会员（管理员）

**请求体**：
```json
{
  "tier": "pro"
}
```

**响应**：
```json
{
  "success": true
}
```

#### POST /api/admin/users/[id]/status
修改用户状态（管理员）

**请求体**：
```json
{
  "status": "active"
}
```

**响应**：
```json
{
  "success": true
}
```

---

## 常见问题

### Q1: 如何重置密码？

A: 目前系统未实现密码重置功能。请联系管理员手动重置。

### Q2: 选型次数用完了怎么办？

A: 
- 免费会员：等待下月重置或升级会员
- 付费会员：联系管理员或升级更高等级

### Q3: 如何取消订阅？

A: 
1. 访问 `/dashboard` 页面
2. 点击"管理订阅"
3. 选择"取消订阅"
4. 确认取消
5. 当前订阅周期结束后不会自动续费

### Q4: 会员到期后会怎样？

A: 
- 订阅状态变为"已过期"
- 选型次数限制恢复为免费会员（10次/月）
- 历史记录保留30天
- 高级功能不可用

### Q5: 如何申请退款？

A: 
- 联系客服或管理员
- 提供订单号和退款原因
- 审核通过后7-15个工作日内退款

### Q6: 企业会员如何申请？

A: 
- 访问 `/pricing` 页面
- 点击"企业定制"按钮
- 填写企业信息表单
- 等待销售团队联系

### Q7: 支持哪些支付方式？

A: 
- 微信支付
- 支付宝
- 银行卡（需要后续集成）

### Q8: 如何成为管理员？

A: 
1. 直接在数据库中修改用户角色
2. 或者通过管理员后台升级用户角色

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### Q9: 数据安全如何保障？

A: 
- 密码使用bcryptjs加密存储
- JWT令牌有有效期限制
- 敏感操作需要验证
- 定期数据库备份

### Q10: 如何集成真实支付系统？

A: 
- 配置环境变量（微信支付/支付宝/Stripe密钥）
- 修改 `src/app/api/payment/create/route.ts`
- 修改 `src/app/api/payment/callback/route.ts`
- 测试支付流程

---

## 技术支持

如有问题，请联系：
- 技术支持邮箱：support@lovato.com
- 在线客服：工作日 9:00-18:00
- 帮助文档：https://docs.lovato.com

---

## 版本历史

- **v1.0.0** (2024-01)
  - 初始版本
  - 实现基础会员制功能
  - 支持免费、基础、高级、企业四个等级
  - 实现用户认证和权限控制
  - 实现管理员后台
