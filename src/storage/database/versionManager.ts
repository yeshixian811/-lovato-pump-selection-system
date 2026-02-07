import { eq, desc, and, sql } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import {
  versions,
  versionFiles,
  versionChanges,
  insertVersionSchema,
  insertVersionFileSchema,
  insertVersionChangeSchema,
  type Version,
  type InsertVersion,
  type VersionFile,
  type InsertVersionFile,
  type VersionChange,
} from "./shared/schema";
import * as schema from "./shared/schema";
import fs from 'fs';
import path from 'path';

export class VersionManager {
  /**
   * 获取数据库连接
   */
  private async getDb() {
    return getDb(schema);
  }

  /**
   * 创建新版本
   * @param name 版本名称
   * @param description 版本描述
   * @param filesToBackup 需要备份的文件路径列表
   * @param createdBy 创建者
   */
  async createVersion(
    name: string,
    description: string,
    filesToBackup: string[],
    createdBy: string = 'system'
  ): Promise<Version> {
    // 获取当前最大版本号
    const db = await this.getDb();
    const [latestVersion] = await db
      .select({ maxNum: sql<number>`MAX(version_number)` })
      .from(versions);

    const nextVersionNumber = (latestVersion?.maxNum || 0) + 1;

    // 创建新版本
    const newVersion: InsertVersion = {
      name,
      description,
      createdBy,
      status: 'active',
      isCurrent: false,
    };

    const [createdVersion] = await db
      .insert(versions)
      .values({
        ...newVersion,
        versionNumber: nextVersionNumber,
      })
      .returning();

    // 备份文件
    for (const filePath of filesToBackup) {
      await this.backupFile(createdVersion.id, filePath);
    }

    // 标记为当前版本
    await this.setCurrentVersion(createdVersion.id);

    return createdVersion;
  }

