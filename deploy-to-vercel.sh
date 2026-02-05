#!/bin/bash
set -Eeuo pipefail

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  洛瓦托水泵选型系统 - Vercel 部署助手${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查是否是Git仓库
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}初始化Git仓库...${NC}"
    git init
    git branch -M main
    echo -e "${GREEN}✓ Git仓库已初始化${NC}"
else
    echo -e "${GREEN}✓ Git仓库已存在${NC}"
fi

# 添加所有文件
echo -e "${YELLOW}添加文件到Git...${NC}"
git add .

# 检查是否有文件需要提交
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}没有新的更改需要提交${NC}"
    echo -e "${YELLOW}如果需要重新部署，请先修改文件${NC}"
else
    # 提交
    echo -e "${YELLOW}提交更改...${NC}"
    git commit -m "feat: 洛瓦托水泵选型系统 - 准备部署到Vercel"
    echo -e "${GREEN}✓ 文件已提交${NC}"
fi

# 检查是否已配置远程仓库
if [ -z "$(git remote get-url origin 2>/dev/null)" ]; then
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  下一步：配置GitHub仓库${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo -e "${YELLOW}1. 在GitHub上创建一个新仓库${NC}"
    echo -e "   访问: https://github.com/new"
    echo -e "   仓库名: luowato-pump-selection"
    echo ""
    echo -e "${YELLOW}2. 连接到GitHub仓库${NC}"
    echo -e "   运行以下命令（替换YOUR_USERNAME）："
    echo -e ""
    echo -e "${GREEN}git remote add origin https://github.com/YOUR_USERNAME/luowato-pump-selection.git${NC}"
    echo -e "${GREEN}git push -u origin main${NC}"
    echo ""
    echo -e "${YELLOW}3. 在Vercel部署${NC}"
    echo -e "   访问: https://vercel.com/new"
    echo -e "   导入你的GitHub仓库"
    echo ""
else
    # 推送到远程仓库
    echo -e "${YELLOW}推送到远程仓库...${NC}"
    git push -u origin main
    echo -e "${GREEN}✓ 代码已推送到GitHub${NC}"

    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  下一步：在Vercel部署${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo -e "${YELLOW}1. 访问 Vercel${NC}"
    echo -e "   ${GREEN}https://vercel.com/new${NC}"
    echo ""
    echo -e "${YELLOW}2. 导入GitHub仓库${NC}"
    echo -e "   选择: luowato-pump-selection"
    echo ""
    echo -e "${YELLOW}3. 配置部署${NC}"
    echo -e "   Framework: Next.js"
    echo -e "   Build Command: pnpm run build"
    echo -e "   Output Directory: .next"
    echo ""
    echo -e "${YELLOW}4. 点击 Deploy${NC}"
    echo -e "   等待2-3分钟即可完成部署！"
    echo ""
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  部署文档${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "详细部署指南: ${GREEN}README_DEPLOYMENT.md${NC}"
echo -e "完整文档: ${GREEN}VERCEL_DEPLOYMENT_GUIDE.md${NC}"
echo ""

echo -e "${GREEN}✓ 准备完成！祝部署顺利！${NC}"
