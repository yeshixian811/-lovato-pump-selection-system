import { eq, and, SQL } from "drizzle-orm";
import { getDb } from "coze-coding-dev-sdk";
import { users, emailVerifications, passwordResets } from "./shared/schema";
import type { User, InsertUser } from "./shared/schema";

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name?: string;
  role?: 'user' | 'admin';
  subscriptionTier?: string;
  subscriptionStatus?: string;
}

export class UserManager {
  /**
   * 创建用户
   */
  async createUser(data: CreateUserInput): Promise<User> {
    const db = await getDb();
    const [user] = await db.insert(users).values({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name || data.email.split('@')[0],
      role: data.role || 'user',
      subscriptionTier: data.subscriptionTier || 'free',
      subscriptionStatus: data.subscriptionStatus || 'active',
    }).returning();
    return user;
  }

  /**
   * 根据邮箱获取用户
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user || null;
  }

  /**
   * 根据ID获取用户
   */
  async getUserById(id: string): Promise<User | null> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  /**
   * 创建邮箱验证token
   */
  async createEmailVerification(userId: string, token: string, expiresAt: Date): Promise<void> {
    const db = await getDb();
    await db.insert(emailVerifications).values({
      userId,
      token,
      expiresAt,
    });
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const db = await getDb();
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }
}

export const userManager = new UserManager();
