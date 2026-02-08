import { NextResponse, NextRequest } from 'next/server';

/**
 * 允许的源列表
 * 可以从环境变量中读取，或者使用默认值
 */
const ALLOWED_ORIGINS = [
  'http://localhost:5000',
  'http://localhost:3000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:3000',
  ...(process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || []),
  // 添加您的生产域名
  // 'https://yourdomain.com',
  // 'https://www.yourdomain.com',
  // 添加微信小程序域名
  // 'https://your-weixin-app.com',
];

/**
 * 允许的 HTTP 方法
 */
const ALLOWED_METHODS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'OPTIONS',
];

/**
 * 允许的请求头
 */
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
  'Access-Control-Request-Method',
  'Access-Control-Request-Headers',
];

/**
 * 暴露的响应头
 */
const EXPOSED_HEADERS = [
  'Content-Length',
  'Content-Type',
];

/**
 * CORS 配置选项
 */
export interface CORSOptions {
  /**
   * 自定义允许的源列表
   */
  origins?: string[];
  /**
   * 自定义允许的方法
   */
  methods?: string[];
  /**
   * 自定义允许的头
   */
  headers?: string[];
  /**
   * 是否允许凭证（cookies, authorization headers）
   */
  credentials?: boolean;
  /**
   * 预检请求缓存时间（秒）
   */
  maxAge?: number;
}

/**
 * 检查源是否被允许
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    // 允许没有 origin 的请求（如移动应用、Postman）
    return true;
  }
  
  // 如果 origin 在白名单中
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }
  
  // 如果环境变量中有额外的允许的源
  const additionalOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  if (additionalOrigins.includes(origin)) {
    return true;
  }
  
  return false;
}

/**
 * 获取 CORS 响应头
 */
export function getCORSHeaders(request: NextRequest, options: CORSOptions = {}): Record<string, string> {
  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {};
  
  // 检查源是否被允许
  if (isOriginAllowed(origin)) {
    // 如果是特定的允许的源，返回该源
    // 否则返回请求的源（允许所有）
    if (origin && (ALLOWED_ORIGINS.includes(origin) || (options.origins?.includes(origin)))) {
      headers['Access-Control-Allow-Origin'] = origin;
    } else {
      // 开发环境允许所有源
      if (process.env.NODE_ENV === 'development') {
        headers['Access-Control-Allow-Origin'] = origin || '*';
      }
    }
  } else {
    // 生产环境，如果源不在白名单中，不设置 Allow-Origin
    // 浏览器会阻止请求
  }
  
  // 允许的凭证
  if (options.credentials ?? true) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  // 允许的方法
  headers['Access-Control-Allow-Methods'] = (options.methods || ALLOWED_METHODS).join(', ');
  
  // 允许的头
  headers['Access-Control-Allow-Headers'] = (options.headers || ALLOWED_HEADERS).join(', ');
  
  // 暴露的头
  headers['Access-Control-Expose-Headers'] = EXPOSED_HEADERS.join(', ');
  
  // 预检请求缓存时间
  if (options.maxAge) {
    headers['Access-Control-Max-Age'] = options.maxAge.toString();
  }
  
  return headers;
}

/**
 * 处理 CORS 预检请求（OPTIONS）
 */
export function handleCORSOptions(request: NextRequest, options: CORSOptions = {}): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const headers = getCORSHeaders(request, options);
    return new NextResponse(null, { headers, status: 204 });
  }
  return null;
}

/**
 * 为响应添加 CORS 头
 */
export function addCORSHeaders(
  response: NextResponse,
  request: NextRequest,
  options: CORSOptions = {}
): NextResponse {
  const headers = getCORSHeaders(request, options);
  
  // 添加 CORS 头到响应
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  
  return response;
}

/**
 * 创建 CORS 中间件
 * 包装 API 处理函数，自动处理 CORS
 */
export function withCors<T = any>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  options: CORSOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    // 处理预检请求
    const preflightResponse = handleCORSOptions(request, options);
    if (preflightResponse) {
      return preflightResponse;
    }
    
    // 调用原始处理函数
    const response = await handler(request);
    
    // 添加 CORS 头
    return addCORSHeaders(response, request, options);
  };
}

/**
 * 创建带认证和 CORS 的中间件
 * 包装 API 处理函数，自动处理认证和 CORS
 */
import { withAuth } from './auth-middleware';
import { JWTPayload, UserRole } from './auth';

export function withAuthAndCors<T = any>(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse<T>>,
  options?: {
    requireRole?: UserRole;
    cors?: CORSOptions;
  }
) {
  return withCors(
    withAuth(handler, { requireRole: options?.requireRole }),
    options?.cors
  );
}

/**
 * 微信小程序 CORS 配置
 */
export function withWeChatCORS<T = any>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  allowedOrigin: string
) {
  return withCors(handler, {
    origins: [allowedOrigin],
    credentials: true,
  });
}
