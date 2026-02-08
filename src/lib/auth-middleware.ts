import { NextResponse } from 'next/server';
import type { Request } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload, hasPermission, UserRole } from './auth';

/**
 * 认证错误类型
 */
export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * 权限错误类型
 */
export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

/**
 * 扩展的 Request 类型，包含用户信息
 */
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

/**
 * 认证中间件
 * 验证 JWT 令牌并将用户信息附加到请求中
 */
export async function requireAuth(request: Request): Promise<JWTPayload> {
  const authorization = request.headers.get('authorization');
  const token = extractTokenFromHeader(authorization);
  
  if (!token) {
    throw new AuthError('Unauthorized: No token provided', 401);
  }
  
  try {
    const payload = await verifyToken(token);
    return payload;
  } catch (error) {
    throw new AuthError('Unauthorized: Invalid or expired token', 401);
  }
}

/**
 * 权限中间件
 * 检查用户是否具有所需的权限
 */
export function requireRole(requiredRole: UserRole) {
  return function (user: JWTPayload) {
    if (!hasPermission(user.role, requiredRole)) {
      throw new PermissionError(`Forbidden: User does not have required role (${requiredRole})`);
    }
  };
}

/**
 * 创建认证错误响应
 */
export function createAuthErrorResponse(error: AuthError | PermissionError): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  } else if (error instanceof PermissionError) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

/**
 * 包装 API 处理函数，自动添加认证
 */
export function withAuth<T = any>(
  handler: (request: Request, user: JWTPayload) => Promise<NextResponse<T>>,
  options?: { requireRole?: UserRole }
) {
  return async (request: Request): Promise<NextResponse<T>> => {
    try {
      // 验证认证
      const user = await requireAuth(request);
      
      // 验证权限（如果需要）
      if (options?.requireRole) {
        requireRole(options.requireRole)(user);
      }
      
      // 调用原始处理函数
      return await handler(request, user);
    } catch (error) {
      if (error instanceof AuthError || error instanceof PermissionError) {
        return createAuthErrorResponse(error);
      }
      
      // 其他错误
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * 可选认证中间件
 * 如果提供了令牌则验证，否则继续执行
 */
export async function optionalAuth(request: Request): Promise<JWTPayload | null> {
  const authorization = request.headers.get('authorization');
  const token = extractTokenFromHeader(authorization);
  
  if (!token) {
    return null;
  }
  
  try {
    return await verifyToken(token);
  } catch (error) {
    return null;
  }
}

/**
 * 包装 API 处理函数，支持可选认证
 */
export function withOptionalAuth<T = any>(
  handler: (request: Request, user: JWTPayload | null) => Promise<NextResponse<T>>
) {
  return async (request: Request): Promise<NextResponse<T>> => {
    const user = await optionalAuth(request);
    return await handler(request, user);
  };
}
