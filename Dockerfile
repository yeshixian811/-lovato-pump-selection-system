# ============================================
# 洛瓦托水泵选型系统 - 生产环境 Dockerfile
# ============================================
# 基于 Node.js 20 Alpine 镜像
# ============================================

# 阶段 1: 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache \
    bash \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    pixman-dev

# 安装 pnpm
RUN npm install -g pnpm

# 配置 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com/ && \
    pnpm config set registry https://registry.npmmirror.com/

# 复制依赖配置文件
COPY package.json pnpm-lock.yaml* ./

# 安装依赖（使用生产环境依赖）
RUN pnpm install --frozen-lockfile --prod=false

# 复制项目文件
COPY . .

# 构建项目
RUN pnpm run build

# ============================================
# 阶段 2: 运行阶段
# ============================================
FROM node:20-alpine AS runner

# 安装运行时依赖
RUN apk add --no-cache \
    bash \
    ca-certificates

# 安装 pnpm
RUN npm install -g pnpm

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 设置工作目录
WORKDIR /app

# 从构建阶段复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 创建必要的目录
RUN mkdir -p public/uploads && \
    chown -R nextjs:nodejs /app

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 启动应用
CMD ["node", "server.js"]
