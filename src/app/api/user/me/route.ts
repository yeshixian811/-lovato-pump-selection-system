import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userManager } from '@/storage/database/userManager';

export async function GET(request: NextRequest) {
  try {
    // 尝试从Cookie获取token
    let token = request.cookies.get('auth_token')?.value;

    // 如果Cookie中没有，尝试从Authorization header获取
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    console.log('认证检查 - Token:', token ? '存在' : '不存在');

    if (!token) {
      console.log('认证检查失败: 未找到token');
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    console.log('认证检查 - 开始验证token...');
    // 验证token
    const decoded = await verifyToken(token);
    console.log('认证检查 - Token验证结果:', decoded ? '成功' : '失败');
    
    if (!decoded || !decoded.userId) {
      console.log('认证检查失败: Token无效或没有userId');
      return NextResponse.json(
        { error: 'Token无效' },
        { status: 401 }
      );
    }

    console.log('认证检查 - 获取用户信息, userId:', decoded.userId);
    // 获取用户信息
    const user = await userManager.getUserById(decoded.userId);
    
    if (!user) {
      console.log('认证检查失败: 用户不存在');
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    console.log('认证检查成功: 用户角色 =', user.role);
    // 返回用户信息（不包含密码）
    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
