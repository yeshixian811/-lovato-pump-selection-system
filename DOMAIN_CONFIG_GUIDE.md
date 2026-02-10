# 🌐 配置自定义域名 lowatopump.com 指南

## ✅ 已完成的步骤

### 1. 项目配置
- ✅ 更新 `vercel.json`，添加域名配置
- ✅ 设置 `NEXT_PUBLIC_APP_URL` 为 `https://lowatopump.com`
- ✅ 添加 `lowatopump.com` 和 `www.lowatopump.com` 域名
- ✅ 推送到 GitHub 主分支

### 2. Vercel 自动部署
- ✅ Vercel 已检测到代码更新
- ⏳ 等待部署完成（预计 3-5 分钟）

---

## 📋 需要手动完成的步骤

### 步骤 1：在 Vercel Dashboard 添加域名

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目：`luowato-pump-selection-system`
3. 点击 **Settings** (设置)
4. 点击 **Domains** (域名)
5. 点击 **Add Domain** (添加域名)
6. 输入域名：`lowatopump.com`
7. 点击 **Add** (添加)

**注意：** 添加 `lowatopump.com` 后，Vercel 会自动添加 `www.lowatopump.com`

---

### 步骤 2：配置 DNS 解析

Vercel 会提供以下 DNS 记录配置：

#### 选项 A：根域名 (lowatopump.com) - 推荐配置

| 类型 | 主机记录 | 记录值 |
|------|----------|--------|
| A | @ | `216.198.79.1` |

#### 选项 B：使用 CNAME（部分域名提供商不支持根域名 A 记录）

| 类型 | 主机记录 | 记录值 |
|------|----------|--------|
| CNAME | @ | `cname.vercel-dns.com` |

#### 选项 C：www 子域名 (www.lowatopump.com) - 必需配置

| 类型 | 主机记录 | 记录值 |
|------|----------|--------|
| CNAME | www | `cname.vercel-dns.com` |

---

### 步骤 3：等待 DNS 生效

1. 配置完成后，等待 DNS 生效（通常 5 分钟 - 24 小时）
2. 检查域名是否指向 Vercel：
   ```bash
   # 检查根域名
   nslookup lowatopump.com

   # 检查 www 子域名
   nslookup www.lowatopump.com
   ```

---

### 步骤 4：验证域名配置

1. 返回 Vercel Dashboard 的 **Domains** 页面
2. 等待域名状态变为 **Valid Configuration** (有效配置)
3. 点击访问域名：`https://lowatopump.com`

---

## 🔧 常见问题排查

### 问题 1：域名状态显示 "Pending"
**原因：** DNS 记录尚未生效
**解决：**
- 等待 5-10 分钟后刷新页面
- 使用 DNS 检查工具验证配置：https://dnschecker.org/

### 问题 2：域名状态显示 "Invalid Configuration"
**原因：** DNS 记录配置错误
**解决：**
- 检查 DNS 记录是否正确
- 确保记录值与 Vercel 提供的一致
- 确认 TTL 设置为合理值（建议 300 秒或更少）

### 问题 3：访问域名显示 404
**原因：** 项目尚未部署或路由配置错误
**解决：**
- 检查 Vercel 部署状态
- 确认 `microfrontends.json` 中的默认路由为 `/`
- 等待部署完成后重试

### 问题 4：HTTP 无法访问，仅 HTTPS 可用
**原因：** Vercel 自动启用 HTTPS
**解决：**
- 这是正常现象，Vercel 会自动配置 SSL 证书
- 直接使用 `https://lowatopump.com` 访问

---

## 📊 配置检查清单

- [x] 更新 `vercel.json` 配置文件
- [x] 推送到 GitHub 主分支
- [ ] 在 Vercel Dashboard 添加域名
- [ ] 配置 DNS 解析记录
- [ ] 等待 DNS 生效
- [ ] 验证域名状态为 "Valid Configuration"
- [ ] 测试访问 `https://lowatopump.com`
- [ ] 测试访问 `https://www.lowatopump.com`

---

## 🎯 预期效果

配置完成后，用户可以通过以下地址访问项目：

- **主域名：** `https://lowatopump.com`
- **www 子域名：** `https://www.lowatopump.com`
- **Vercel 域名：** `https://luowato-pump-selection-system.vercel.app`（仍然可用）

---

## 🔐 HTTPS 配置

Vercel 会自动为自定义域名配置 HTTPS 证书：

- ✅ 自动生成 SSL 证书
- ✅ 自动续期
- ✅ 强制 HTTPS 重定向

**无需手动配置 HTTPS！**

---

## 📞 技术支持

如果遇到问题，可以参考以下资源：

- [Vercel 域名配置文档](https://vercel.com/docs/concepts/projects/domains)
- [Vercel DNS 配置指南](https://vercel.com/docs/concepts/projects/domains/add-a-domain)
- [DNS 检查工具](https://dnschecker.org/)

---

**祝配置顺利！如有问题，随时联系。** 🚀
