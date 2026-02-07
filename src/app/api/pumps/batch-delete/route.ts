import { NextRequest, NextResponse } from "next/server";
import { getDb } from "coze-coding-dev-sdk";
import { pumps } from "@/storage/database/shared/schema";
import * as schema from "@/storage/database/shared/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/pumps/batch-delete - 批量删除水泵
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "请提供要删除的产品ID列表" },
        { status: 400 }
      );
    }

    const db = await getDb(schema);

    // 批量删除
    for (const id of ids) {
      await db.delete(pumps).where(eq(pumps.id, id));
    }

    return NextResponse.json({
      success: true,
      deleted: ids.length,
      message: `成功删除 ${ids.length} 个产品`,
    });
  } catch (error: any) {
    console.error("Batch delete error:", error);
    return NextResponse.json(
      { error: error.message || "批量删除失败" },
      { status: 500 }
    );
  }
}
