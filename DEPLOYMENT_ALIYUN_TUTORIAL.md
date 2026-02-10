# 🚀 阿里云部署 - 超详细一步一步教程

**⏱️ 预计时间：40 分钟**
**难度：⭐⭐ 中等**

---

## 📋 第 0 步：准备必要信息（5 分钟）

在你开始之前，请准备好以下信息：

### 你需要准备的东西：
- [ ] **阿里云服务器公网 IP**（如：47.96.123.45）
- [ ] **SSH 密钥文件**（.pem 格式，如：aliyun-key.pem）
- [ ] **域名**（如：lowato-hvac.com，已解析到服务器 IP）
- [ ] **阿里云 RDS PostgreSQL 连接信息**：
  - 内网地址（如：rm-xxxxxx.pg.rds.aliyuncs.com）
  - 端口（通常是 1921）
  - 数据库名（如：postgres）
  - 用户名（如：aliyun_user）
  - 密码
- [ ] **微信小程序 AppID**（如：wx1234567890abcdef）

### ⚠️ 重要提示
- 我无法直接访问你的服务器，你需要在本地的电脑上执行命令
- 确保你的电脑已安装 SSH 客户端（Mac/Linux 自带，Windows 10+ 自带）
- 确保你有服务器的 root 权限

---

## 📋 第 1 步：连接到阿里云服务器（5 分钟）

### 在你的本地电脑上执行：

#### 1.1 打开终端（命令行）

**Mac 用户：**
- 打开"终端"应用（在"应用程序"→"实用工具"→"终端"）

**Windows 用户：**
- 按 `Win + R`，输入 `cmd` 或 `powershell`，回车
- 或者使用"Windows 终端"（推荐）

**Linux 用户：**
- 打开终端（Ctrl + Alt + T）

#### 1.2 进入 SSH 密钥文件所在目录

```bash
# 假设你的密钥文件在 Downloads 文件夹
cd ~/Downloads

# 或者如果你知道密钥文件的完整路径，直接使用完整路径即可
```

#### 1.3 设置密钥文件权限（非常重要！）

```bash
# 将密钥文件权限设置为只有所有者可读
chmod 600 aliyun-key.pem

# 如果你的密钥文件名不是 aliyun-key.pem，请替换为你的实际文件名
# 例如：chmod 600 my-key.pem
```

#### 1.4 连接到服务器

```bash
# 使用 SSH 密钥连接
ssh -i aliyun-key.pem root@你的服务器公网IP

# 示例：
# ssh -i aliyun-key.pem root@47.96.123.45
```

#### 1.5 接受服务器指纹

第一次连接时，会看到这样的提示：
```
The authenticity of host '47.96.123.45 (47.96.123.45)' can't be established.
ECDSA key fingerprint is SHA256:...
Are you sure you want to continue connecting (yes/no)?
```

**输入：** `yes` 然后按回车

#### 1.6 连接成功

连接成功后，你应该看到类似这样的提示：
```
Welcome to Ubuntu 20.04 LTS (GNU/Linux 5.4.0-80-generic x86_64)

 * Documentation:  https://help.ubuntu.com/
 * Management:     https://help.ubuntu.com/
 * Support:        https://ubuntu.com/advantage

Last login: Wed Jan 1 00:00:00 2024 from 192.168.1.1
root@aliyun-instance:~#
```

**✅ 恭喜！你已成功连接到服务器！**

---

## 📋 第 2 步：上传项目文件到服务器（10 分钟）

### 在你的本地电脑上执行（新开一个终端窗口）

#### 2.1 打开新的终端窗口

保留刚才连接服务器的终端窗口，打开一个新的终端窗口。

#### 2.2 进入项目目录

```bash
# 进入洛瓦托水泵选型系统项目目录
cd /path/to/luowato-selection

# 示例：
# cd ~/Projects/luowato-selection
# cd /Users/username/Desktop/luowato-selection
```

