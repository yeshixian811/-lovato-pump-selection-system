import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 获取数据库连接状态
 */
export async function GET() {
  try {
    const dbConfig = {
      host: '122.51.22.101',
      port: 5433,
      user: 'admin',
      database: 'mydb',
    };

    // 使用 nc 检查端口
    let portOpen = false;
    try {
      await execAsync(`nc -z -w5 ${dbConfig.host} ${dbConfig.port}`);
      portOpen = true;
    } catch {
      portOpen = false;
    }

    // 使用 psql 查询数据库状态（如果可用）
    let dbStatus = 'disconnected';
    let tableCount = 0;
    let connectionTime = 0;

    if (portOpen) {
      try {
        const startTime = Date.now();
        await execAsync(`PGPASSWORD='Tencent@123' psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -c "SELECT 1;"`);
        connectionTime = Date.now() - startTime;
        dbStatus = 'connected';

        // 查询表数量
        const { stdout } = await execAsync(`PGPASSWORD='Tencent@123' psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"`);
        tableCount = parseInt(stdout.trim()) || 0;
      } catch (error) {
        console.error('数据库查询失败:', error);
        dbStatus = 'error';
      }
    }

    // 检查数据库容器状态
    let containerStatus = 'not-found';
    try {
      const { stdout } = await execAsync('docker ps -a --filter "name=postgres15-docker" --format "{{.Status}}"');
      if (stdout.trim()) {
        containerStatus = stdout.trim();
      }
    } catch {
      containerStatus = 'not-found';
    }

    return NextResponse.json({
      success: true,
      database: {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database,
        status: dbStatus,
        portOpen,
        tableCount,
        connectionTime,
        containerStatus,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取数据库状态失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取数据库状态失败',
      },
      { status: 500 }
    );
  }
}
