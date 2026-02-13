# 数据同步指南 - 本地 → GitHub → 火山云服务器

## 📋 架构说明

```
┌─────────────┐         ┌──────────────┐         ┌──────────────────┐
│   本地开发   │ ────→  │  GitHub 仓库  │ ────→  │  火山云 ECS 服务器  │
│ (沙箱环境)   │  git   │  (代码备份)   │  部署   │   (生产环境)      │
└─────────────┘         └──────────────┘         └──────────────────┘
```

---

## 🚀 同步步骤

### 第一步：本地 → GitHub（已完成 ✅）

```bash
# 1. 提交本地更改
git add .
git commit -m "描述你的更改"

# 2. 推送到 GitHub
git push origin main
```

**当前状态**: ✅ 已完成
- 本地和 GitHub 已同步
- 所有阿里云/腾讯云数据已删除
- 代码已更新为火山云配置

---

### 第二步：GitHub → 火山云服务器（需要配置）

#### 方式 1：手动部署（推荐）⭐⭐⭐

**步骤：**

1. **连接到服务器**
   ```bash
   ssh root@14.103.55.52
   ```

2. **拉取最新代码**
   ```bash
   cd /opt/lovato-pump
   git pull origin main
   ```

3. **安装依赖**
   ```bash
   pnpm install
   ```

4. **构建项目**
   ```bash
   pnpm build
   ```

5. **重启服务**
   ```bash
   pm2 restart lovato-pump
   # 或
   systemctl restart nginx
   ```

---

#### 方式 2：使用部署脚本（自动）

**创建部署脚本 `/opt/lovato-pump/scripts/deploy-volcano.sh`：**

```bash
#!/bin/bash

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}开始部署洛瓦托水泵选型系统...${NC}"

# 进入项目目录
cd /opt/lovato-pump

# 拉取最新代码
echo -e "${YELLOW}拉取最新代码...${NC}"
git pull origin main

# 检查是否有错误
if [ $? -ne 0 ]; then
    echo -e "${RED}拉取代码失败！${NC}"
    exit 1
fi

# 安装依赖
echo -e "${YELLOW}安装依赖...${NC}"
pnpm install

# 构建项目
echo -e "${YELLOW}构建项目...${NC}"
pnpm build

# 重启 PM2 服务
echo -e "${YELLOW}重启服务...${NC}"
pm2 restart lovato-pump

# 保存 PM2 配置
pm2 save

echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}应用访问地址: https://lowato-hvac.com${NC}"
```

**使用方法：**
```bash
# 在服务器上执行
cd /opt/lovato-pump
chmod +x scripts/deploy-volcano.sh
bash scripts/deploy-volcano.sh
```

---

#### 方式 3：CI/CD 自动部署（高级）⭐⭐⭐⭐⭐

**使用 GitHub Actions 自动部署**

创建 `.github/workflows/deploy-volcano.yml`：

```yaml
name: Deploy to Volcano Cloud

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/lovato-pump
            git pull origin main
            pnpm install
            pnpm build
            pm2 restart lovato-pump
```

**配置 GitHub Secrets：**
1. 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
2. 添加以下 Secrets：
   - `SERVER_HOST`: 14.103.55.52
   - `SERVER_USER`: root
   - `SSH_PRIVATE_KEY`: 服务器的 SSH 私钥

**效果：**
- 每次推送代码到 GitHub main 分支
- 自动触发部署流程
- 自动拉取、构建、重启服务

---

## 🗄️ 数据库同步

### 火山云 PostgreSQL（已配置）

**数据库信息：**
- 地址：postgres1ee265de90ab.rds-pg.ivolces.com
- 端口：5432
- 数据库：lowatopump
- 用户：lowatopump

**说明：**
- 数据库已配置在火山云 RDS
- 不需要从本地同步数据库
- 应用直接连接火山云 RDS

**连接字符串：**
```env
DATABASE_URL=postgresql://lowatopump:6WAmA3-h7C2!NDE@postgres1ee265de90ab.rds-pg.ivolces.com:5432/lowatopump
```

---

## 📝 完整工作流程

### 场景 1：开发新功能

