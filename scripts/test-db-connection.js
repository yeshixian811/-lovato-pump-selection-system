#!/usr/bin/env node

/**
 * 腾讯云轻量数据库连接测试脚本
 * 测试数据库连接和基本操作
 */

const { Client } = require('pg');

// 数据库配置（腾讯云轻量数据库）
const DB_CONFIG = {
  host: '122.51.22.101',
  port: 5433,
  database: 'mydb',
  user: 'admin',
  password: 'Tencent@123',
  connectionTimeoutMillis: 10000,
};

async function testConnection() {
  const client = new Client(DB_CONFIG);

  console.log('==========================================');
  console.log('腾讯云轻量数据库连接测试');
  console.log('==========================================');
  console.log('');
  console.log('数据库配置:');
  console.log(`  地址: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`  数据库: ${DB_CONFIG.database}`);
  console.log(`  用户: ${DB_CONFIG.user}`);
  console.log('');

  try {
    // 1. 测试连接
    console.log('步骤 1: 测试数据库连接...');
    await client.connect();
    console.log('✅ 数据库连接成功\n');

    // 2. 查询数据库版本
    console.log('步骤 2: 查询数据库版本...');
    const versionResult = await client.query('SELECT version()');
    console.log('✅ 数据库版本:', versionResult.rows[0].version.split(',')[0], '\n');

    // 3. 检查表是否存在
    console.log('步骤 3: 检查表是否存在...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log('✅ 找到以下表:');
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
      console.log('');
    } else {
      console.log('⚠️  数据库中还没有表，需要运行数据库迁移\n');
    }

    // 4. 测试查询性能
    console.log('步骤 4: 测试查询性能...');
    const startTime = Date.now();
    await client.query('SELECT NOW()');
    const latency = Date.now() - startTime;
    console.log(`✅ 查询延迟: ${latency}ms\n`);

    // 5. 检查连接池配置
    console.log('步骤 5: 连接信息:');
    const pidResult = await client.query('SELECT pg_backend_pid()');
    console.log(`  当前进程 ID: ${pidResult.rows[0].pg_backend_pid}`);
    console.log(`  连接超时: ${DB_CONFIG.connectionTimeoutMillis}ms\n`);

    console.log('==========================================');
    console.log('✅ 所有测试通过！');
    console.log('==========================================');
    console.log('');
    console.log('数据库连接配置正确，可以继续部署。');

  } catch (error) {
    console.error('==========================================');
    console.error('❌ 数据库连接失败！');
    console.error('==========================================');
    console.error('');
    console.error('错误信息:', error.message);
    console.error('');
    console.error('请检查:');
    console.error('1. 数据库地址是否正确: 122.51.22.101:5433');
    console.error('2. 用户名和密码是否正确: admin / Tencent@123');
    console.error('3. 数据库是否已启动: mydb');
    console.error('4. 防火墙是否开放 5433 端口');
    console.error('');
    process.exit(1);
  } finally {
    await client.end();
  }
}

// 执行测试
testConnection().catch(error => {
  console.error('测试脚本执行失败:', error);
  process.exit(1);
});
