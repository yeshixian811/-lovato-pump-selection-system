import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

const ALGORITHM = 'HS256';
const ACCESS_TOKEN_EXPIRY = '1h'; // 访问令牌有效期 1 小时
const REFRESH_TOKEN_EXPIRY = '7d'; // 刷新令牌有效期 7 天

/**
 * 用户角色类型
 */
export type UserRole = 'admin' | 'manager' | 'user';

/**
 * 订阅等级类型
 */
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

/**
 * JWT 载荷类型
 */
export interface JWTPayload {
  userId: string;
  username?: string;
  email?: string;
  role: UserRole;
  subscriptionTier?: SubscriptionTier;
  iat?: number;
  exp?: number;
}

/**
 * 生成访问令牌
 */
export async function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * 生成刷新令牌
 */
export async function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * 创建令牌（兼容现有登录 API）
 */
export async function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * 验证令牌
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * 哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * 从请求头中提取令牌
 */
export function extractTokenFromHeader(authorization: string | null): string | null {
  if (!authorization) return null;
  
  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * 检查用户权限
 */
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    manager: 2,
    user: 1,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
