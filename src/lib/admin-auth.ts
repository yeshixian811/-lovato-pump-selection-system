import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userManager } from '@/storage/database/userManager';

/**
 * 验证管理员权限的中间件
 */
export async function verifyAdminAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    // 验证token
    const decoded = await verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Token无效' },
        { status: 401 }
      );
    }

    // 获取用户信息
    const user = await userManager.getUserById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查是否为管理员
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }

    // 返回用户信息供后续使用
    return user;
  } catch (error) {
    console.error('验证管理员权限错误:', error);
    return NextResponse.json(
      { error: '验证失败' },
      { status: 500 }
    );
  }
}
