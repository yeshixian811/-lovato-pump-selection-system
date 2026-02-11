import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';

const execAsync = promisify(exec);

/**
 * 获取系统资源统计信息
 */
export async function GET() {
  try {
    // 获取 CPU 使用率（Linux）
    let cpuUsage = 0;
    try {
      const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'");
      cpuUsage = parseFloat(stdout.trim()) || 0;
    } catch {
      cpuUsage = 0;
    }

    // 获取内存使用情况
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = (usedMem / totalMem) * 100;

    // 获取磁盘使用情况
    let diskUsage = 0;
    let diskTotal = 0;
    let diskUsed = 0;
    try {
      const { stdout } = await execAsync("df -h / | tail -1 | awk '{print $2,$3,$5}'");
      const parts = stdout.trim().split(' ');
      if (parts.length >= 3) {
        diskTotal = parts[0] || '0';
        diskUsed = parts[1] || '0';
        diskUsage = parseFloat(parts[2].replace('%', '')) || 0;
      }
    } catch {
      diskUsage = 0;
    }

    // 获取系统负载
    const loadAverage = os.loadavg();

    // 获取运行时间
    const uptime = os.uptime();

    // 获取 Docker 资源使用
    let dockerStats = [];
    try {
      const { stdout } = await execAsync('docker stats --no-stream --format "json"');
      dockerStats = stdout.trim().split('\n').filter(Boolean).map(line => {
        try {
          const stats = JSON.parse(line);
          return {
            name: stats.Name,
            cpu: stats.CPUPerc.replace('%', ''),
            memory: stats.MemUsage,
            memoryPercent: stats.MemPerc.replace('%', ''),
          };
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch {
      dockerStats = [];
    }

    return NextResponse.json({
      success: true,
      system: {
        cpu: {
          usage: Math.round(cpuUsage * 100) / 100,
          cores: os.cpus().length,
        },
        memory: {
          total: Math.round(totalMem / 1024 / 1024 / 1024 * 100) / 100, // GB
          used: Math.round(usedMem / 1024 / 1024 / 1024 * 100) / 100, // GB
          free: Math.round(freeMem / 1024 / 1024 / 1024 * 100) / 100, // GB
          usage: Math.round(memoryUsage * 100) / 100,
        },
        disk: {
          total: diskTotal,
          used: diskUsed,
          usage: diskUsage,
        },
        load: loadAverage,
        uptime: Math.floor(uptime),
        uptimeFormatted: formatUptime(uptime),
      },
      docker: dockerStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取系统统计信息失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取系统统计信息失败',
      },
      { status: 500 }
    );
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
}
