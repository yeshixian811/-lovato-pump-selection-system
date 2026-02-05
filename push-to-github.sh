#!/bin/bash

# GitHub仓库推送脚本
# 使用Personal Access Token推送代码

set -e

echo "==================================="
echo "GitHub 代码推送脚本"
echo "==================================="
echo ""

# 仓库地址
REPO_URL="https://github.com/yeshixian811/-lovato-pump-selection-system.git"

# 检查是否已有远程仓库
if git remote get-url origin >/dev/null 2>&1; then
    echo "✓ 远程仓库已配置："
    git remote get-url origin
else
    echo "✗ 远程仓库未配置，正在添加..."
    git remote add origin "$REPO_URL"
    echo "✓ 远程仓库已添加"
fi

echo ""
echo "==================================="
echo "请提供GitHub Personal Access Token"
echo "==================================="
echo ""
echo "如何获取Token："
echo "1. 访问：https://github.com/settings/tokens/new"
echo "2. Note: Lovato Pump Deployment"
echo "3. Expiration: 选择过期时间"
echo "4. 勾选权限：repo"
echo "5. 点击 Generate token"
echo "6. 复制生成的token"
echo ""
read -p "请输入你的Personal Access Token: " TOKEN

echo ""
echo "==================================="
echo "开始推送代码..."
echo "==================================="

# 构建带token的URL
AUTH_URL="https://${TOKEN}@github.com/yeshixian811/-lovato-pump-selection-system.git"

# 推送代码
echo "正在推送代码到GitHub..."
git push "$AUTH_URL" main

echo ""
echo "==================================="
echo "✓ 代码推送成功！"
echo "==================================="
echo ""
echo "下一步："
echo "1. 访问GitHub仓库验证："
echo "   https://github.com/yeshixian811/-lovato-pump-selection-system"
echo ""
echo "2. Vercel会自动检测并重新部署"
echo "3. 几分钟后访问："
echo "   https://lovato-pump-selection-system-b6nh-30q2we343-yeshixians-projects.vercel.app"
echo ""
