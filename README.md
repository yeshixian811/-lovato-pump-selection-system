# 洛瓦托水泵选型系统

这是一个基于 [Next.js 16](https://nextjs.org) + [shadcn/ui](https://ui.shadcn.com) 的全栈应用项目，由扣子编程 CLI 创建。

**主要功能：**
- 水泵选型工具（基于性能曲线匹配）
- 版本管理系统
- 进销存管理
- 用户认证与授权
- 微信小程序支持

## 快速开始

### 前置要求

- Node.js 24+
- PostgreSQL 14+
- pnpm（推荐）或 npm
- Windows 操作系统（本地部署）

### 1. 环境变量配置

在启动应用之前，必须先配置环境变量：

```bash
# 1. 复制环境变量模板
cp .env.example .env

# 2. 编辑 .env 文件，填写实际配置
# Windows: notepad .env
# Linux/Mac: nano .env

# 3. 必须配置的变量：
#    - JWT_SECRET（强随机密钥，至少 32 字符）
#    - ENCRYPTION_KEY（强随机密钥，至少 32 字符）
#    - DATABASE_URL（PostgreSQL 连接字符串）
```

**生成密钥（推荐使用 OpenSSL）：**

```bash
# 生成 JWT_SECRET
openssl rand -base64 32

# 生成 ENCRYPTION_KEY
openssl rand -base64 32
```

**验证环境变量配置：**

```bash
# Windows
node scripts/validate-env.js

# Linux/Mac
node scripts/validate-env.js
```

### 2. 数据库初始化

确保 PostgreSQL 服务已启动，然后创建数据库：

```bash
# 使用 psql 连接数据库
psql -U postgres

# 创建数据库
CREATE DATABASE lovato_pump;

# 退出 psql
\q
```

**迁移数据库数据到 J 盘（可选）：**

```bash
# Windows
migrate-to-j-drive.bat
```

### 3. 安装依赖

```bash
pnpm install
```

### 4. 启动开发服务器

```bash
# 使用 Coze CLI 启动
coze dev

# 或使用 pnpm
pnpm run dev
```

启动后，在浏览器中打开 [http://localhost:5000](http://localhost:5000) 查看应用。

开发服务器支持热更新，修改代码后页面会自动刷新。

### 5. 测试安全功能

```bash
# Windows
run-security-tests.bat

# Linux/Mac
node scripts/test-encryption.js
node scripts/test-security.js
```

### 6. 构建和部署

```bash
# 构建生产版本
coze build

# 启动生产服务器
coze start
```

### 7. 配置 Cloudflare Tunnel（外网访问）

```bash
# Windows
setup-cloudflare-tunnel.bat

# 详细配置指南
# 参阅 CLOUDFLARE-TUNNEL-GUIDE.md
```

## 项目结构

```
src/
├── app/                      # Next.js App Router 目录
│   ├── layout.tsx           # 根布局组件
│   ├── page.tsx             # 首页
│   ├── globals.css          # 全局样式（包含 shadcn 主题变量）
│   └── [route]/             # 其他路由页面
├── components/              # React 组件目录
│   └── ui/                  # shadcn/ui 基础组件（优先使用）
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/                     # 工具函数库
│   └── utils.ts            # cn() 等工具函数
└── hooks/                   # 自定义 React Hooks（可选）
```

## 核心开发规范

### 1. 组件开发

**优先使用 shadcn/ui 基础组件**

本项目已预装完整的 shadcn/ui 组件库，位于 `src/components/ui/` 目录。开发时应优先使用这些组件作为基础：

```tsx
// ✅ 推荐：使用 shadcn 基础组件
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>标题</CardHeader>
      <CardContent>
        <Input placeholder="输入内容" />
        <Button>提交</Button>
      </CardContent>
    </Card>
  );
}
```

**可用的 shadcn 组件清单**

- 表单：`button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider`
- 布局：`card`, `separator`, `tabs`, `accordion`, `collapsible`, `scroll-area`
- 反馈：`alert`, `alert-dialog`, `dialog`, `toast`, `sonner`, `progress`
- 导航：`dropdown-menu`, `menubar`, `navigation-menu`, `context-menu`
- 数据展示：`table`, `avatar`, `badge`, `hover-card`, `tooltip`, `popover`
- 其他：`calendar`, `command`, `carousel`, `resizable`, `sidebar`

详见 `src/components/ui/` 目录下的具体组件实现。

### 2. 路由开发

Next.js 使用文件系统路由，在 `src/app/` 目录下创建文件夹即可添加路由：

```bash
# 创建新路由 /about
src/app/about/page.tsx

# 创建动态路由 /posts/[id]
src/app/posts/[id]/page.tsx

# 创建路由组（不影响 URL）
src/app/(marketing)/about/page.tsx

# 创建 API 路由
src/app/api/users/route.ts
```

**页面组件示例**

```tsx
// src/app/about/page.tsx
import { Button } from '@/components/ui/button';

export const metadata = {
  title: '关于我们',
  description: '关于页面描述',
};

export default function AboutPage() {
  return (
    <div>
      <h1>关于我们</h1>
      <Button>了解更多</Button>
    </div>
  );
}
```

**动态路由示例**

```tsx
// src/app/posts/[id]/page.tsx
export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>文章 ID: {id}</div>;
}
```

**API 路由示例**

```tsx
// src/app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ users: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true });
}
```

### 3. 依赖管理

**必须使用 pnpm 管理依赖**

```bash
# ✅ 安装依赖
pnpm install

# ✅ 添加新依赖
pnpm add package-name

# ✅ 添加开发依赖
pnpm add -D package-name

# ❌ 禁止使用 npm 或 yarn
# npm install  # 错误！
# yarn add     # 错误！
```

项目已配置 `preinstall` 脚本，使用其他包管理器会报错。

### 4. 样式开发

**使用 Tailwind CSS v4**

本项目使用 Tailwind CSS v4 进行样式开发，并已配置 shadcn 主题变量。

```tsx
// 使用 Tailwind 类名
<div className="flex items-center gap-4 p-4 rounded-lg bg-background">
  <Button className="bg-primary text-primary-foreground">
    主要按钮
  </Button>
</div>

// 使用 cn() 工具函数合并类名
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  condition && "conditional-class",
  className
)}>
  内容
</div>
```

**主题变量**

主题变量定义在 `src/app/globals.css` 中，支持亮色/暗色模式：

- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`

### 5. 表单开发

推荐使用 `react-hook-form` + `zod` 进行表单开发：

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  username: z.string().min(2, '用户名至少 2 个字符'),
  email: z.string().email('请输入有效的邮箱'),
});

export default function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', email: '' },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('username')} />
      <Input {...form.register('email')} />
      <Button type="submit">提交</Button>
    </form>
  );
}
```

### 6. 数据获取

**服务端组件（推荐）**

```tsx
// src/app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'no-store', // 或 'force-cache'
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

**客户端组件**

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function ClientComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}
```

## 安全措施

本项目实施了以下安全措施，确保应用的安全性：

### 认证与授权

- ✅ **JWT 认证系统**
  - HMAC SHA256 签名算法
  - 访问令牌（1 小时有效期）和刷新令牌（7 天有效期）
  - 支持从 Authorization header 和 Cookie 获取令牌
  - 密码使用 bcrypt 哈希（12 轮加盐）

- ✅ **三级权限系统**
  - `admin`：管理员，完全访问权限
  - `manager`：经理，管理功能和部分权限
  - `user`：普通用户，基本访问权限

- ✅ **认证中间件**
  - 自动验证 JWT 令牌
  - 支持权限检查
  - 统一错误处理

### 数据保护

- ✅ **敏感数据加密**
  - AES-256-GCM 加密算法
  - PBKDF2 密钥派生（100,000 次迭代）
  - 支持文本和对象加密/解密
  - 数据库字段加密助手

- ✅ **SQL 注入防护**
  - 使用 Drizzle ORM 参数化查询
  - 移除所有字符串拼接 SQL
  - 自动转义用户输入

### 网络安全

- ✅ **CORS 配置**
  - 白名单机制
  - 预检请求（OPTIONS）处理
  - 支持凭证（cookies, authorization headers）
  - 微信小程序专用配置

- ✅ **HTTPS 强制**
  - HSTS（有效期 2 年）
  - 内容安全策略 (CSP)
  - 安全 HTTP 头（X-Content-Type-Options, X-Frame-Options, X-XSS-Protection）
  - Referrer-Policy 和 Permissions-Policy

- ✅ **API 速率限制**
  - 滑动窗口算法
  - 多种预设配置（strict, standard, loose, login, upload）
  - IP 白名单支持
  - 速率限制响应头

### 代码质量

- ✅ **单元测试和集成测试**
  - Jest 测试框架
  - 认证工具测试（56 个测试用例）
  - 加密工具测试（45 个测试用例）
  - 认证 API 集成测试框架

### 安全文档

详细的安全文档请参阅：

- [SECURITY-CHECKLIST.md](SECURITY-CHECKLIST.md) - 安全检查清单
- [SECURITY-IMPLEMENTATION-REPORT.md](SECURITY-IMPLEMENTATION-REPORT.md) - 安全措施实施报告
- [COMPLETE-SECURITY-IMPLEMENTATION-REPORT.md](COMPLETE-SECURITY-IMPLEMENTATION-REPORT.md) - 完整的安全措施报告
- [SECURITY-AUDIT-CHECKLIST.md](SECURITY-AUDIT-CHECKLIST.md) - 安全审计检查清单

## 部署指南

### 本地部署

详细的本地部署指南请参阅 [DEPLOYMENT.md](DEPLOYMENT.md)。

**快速部署脚本（Windows）：**

```bash
# 完整部署向导
deploy-local.bat

# 系统健康检查
health-check.bat

# 快速启动
quick-start.bat
```

### 外网访问（Cloudflare Tunnel）

使用 Cloudflare Tunnel 实现内网穿透，提供稳定的外网访问：

```bash
# 快速配置向导
setup-cloudflare-tunnel.bat

# 详细指南
# 参阅 CLOUDFLARE-TUNNEL-GUIDE.md
```

### 部署脚本说明

所有部署脚本的说明请参阅 [DEPLOYMENT-SCRIPTS-README.md](DEPLOYMENT-SCRIPTS-README.md)。

## 文档索引

- [README.md](README.md) - 项目说明和快速开始
- [DEPLOYMENT.md](DEPLOYMENT.md) - 本地部署指南
- [CLOUDFLARE-TUNNEL-GUIDE.md](CLOUDFLARE-TUNNEL-GUIDE.md) - Cloudflare Tunnel 配置指南
- [DEPLOYMENT-SCRIPTS-README.md](DEPLOYMENT-SCRIPTS-README.md) - 部署脚本说明
- [SECURITY-CHECKLIST.md](SECURITY-CHECKLIST.md) - 安全检查清单
- [SECURITY-IMPLEMENTATION-REPORT.md](SECURITY-IMPLEMENTATION-REPORT.md) - 安全措施实施报告
- [COMPLETE-SECURITY-IMPLEMENTATION-REPORT.md](COMPLETE-SECURITY-IMPLEMENTATION-REPORT.md) - 完整的安全措施报告
- [SECURITY-AUDIT-CHECKLIST.md](SECURITY-AUDIT-CHECKLIST.md) - 安全审计检查清单

## 故障排查

### 开发服务器无法启动

1. 检查 Node.js 版本（需要 24+）
2. 检查端口 5000 是否被占用
3. 确保已安装依赖：`pnpm install`
4. 检查 .env 文件是否正确配置

### 数据库连接失败

1. 确保 PostgreSQL 服务已启动
2. 检查 DATABASE_URL 配置是否正确
3. 确保数据库已创建
4. 检查防火墙设置

### 安全测试失败

1. 确保环境变量已正确配置
2. 运行 `node scripts/validate-env.js` 检查配置
3. 确保开发服务器正在运行
4. 检查密钥长度和格式

### Cloudflare Tunnel 无法连接

1. 确保已登录 Cloudflare 账户：`cloudflared tunnel login`
2. 检查隧道配置文件
3. 确保域名已正确配置
4. 检查防火墙设置

## 技术栈

- **框架**: Next.js 16 (App Router)
- **React 版本**: React 19
- **TypeScript**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS 4
- **数据库**: PostgreSQL 14
- **ORM**: Drizzle ORM
- **认证**: JWT + bcrypt
- **加密**: AES-256-GCM + PBKDF2
- **测试**: Jest
- **包管理器**: pnpm
- **内网穿透**: Cloudflare Tunnel

## 许可证

本项目为洛瓦托水泵选型系统内部使用。

## 联系方式

如有问题，请联系开发团队。

## 常见开发场景

### 添加新页面

1. 在 `src/app/` 下创建文件夹和 `page.tsx`
2. 使用 shadcn 组件构建 UI
3. 根据需要添加 `layout.tsx` 和 `loading.tsx`

### 创建业务组件

1. 在 `src/components/` 下创建组件文件（非 UI 组件）
2. 优先组合使用 `src/components/ui/` 中的基础组件
3. 使用 TypeScript 定义 Props 类型

### 添加全局状态

推荐使用 React Context 或 Zustand：

```tsx
// src/lib/store.ts
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 集成数据库

推荐使用 Prisma 或 Drizzle ORM，在 `src/lib/db.ts` 中配置。

## 技术栈

- **框架**: Next.js 16.1.1 (App Router)
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS v4
- **表单**: React Hook Form + Zod
- **图标**: Lucide React
- **字体**: Geist Sans & Geist Mono
- **包管理器**: pnpm 9+
- **TypeScript**: 5.x

## 参考文档

- [Next.js 官方文档](https://nextjs.org/docs)
- [shadcn/ui 组件文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com)

## 重要提示

1. **必须使用 pnpm** 作为包管理器
2. **优先使用 shadcn/ui 组件** 而不是从零开发基础组件
3. **遵循 Next.js App Router 规范**，正确区分服务端/客户端组件
4. **使用 TypeScript** 进行类型安全开发
5. **使用 `@/` 路径别名** 导入模块（已配置）

## 本地部署指南

### Windows 快速部署

本项目提供了 Windows 部署脚本，可以快速完成本地部署：

#### 1. 首次部署
```batch
# 运行部署向导（自动检查环境、安装依赖、配置数据库）
deploy-local.bat
```

#### 2. 快速启动
```batch
# 一键启动开发服务器
quick-start.bat
```

#### 3. 系统检查
```batch
# 检查系统环境和配置状态
health-check.bat
```

#### 4. 数据库迁移
```batch
# 将数据库迁移到 J 盘（需管理员权限）
migrate-to-j-drive.bat
```

### 详细部署文档

完整的部署指南、常见问题解决方案和安全建议，请参考：
- **部署文档**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **脚本说明**: [DEPLOYMENT-SCRIPTS-README.md](./DEPLOYMENT-SCRIPTS-README.md)

### 环境要求

- **操作系统**: Windows 10/11
- **Node.js**: 24.x
- **PostgreSQL**: 14+
- **磁盘空间**: 至少 10GB
- **内存**: 建议 8GB+

### 安全检查

系统已完成全面安全审计，已修复以下问题：

#### 已修复的安全漏洞
- ✅ **SQL 注入漏洞**: 使用 Drizzle ORM 参数化查询替代字符串拼接
- ✅ **文件上传配置**: 添加环境变量读取和安全警告
- ✅ **输入验证**: 所有 API 端点添加了严格的输入验证
- ✅ **XSS 防护**: React 自动转义 + 内容安全策略 (CSP)

#### 建议的安全措施（在 DEPLOYMENT.md 中详细说明）
- 📋 实现 JWT 认证机制
- 📋 添加 API 速率限制
- 📋 配置 CORS 白名单
- 📋 定期安全审计

### 系统功能

#### 核心功能
- **水泵选型系统**: 基于性能曲线（H-Q曲线）的智能选型
- **产品库管理**: 完整的产品 CRUD 操作
- **性能曲线可视化**: 交互式图表展示
- **版本管理系统**: 代码备份、回滚、在线编辑
- **进销存管理**: 库存、采购、销售、供应商/客户管理

#### 技术特点
- **响应式设计**: 完美支持 H5 移动端和微信小程序 WebView
- **高性能**: 使用 Next.js 16 和 React 19 优化渲染性能
- **安全性**: 参数化查询、输入验证、XSS 防护
- **可扩展**: 模块化架构，易于扩展新功能

### 支持与维护

如遇到部署或使用问题：
1. 运行 `health-check.bat` 进行系统诊断
2. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 常见问题章节
3. 检查应用日志文件

### 贡献指南

本项目遵循严格的开发规范，贡献代码前请阅读：
- Next.js 官方文档
- 项目核心开发规范（见上方）
- 安全编码最佳实践
