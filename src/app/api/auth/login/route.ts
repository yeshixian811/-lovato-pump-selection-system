import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码为必填项' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await userManager.getUserByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 创建JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
      role: user.role,
    });

    // 返回用户信息（不包含密码）
    const { passwordHash: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: '登录成功',
    });

    // 设置cookie
    response.cookies.set('auth_token', token, {
      httpOnly: false, // 允许JavaScript访问（调试用）
      secure: false, // 开发环境允许HTTP
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
      domain: undefined, // 不设置domain，使用当前域
    });

    return response;
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
