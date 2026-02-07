# 🚀 在本地Windows电脑上创建项目 - 快速方案

## 方案1: 克隆GitHub仓库（推荐）

### 1. 在本地Windows电脑上打开命令提示符
- 按 `Win + R`
- 输入 `cmd`
- 按 Enter

### 2. 克隆项目（替换为实际地址）
```batch
git clone https://github.com/your-username/lovato-pump-selection.git
cd lovato-pump-selection
```

### 3. 如果仓库不存在，使用Gitee
```batch
git clone https://gitee.com/your-username/lovato-pump-selection.git
cd lovato-pump-selection
```

---

## 方案2: 手动创建项目文件

### 第1步：创建项目文件夹

在桌面创建文件夹 `lovato-pump-selection`

### 第2步：创建 package.json

在文件夹中创建文件 `package.json`，内容如下：

```json
{
  "name": "luowato-pump-selection",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "pg": "^8.16.3",
    "drizzle-orm": "^0.45.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

### 第3步：安装依赖
```batch
pnpm install
```

### 第4步：创建基本文件结构

创建以下文件夹：
```
lovato-pump-selection/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── public/
├── migrations/
```

---

## 方案3: 下载项目压缩包（最简单）

### 访问项目页面
- GitHub: https://github.com/your-username/lovato-pump-selection
- 或 Gitee: https://gitee.com/your-username/lovato-pump-selection

### 点击 "Code" → "Download ZIP"

### 解压到桌面

---

## 下一步：配置和启动

### 1. 创建 .env 文件
```batch
copy .env.example .env
```

### 2. 配置数据库
```batch
psql -U postgres -c "CREATE DATABASE lovato_pump;"
psql -U postgres -d lovato_pump < migrations\001_add_membership_tables.sql
```

### 3. 启动应用
```batch
pnpm run dev
```

### 4. 访问
打开浏览器：http://localhost:5000
