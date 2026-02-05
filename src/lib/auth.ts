import { cookies } from 'next/headers';
import { userManager } from '@/storage/database/userManager';
import { jwtVerify, SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// JWT payload 类型
export interface JWTPayload {
  userId: string;
  email: string;
  subscriptionTier: string;
  role: string;
}

// 创建 JWT token
export async function createToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);

  return token;
}

// 验证 JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
}

// 获取当前用户
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return null;
  }

  // 检查用户是否仍然有效
  const user = await userManager.getUserById(payload.userId);

  if (!user) {
    return null;
  }

  return user;
}

// 检查用户权限
export async function checkPermission(requiredTier: string = 'free'): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const tierPriority = {
    free: 0,
    basic: 1,
    pro: 2,
    enterprise: 3,
  };

  const userPriority = tierPriority[user.subscriptionTier as keyof typeof tierPriority] || 0;
  const requiredPriority = tierPriority[requiredTier as keyof typeof tierPriority] || 0;

  return userPriority >= requiredPriority;
}

// 检查管理员权限
export async function checkAdmin(): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  return user.role === 'admin';
}
