# 部署检查清单

本清单支持多种云服务提供商部署，请根据你的选择使用对应的检查清单。

- [火山云部署](#火山云部署检查清单)
- [腾讯云部署](#腾讯云部署检查清单)

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
- [x] 产品库页面正常
- [x] 产品库密码保护（admin123）

### 智能选型功能
- [x] 流量输入
- [x] 扬程输入
- [x] 应用类型选择
- [x] 流体类型选择
- [x] 泵类型选择
- [x] 产品匹配算法
- [x] 性能曲线显示
- [x] 推荐列表显示

### 产品库功能
- [x] 产品列表展示
- [x] 产品搜索功能
- [x] 产品编辑功能
- [x] 产品删除功能（单个）
- [x] 产品删除功能（批量）
- [x] 批量导入功能
- [x] PDF 导出功能
- [x] 性能曲线预览

## ✅ 性能优化

- [x] 图片优化配置
- [x] 静态资源缓存
- [x] 代码分割
- [x] 懒加载
- [x] Gzip 压缩（Nginx配置）

## ✅ 安全配置

- [x] HTTPS 配置（SSL证书）
- [x] 安全头配置
- [x] CSP 策略
- [x] XSS 防护
- [x] CSRF 防护
- [x] 密码保护

## ✅ 部署配置

- [x] PM2 配置文件
- [x] Nginx 配置文件
- [x] 环境变量模板
- [x] 日志轮转配置
- [x] 自动部署脚本

## 部署前检查

### 服务器准备
- [ ] 火山云服务器已购买
- [ ] 服务器已配置 SSH 访问
- [ ] 域名已解析到服务器 IP
- [ ] 数据库已安装（PostgreSQL）

### 环境配置
- [ ] Node.js 24 已安装
- [ ] pnpm 已安装
- [ ] Git 已安装
- [ ] PM2 已安装
- [ ] Nginx 已安装

### 配置文件
- [ ] 修改 `.env.production` 中的数据库连接
- [ ] 修改 `.env.production` 中的微信 AppID
- [ ] 修改 `deploy-volcano.sh` 中的域名和邮箱
- [ ] 配置微信小程序业务域名

### SSL 证书
- [ ] 域名 DNS 已生效
- [ ] SSL 证书已获取
- [ ] HTTPS 已正常工作

## 部署步骤

### 方式一：自动部署（推荐）

1. 上传项目到服务器
   ```bash
   scp -r /path/to/project root@your-server-ip:/var/www/luowato-selection
   ```

2. 运行自动部署脚本
   ```bash
   ssh root@your-server-ip
   cd /var/www/luowato-selection
   bash deploy-volcano.sh
   ```

3. 修改环境变量
   ```bash
   nano /var/www/luowato-selection/.env.production
   ```

4. 重启应用
   ```bash
   pm2 restart luowato-selection
   ```

### 方式二：手动部署

1. 安装依赖
   ```bash
   cd /var/www/luowato-selection
   pnpm install
   ```

2. 构建项目
   ```bash
   pnpm run build
   ```

3. 配置 PM2
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```

4. 配置 Nginx
   ```bash
   cp nginx-config /etc/nginx/sites-available/luowato-selection
   ln -s /etc/nginx/sites-available/luowato-selection /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

5. 获取 SSL 证书
   ```bash
   certbot --nginx -d your-domain.com
   ```

## 部署后验证

### 基础访问
- [ ] HTTP 访问正常（http://your-domain.com）
- [ ] HTTPS 访问正常（https://your-domain.com）
- [ ] 自动跳转到 HTTPS

### 页面测试
- [ ] 首页正常跳转到智能选型
- [ ] 智能选型页面正常
- [ ] 产品库页面需要密码才能访问
- [ ] 所有页面在手机上正常显示

### 功能测试
- [ ] 智能选型功能正常
- [ ] 产品管理功能正常
- [ ] 图片上传功能正常
- [ ] PDF 导出功能正常
- [ ] 性能曲线显示正常

### 微信测试
- [ ] 在微信中访问正常
- [ ] 添加到主屏幕功能正常
- [ ] 所有功能在微信中可用

## 腾讯云部署检查清单

### 服务器准备
- [ ] 腾讯云 CVM 服务器已购买（2核4GB）
- [ ] 服务器已配置 SSH 密钥访问
- [ ] 域名已解析到服务器公网 IP
- [ ] 安全组已配置（22, 80, 443, 5000）

### 数据库准备
- [ ] 腾讯云 PostgreSQL 已创建
- [ ] 数据库连接信息已获取
  - [ ] 内网地址
  - [ ] 端口
  - [ ] 用户名
  - [ ] 密码
  - [ ] 数据库名

### SSL 证书
- [ ] 腾讯云 SSL 证书已申请（免费 TrustAsia 证书）
- [ ] 证书已下载（Nginx 格式）
- [ ] 证书已上传到服务器 /etc/nginx/ssl/your-domain.com/
  - [ ] fullchain.pem
  - [ ] privkey.pem

### 环境配置
- [ ] Node.js 24 已安装
- [ ] pnpm 已安装
- [ ] PM2 已安装
- [ ] Nginx 已安装
- [ ] Git 已安装

### 配置文件
- [ ] 修改 `.env.production` 中的腾讯云 PostgreSQL 连接字符串
- [ ] 修改 `.env.production` 中的微信 AppID
- [ ] 修改 `deploy-tencent.sh` 中的域名和邮箱
- [ ] 配置腾讯云 COS（如果使用对象存储）

### 腾讯云配置
- [ ] 域名解析已配置
  - [ ] A 记录：@ → 服务器公网 IP
  - [ ] A 记录：www → 服务器公网 IP（可选）
- [ ] 微信小程序业务域名已配置
  - [ ] 域名已添加到微信业务域名
  - [ ] 校验文件已上传并验证

## 腾讯云部署步骤

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
   nano deploy-tencent.sh
   # 修改 DOMAIN 和 EMAIL 变量
   ```

4. 运行部署脚本
   ```bash
   bash deploy-tencent.sh
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
   curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
   apt install -y nodejs
   npm install -g pnpm pm2
   ```

2. 安装依赖并构建
   ```bash
   cd /var/www/luowato-selection
   pnpm install
   pnpm run build
   ```

3. 配置环境变量
   ```bash
   nano .env.production
   ```

4. 启动应用
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```

5. 配置 Nginx
   ```bash
   nano /etc/nginx/sites-available/luowato-selection
   ```

6. 创建 SSL 证书目录
   ```bash
   mkdir -p /etc/nginx/ssl/your-domain.com
   ```

7. 上传 SSL 证书
   ```bash
   # 上传 fullchain.pem 和 privkey.pem
   ```

8. 启用配置
   ```bash
   ln -s /etc/nginx/sites-available/luowato-selection /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

## 腾讯云部署后验证

### 基础访问
- [ ] HTTP 访问正常（http://your-domain.com）
- [ ] HTTPS 访问正常（https://your-domain.com）
- [ ] 自动跳转到 HTTPS
- [ ] SSL 证书有效

### 应用状态
- [ ] PM2 进程运行正常（pm2 status）
- [ ] 端口 5000 正常监听
- [ ] 应用日志无错误

### 页面测试
- [ ] 首页正常跳转到智能选型
- [ ] 智能选型页面正常
- [ ] 产品库页面需要密码才能访问
- [ ] 所有页面在手机上正常显示

### 功能测试
- [ ] 智能选型功能正常
- [ ] 产品管理功能正常
- [ ] 图片上传功能正常
- [ ] PDF 导出功能正常
- [ ] 性能曲线显示正常
- [ ] 恒压参考线显示正常

### 微信测试
- [ ] 在微信中访问正常
- [ ] 添加到主屏幕功能正常
- [ ] 所有功能在微信中可用

### 数据库连接
- [ ] PostgreSQL 连接正常
- [ ] 数据读写正常

## 腾讯云成本估算

### 月度成本
- [x] 云服务器 CVM（2核4GB）：约 200 元/月
- [x] PostgreSQL（4GB）：约 150 元/月
- [x] 带宽（5Mbps）：约 150 元/月
- [x] SSL 证书（免费）：0 元/月
- [x] 域名：约 5 元/月
- [x] CDN（按流量）：约 0.24 元/GB

**总计**：约 500 元/月

## 腾讯云监控和维护

### 日常检查
- [ ] PM2 进程状态：`pm2 status`
- [ ] 应用日志：`pm2 logs luowato-selection`
- [ ] Nginx 日志：`tail -f /var/log/nginx/luowato-selection-error.log`
- [ ] 磁盘空间：`df -h`
- [ ] 内存使用：`free -h`

### 备份策略
- [ ] 数据库定期备份（每天凌晨2点）
- [ ] 应用代码备份（每天）
- [ ] 配置文件备份
- [ ] 日志归档

### 监控告警
- [ ] 腾讯云云监控已配置
  - [ ] CPU 使用率告警（>80%）
  - [ ] 内存使用率告警（>80%）
  - [ ] 磁盘使用率告警（>80%）
  - [ ] 应用进程告警

## 监控和维护

### 日常检查
- [ ] PM2 进程状态：`pm2 status`
- [ ] 应用日志：`pm2 logs luowato-selection`
- [ ] Nginx 日志：`tail -f /var/log/nginx/luowato-selection-access.log`
- [ ] 磁盘空间：`df -h`
- [ ] 内存使用：`free -h`

### 备份策略
- [ ] 数据库定期备份
- [ ] 代码仓库备份
- [ ] 配置文件备份
- [ ] 日志归档

### 更新策略
- [ ] 定期更新系统依赖
- [ ] 定期更新 Node.js
- [ ] 定期更新应用依赖
- [ ] 定期更新 SSL 证书

## 常见问题排查

### 问题：服务无法启动
```bash
# 检查端口占用
lsof -i :5000

# 查看 PM2 日志
pm2 logs luowato-selection

# 重启服务
pm2 restart luowato-selection
```

### 问题：页面无法访问
```bash
# 检查 Nginx 状态
systemctl status nginx

# 检查 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

### 问题：数据库连接失败
```bash
# 检查数据库服务
systemctl status postgresql

# 测试数据库连接
psql -h localhost -U postgres -d luowato_selection

# 检查环境变量
cat /var/www/luowato-selection/.env.production
```

### 问题：SSL 证书错误
```bash
# 检查证书状态
certbot certificates

# 续期证书
certbot renew

# 强制更新
certbot --force-renewal
```

## 联系支持

如遇问题，请提供以下信息：
1. 服务器 IP 和域名
2. PM2 日志：`pm2 logs luowato-selection --lines 100`
3. Nginx 日志：`tail -100 /var/log/nginx/luowato-selection-error.log`
4. 系统版本：`cat /etc/os-release`
5. Node.js 版本：`node -v`