```bash
# 1. 本地开发
# 在沙箱环境中编写代码

# 2. 本地测试
pnpm dev
# 访问 http://localhost:5000 测试

# 3. 提交代码
git add .
git commit -m "feat: 添加新功能"

# 4. 推送到 GitHub
git push origin main

# 5. 部署到服务器
ssh root@14.103.55.52
cd /opt/lovato-pump
bash scripts/deploy-volcano.sh

# 6. 验证部署
curl https://lowato-hvac.com/api/health
```

---

### 场景 2：修复 Bug

```bash
# 1. 本地修复
# 在沙箱环境中修复问题

# 2. 提交并推送
git add .
git commit -m "fix: 修复xxx问题"
git push origin main

# 3. 服务器部署（如已配置 CI/CD，自动触发）
ssh root@14.103.55.52
cd /opt/lovato-pump
git pull origin main
pnpm build
pm2 restart lovato-pump
```

---

### 场景 3：多环境部署

**开发环境（本地）：**
- 数据库：本地 PostgreSQL 或火山云 RDS 开发实例
- 域名：localhost:5000

**测试环境（服务器）：**
- 数据库：火山云 RDS 测试实例
- 域名：test.lowato-hvac.com

**生产环境（服务器）：**
- 数据库：火山云 RDS 生产实例
- 域名：lowato-hvac.com

---

## 🔐 安全配置

### SSH 密钥配置

**1. 生成 SSH 密钥（如未配置）**
```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

**2. 将公钥添加到服务器**
```bash
ssh-copy-id root@14.103.55.52
```

**3. 将私钥添加到 GitHub Secrets**
- 复制私钥内容（`~/.ssh/id_rsa`）
- 添加到 GitHub → Settings → Secrets → `SSH_PRIVATE_KEY`

---

## 📊 同步状态检查

### 检查本地和 GitHub 同步状态

```bash
cd /workspace/projects

# 查看状态
git status

# 查看远程分支
git remote -v

# 查看提交历史
git log --oneline -5
```

### 检查服务器代码版本

```bash
ssh root@14.103.55.52
cd /opt/lovato-pump
git log --oneline -3
git status
```

---

## 🚨 常见问题

### Q1: 推送到 GitHub 后，服务器没有自动更新？

**A:**
- 如果使用手动部署，需要手动在服务器上执行部署命令
- 如果使用 CI/CD，检查 GitHub Actions 是否正常运行

### Q2: 数据库数据会同步吗？

**A:**
- 代码会同步到服务器
- 数据库不通过 Git 同步
- 数据库使用火山云 RDS，独立管理

### Q3: 如何回滚到之前的版本？

**A:**
```bash
# 1. 查看历史版本
git log --oneline

# 2. 回滚到指定版本
git reset --hard <commit-hash>
git push -f origin main

# 3. 服务器部署
ssh root@14.103.55.52
cd /opt/lovato-pump
git reset --hard <commit-hash>
pnpm build
pm2 restart lovato-pump
```

---

## 📚 推荐方案

### 对于当前项目

**推荐使用：手动部署 + 定期备份**

**原因：**
- 项目规模适中
- 部署频率不高
- 手动控制更安全
- 成本更低

**工作流程：**
1. 本地开发测试
2. 推送到 GitHub 备份
3. 登录服务器手动部署
4. 验证功能

---

## 🎯 下一步建议

1. **配置 SSH 免密登录**
   ```bash
   ssh-copy-id root@14.103.55.52
   ```

2. **在服务器上创建部署脚本**
   ```bash
   ssh root@14.103.55.52
   cd /opt/lovato-pump
   mkdir -p scripts
   # 创建 deploy-volcano.sh
   ```

3. **测试部署流程**
   ```bash
   # 在本地修改一个文件
   echo "test" > test.txt
   git add test.txt
   git commit -m "test"
   git push origin main

   # 在服务器上部署
   ssh root@14.103.55.52
   cd /opt/lovato-pump
   git pull origin main
   ```

---

**总结：本地 → GitHub → 服务器的同步流程已经打通，只需在服务器上配置好部署脚本即可实现自动化部署。**