#### 2.3 确认项目文件

```bash
# 查看项目文件
ls -lh

# 你应该看到这些文件：
# - deploy-aliyun.sh
# - ecosystem.config.js
# - nginx-config
# - package.json
# - src/
# - public/
# - 等等...
```

#### 2.4 上传项目到服务器

```bash
# 使用 SCP 上传整个项目
scp -i aliyun-key.pem -r . root@你的服务器公网IP:/var/www/luowato-selection

# 示例：
# scp -i aliyun-key.pem -r . root@47.96.123.45:/var/www/luowato-selection
```

#### 2.5 等待上传完成

上传时间取决于：
- 项目大小
- 你的网速
- 服务器带宽

通常需要 **3-10 分钟**

上传过程中你会看到类似这样的输出：
```
package.json                                      100%  2KB   2.0KB/s   00:00
src/                                              100%  10KB  10.0KB/s   00:00
...
```

#### 2.6 验证上传成功

上传完成后，在**服务器的终端窗口**（不是本地）执行：

```bash
# 检查项目文件
ls -lh /var/www/luowato-selection

# 你应该看到项目文件已上传
```

**✅ 恭喜！项目文件上传成功！**

---

## 📋 第 3 步：在服务器上运行自动部署脚本（5 分钟）

### 在服务器终端窗口执行：

#### 3.1 进入项目目录

```bash
# 进入项目目录
cd /var/www/luowato-selection

# 确认当前目录
pwd

# 应该显示：/var/www/luowato-selection
```

#### 3.2 查看部署脚本

```bash
# 查看部署脚本是否存在
ls -lh deploy-aliyun.sh

# 应该显示：
# -rwxr-xr-x 1 root root 5.2K Jan 1 00:00 deploy-aliyun.sh
```

#### 3.3 编辑部署脚本（修改域名和邮箱）

```bash
# 使用 nano 编辑器打开部署脚本
nano deploy-aliyun.sh
```

#### 3.4 修改域名和邮箱

在 nano 编辑器中：

1. 使用方向键移动光标
2. 找到 **第 17 行**（或类似）：
   ```bash
   DOMAIN="your-domain.com"
   ```
3. 修改为你的实际域名：
   ```bash
   DOMAIN="lowato-hvac.com"  # 改成你的域名
   ```

4. 找到 **第 18 行**（或类似）：
   ```bash
   EMAIL="your-email@example.com"
   ```
5. 修改为你的实际邮箱：
   ```bash
   EMAIL="your-email@example.com"  # 改成你的邮箱
   ```

#### 3.5 保存并退出 nano

- 按 `Ctrl + O` 保存文件
- 按 `Enter` 确认
- 按 `Ctrl + X` 退出编辑器

#### 3.6 给脚本添加执行权限（如果需要）

```bash
# 添加执行权限
chmod +x deploy-aliyun.sh

# 验证权限
ls -lh deploy-aliyun.sh

# 应该显示 -rwxr-xr-x（有 x 权限）
```

#### 3.7 运行部署脚本

```bash
# 运行部署脚本
bash deploy-aliyun.sh
```

#### 3.8 等待部署完成

部署脚本会自动执行以下操作：
1. ✅ 检查并安装 Node.js 24
2. ✅ 检查并安装 pnpm
3. ✅ 检查并安装 PM2
4. ✅ 检查并安装 Git
5. ✅ 创建项目目录
6. ✅ 安装项目依赖
7. ✅ 构建项目
8. ✅ 配置环境变量
9. ✅ 配置 PM2
10. ✅ 配置 Nginx
11. ✅ 获取 SSL 证书

预计时间：**5-10 分钟**

