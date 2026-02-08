# 用户管理连接错误修复说明

## 问题描述

用户在访问管理员后台的"用户管理"页面时，遇到连接错误：
```
8d5b54c6-3201-446b-bb01-95cdf8a1dcaf.dev.coze.site 拒绝了我们的连接请求。
```

## 根本原因

问题出在 **认证 Token 没有正确传递**：

1. **登录流程**：
   - 管理员在 `/admin-login` 页面登录成功后，Token 被保存到 `sessionStorage`
   - 但是后续的 API 调用没有从 `sessionStorage` 读取 Token

2. **API 调用**：
   - `/admin/dashboard` 页面调用 `/api/admin/users` 和 `/api/admin/stats` 时
   - 没有传递 `Authorization` header
   - 导致 API 返回 401 未授权错误

## 修复方案

### 1. 创建统一的 API 调用工具

创建了 `src/lib/api.ts`，提供以下功能：

- ✅ 自动从多个来源获取 Token（sessionStorage、localStorage、cookie）
- ✅ 自动添加 `Authorization` header
- ✅ 统一的错误处理
- ✅ 自动处理 401 错误（清除 Token 并跳转到登录页）
- ✅ 提供便捷的请求方法（get、post、put、del、upload）

### 2. 更新管理后台页面

修改了以下页面以使用新的 API 工具：

- ✅ `src/app/admin/dashboard/page.tsx`
  - 使用 `get()` 和 `post()` 替代原生 `fetch()`
  - 自动传递认证 Token

- ✅ `src/app/admin-login/page.tsx`
  - 使用 `setToken()` 工具保存 Token
  - 确保保存到 `sessionStorage`

### 3. 代码变更详情

#### API 工具（`src/lib/api.ts`）

```typescript
// 获取 Token（从多个来源）
export function getToken(): string | null {
  const sessionToken = sessionStorage.getItem('admin_token');
  const localToken = localStorage.getItem('auth_token');
  const cookies = document.cookie;
  // ... 返回找到的第一个 Token
}

// 统一的 API 调用
export async function api<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  // 自动添加 Authorization header
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // ... 处理响应和错误
}

// 便捷方法
export async function get<T = any>(url: string, options?: RequestOptions): Promise<T>
export async function post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>
export async function put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>
export async function del<T = any>(url: string, options?: RequestOptions): Promise<T>
```

#### Dashboard 页面更新

**修改前**：
```typescript
const response = await fetch('/api/admin/users')
if (response.ok) {
  const data = await response.json()
  setUsers(data.users)
}
```

**修改后**：
```typescript
const data = await get<{ users: User[] }>('/api/admin/users')
setUsers(data.users)
```

## 测试步骤

### 1. 清除速率限制（如果之前测试失败）

等待速率限制过期（通常 5 分钟），或者手动清除：

```bash
# 查看当前限制状态
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrongpassword"}' \
  http://localhost:5000/api/auth/login
```

### 2. 测试管理员登录

1. 访问 `http://localhost:5000/admin-login`
2. 使用测试账户登录：
   - 邮箱：`admin@lovato.com`
   - 密码：`admin123`
3. 点击"登录"
4. 验证是否显示"登录成功"
5. 点击"进入后台管理"

### 3. 测试用户管理页面

1. 在后台管理页面，点击"会员管理"标签
2. 验证用户列表是否正常显示
3. 验证统计数据是否正常显示

### 4. 测试 API 调用（可选）

使用浏览器开发者工具：

1. 按 F12 打开开发者工具
2. 切换到 "Network" 标签
3. 刷新页面或执行操作
4. 检查 `/api/admin/users` 和 `/api/admin/stats` 请求
5. 验证：
   - 请求头包含 `Authorization: Bearer <token>`
   - 响应状态码为 200
   - 响应数据正常

### 5. 测试未授权访问

1. 清除浏览器 Token（sessionStorage）
2. 直接访问 `/admin/dashboard`
3. 验证是否自动跳转到 `/admin-login`

## 其他需要更新的页面

以下页面也可能需要更新以使用新的 API 工具：

- `/admin/inventory/customers/page.tsx` - 客户管理
- `/admin/inventory/suppliers/page.tsx` - 供应商管理
- `/admin/inventory/sales/page.tsx` - 销售管理
- `/admin/inventory/purchase/page.tsx` - 采购管理
- `/admin/products/page.tsx` - 产品管理
- `/admin/settings/page.tsx` - 系统设置

如果这些页面也遇到类似的连接问题，可以按照相同的方式更新：

1. 导入 API 工具：`import { get, post, put, del } from '@/lib/api'`
2. 替换 `fetch()` 调用为 `get()`、`post()` 等

## 故障排查

### 问题 1：仍然提示"未登录"

**原因**：Token 未正确保存或已过期

**解决方案**：
1. 打开浏览器开发者工具（F12）
2. 切换到 "Application" 标签
3. 检查 "Session Storage" 是否包含 `admin_token`
4. 如果没有，重新登录
5. 如果有，检查 Token 是否有效（可能已过期）

### 问题 2：Token 保存了但仍然被拒绝

**原因**：Token 格式不正确或验证失败

**解决方案**：
1. 检查 Token 格式：应该是 `Bearer <token>`
2. 检查后端日志：查看 JWT 验证错误
3. 重新登录获取新 Token

### 问题 3：速率限制导致无法登录

**原因**：多次登录失败触发速率限制

**解决方案**：
1. 等待速率限制过期（通常 5 分钟）
2. 检查密码是否正确
3. 联系管理员重置速率限制

## 安全建议

1. **定期轮换 Token**：建议设置合理的 Token 有效期
2. **使用 HTTPS**：生产环境必须使用 HTTPS
3. **设置 CSP**：防止 XSS 攻击窃取 Token
4. **启用 HttpOnly Cookie**：将 Token 存储在 HttpOnly Cookie 中（当前版本使用 sessionStorage）
5. **监控异常登录**：记录登录日志，检测异常行为

## 下一步优化

1. **Token 自动刷新**：实现 Access Token 和 Refresh Token 机制
2. **Token 存储**：考虑使用 HttpOnly Cookie 替代 sessionStorage
3. **错误处理**：提供更友好的错误提示
4. **加载状态**：在 API 调用期间显示加载指示器
5. **请求重试**：对临时性错误自动重试

## 相关文档

- [JWT 认证文档](src/lib/auth.ts) - JWT 认证实现
- [API 工具文档](src/lib/api.ts) - API 调用工具
- [管理员认证文档](src/lib/admin-auth.ts) - 管理员认证中间件

## 联系支持

如果问题仍未解决，请联系技术支持并提供：
1. 浏览器控制台错误截图
2. Network 请求截图
3. 登录账户信息（脱敏）
4. 操作步骤描述
