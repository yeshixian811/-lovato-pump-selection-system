import { Pool } from 'pg'

/**
 * 从 DATABASE_URL 解析数据库配置
 */
function parseDatabaseUrl(url: string): {
  host: string
  port: number
  user: string
  password: string
  database: string
} {
  try {
    const parsed = new URL(url)
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 5432,
      user: parsed.username,
      password: parsed.password,
      database: parsed.pathname.slice(1), // 移除开头的 /
    }
  } catch (error) {
    console.error('解析 DATABASE_URL 失败:', error)
    throw error
  }
}

/**
 * 获取数据库配置
 * 优先使用 DATABASE_URL，否则使用单独的环境变量
 */
function getDatabaseConfig() {
  // 如果提供了 DATABASE_URL，优先使用它
  if (process.env.DATABASE_URL) {
    return parseDatabaseUrl(process.env.DATABASE_URL)
  }

  // 否则使用单独的环境变量
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'lovato_pump', // 默认使用 lovato_pump
  }
}

const config = getDatabaseConfig()

console.log('数据库配置:', {
  host: config.host,
  port: config.port,
  user: config.user,
  database: config.database,
})

const pool = new Pool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  // 连接池配置
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// 监听连接错误
pool.on('error', (err) => {
  console.error('数据库连接池错误:', err)
})

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
}

export default pool

/**
 * 测试数据库连接
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    client.release()
    console.log('数据库连接测试成功:', result.rows[0])
    return true
  } catch (error) {
    console.error('数据库连接测试失败:', error)
    return false
  }
}