你会看到类似这样的输出：
```
==========================================
洛瓦托水泵选型系统 - 阿里云部署脚本
==========================================
[1/8] 检查并安装依赖...
安装 Node.js 24...
✓ 依赖安装完成
[2/8] 创建项目目录...
✓ 项目目录创建完成
[3/8] 安装项目依赖...
✓ 依赖安装完成
[4/8] 构建项目...
✓ 项目构建完成
[5/8] 配置环境变量...
⚠ 已创建 .env.production 文件，请修改其中的配置项
[6/8] 配置 PM2...
✓ PM2 配置完成
[7/8] 配置 Nginx...
✓ Nginx 配置完成
[8/8] 配置 SSL 证书...
获取 SSL 证书...
✓ SSL 证书配置完成

==========================================
部署完成！
==========================================

访问地址:
  HTTP:  http://lowato-hvac.com
  HTTPS: https://lowato-hvac.com

管理命令:
  查看状态: pm2 status
  查看日志: pm2 logs luowato-selection
  重启应用: pm2 restart luowato-selection
  重启 Nginx: systemctl restart nginx

重要提醒:
  1. 请修改 /var/www/luowato-selection/.env.production 中的配置
  2. 请配置微信小程序业务域名
  3. 请配置阿里云 RDS 白名单
  4. 默认产品库密码: admin123
```

**✅ 恭喜！自动部署完成！**

---

## 📋 第 4 步：配置阿里云 RDS 白名单（重要！）

### 在阿里云控制台执行：

#### 4.1 登录阿里云控制台
1. 访问：https://rdsnext.console.aliyun.com/
2. 登录你的阿里云账号

#### 4.2 进入 RDS PostgreSQL 实例
1. 点击"RDS 管理控制台"
2. 选择你的 PostgreSQL 实例

#### 4.3 配置白名单
1. 在左侧菜单点击"数据安全性"
2. 点击"白名单设置"
3. 点击"修改"
4. 添加服务器内网 IP：
   - 如果 ECS 和 RDS 在同一地域：添加 ECS 内网 IP
   - 或者添加 `0.0.0.0/0`（允许所有 IP 访问，不推荐生产环境）
5. 点击"确定"

#### 4.4 查看内网连接地址
1. 在实例详情页查看"连接信息"
2. 复制内网地址（如：`rm-xxxxxx.pg.rds.aliyuncs.com`）
3. 记住端口（通常是 `1921`）

**✅ 恭喜！RDS 白名单配置完成！**

---

## 📋 第 5 步：配置环境变量（3 分钟）

### 在服务器终端窗口执行：

#### 5.1 编辑环境变量文件

```bash
# 编辑环境变量文件
nano /var/www/luowato-selection/.env.production
```

#### 5.2 修改数据库连接字符串

找到这一行：
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/luowato_selection
```

修改为你的阿里云 RDS PostgreSQL 连接信息：
```bash
# 格式：postgresql://用户名:密码@内网地址:端口/数据库名
DATABASE_URL=postgresql://aliyun_user:your-password@rm-xxxxxx.pg.rds.aliyuncs.com:1921/postgres

# 示例：
# DATABASE_URL=postgresql://root:MyPassword123@rm-bp123456.pg.rds.aliyuncs.com:1921/postgres
```

**注意**：
- 阿里云 RDS PostgreSQL 默认端口是 **1921**（不是 5432）
- 内网地址格式类似：`rm-xxxxxx.pg.rds.aliyuncs.com`

#### 5.3 修改微信小程序 AppID

找到这一行：
```bash
NEXT_PUBLIC_WECHAT_APP_ID=your-wechat-app-id
```

修改为你的实际 AppID：
```bash
NEXT_PUBLIC_WECHAT_APP_ID=wx1234567890abcdef
```

#### 5.4 修改应用 URL

找到这一行（如果没有，添加这一行）：
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

修改为你的实际域名：
```bash
NEXT_PUBLIC_APP_URL=https://lowato-hvac.com
```

#### 5.5 保存并退出 nano

- 按 `Ctrl + O` 保存
- 按 `Enter` 确认
- 按 `Ctrl + X` 退出

#### 5.6 重启应用使配置生效

```bash
# 重启应用
pm2 restart luowato-selection

