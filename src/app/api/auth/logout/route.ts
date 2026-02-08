import { NextRequest, NextResponse } from 'next/server';
import { clearToken } from '@/lib/api';

/**
 * 用户登出 API
 */
export async function POST(request: NextRequest) {
  try {
    // 清除客户端 Token
    clearToken();

    // 创建响应
    const response = NextResponse.json({
      success: true,
      message: '登出成功',
    });

    // 清除 Cookie
    response.cookies.delete('auth_token');

    return response;
  } catch (error) {
    console.error('登出失败:', error);
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    );
  }
}
