# ✅ 腾讯云 PostgreSQL 配置检查清单

## 📋 配置进度跟踪

---

## 第 1 部分：腾讯云配置

### 1.1 创建实例

- [ ] 访问 https://console.cloud.tencent.com/postgres
- [ ] 点击"新建实例"
- [ ] 选择配置：
  - [ ] 计费模式：按量计价
  - [ ] 地域：广州
  - [ ] 版本：PostgreSQL 14
  - [ ] 规格：2核4GB
  - [ ] 存储：100GB
- [ ] 设置管理员密码
- [ ] 确认并创建

**实例名称：** `lovato-pump-db`

### 1.2 等待实例创建

- [ ] 等待 3-10 分钟
- [ ] 确认状态为"运行中"

### 1.3 创建数据库

- [ ] 进入实例管理
- [ ] 点击"数据库管理"
- [ ] 创建数据库：
  - [ ] 数据库名：`lovato_pump`
  - [ ] 字符集：UTF-8

### 1.4 创建账号

- [ ] 点击"账号管理"
- [ ] 创建账号：
  - [ ] 账号名：`lovato_user`
  - [ ] 主机：`%`
  - [ ] 密码：_______________（请填写）
  - [ ] 权限：lovato_pump 数据库所有者

### 1.5 获取连接信息

- [ ] 进入"连接管理"
- [ ] 开启外网地址
- [ ] 记录以下信息：

| 项目 | 实际值 |
|------|--------|
| 外网地址 | _________________ |
| 端口 | 5432 |

### 1.6 配置安全组

- [ ] 检查安全组规则
- [ ] 确认允许 5432 端口
- [ ] 来源：0.0.0.0/0

### 1.7 生成连接字符串

**连接字符串模板：**
```
postgresql://lovato_user:密码@外网地址:5432/lovato_pump
```

**你的连接字符串：**
```
postgresql://lovato_user:________@_______________:5432/lovato_pump
```

---

## 第 2 部分：Vercel 配置

### 2.1 访问 Vercel Dashboard

- [ ] 访问 https://vercel.com/dashboard
- [ ] 登录 Vercel 账号

### 2.2 选择项目

- [ ] 选择项目：`luowato-pump-selection-system`

### 2.3 配置环境变量

- [ ] 进入 Settings → Environment Variables
- [ ] 添加环境变量：

| 配置项 | 值 |
|--------|-----|
| Name | DATABASE_URL |
| Value | [你的连接字符串] |
| Environment | All |

**Value 值：**
```
postgresql://lovato_user:________@_______________:5432/lovato_pump
```

- [ ] 点击 Add
- [ ] 点击 Save

### 2.4 重新部署

- [ ] 进入 Deployments 标签
- [ ] 点击 Redeploy
- [ ] 选择 Redeploy to Production
- [ ] 等待部署完成（5-10 分钟）

---

## 第 3 部分：验证

### 3.1 检查部署状态

- [ ] 部署状态显示：Ready
- [ ] 没有错误信息

### 3.2 测试数据库连接

- [ ] 访问网站：https://lowatopump.com
- [ ] 测试登录功能
- [ ] 测试其他需要数据库的功能

### 3.3 测试数据库直接连接（可选）

- [ ] 使用 psql 测试：
  ```bash
  psql -h 外网地址 -p 5432 -U lovato_user -d lovato_pump
  ```
- [ ] 输入密码，确认连接成功

---

## 📊 配置总结

### 数据库信息

| 项目 | 值 |
|------|-----|
| **数据库类型** | 腾讯云 PostgreSQL |
| **实例名称** | lovato-pump-db |
| **数据库** | lovato_pump |
| **用户名** | lovato_user |
| **密码** | [已设置] |
| **外网地址** | [已获取] |
| **端口** | 5432 |

### Vercel 配置

| 项目 | 值 |
|------|-----|
| **项目名称** | luowato-pump-selection-system |
| **环境变量** | DATABASE_URL |
| **连接字符串** | [已配置] |
| **部署状态** | Ready |

---

## 🎯 完成标志

所有项目完成后，你应该能够：

- [ ] ✅ 在腾讯云控制台看到运行中的 PostgreSQL 实例
- [ ] ✅ 在 Vercel Dashboard 看到 DATABASE_URL 环境变量
- [ ] ✅ 访问 https://lowatopump.com 可以正常使用所有功能
- [ ] ✅ 数据库连接正常，数据可以存储和读取

---

## 💡 快速参考

### 重要链接

- 腾讯云 PostgreSQL 控制台：https://console.cloud.tencent.com/postgres
- Vercel Dashboard：https://vercel.com/dashboard
- 项目网站：https://lowatopump.com

### 重要命令

**测试连接：**
```bash
psql -h 外网地址 -p 5432 -U lovato_user -d lovato_pump
```

**查看数据库列表：**
```sql
\l
```

**退出 psql：**
```sql
\q
```

---

## 🆘 需要帮助？

如果在配置过程中遇到问题：

1. **查看详细指南**：TENCENT_CLOUD_POSTGRES_DETAILED.md
2. **检查常见问题**：TENCENT_CLOUD_POSTGRES_DETAILED.md 中的"常见问题"部分
3. **联系支持**：腾讯云技术支持

---

**按照检查清单逐项完成配置！** 🚀

**完成后告诉我连接信息，我帮你验证！** 👍