# 查看状态
pm2 status

# 应该显示：online
```

**✅ 恭喜！环境变量配置完成！**

---

## 📋 第 6 步：配置阿里云域名解析（3 分钟）

### 在阿里云控制台执行：

#### 6.1 登录阿里云域名控制台
1. 访问：https://dc.console.aliyun.com/next/index
2. 登录你的阿里云账号

#### 6.2 找到你的域名
1. 在"域名列表"中找到你的域名（lowato-hvac.com）
2. 点击"解析"

#### 6.3 添加解析记录
1. 点击"添加记录"
2. 填写以下信息：
   - **记录类型**：A
   - **主机记录**：@（表示根域名）
   - **记录值**：你的服务器公网 IP（47.96.123.45）
   - **TTL**：10 分钟
3. 点击"确定"

#### 6.4 可选：添加 www 子域名
1. 再次点击"添加记录"
2. 填写以下信息：
   - **记录类型**：A
   - **主机记录**：www
   - **记录值**：你的服务器公网 IP
   - **TTL**：10 分钟
3. 点击"确定"

#### 6.5 等待 DNS 生效
DNS 生效通常需要 **10 分钟**，最多可能需要 24 小时。

**✅ 恭喜！阿里云域名解析配置完成！**

---

## 📋 第 7 步：验证部署（5 分钟）

### 在你的本地电脑上执行：

#### 7.1 测试 HTTP 访问

```bash
# 测试 HTTP 访问
curl -I http://lowato-hvac.com
```

你应该看到类似这样的输出（自动重定向到 HTTPS）：
```
HTTP/1.1 301 Moved Permanently
Server: nginx/1.18.0
Location: https://lowato-hvac.com/
```

#### 7.2 测试 HTTPS 访问

```bash
# 测试 HTTPS 访问
curl -I https://lowato-hvac.com
```

你应该看到类似这样的输出：
```
HTTP/1.1 200 OK
Server: nginx/1.18.0
Content-Type: text/html; charset=utf-8
```

#### 7.3 在浏览器中测试

1. 打开你的浏览器（Chrome、Firefox、Safari 等）
2. 访问：`http://lowato-hvac.com`
3. 应该自动跳转到：`https://lowato-hvac.com`
4. 页面应该正常显示

#### 7.4 测试功能

在浏览器中测试以下功能：

1. **首页**：
   - 应该自动跳转到智能选型页面

2. **智能选型功能**：
   - 输入流量和扬程
   - 点击"开始选型"
   - 应该显示选型结果

3. **产品库功能**：
   - 点击"产品库"菜单
   - 应该弹出密码输入框
   - 输入密码：`admin123`
   - 应该可以进入产品库

**✅ 恭喜！部署成功！**

---

## 📋 第 8 步：配置微信小程序业务域名（5 分钟）

### 在微信公众平台执行：

#### 8.1 登录微信公众平台
1. 访问：https://mp.weixin.qq.com/
2. 使用你的小程序账号登录

#### 8.2 进入开发设置
1. 点击左侧菜单："开发"
2. 点击："开发管理"
3. 点击："开发设置"

#### 8.3 配置业务域名
1. 找到"业务域名"部分
2. 点击"配置"按钮
3. 添加你的域名：
   - 域名：`lowato-hvac.com`（不要加 http:// 或 https://）
4. 点击"确定"

#### 8.4 下载并上传校验文件
1. 点击"下载校验文件"
2. 将下载的文件（如：`MP_verify_xxxxxx.txt`）上传到服务器

**在你的本地电脑上执行：**

```bash
# 上传校验文件到服务器
scp -i aliyun-key.pem MP_verify_xxxxxx.txt root@你的服务器公网IP:/var/www/luowato-selection/public/

# 示例：
# scp -i aliyun-key.pem MP_verify_ABC123.txt root@47.96.123.45:/var/www/luowato-selection/public/
```

