# 洛瓦托水泵选型系统 - APP构建指南

## 项目概述
洛瓦托水泵选型系统已配置支持多种平台：
- ✅ **PWA（渐进式Web应用）** - 可安装到浏览器、手机和桌面
- ✅ **移动端APP** - iOS + Android（基于Capacitor）
- ✅ **桌面端APP** - Windows + Mac + Linux（基于Electron）

---

## 一、PWA构建（推荐先完成）

### 1. 生成图标
按照 `ICONS_README.md` 中的说明生成所需的图标文件。

### 2. 构建PWA
```bash
# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start
```

### 3. 验证PWA
1. 访问 https://localhost:5000
2. 打开浏览器开发者工具 > Application > Manifest
3. 验证manifest.json是否正确加载
4. 检查Service Worker是否正常注册

### 4. 安装PWA
- **Chrome/Edge**: 点击地址栏右侧的安装图标
- **Safari**: 分享按钮 > 添加到主屏幕
- **Firefox**: 地址栏右侧的安装图标

---

## 二、移动端APP构建（Capacitor）

### 前置要求

#### Android
- 安装 [Android Studio](https://developer.android.com/studio)
- 安装 Android SDK（API Level 33+）
- 配置 `ANDROID_HOME` 环境变量
- 安装 Java JDK 17

#### iOS
- macOS系统
- 安装 [Xcode](https://developer.apple.com/xcode/) 14+
- 安装 CocoaPods: `sudo gem install cocoapods`

### 构建步骤

#### 1. 同步Capacitor
```bash
# 构建Next.js应用
pnpm run build

# 同步到Capacitor
pnpm run cap:sync
```

#### 2. 打开项目
```bash
# 打开Android项目
pnpm run cap:open:android

# 打开iOS项目
pnpm run cap:open:ios
```

#### 3. 构建Android APK

**方法1: 使用Android Studio**
1. 打开Android Studio项目
2. 选择 Build > Build Bundle(s) / APK(s) > Build APK(s)
3. APK文件位置: `android/app/build/outputs/apk/debug/app-debug.apk`

**方法2: 使用命令行**
```bash
cd android
./gradlew assembleDebug
# 生成的APK在: app/build/outputs/apk/debug/app-debug.apk
```

**方法3: 使用Capacitor Cloud**
```bash
pnpm add -D @capacitor/cloud
npx cap build android
```

#### 4. 构建iOS IPA

**方法1: 使用Xcode**
1. 打开Xcode项目
2. 选择 Product > Archive
3. 在Organizer中导出IPA

**方法2: 使用Capacitor Cloud**
```bash
npx cap build ios
```

#### 5. 签名配置（发布版本）

**Android**
- 生成签名密钥: `keytool -genkey -v -keystore release.keystore -alias luowato -keyalg RSA -keysize 2048 -validity 10000`
- 配置 `android/app/build.gradle`
- 使用 `./gradlew assembleRelease` 构建发布版

**iOS**
- 在Xcode中配置Signing & Capabilities
- 需要Apple Developer账号（$99/年）

---

## 三、桌面端APP构建（Electron）

### 前置要求
- 安装 Node.js 18+
- Windows: 安装 Visual Studio Build Tools
- macOS: 安装 Xcode Command Line Tools
- Linux: 安装 build-essential

### 构建步骤

#### 1. 安装Electron依赖
```bash
pnpm install
```

#### 2. 构建Next.js应用
```bash
pnpm run build
```

#### 3. 构建桌面端APP

**Windows**
```bash
pnpm run electron:build:win
# 输出: dist/luowato-pump-selection Setup 1.0.0.exe
```

**macOS**
```bash
pnpm run electron:build:mac
# 输出: dist/洛瓦托水泵选型-1.0.0.dmg
```

**Linux**
```bash
pnpm run electron:build:linux
# 输出: dist/洛瓦托水泵选型-1.0.0.AppImage
```

#### 4. 构建所有平台
```bash
pnpm run electron:build
```

#### 5. 开发模式
```bash
# 启动开发服务器（终端1）
pnpm run dev

# 启动Electron（终端2）
pnpm run electron:dev
```

---

## 四、文件结构

```
项目根目录/
├── capacitor.config.ts          # Capacitor配置
├── electron-builder.json        # Electron Builder配置
├── electron/                    # Electron主进程代码
│   └── main.ts
├── public/                      # 静态资源
│   ├── manifest.json           # PWA manifest
│   ├── icon.png                # 桌面端图标
│   ├── favicon.ico             # 网站图标
│   └── assets/                 # 其他资源
├── out/                        # Next.js构建输出（用于APP）
└── dist/                       # Electron构建输出
```

---

## 五、常见问题

### 1. Capacitor同步失败
```bash
# 清除缓存
rm -rf android ios node_modules/.cache
pnpm run cap:sync
```

### 2. Android构建失败
- 检查 `ANDROID_HOME` 环境变量
- 确保Android SDK API Level 33+已安装
- 检查Java JDK版本（推荐JDK 17）

### 3. iOS构建失败
- 确保使用macOS系统
- 检查Xcode版本（14+）
- 运行 `pod install` 在 `ios/App` 目录

### 4. Electron构建失败
- 检查Node.js版本（18+）
- Windows需要安装Visual Studio Build Tools
- 检查是否有足够的磁盘空间

### 5. 图标不显示
- 确保已按照 `ICONS_README.md` 生成所有尺寸的图标
- 图标文件必须放在 `public/` 目录下
- 清除浏览器缓存后刷新

---

## 六、发布指南

### PWA发布
1. 将构建后的 `out/` 目录部署到Web服务器
2. 确保HTTPS支持（PWA必需）
3. 验证manifest.json和Service Worker可访问

### Android发布
1. 生成签名密钥
2. 构建发布版APK
3. 上传到Google Play Console
4. 填写应用信息和截图
5. 提交审核

### iOS发布
1. 构建IPA文件
2. 上传到App Store Connect
3. 填写应用信息和截图
4. 提交审核（需Apple Developer账号）

### 桌面端发布
1. 构建各平台安装包
2. 签名安装包（Windows/macOS）
3. 上传到官网或应用商店
4. 提供下载链接

---

## 七、快速开始（推荐顺序）

1. **先构建PWA**（最简单，无需额外工具）
   ```bash
   pnpm run build
   pnpm run start
   ```

2. **再构建桌面端**（需要Electron）
   ```bash
   pnpm run build
   pnpm run electron:build
   ```

3. **最后构建移动端**（需要Android Studio/Xcode）
   ```bash
   pnpm run build
   pnpm run cap:sync
   pnpm run cap:open:android  # 或 ios
   ```

---

## 八、技术支持

- **Capacitor文档**: https://capacitorjs.com/
- **Electron文档**: https://www.electronjs.org/
- **Next.js文档**: https://nextjs.org/
- **PWA文档**: https://web.dev/progressive-web-apps/

---

## 版本信息
- **项目名称**: 洛瓦托水泵选型系统
- **版本号**: 1.0.0
- **包名**: com.luowato.pump
- **构建工具**: Capacitor 8.0.2, Electron, next-pwa
