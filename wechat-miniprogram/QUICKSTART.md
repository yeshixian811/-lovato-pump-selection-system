# 快速开始指南

## 🎯 5 分钟快速部署

### 步骤 1：下载项目（1 分钟）

```bash
# 克隆仓库
git clone https://github.com/你的用户名/lovato-pump.git
cd lovato-pump/wechat-miniprogram

# 或下载 ZIP 压缩包
# 访问 GitHub -> Code -> Download ZIP
# 解压后进入 wechat-miniprogram 目录
```

### 步骤 2：打开微信开发者工具（1 分钟）

1. 下载并安装微信开发者工具
   - https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

2. 启动微信开发者工具

3. 选择"导入项目"

4. 选择 `wechat-miniprogram` 目录

5. 填写项目信息：
   - 项目名称：洛瓦托水泵选型系统
   - AppID：使用测试号（推荐新手）
   - 开发模式：小程序
   - 后端服务：不使用云服务

6. 点击"导入"

### 步骤 3：编译运行（1 分钟）

1. 点击"编译"按钮
2. 项目会自动运行在模拟器中
3. 查看首页效果

### 步骤 4：测试功能（1 分钟）

#### 测试智能选型

1. 点击底部"智能选型"标签
2. 拖动流量滑块（例如：10 m³/h）
3. 拖动扬程滑块（例如：20 m）
4. 点击"开始选型"
5. 查看选型结果

#### 测试性能曲线

1. 点击任意选型结果
2. 进入产品详情页面
3. 查看性能曲线数据表
4. 查看需求点对比

### 步骤 5：真机预览（1 分钟）

1. 点击"预览"按钮
2. 使用微信扫码
3. 在手机上查看效果

---

## 📋 项目概览

### 核心功能

| 功能 | 说明 | 位置 |
|------|------|------|
| 智能选型 | 输入参数，自动匹配水泵 | 智能选型页 |
| 性能曲线 | 显示扬程、效率、功率曲线 | 产品详情页 |
| 产品库 | 浏览所有产品 | 产品库页 |
| 收藏 | 收藏感兴趣的产品 | 收藏页 |

### 页面结构

```
wechat-miniprogram/
├── pages/
│   ├── index/           # 首页
│   ├── selection/       # 智能选型 ⭐
│   ├── products/        # 产品库
│   ├── product-detail/  # 产品详情 ⭐
│   ├── favorites/       # 收藏
│   └── about/           # 关于
└── components/
    └── pump-curve-chart/  # 性能曲线组件 ⭐
```

---

## 🔧 配置说明

### 配置 API 地址

编辑 `utils/api.ts`：

```typescript
const BASE_URL = 'https://lowato-hvac.com/api'
```

### 配置 AppID

编辑 `project.config.json`：

```json
{
  "appid": "wxXXXXXXXXXXXXXXXX"
}
```

---

## 🚀 下一步

- 查看完整文档：[README.md](README.md)
- 查看部署指南：[DEPLOYMENT.md](DEPLOYMENT.md)
- 查看性能曲线说明：[README.md#性能曲线说明](README.md#性能曲线说明)

---

## ❓ 常见问题

### Q: 如何使用测试号？

A: 在导入项目时，选择"测试号"即可。测试号可以开发和小范围测试，但不能正式发布。

### Q: API 请求失败怎么办？

A: 开启"不校验合法域名"选项：
1. 点击"详情" -> "本地设置"
2. 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"

### Q: 性能曲线不显示？

A: 确保产品数据中包含 `performance_curve` 数据。Mock 数据已包含 3 个产品的性能曲线数据。

---

## 📞 联系我们

- 客服电话：400-XXX-XXXX
- 电子邮箱：contact@lovato-pump.com
- 官方网站：https://lowato-hvac.com

---

祝使用愉快！🎉
