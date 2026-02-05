import { getDb } from "coze-coding-dev-sdk";
import { users } from "./shared/schema";
import { sql, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function createSuperAdmin() {
  try {
    const db = await getDb();

    // 检查是否已存在超级管理员
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@lovato.com'))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("超级管理员已存在，跳过创建");
      return;
    }

    // 生成密码哈希（密码：admin123）
    const passwordHash = await bcrypt.hash("admin123", 10);

    // 创建超级管理员
    const [admin] = await db.insert(users).values({
      email: "admin@lovato.com",
      passwordHash,
      name: "超级管理员",
      role: "admin",
      subscriptionTier: "enterprise",
      subscriptionStatus: "active",
      emailVerified: true,
    }).returning();

    console.log("✅ 超级管理员创建成功！");
    console.log("邮箱：admin@lovato.com");
    console.log("密码：admin123");
    console.log("用户ID：", admin.id);
  } catch (error) {
    console.error("创建超级管理员失败：", error);
  }
}

createSuperAdmin();
