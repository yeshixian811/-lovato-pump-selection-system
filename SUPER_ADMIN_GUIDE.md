# 超级管理员账户说明

## 账户信息

- **邮箱**: `admin@lovato.com`
- **密码**: `admin123`
- **角色**: 超级管理员 (admin)
- **订阅等级**: 企业会员 (enterprise)

## 安全提醒

⚠️ **重要**: 生产环境部署前，请务必修改超级管理员的密码！

### 修改密码步骤

1. 使用当前账户登录系统
2. 访问 `/auth` 页面
3. 重新注册一个新账户
4. 在数据库中更新 admin 账户的密码哈希

或使用以下命令生成新密码哈希：

```typescript
import bcrypt from 'bcryptjs';

const newPassword = 'your_new_secure_password';
const hash = await bcrypt.hash(newPassword, 10);
console.log(hash);
```

然后执行SQL更新：

```sql
UPDATE users
SET password_hash = '$2a$10$...'  -- 替换为新生成的哈希
WHERE email = 'admin@lovato.com';
```

## 权限说明

超级管理员拥有以下权限：

### 1. 用户管理
- ✅ 查看所有注册用户
- ✅ 查看用户订阅状态
- ✅ 升级/降级用户会员等级
- ✅ 激活/停用用户账户

### 2. 数据统计
- ✅ 查看总用户数
- ✅ 查看活跃订阅数
- ✅ 查看月收入统计
- ✅ 查看会员等级分布

### 3. 访问路径
- ✅ 管理员后台: `/admin/dashboard`
- ✅ 所有API接口 (`/api/admin/*`)

## 管理员API接口

### 获取用户列表
```
GET /api/admin/users
```

### 获取统计数据
```
GET /api/admin/stats
```

### 升级用户会员
```
POST /api/admin/users/{id}/upgrade
Body: { "tier": "pro" }
```

### 修改用户状态
```
POST /api/admin/users/{id}/status
Body: { "status": "active" }
```

## 安全最佳实践

1. **定期更换密码**: 每季度更换一次管理员密码
2. **启用双因素认证**: 建议为管理员账户启用2FA
3. **限制IP访问**: 在生产环境限制管理员后台的访问IP
4. **审计日志**: 记录所有管理员的操作日志
5. **最小权限原则**: 创建多个不同权限的管理员账户

## 创建更多管理员

如需创建更多管理员账户，执行以下步骤：

1. 使用超级管理员登录
2. 在数据库中修改普通用户的角色：

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'user@example.com';
```

3. 或使用代码：

```typescript
await userManager.updateUser(userId, {
  role: 'admin',
});
```

## 故障排查

### 无法登录管理员后台
- 检查账户是否已激活
- 确认密码是否正确
- 检查浏览器是否保存了旧cookie

### API返回403错误
- 确认当前登录用户角色为 `admin`
- 检查token是否过期
- 清除浏览器缓存和cookie

### 数据库连接失败
- 检查环境变量配置
- 确认数据库服务正常运行
- 检查网络连接

## 联系支持

如有问题，请联系技术支持：
- 邮箱: support@lovato.com
- 文档: https://docs.lovato.com
