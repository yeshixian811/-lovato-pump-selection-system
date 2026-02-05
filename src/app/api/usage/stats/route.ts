import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { usageStats } from '@/db/schema';
import { db } from '@/db';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    // 获取使用统计
    const [stats] = await db
      .select()
      .from(usageStats)
      .where(eq(usageStats.userId, user.id))
      .limit(1);

    let selectionsThisMonth = 0;
    let maxSelections = user.subscriptionTier === 'free' ? 10 : Infinity;
    let lastResetDate = new Date();

    if (stats) {
      const now = new Date();
      const resetDate = new Date(stats.lastResetDate);

      // 检查是否需要重置计数器
      if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
        // 新月份，重置计数器
        await db
          .update(usageStats)
          .set({
            selectionCount: 0,
            lastResetDate: now,
            updatedAt: now,
          })
          .where(eq(usageStats.userId, user.id));

        selectionsThisMonth = 0;
        lastResetDate = now;
      } else {
        selectionsThisMonth = stats.selectionCount;
        lastResetDate = resetDate;
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        selectionsThisMonth,
        maxSelections,
        lastResetDate,
      },
    });
  } catch (error) {
    console.error('获取使用统计错误:', error);
    return NextResponse.json(
      { error: '获取使用统计失败' },
      { status: 500 }
    );
  }
}
