import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 重启容器
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { container } = body;

    if (!container) {
      return NextResponse.json(
        { success: false, error: '缺少容器名称' },
        { status: 400 }
      );
    }

    // 执行重启命令
    const { stdout, stderr } = await execAsync(`docker restart ${container}`);

    if (stderr && !stdout) {
      throw new Error(stderr);
    }

    return NextResponse.json({
      success: true,
      message: `容器 ${container} 重启成功`,
      container,
      output: stdout,
    });
  } catch (error) {
    console.error('重启容器失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '重启容器失败',
      },
      { status: 500 }
    );
  }
}