#### 8.5 验证并保存
1. 回到微信公众平台
2. 点击"确定"或"验证"
3. 验证成功后，域名配置完成

**✅ 恭喜！微信小程序业务域名配置完成！**

---

## 📋 第 9 步：检查服务状态（2 分钟）

### 在服务器终端窗口执行：

#### 9.1 检查 PM2 应用状态

```bash
# 查看 PM2 状态
pm2 status

# 应该显示：
# ┌─────┬─────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┐
# │ id  │ name                │ version     │ mode    │ pid     │ status   │ cpu    │ mem  │ user      │ uptime   │ restarts │ watching │
# ├─────┼─────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┤
# │ 0   │ luowato-selection   │ 1.0.0       │ cluster │ 1234    │ online   │ 0.1%   │ 150M │ root      │ 10m      │ 0        │ disabled │
# └─────┴─────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┘
```

#### 9.2 检查 Nginx 状态

```bash
# 查看 Nginx 状态
systemctl status nginx

# 应该显示：
# ● nginx.service - A high performance web server and a reverse proxy server
#    Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
#    Active: active (running) since Wed 2024-01-01 00:00:00 UTC; 10m ago
```

#### 9.3 检查端口监听

```bash
# 检查 5000 端口（应用端口）
ss -lptn 'sport = :5000'

# 应该显示：
# State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port
# LISTEN  0       128                *:5000              *:*    users:(("node",pid=1234,fd=10))

# 检查 80 和 443 端口（HTTP 和 HTTPS）
ss -lptn 'sport = :80'
ss -lptn 'sport = :443'

# 应该显示 nginx 在监听这些端口
```

**✅ 恭喜！所有服务运行正常！**

---

## 🎉 部署完成！

### 📋 最终检查清单

- [ ] 服务器连接成功
- [ ] 项目文件上传成功
- [ ] 部署脚本执行成功
- [ ] 阿里云 RDS 白名单配置完成
- [ ] 环境变量配置完成
- [ ] SSL 证书配置完成
- [ ] 阿里云域名解析完成
- [ ] 服务重启成功
- [ ] 网站访问正常
- [ ] 智能选型功能正常
- [ ] 产品库密码登录正常（admin123）
- [ ] 微信小程序业务域名配置完成

### 🚀 访问地址

- HTTP:  `http://lowato-hvac.com`
- HTTPS: `https://lowato-hvac.com`

### 🛠️ 常用管理命令

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs luowato-selection

# 重启应用
pm2 restart luowato-selection

# 重启 Nginx
systemctl restart nginx

# 查看系统资源
free -h        # 查看内存
df -h          # 查看磁盘
top            # 查看 CPU
```

---

## 🆘 常见问题排查

### 问题 1：连接服务器失败

**错误信息：**
```
Permission denied (publickey)
```

**解决方案：**
```bash
# 检查密钥文件权限
chmod 600 aliyun-key.pem

# 使用详细模式连接
ssh -v -i aliyun-key.pem root@你的服务器公网IP
```

---

### 问题 2：上传文件失败

**错误信息：**
```
No space left on device
```

**解决方案：**
```bash
# 检查磁盘空间
ssh root@你的服务器公网IP "df -h"

# 清理缓存（如果空间不足）
ssh root@你的服务器公网IP "apt clean"
```

---

### 问题 3：访问 502 Bad Gateway

**错误信息：**
```
502 Bad Gateway
```

**解决方案：**
```bash
# 在服务器上执行

# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs luowato-selection

# 重启应用
pm2 restart luowato-selection

# 检查端口
ss -lptn 'sport = :5000'
```

---

### 问题 4：SSL 证书错误

**错误信息：**
```
SSL certificate problem
```

**解决方案：**
```bash
# 在服务器上执行

# 使用 Certbot 重新获取
certbot --nginx -d lowato-hvac.com --force-renewal

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

---

