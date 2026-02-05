# APP图标生成指南

## 现有资源
项目中有LOGO图片：`public/assets/LOGO透明图.png`

## 需要生成的图标尺寸

### 移动端APP（Capacitor）
- Android: 192x192 (android-chrome-192x192.png)
- Android: 512x512 (android-chrome-512x512.png)
- iOS: 180x180 (apple-touch-icon.png)
- iOS: 57x57 (apple-touch-icon-57x57.png)
- iOS: 72x72 (apple-touch-icon-72x72.png)
- iOS: 76x76 (apple-touch-icon-76x76.png)
- iOS: 114x114 (apple-touch-icon-114x114.png)
- iOS: 120x120 (apple-touch-icon-120x120.png)
- iOS: 144x144 (apple-touch-icon-144x144.png)
- iOS: 152x152 (apple-touch-icon-152x152.png)
- iOS: 167x167 (apple-touch-icon-167x167.png)
- iOS: 180x180 (apple-touch-icon-180x180.png)
- iOS: 192x192 (apple-touch-icon-192x192.png)

### 桌面端APP（Electron）
- Windows: 256x256 (icon.png, icon.ico)
- macOS: 512x512 (icon.png)
- Linux: 512x512 (icon.png)

### PWA
- favicon: 32x32 (favicon.ico)
- manifest: 192x192 (icon-192x192.png)
- manifest: 512x512 (icon-512x512.png)

## 生成方法

### 方法1: 使用在线工具
1. 访问 https://realfavicongenerator.net/
2. 上传 `public/assets/LOGO透明图.png`
3. 选择所有图标尺寸
4. 下载并解压到 `public/` 目录

### 方法2: 使用ImageMagick（命令行）
```bash
# 创建icon.png (512x512)
convert public/assets/LOGO透明图.png -resize 512x512 public/icon.png

# 创建favicon.ico (32x32)
convert public/assets/LOGO透明图.png -resize 32x32 public/favicon.ico

# 创建PWA图标
convert public/assets/LOGO透明图.png -resize 192x192 public/icon-192x192.png
convert public/assets/LOGO透明图.png -resize 512x512 public/icon-512x512.png

# 创建Android图标
convert public/assets/LOGO透明图.png -resize 192x192 public/android-chrome-192x192.png
convert public/assets/LOGO透明图.png -resize 512x512 public/android-chrome-512x512.png

# 创建iOS图标
convert public/assets/LOGO透明图.png -resize 180x180 public/apple-touch-icon.png
```

### 方法3: 使用Capacitor Assets
```bash
# 安装capacitor-assets
pnpm add -D @capacitor/assets

# 创建capacitor.config.ts中的icons配置
# 然后运行：
npx cap assets:generate
```

## 当前状态
由于沙箱环境限制，图标文件暂时使用placeholder。在实际构建前，请按照上述方法生成完整的图标文件。

## 图标存放位置
- PWA图标: `public/` 目录
- 移动端图标: `public/` 或 `capacitor.config.ts` 配置
- 桌面端图标: `public/icon.png`
