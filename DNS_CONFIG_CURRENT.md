# 🌐 DNS 配置指南 - lowatopump.com

## 📋 Vercel 提供的最新 DNS 记录

### 根域名 (lowatopump.com)

| 类型 | 名称 | 价值 | 状态 |
|------|------|------|------|
| A | @ | 216.198.79.1 | ✅ 推荐使用 |

### www 子域名 (www.lowatopump.com)

| 类型 | 名称 | 价值 | 状态 |
|------|------|------|------|
| CNAME | www | cname.vercel-dns.com | ✅ 标准 |

---

## ✅ 完整 DNS 配置清单

### 记录 1：根域名（必需）

```
记录类型：A
主机记录：@
记录值：216.198.79.1
TTL：600（或默认值）
```

### 记录 2：www 子域名（推荐）

```
记录类型：CNAME
主机记录：www
记录值：cname.vercel-dns.com
TTL：600（或默认值）
```

---

## 🔧 各大域名提供商配置步骤

### 阿里云 (Alibaba Cloud)

1. 登录 [阿里云 DNS 控制台](https://dns.console.aliyun.com/)
2. 选择域名：lowatopump.com
3. 点击 **添加记录**

**记录 1：**
- 记录类型：A
- 主机记录：`@`
- 记录值：`216.198.79.1`
- TTL：600

**记录 2：**
- 记录类型：CNAME
- 主机记录：`www`
- 记录值：`cname.vercel-dns.com`
- TTL：600

---

### 腾讯云 (Tencent Cloud)

1. 登录 [腾讯云 DNS 控制台](https://console.cloud.tencent.com/cns)
2. 选择域名：lowatopump.com
3. 点击 **添加记录**

**记录 1：**
- 主机记录：`@`
- 记录类型：A
- 线路类型：默认
- 记录值：`216.198.79.1`
- TTL：600

**记录 2：**
- 主机记录：`www`
- 记录类型：CNAME
- 线路类型：默认
- 记录值：`cname.vercel-dns.com`
- TTL：600

---

### GoDaddy

1. 登录 [GoDaddy DNS 管理](https://dcc.godaddy.com/manage/dns)
2. 选择域名：lowatopump.com
3. 点击 **Add**

**记录 1：**
- Type：A
- Name：`@`
- Value：`216.198.79.1`
- TTL：1 Hour

**记录 2：**
- Type：CNAME
- Name：`www`
- Value：`cname.vercel-dns.com`
- TTL：1 Hour

---

### Namecheap

1. 登录 [Namecheap Domain List](https://ap.www.namecheap.com/Domains/DomainControlPanel)
2. 选择域名：lowatopump.com
3. 点击 **Advanced DNS**
4. 点击 **Add New Record**

**记录 1：**
- Type：A Record
- Host：`@`
- Value：`216.198.79.1`
- TTL：Automatic

**记录 2：**
- Type：CNAME Record
- Host：`www`
- Value：`cname.vercel-dns.com`
- TTL：Automatic

---

### Cloudflare

1. 登录 [Cloudflare DNS](https://dash.cloudflare.com/)
2. 选择域名：lowatopump.com
3. 点击 **Add Record**

**记录 1：**
- Type：A
- Name：`@`
- IPv4 address：`216.198.79.1`
- Proxy status：Proxied (橙色云朵) 或 DNS only (灰色云朵)

**记录 2：**
- Type：CNAME
- Name：`www`
- Target：`cname.vercel-dns.com`
- Proxy status：Proxied (橙色云朵) 或 DNS only (灰色云朵)

---

## ⏳ DNS 生效检查

### 方法 1：使用命令行

```bash
# 检查根域名
nslookup lowatopump.com

# 检查 www 子域名
nslookup www.lowatopump.com
```

**预期结果：**
```
Server:  xxx.xxx.xxx.xxx
Address: xxx.xxx.xxx.xxx#53

Non-authoritative answer:
Name:    lowatopump.com
Address: 216.198.79.1
```

### 方法 2：使用在线工具

访问以下网站检查 DNS 状态：
- [DNS Checker](https://dnschecker.org/)
- [MXToolbox](https://mxtoolbox.com/DNSLookup.aspx)

---

## 📊 配置检查清单

- [ ] 在域名提供商登录
- [ ] 找到 DNS 管理页面
- [ ] 添加 A 记录：@ → 216.198.79.1
- [ ] 添加 CNAME 记录：www → cname.vercel-dns.com
- [ ] 等待 5-10 分钟
- [ ] 使用 DNS 检查工具验证
- [ ] 返回 Vercel Dashboard 确认状态为 "Valid Configuration"
- [ ] 访问 https://lowatopump.com 测试

---

## ⚠️ 常见问题

### Q1：DNS 记录配置后多久生效？
**A：** 通常 5-10 分钟，最多 24 小时。建议 10 分钟后检查。

### Q2：Vercel 显示 "Invalid Configuration"？
**A：**
- 检查记录值是否正确
- 确认记录类型和主机记录匹配
- 等待 DNS 生效后刷新 Vercel Dashboard

### Q3：可以只配置根域名或只配置 www 吗？
**A：** 建议同时配置两者，确保用户可以通过两种方式访问。

### Q4：旧记录（76.76.21.21）还能用吗？
**A：** 可以使用，但建议更新为新的 216.198.79.1 以获得更好的性能。

---

## 🎯 配置完成后的效果

| 域名 | 访问地址 | 状态 |
|------|----------|------|
| 根域名 | https://lowatopump.com | ✅ 可用 |
| www 子域名 | https://www.lowatopump.com | ✅ 可用 |
| Vercel 域名 | https://luowato-pump-selection-system.vercel.app | ✅ 可用 |

---

**配置完成后，返回 Vercel Dashboard 验证域名状态！** 🚀