### 问题 5：数据库连接失败

**错误信息：**
```
Connection refused
```

**解决方案：**
```bash
# 在服务器上执行

# 检查环境变量
cat /var/www/luowato-selection/.env.production | grep DATABASE_URL

# 检查 RDS 白名单是否配置
# 在阿里云控制台检查：RDS → 数据安全性 → 白名单设置

# 测试数据库连接
psql -h 内网地址 -p 1921 -U 用户名 -d 数据库名

# 重启应用
pm2 restart luowato-selection
```

**注意**：阿里云 RDS PostgreSQL 端口默认是 1921，不是 5432！

---

### 问题 6：RDS 连接被拒绝

**错误信息：**
```
FATAL: no pg_hba.conf entry for host "xxx.xxx.xxx.xxx"
```

**解决方案：**

1. **配置 RDS 白名单**
   - 登录阿里云控制台
   - 进入 RDS 管理控制台
   - 选择你的 PostgreSQL 实例
   - 点击"数据安全性" → "白名单设置"
   - 添加 ECS 内网 IP 或 `0.0.0.0/0`
   - 点击"确定"

2. **检查连接地址**
   - 确保使用内网地址（不是公网地址）
   - 格式：`rm-xxxxxx.pg.rds.aliyuncs.com`

3. **检查端口**
   - 阿里云 RDS PostgreSQL 默认端口：**1921**
   - 不要使用 5432

---

## 💡 下一步建议

### 1. 配置安全组（重要！）

在阿里云控制台配置 ECS 安全组：

1. 进入 ECS 控制台
2. 选择你的实例
3. 点击"安全组"
4. 配置入方向规则：
   - 端口 22：仅允许你的 IP 访问（SSH）
   - 端口 80：允许所有 IP 访问（HTTP）
   - 端口 443：允许所有 IP 访问（HTTPS）

### 2. 配置防火墙（可选）
```bash
# 安装 UFW
apt install -y ufw

# 允许 SSH
ufw allow 22

# 允许 HTTP 和 HTTPS
ufw allow 80
ufw allow 443

# 启用防火墙
ufw enable
```

### 3. 配置自动备份（可选）
```bash
# 安装备份工具
apt install -y cron

# 添加定时任务
crontab -e

# 添加以下行（每天凌晨 2 点备份）
# 0 2 * * * pg_dump -h 内网地址 -p 1921 -U 用户名 数据库名 > /backup/db_$(date +\%Y\%m\%d).sql
```

### 4. 配置监控告警（可选）
- 使用阿里云云监控服务
- 配置 CPU、内存、磁盘使用率告警
- 配置应用日志告警

---

## 📞 需要帮助？

如果遇到问题，请提供以下信息：

1. **当前步骤**：你执行到哪一步了？
2. **错误信息**：完整的错误输出
3. **日志信息**：
   ```bash
   pm2 logs luowato-selection --lines 100
   tail -100 /var/log/nginx/luowato-selection-error.log
   ```
4. **系统信息**：
   ```bash
   cat /etc/os-release
   node -v
   pnpm -v
   ```

---

## 🔥 阿里云特有注意事项

### 1. RDS PostgreSQL 端口
- 阿里云 RDS PostgreSQL 默认端口：**1921**
- 不是 5432！

### 2. RDS 白名单
- 必须配置白名单，否则无法连接
- 建议：添加 ECS 内网 IP（最安全）
- 或添加 `0.0.0.0/0`（允许所有，不推荐生产环境）

### 3. 内网地址格式
- 格式：`rm-xxxxxx.pg.rds.aliyuncs.com`
- 不要使用公网地址（除非开启了公网访问）

### 4. 安全组配置
- ECS 安全组必须开放 80、443 端口
- 22 端口建议限制 IP 访问

---

**🎉 恭喜你完成了阿里云部署！**

现在你的洛瓦托水泵选型系统已经成功部署到阿里云服务器上了！
