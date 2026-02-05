import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { getDb } from "coze-coding-dev-sdk";
import { users, subscriptions } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

// 获取用户列表（仅管理员）
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAdminAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const db = await getDb();
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        subscriptionTier: users.subscriptionTier,
        subscriptionStatus: users.subscriptionStatus,
        subscriptionStartDate: users.subscriptionStartDate,
        subscriptionEndDate: users.subscriptionEndDate,
      })
      .from(users)
      .orderBy(users.createdAt);

    return NextResponse.json({ users: userList });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 });
  }
}
