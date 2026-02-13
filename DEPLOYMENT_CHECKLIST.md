# 部署检查清单

本清单支持火山云部署，请使用对应的检查清单。

- [火山云部署](#火山云部署检查清单)

## ✅ 语法检查

- [x] TypeScript 编译检查通过
- [x] 无类型错误
- [x] 无语法错误

## ✅ 构建检查

- [x] 项目可正常构建
- [x] 构建产物正常生成
- [x] 无构建错误

## ✅ 微信小程序网站格式

### PWA 配置
- [x] `manifest.json` 已配置
- [x] 应用图标已配置（192x192, 512x512）
- [x] 应用快捷方式已配置
- [x] 支持离线使用

### 微信兼容配置
- [x] `wechat-enable-compatible` meta 标签
- [x] 移动端响应式设计
- [x] 触摸优化
- [x] 视口配置正确

### 小程序配置文件
- [x] `app.json` 已创建
- [x] `sitemap.json` 已创建
- [x] 页面路由已配置
- [x] TabBar 已配置

### 图标文件
- [x] favicon.ico
- [x] icon-192x192.png
- [x] icon-512x512.png
- [x] apple-touch-icon.png

## ✅ 功能检查

### 页面功能
- [x] 首页自动跳转到智能选型
- [x] 智能选型页面正常
- [ ] 流量输入框
- [ ] 扬程输入框
- [ ] 应用场景选择
- [ ] 选型按钮
- [ ] 结果展示

### API 接口
- [ ] `/api/health` - 健康检查
- [ ] `/api/pumps` - 获取水泵列表
- [ ] `/api/pumps/:id` - 获取水泵详情
- [ ] `/api/selection` - 智能选型
- [ ] `/api/products` - 获取产品列表
- [ ] `/api/selection/select` - 选型接口

### 数据库
- [ ] 数据库连接正常
- [ ] 产品数据已导入
- [ ] 选型算法正常工作

### 其他功能
- [ ] PDF 导出功能正常
- [ ] 性能曲线显示正常

### 微信测试
- [ ] 在微信中访问正常
- [ ] 添加到主屏幕功能正常
- [ ] 所有功能在微信中可用

## 火山云部署检查清单

### 服务器准备
- [ ] 火山云 ECS 服务器已购买（2核4GB）
- [ ] 服务器已配置 SSH 密钥访问
- [ ] 域名已解析到服务器公网 IP
- [ ] 安全组已配置（22, 80, 443, 5000）

### 数据库准备
- [ ] 火山云 PostgreSQL 已创建
- [ ] 数据库连接信息已获取
  - [ ] 内网地址
  - [ ] 端口
  - [ ] 用户名
  - [ ] 密码
  - [ ] 数据库名

### SSL 证书
- [ ] SSL 证书已申请
- [ ] 证书已下载（Nginx 格式）
- [ ] 证书已上传到服务器 /etc/nginx/ssl/your-domain.com/
  - [ ] fullchain.pem
  - [ ] privkey.pem

### 环境配置
- [ ] Node.js 20+ 已安装
- [ ] pnpm 已安装
- [ ] PM2 已安装
- [ ] Nginx 已安装
- [ ] Git 已安装

### 配置文件
- [ ] 修改 `.env.production` 中的火山云 PostgreSQL 连接字符串
- [ ] 修改 `.env.production` 中的微信 AppID
- [ ] 配置火山云对象存储 TOS（如果使用对象存储）

### 火山云配置
- [ ] 域名解析已配置
  - [ ] A 记录：@ → 服务器公网 IP
  - [ ] A 记录：www → 服务器公网 IP（可选）
- [ ] 微信小程序业务域名已配置
  - [ ] 域名已添加到微信业务域名
  - [ ] 校验文件已上传并验证

## 火山云部署步骤

### 方式一：自动部署脚本（推荐）

1. 上传项目到服务器
   ```bash
   scp -r /path/to/project root@your-server-ip:/var/www/luowato-selection
   ```

2. 登录服务器
   ```bash
   ssh root@your-server-ip
   cd /var/www/luowato-selection
   ```

3. 修改部署脚本
   ```bash
   nano deploy-volcano.sh
   # 修改 DOMAIN 和 EMAIL 变量
   ```

4. 运行部署脚本
   ```bash
   bash deploy-volcano.sh
   ```

5. 修改环境变量
   ```bash
   nano /var/www/luowato-selection/.env.production
   # 更新 DATABASE_URL 等配置
   ```

6. 上传 SSL 证书
   ```bash
   mkdir -p /etc/nginx/ssl/your-domain.com
   # 上传 fullchain.pem 和 privkey.pem
   ```

7. 重启服务
   ```bash
   systemctl restart nginx
   pm2 restart luowato-selection
   ```

### 方式二：手动部署

1. 安装依赖
   ```bash
   pnpm install
   pnpm build
   ```

2. 启动应用
   ```bash
   pm2 start .next/standalone/server.js --name luowato-selection
   ```

3. 配置 Nginx
   ```bash
   nano /etc/nginx/sites-available/luowato-selection
   ```

4. 重启 Nginx
   ```bash
   nginx -t
   systemctl restart nginx
   ```

## 部署后验证

### 功能验证
- [ ] 访问 http://your-domain.com 正常
- [ ] 访问 https://your-domain.com 正常
- [ ] 首页可以正常显示
- [ ] 智能选型功能正常
- [ ] API 接口正常响应

### 性能验证
- [ ] 页面加载时间 < 2秒
- [ ] API 响应时间 < 500ms
- [ ] 数据库查询正常

### 安全验证
- [ ] HTTPS 证书有效
- [ ] HTTP 自动跳转 HTTPS
- [ ] 防火墙配置正确

## 成本估算

### 火山云成本

- 服务器 ECS（2核4GB）：200元/月
- PostgreSQL（4GB）：150元/月
- 带宽（5Mbps）：150元/月
- **总计：约500元/月**

## 监控和维护

- [ ] 应用自动重启已配置（PM2）
- [ ] 日志轮转已配置
- [ ] 火山云云监控已配置
- [ ] 定期备份已配置

---

**部署完成后，请访问 https://lowato-hvac.com 验证所有功能！**
