import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 获取 Docker 容器状态
 */
export async function GET() {
  try {
    const { stdout, stderr } = await execAsync('docker ps --format "json"');

    if (stderr && !stdout) {
      throw new Error(stderr);
    }

    const containers = stdout.trim().split('\n').filter(Boolean).map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);

    // 获取所有容器（包括停止的）
    const { stdout: allStdout } = await execAsync('docker ps -a --format "json"');
    const allContainers = allStdout.trim().split('\n').filter(Boolean).map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      running: containers,
      all: allContainers,
      total: allContainers.length,
      runningCount: containers.length,
      stoppedCount: allContainers.length - containers.length,
    });
  } catch (error) {
    console.error('获取容器状态失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取容器状态失败',
      },
      { status: 500 }
    );
  }
}