  /**
   * 备份文件到版本
   */
  private async backupFile(versionId: string, filePath: string): Promise<void> {
    try {
      // 使用 Node.js fs 读取文件内容
      const fullPath = path.join(process.cwd(), filePath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const fileType = this.getFileType(filePath);

      const versionFile: InsertVersionFile = {
        versionId,
        filePath,
        fileContent: content,
        fileType,
      };

      const db = await this.getDb();
      await db.insert(versionFiles).values(versionFile);

      // 记录修改
      await this.recordChange(versionId, 'create', filePath, '备份文件');
    } catch (error) {
      console.error(`Failed to backup file ${filePath}:`, error);
    }
  }

  /**
   * 获取文件类型
   */
  private getFileType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const typeMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'react',
      'js': 'javascript',
      'jsx': 'react',
      'json': 'json',
      'css': 'css',
      'scss': 'scss',
      'md': 'markdown',
      'html': 'html',
      'xml': 'xml',
      'toml': 'toml',
      'yaml': 'yaml',
      'yml': 'yaml',
    };
    return typeMap[ext] || 'text';
  }

  /**
   * 记录版本修改
   */
  private async recordChange(
    versionId: string,
    action: string,
    targetPath: string,
    description?: string
  ): Promise<void> {
    const change = {
      versionId,
      action,
      targetPath,
      changeDescription: description || '',
    };
    const db = await this.getDb();
    await db.insert(versionChanges).values(change);
  }

  /**
   * 获取所有版本
   */
  async getAllVersions(): Promise<Version[]> {
    const db = await this.getDb();
    return db
      .select()
      .from(versions)
      .orderBy(desc(versions.versionNumber));
  }

  /**
   * 获取当前版本
   */
  async getCurrentVersion(): Promise<Version | null> {
    const db = await this.getDb();
    const [current] = await db
      .select()
      .from(versions)
      .where(eq(versions.isCurrent, true))
      .limit(1);
    return current || null;
  }

  /**
   * 获取版本详情（包含文件列表）
   */
  async getVersionWithFiles(versionId: string): Promise<{
    version: Version;
    files: VersionFile[];
    changes: VersionChange[];
  } | null> {
    const db = await this.getDb();
    const [version] = await db
      .select()
      .from(versions)
      .where(eq(versions.id, versionId))
      .limit(1);

    if (!version) return null;

    const files = await db
      .select()
      .from(versionFiles)
      .where(eq(versionFiles.versionId, versionId));

    const changes = await db
      .select()
      .from(versionChanges)
      .where(eq(versionChanges.versionId, versionId))
      .orderBy(desc(versionChanges.createdAt));

    return { version, files, changes };
  }

  /**
   * 设置当前版本
   */
  async setCurrentVersion(versionId: string): Promise<void> {
    const db = await this.getDb();
    // 取消所有版本的当前标记
    await db
      .update(versions)
      .set({ isCurrent: false })
      .where(eq(versions.isCurrent, true));

    // 设置指定版本为当前版本
    await db
      .update(versions)
      .set({ isCurrent: true })
      .where(eq(versions.id, versionId));
  }

  /**
   * 回滚到指定版本
   * @param versionId 要回滚的版本ID
   */
  async rollbackToVersion(versionId: string): Promise<void> {
    const versionData = await this.getVersionWithFiles(versionId);
    if (!versionData) {
      throw new Error('Version not found');
    }

    // 创建新的回滚版本
    const newVersion = await this.createVersion(
      `Rollback to v${versionData.version.versionNumber}`,
      `回滚到版本 ${versionData.version.name}`,
      versionData.files.map(f => f.filePath),
      'system'
    );

    // 将文件内容恢复
    const db = await this.getDb();
    for (const file of versionData.files) {
      await db
        .insert(versionFiles)
        .values({
          versionId: newVersion.id,
          filePath: file.filePath,
          fileContent: file.fileContent,
          fileType: file.fileType,
        });
    }
  }

  /**
   * 删除版本
   */
  async deleteVersion(versionId: string): Promise<void> {
    const db = await this.getDb();
    await db
      .delete(versions)
      .where(eq(versions.id, versionId));
  }

  /**
   * 获取版本文件内容
   */
  async getVersionFileContent(versionId: string, filePath: string): Promise<string | null> {
    const db = await this.getDb();
    const [file] = await db
      .select()
      .from(versionFiles)
      .where(
        and(
          eq(versionFiles.versionId, versionId),
          eq(versionFiles.filePath, filePath)
        )
      )
      .limit(1);

    return file?.fileContent || null;
  }

  /**
   * 自动备份关键文件
   * 每次调用时创建一个快照版本
   */
  async autoBackup(description: string, changedFiles: string[] = []): Promise<Version> {
    // 默认备份的关键文件
    const defaultFiles = [
      'src/app/selection/page.tsx',
      'src/app/page.tsx',
      'src/app/api/pump/match/route.ts',
      'src/storage/database/schema.ts',
    ];

    const filesToBackup = changedFiles.length > 0 ? changedFiles : defaultFiles;

    return this.createVersion(
      `Auto Backup ${new Date().toLocaleString('zh-CN')}`,
      description,
      filesToBackup,
      'auto'
    );
  }

  /**
   * 初始化版本系统（创建第一个版本）
   */
  async initialize(): Promise<Version | null> {
    const existingVersions = await this.getAllVersions();
    if (existingVersions.length > 0) {
      return existingVersions[0];
    }

    // 查找需要备份的文件
    const filesToBackup: string[] = [];
    const patterns = [
      'src/app/**/*.tsx',
      'src/app/**/*.ts',
      'src/components/**/*.tsx',
      'src/lib/**/*.ts',
    ];

    // 使用 glob_file 查找文件（这里简化处理，直接备份关键文件）
    filesToBackup.push(
      'src/app/page.tsx',
      'src/app/selection/page.tsx',
      'src/app/api/pump/match/route.ts'
    );

    return this.createVersion(
      'Initial Version',
      '系统初始化版本',
      filesToBackup,
      'system'
    );
  }
}

export const versionManager = new VersionManager();
