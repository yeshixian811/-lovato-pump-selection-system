import { NextResponse } from 'next/server';
import type { Request } from 'next/server';

/**
 * 速率限制配置
 */
export interface RateLimitConfig {
  /**
   * 时间窗口内的最大请求数
   */
  limit: number;
  /**
   * 时间窗口（毫秒）
   */
  window: number;
  /**
   * 标识符（可选，默认使用 IP 地址）
   */
  identifier?: string;
  /**
   * 自定义错误消息
   */
  errorMessage?: string;
  /**
   * 重试等待时间（秒）
   */
  retryAfter?: number;
}

/**
 * 速率限制结果
 */
export interface RateLimitResult {
  /**
   * 是否允许请求
   */
  success: boolean;
  /**
   * 剩余请求数
   */
  remaining: number;
  /**
   * 重置时间戳（毫秒）
   */
  reset: number;
  /**
   * 是否被限制
   */
  blocked: boolean;
  /**
   * 重试等待时间（秒）
   */
  retryAfter?: number;
}

/**
 * 内存存储的速率限制器
 * 适用于开发环境和单实例生产环境
 */
class MemoryRateLimitStore {
  private store: Map<string, { count: number; reset: number }>;

  constructor() {
    this.store = new Map();
    
    // 定期清理过期记录
    setInterval(() => {
      this.cleanup();
    }, 60000); // 每分钟清理一次
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.reset < now) {
        this.store.delete(key);
      }
    }
  }

  /**
   * 检查速率限制
   */
  check(key: string, limit: number, window: number): RateLimitResult {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || record.reset < now) {
      // 创建新记录
      const reset = now + window;
      this.store.set(key, { count: 1, reset });
      return {
        success: true,
        remaining: limit - 1,
        reset,
        blocked: false,
      };
    }

    // 更新现有记录
    if (record.count >= limit) {
      // 超过限制
      const retryAfter = Math.ceil((record.reset - now) / 1000);
      return {
        success: false,
        remaining: 0,
        reset: record.reset,
        blocked: true,
        retryAfter,
      };
    }

    // 增加计数
    record.count++;
    return {
      success: true,
      remaining: limit - record.count,
      reset: record.reset,
      blocked: false,
    };
  }

  /**
   * 重置速率限制
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * 获取当前计数
   */
  getCount(key: string): number {
    const record = this.store.get(key);
    return record?.count || 0;
  }
}

// 全局存储实例
const memoryStore = new MemoryRateLimitStore();

/**
 * 从请求中提取标识符
 */
function getIdentifier(request: Request): string {
  // 优先使用 X-Forwarded-For 头（代理环境）
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // 使用 X-Real-IP 头
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // 使用 CF-Connecting-IP 头（Cloudflare）
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP;
  }

  // 使用用户 ID（如果已认证）
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // 简单的 token 哈希作为标识符
    return `token:${authHeader.slice(-20)}`;
  }

  // 最后使用 'unknown'
  return 'unknown';
}

/**
 * 速率限制中间件
 */
export async function rateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const identifier = config.identifier || getIdentifier(request);
  return memoryStore.check(identifier, config.limit, config.window);
}

/**
 * 创建速率限制响应
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  errorMessage?: string
): NextResponse {
  const message = errorMessage || 'Too many requests. Please try again later.';

  const response = NextResponse.json(
    {
      error: message,
      retryAfter: result.retryAfter,
      reset: result.reset,
    },
    { status: 429 }
  );

  // 添加速率限制头
  response.headers.set('X-RateLimit-Limit', 'true');
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());

  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString());
  }

  return response;
}

/**
 * 包装 API 处理函数，自动应用速率限制
 */
export function withRateLimit<T = any>(
  handler: (request: Request) => Promise<NextResponse<T>>,
  config: RateLimitConfig
) {
  return async (request: Request): Promise<NextResponse<T>> => {
    // 检查速率限制
    const result = await rateLimit(request, config);

    // 添加速率限制头
    const response = await handler(request);
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());

    // 如果被限制，返回错误
    if (result.blocked) {
      return createRateLimitResponse(result, config.errorMessage);
    }

    return response;
  };
}

/**
 * 组合中间件：速率限制 + 认证
 */
import { withAuth, type JWTPayload } from './auth-middleware';

export function withRateLimitAndAuth<T = any>(
  handler: (request: Request, user: JWTPayload) => Promise<NextResponse<T>>,
  rateLimitConfig: RateLimitConfig,
  authOptions?: { requireRole?: 'admin' | 'manager' | 'user' }
) {
  return withRateLimit(
    withAuth(handler, authOptions),
    rateLimitConfig
  );
}

/**
 * 预定义的速率限制配置
 */
export const RateLimitPresets = {
  /**
   * 严格限制（登录、注册等敏感操作）
   */
  strict: {
    limit: 5,
    window: 60000, // 1 分钟
    errorMessage: 'Too many attempts. Please try again later.',
  },

  /**
   * 标准限制（普通 API）
   */
  standard: {
    limit: 100,
    window: 60000, // 1 分钟
    errorMessage: 'Rate limit exceeded. Please slow down.',
  },

  /**
   * 宽松限制（读取操作）
   */
  loose: {
    limit: 1000,
    window: 60000, // 1 分钟
    errorMessage: 'Rate limit exceeded. Please slow down.',
  },

  /**
   * 登录限制（更严格）
   */
  login: {
    limit: 5,
    window: 300000, // 5 分钟
    errorMessage: 'Too many login attempts. Please try again later.',
  },

  /**
   * 文件上传限制
   */
  upload: {
    limit: 10,
    window: 3600000, // 1 小时
    errorMessage: 'Too many upload attempts. Please try again later.',
  },
} as const;

/**
 * 获取客户端 IP 地址
 */
export function getClientIP(request: Request): string {
  return getIdentifier(request);
}

/**
 * 检查 IP 是否在白名单中
 */
export function isIPWhitelisted(ip: string, whitelist: string[]): boolean {
  return whitelist.includes(ip);
}

/**
 * 创建白名单速率限制器
 */
export function createWhitelistedRateLimit(
  whitelist: string[],
  defaultConfig: RateLimitConfig
) {
  return async (request: Request): Promise<RateLimitResult> => {
    const ip = getClientIP(request);

    // 白名单 IP 不受限制
    if (isIPWhitelisted(ip, whitelist)) {
      return {
        success: true,
        remaining: Infinity,
        reset: Date.now() + defaultConfig.window,
        blocked: false,
      };
    }

    // 应用速率限制
    return rateLimit(request, defaultConfig);
  };
}

/**
 * 导出存储实例（用于测试和管理）
 */
export { memoryStore };

/**
 * 管理工具：重置特定用户的速率限制
 */
export function resetRateLimit(identifier: string): void {
  memoryStore.reset(identifier);
}

/**
 * 管理工具：获取特定用户的当前计数
 */
export function getRateLimitCount(identifier: string): number {
  return memoryStore.getCount(identifier);
}

/**
 * 管理工具：清理所有过期记录
 */
export function cleanupExpiredRateLimits(): void {
  // 由内部定时器自动处理，这里暴露出来以便手动触发
  (memoryStore as any).cleanup();
}
