import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

/**
 * POST /api/versions/init - 初始化版本管理数据库表
 */
export async function POST() {
  try {
    const db = await getDb();

    // 创建 versions 表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS versions (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        version_number INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        is_current BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS versions_version_number_idx ON versions(version_number);
      CREATE INDEX IF NOT EXISTS versions_is_current_idx ON versions(is_current);
    `);
    console.log('✓ versions 表创建成功');

    // 创建 version_files 表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS version_files (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        version_id VARCHAR(36) NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
        file_path VARCHAR(500) NOT NULL,
        file_content TEXT NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS version_files_version_id_idx ON version_files(version_id);
      CREATE INDEX IF NOT EXISTS version_files_file_path_idx ON version_files(file_path);
      CREATE INDEX IF NOT EXISTS version_files_unique_idx ON version_files(version_id, file_path);
    `);
    console.log('✓ version_files 表创建成功');

    // 创建 version_changes 表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS version_changes (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        version_id VARCHAR(36) NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        target_path VARCHAR(500) NOT NULL,
        change_description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS version_changes_version_id_idx ON version_changes(version_id);
    `);
    console.log('✓ version_changes 表创建成功');

    return NextResponse.json({
      success: true,
      message: '版本管理数据库表初始化成功',
    });
  } catch (error: any) {
    console.error('Initialize version database error:', error);
    return NextResponse.json(
      {
        error: error.message || '初始化失败',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
