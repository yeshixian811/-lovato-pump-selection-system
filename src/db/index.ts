import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 从环境变量获取数据库连接字符串
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is not set');
}

// 创建PostgreSQL连接
const client = postgres(connectionString, {
  max: 10, // 最大连接数
  idle_timeout: 20,
  connect_timeout: 10,
});

// 创建Drizzle实例
export const db = drizzle(client, { schema });

// 数据库schema
export * from './schema/users';
export * from './schema/subscriptions';
