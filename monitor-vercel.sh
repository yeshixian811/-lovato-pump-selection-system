#!/bin/bash

# Vercel 状态监控脚本

echo "🔍 Vercel 状态监控"
echo "===================="
echo ""

# 检查 Vercel Dashboard
echo "📊 检查 Vercel Dashboard..."
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://vercel.com/dashboard)
echo "Dashboard 状态码: $DASHBOARD_STATUS"

if [ "$DASHBOARD_STATUS" = "200" ]; then
    echo "✅ Dashboard 正常"
else
    echo "❌ Dashboard 异常 ($DASHBOARD_STATUS)"
fi
echo ""

# 检查网站
echo "🌐 检查网站 https://lowatopump.com..."
WEBSITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://lowatopump.com)
echo "网站状态码: $WEBSITE_STATUS"

if [ "$WEBSITE_STATUS" = "200" ]; then
    echo "✅ 网站正常"
else
    echo "❌ 网站异常 ($WEBSITE_STATUS)"
fi
echo ""

# 检查 Vercel 状态 API
echo "📡 检查 Vercel 状态 API..."
STATUS_API=$(curl -s https://status.vercel.com/api/v2/status.json | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
echo "Vercel 状态: $STATUS_API"

if [ "$STATUS_API" = "operational" ]; then
    echo "✅ Vercel 服务正常"
else
    echo "⚠️ Vercel 服务异常: $STATUS_API"
fi
echo ""

# 检查数据库
echo "🗄️ 检查数据库连接..."
DB_STATUS=$(timeout 5 bash -c 'echo "" | nc -z 122.51.22.101 5432 && echo "OK" || echo "FAILED"')
echo "数据库状态: $DB_STATUS"

if [ "$DB_STATUS" = "OK" ]; then
    echo "✅ 数据库可访问"
else
    echo "❌ 数据库无法访问"
fi
echo ""

# 检查 GitHub 仓库
echo "📦 检查 GitHub 仓库..."
GITHUB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://github.com/yeshixian811/-lovato-pump-selection-system)
echo "GitHub 状态码: $GITHUB_STATUS"

if [ "$GITHUB_STATUS" = "200" ]; then
    echo "✅ GitHub 仓库正常"
else
    echo "❌ GitHub 仓库异常 ($GITHUB_STATUS)"
fi
echo ""

# 总结
echo "===================="
echo "📋 总结:"

if [ "$DASHBOARD_STATUS" = "200" ] && [ "$WEBSITE_STATUS" = "200" ]; then
    echo "✅ 一切正常！可以访问 Dashboard 和网站"
elif [ "$DASHBOARD_STATUS" = "200" ] && [ "$WEBSITE_STATUS" != "200" ]; then
    echo "⚠️ Dashboard 正常，但网站异常 - 需要检查部署"
elif [ "$DASHBOARD_STATUS" != "200" ] && [ "$WEBSITE_STATUS" = "200" ]; then
    echo "⚠️ 网站正常，但 Dashboard 异常 - 可能是 Vercel UI 问题"
else
    echo "❌ Dashboard 和网站都异常 - 可能是 Vercel 服务故障"
fi

echo ""
echo "检查完成！"
echo "请根据结果采取相应措施。"
