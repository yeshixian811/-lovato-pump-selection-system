import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/db';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'pass' | 'fail';
      responseTime?: number;
      message?: string;
    };
    memory: {
      status: 'pass' | 'fail';
      usage: {
        used: number;
        total: number;
        percentage: number;
      };
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: {
        status: 'fail',
      },
      memory: {
        status: 'pass',
        usage: {
          used: 0,
          total: 0,
          percentage: 0,
        },
      },
    },
  };

  // 检查数据库连接
  try {
    const dbStartTime = Date.now();
    const dbConnected = await testDatabaseConnection();
    const dbResponseTime = Date.now() - dbStartTime;

    if (dbConnected) {
      healthStatus.checks.database = {
        status: 'pass',
        responseTime: dbResponseTime,
        message: 'Database connection successful',
      };
    } else {
      healthStatus.checks.database = {
        status: 'fail',
        message: 'Database connection failed',
      };
      healthStatus.status = 'unhealthy';
    }
  } catch (error: any) {
    healthStatus.checks.database = {
      status: 'fail',
      message: error.message || 'Database error',
    };
    healthStatus.status = 'unhealthy';
  }

  // 检查内存使用情况
  try {
    const usedMemory = process.memoryUsage();
    const totalMemory = usedMemory.heapTotal;
    const usedMemoryMB = usedMemory.heapUsed / 1024 / 1024;
    const totalMemoryMB = totalMemory / 1024 / 1024;
    const memoryPercentage = (usedMemory.heapUsed / totalMemory) * 100;

    healthStatus.checks.memory = {
      status: memoryPercentage > 90 ? 'fail' : 'pass',
      usage: {
        used: Math.round(usedMemoryMB * 100) / 100,
        total: Math.round(totalMemoryMB * 100) / 100,
        percentage: Math.round(memoryPercentage * 100) / 100,
      },
    };

    if (memoryPercentage > 90) {
      healthStatus.status = 'degraded';
    }
  } catch (error) {
    healthStatus.checks.memory = {
      status: 'fail',
      usage: {
        used: 0,
        total: 0,
        percentage: 0,
      },
    };
    healthStatus.status = 'degraded';
  }

  // 计算总响应时间
  const totalResponseTime = Date.now() - startTime;

  // 返回健康状态
  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

  return NextResponse.json(healthStatus, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Response-Time': `${totalResponseTime}ms`,
    },
  });
}
