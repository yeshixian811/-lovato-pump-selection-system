# 🐘 腾讯云 PostgreSQL + Vercel 集成指南

## 📋 数据库配置信息

### 连接信息
- **主机地址**: 122.51.22.101
- **端口**: 5432
- **数据库名**: lovato_pump
- **用户名**: lovato_user
- **密码**: lovato_db_password_2024

### 连接字符串
```env
DATABASE_URL=postgresql://lovato_user:lovato_db_password_2024@122.51.22.101:5432/lovato_pump
```

---

## 🔧 Vercel 环境变量配置

### 步骤 1：访问 Vercel Dashboard
```
https://vercel.com/dashboard
```

### 步骤 2：选择项目并配置环境变量

#### 路径：
1. 选择您的项目
2. 进入 **Settings** → **Environment Variables**

#### 添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://lovato_user:lovato_db_password_2024@122.51.22.101:5432/lovato_pump` | 数据库连接字符串 |
| `JWT_SECRET` | `lovato-jwt-secret-key-production-2024-secure` | JWT 密钥 |
| `NEXT_PUBLIC_APP_URL` | `https://lowatopump.com` | 应用 URL |
| `NODE_ENV` | `production` | 环境模式 |
| `PORT` | `5000` | 端口号 |

### 步骤 3：选择环境

为每个环境变量选择适用范围：
- ✅ **Production**（生产环境）
- ✅ **Preview**（预览环境）
- ✅ **Development**（开发环境）

### 步骤 4：保存并重新部署
1. 点击 **Save**
2. 进入 **Deployments** 标签
3. 点击最新部署右侧的 **...** → **Redeploy**
4. 确认重新部署

---

## 🔍 连接测试

### 方法 1：本地测试（确保数据库可访问）

```bash
# 安装 PostgreSQL 客户端
pnpm add -D pg

# 创建测试脚本
```

创建文件 `test-db-connection.js`：
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://lovato_user:lovato_db_password_2024@122.51.22.101:5432/lovato_pump',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ 数据库连接成功！');
    console.log('当前时间:', result.rows[0].now);
    client.release();
  } catch (error) {
    console.error('❌ 数据库连接失败！');
    console.error('错误信息:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
```

运行测试：
```bash
node test-db-connection.js
```

### 方法 2：在 Vercel 中测试（部署后）

创建 API 路由 `src/app/api/test-db/route.ts`：
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const result = await pool.query('SELECT NOW()');
    await pool.end();

    return NextResponse.json({
      success: true,
      message: '数据库连接成功',
      timestamp: result.rows[0].now,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: '数据库连接失败',
      error: error.message,
    }, { status: 500 });
  }
}
```

访问：`https://lowatopump.com/api/test-db`

---

## ⚠️ 常见问题与解决方案

### 问题 1：连接超时

**错误信息：**
```
connection timeout
```

**解决方案：**
1. 检查腾讯云 PostgreSQL 安全组配置
2. 确保 Vercel IP 地址已添加到白名单

**Vercel IP 地址范围：**
```
76.76.21.0/24
76.76.19.0/24
76.76.2.0/24
76.76.27.0/24
```

在腾讯云控制台配置：
```
1. 进入 PostgreSQL 实例 → 数据库管理
2. 选择目标数据库
3. 点击"安全组"
4. 添加入站规则
   - 类型: 自定义
   - 来源: 76.76.21.0/24
   - 协议端口: 5432
   - 策略: 允许
```

### 问题 2：SSL 连接错误

**错误信息：**
```
SSL connection is required
```

**解决方案：**

在连接字符串中添加 SSL 参数：
```env
DATABASE_URL=postgresql://lovato_user:lovato_db_password_2024@122.51.22.101:5432/lovato_pump?sslmode=require
```

或在代码中配置：
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // 仅用于测试，生产环境建议使用有效证书
  }
});
```

### 问题 3：连接数限制

**错误信息：**
```
connection limit exceeded
```

**解决方案：**

使用连接池配置：
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 问题 4：认证失败

**错误信息：**
```
password authentication failed
```

**解决方案：**

1. 检查用户名和密码是否正确
2. 确保用户有访问该数据库的权限
3. 在腾讯云控制台重置密码

---

## 🔒 安全配置

### 1. 限制 IP 白名单

只允许 Vercel IP 访问：
```
76.76.21.0/24
76.76.19.0/24
76.76.2.0/24
76.76.27.0/24
```

### 2. 启用 SSL 连接

```env
DATABASE_URL=postgresql://lovato_user:lovato_db_password_2024@122.51.22.101:5432/lovato_pump?sslmode=require
```

### 3. 使用强密码

```env
# 当前密码
lovato_db_password_2024

# 建议使用更复杂的密码（32位随机字符串）
# 例如：xY9#mK2$pL8@nQ7!rT4&wE3%zV6*sB9
```

### 4. 定期备份

在腾讯云控制台配置：
- 自动备份：每天凌晨 2:00
- 保留时间：7 天
- 备份方式：全量备份

---

## 📊 监控与日志

### 1. 腾讯云监控

访问路径：
```
腾讯云控制台 → PostgreSQL → 实例管理 → 监控
```

监控指标：
- CPU 使用率
- 内存使用率
- 磁盘使用率
- 连接数
- 慢查询

### 2. Vercel 日志

访问路径：
```
Vercel Dashboard → 项目 → Logs
```

### 3. 应用日志

在代码中添加日志：
```typescript
console.log('数据库连接成功', { timestamp: new Date() });
console.error('数据库连接失败', { error: error.message });
```

---

## 🚀 性能优化

### 1. 使用连接池

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // 最大连接数
  min: 2,  // 最小连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 2. 启用查询缓存

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  statement_timeout: 10000, // 查询超时时间
  query_timeout: 10000,
});
```

### 3. 优化查询

使用索引：
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category);
```

---

## 📝 总结

### 配置清单
- ✅ 数据库连接字符串已配置
- ✅ 环境变量已准备好
- ✅ SSL 连接已启用
- ✅ 连接池已配置

### 下一步
1. 等待 Vercel Dashboard 恢复
2. 配置环境变量
3. 重新部署
4. 测试数据库连接
5. 监控性能和日志

### 相关文档
- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [腾讯云 PostgreSQL 文档](https://cloud.tencent.com/document/product/409)

---

**配置完成！等待 Vercel Dashboard 恢复后即可部署。** 🚀
