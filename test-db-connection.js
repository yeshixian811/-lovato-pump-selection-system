/**
 * 腾讯云 PostgreSQL 连接测试脚本
 *
 * 用途：测试与腾讯云 PostgreSQL 数据库的连接
 * 运行：node test-db-connection.js
 */

const { Pool } = require('pg');

// 数据库配置
const config = {
  connectionString: 'postgresql://lovato_user:YEzi100243..@122.51.22.101:5432/lovato_pump',
  ssl: {
    rejectUnauthorized: false // 生产环境建议使用有效证书
  }
};

const pool = new Pool(config);

async function testConnection() {
  console.log('🔍 开始测试数据库连接...\n');
  console.log('📋 连接配置:');
  console.log(`  主机: 122.51.22.101`);
  console.log(`  端口: 5432`);
  console.log(`  数据库: lovato_pump`);
  console.log(`  用户: lovato_user\n`);

  try {
    // 测试 1: 连接数据库
    console.log('📡 测试 1: 连接数据库...');
    const client = await pool.connect();
    console.log('✅ 数据库连接成功！\n');

    // 测试 2: 查询当前时间
    console.log('📡 测试 2: 查询数据库时间...');
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('✅ 查询成功！');
    console.log(`  数据库时间: ${timeResult.rows[0].current_time}\n`);

    // 测试 3: 查询数据库版本
    console.log('📡 测试 3: 查询数据库版本...');
    const versionResult = await client.query('SELECT version() as version');
    console.log('✅ 查询成功！');
    console.log(`  数据库版本: ${versionResult.rows[0].version}\n`);

    // 测试 4: 查询所有表
    console.log('📡 测试 4: 查询所有表...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('✅ 查询成功！');
    console.log(`  表数量: ${tablesResult.rows.length}`);
    if (tablesResult.rows.length > 0) {
      console.log('  表列表:');
      tablesResult.rows.forEach((row, index) => {
        console.log(`    ${index + 1}. ${row.table_name}`);
      });
    } else {
      console.log('  ⚠️  数据库中暂无表，请运行数据库迁移脚本');
    }
    console.log();

    // 测试 5: 测试连接池
    console.log('📡 测试 5: 测试连接池信息...');
    const poolInfo = {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    };
    console.log('✅ 查询成功！');
    console.log(`  总连接数: ${poolInfo.totalCount}`);
    console.log(`  空闲连接数: ${poolInfo.idleCount}`);
    console.log(`  等待连接数: ${poolInfo.waitingCount}\n`);

    client.release();
    console.log('🎉 所有测试通过！数据库连接正常。');

  } catch (error) {
    console.error('\n❌ 数据库连接测试失败！');
    console.error(`\n错误信息: ${error.message}`);
    console.error(`\n错误代码: ${error.code || 'N/A'}`);
    console.error(`\n详细错误:`);
    console.error(error);

    console.error('\n💡 可能的原因:');
    if (error.code === 'ECONNREFUSED') {
      console.error('  - 数据库服务器未启动或端口配置错误');
      console.error('  - 检查主机地址 122.51.22.101 是否正确');
      console.error('  - 检查端口 5432 是否开放');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('  - 连接超时');
      console.error('  - 检查网络连接是否正常');
      console.error('  - 检查防火墙或安全组配置');
    } else if (error.code === '3D000') {
      console.error('  - 数据库不存在');
      console.error('  - 检查数据库名 "lovato_pump" 是否正确');
    } else if (error.code === '28P01') {
      console.error('  - 认证失败');
      console.error('  - 检查用户名 "lovato_user" 是否正确');
      console.error('  - 检查密码是否正确');
    } else if (error.code === '28000') {
      console.error('  - 权限不足');
      console.error('  - 检查用户是否有访问数据库的权限');
    }

    console.error('\n🔧 解决方案:');
    console.error('  1. 检查腾讯云 PostgreSQL 控制台，确认实例状态');
    console.error('  2. 检查安全组配置，确保 Vercel IP 已添加到白名单');
    console.error('  3. 检查用户权限和密码');
    console.error('  4. 联系腾讯云技术支持');

  } finally {
    await pool.end();
    console.log('\n📡 连接池已关闭');
    process.exit(0);
  }
}

// 运行测试
testConnection();
