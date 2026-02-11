import { NextResponse } from 'next/server';

/**
 * 健康检查端点
 * 用于 Docker 健康检查和负载均衡
 */
export async function GET() {
  try {
    // 检查数据库连接
    let dbStatus = 'disconnected';
    try {
      const { getDb } = await import('@/storage/database');
      const { pumps } = await import('@/storage/database/shared/schema');
      const db = await getDb();

      // 执行简单查询测试连接
      await db.select().from(pumps).limit(1);
      dbStatus = 'connected';
    } catch (error) {
      console.error('数据库连接测试失败:', error);
    }

    // 检查系统状态
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      database: dbStatus,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
