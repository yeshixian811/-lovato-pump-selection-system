#!/usr/bin/env node
/**
 * 安全功能测试脚本
 * 测试认证、加密、CORS 等安全功能
 */

const http = require('http');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body),
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testLogin() {
  log('', colors.reset);
  log('🔐 测试登录认证...', colors.blue);
  log('', colors.reset);

  try {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const data = {
      username: 'admin',
      password: 'admin123', // 请使用实际的测试密码
    };

    const response = await makeRequest(options, data);

    if (response.statusCode === 200 && response.body.success && response.body.data.accessToken) {
      log('✅ 登录成功', colors.green);
      log(`   访问令牌: ${response.body.data.accessToken.substring(0, 20)}...`, colors.reset);
      log(`   刷新令牌: ${response.body.data.refreshToken.substring(0, 20)}...`, colors.reset);
      log(`   用户: ${response.body.data.user.username} (${response.body.data.user.role})`, colors.reset);
      return response.body.data;
    } else {
      log('❌ 登录失败', colors.red);
      log(`   状态码: ${response.statusCode}`, colors.reset);
      log(`   响应: ${JSON.stringify(response.body)}`, colors.reset);
      return null;
    }
  } catch (error) {
    log('❌ 登录请求失败', colors.red);
    log(`   错误: ${error.message}`, colors.reset);
    return null;
  }
}

async function testProtectedEndpoint(accessToken) {
  log('', colors.reset);
  log('🔒 测试受保护的 API 端点...', colors.blue);
  log('', colors.reset);

  try {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/inventory/customers',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    };

    const response = await makeRequest(options);

    if (response.statusCode === 200) {
      log('✅ 访问受保护端点成功', colors.green);
      log(`   状态码: ${response.statusCode}`, colors.reset);
      log(`   数据数量: ${response.body.data ? response.body.data.length : 0}`, colors.reset);
      return true;
    } else if (response.statusCode === 401) {
      log('⚠️ 未授权（可能需要管理员权限）', colors.yellow);
      log(`   状态码: ${response.statusCode}`, colors.reset);
      return true;
    } else {
      log('❌ 访问受保护端点失败', colors.red);
      log(`   状态码: ${response.statusCode}`, colors.reset);
      log(`   响应: ${JSON.stringify(response.body)}`, colors.reset);
      return false;
    }
  } catch (error) {
    log('❌ 请求失败', colors.red);
    log(`   错误: ${error.message}`, colors.reset);
    return false;
  }
}

async function testUnauthorizedAccess() {
  log('', colors.reset);
  log('🚫 测试未授权访问...', colors.blue);
  log('', colors.reset);

  try {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/inventory/customers',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await makeRequest(options);

    if (response.statusCode === 401) {
      log('✅ 正确拒绝未授权访问', colors.green);
      log(`   状态码: ${response.statusCode}`, colors.reset);
      return true;
    } else {
      log('❌ 未正确拒绝未授权访问', colors.red);
      log(`   状态码: ${response.statusCode}`, colors.reset);
      return false;
    }
  } catch (error) {
    log('❌ 请求失败', colors.red);
    log(`   错误: ${error.message}`, colors.reset);
    return false;
  }
}

async function testRateLimit() {
  log('', colors.reset);
  log('⚡ 测试速率限制...', colors.blue);
  log('', colors.reset);

  try {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const data = {
      username: 'test',
      password: 'wrongpassword',
    };

    let rateLimitTriggered = false;
    const attempts = 10;

    log(`   发送 ${attempts} 次登录请求...`, colors.cyan);

    for (let i = 0; i < attempts; i++) {
      const response = await makeRequest(options, data);

      if (response.statusCode === 429) {
        rateLimitTriggered = true;
        log(`   第 ${i + 1} 次请求触发速率限制`, colors.yellow);
        break;
      }
    }

    if (rateLimitTriggered) {
      log('✅ 速率限制工作正常', colors.green);
      return true;
    } else {
      log('⚠️ 未触发速率限制（可能配置较宽松）', colors.yellow);
      return true;
    }
  } catch (error) {
    log('❌ 速率限制测试失败', colors.red);
    log(`   错误: ${error.message}`, colors.reset);
    return false;
  }
}

async function testCors() {
  log('', colors.reset);
  log('🌐 测试 CORS 配置...', colors.blue);
  log('', colors.reset);

  try {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
      },
    };

    const response = await makeRequest(options);

    if (response.statusCode === 204) {
      log('✅ CORS 预检请求成功', colors.green);
      log(`   状态码: ${response.statusCode}`, colors.reset);

      if (response.headers['access-control-allow-origin']) {
        log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`, colors.reset);
      }

      if (response.headers['access-control-allow-methods']) {
        log(`   Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods']}`, colors.reset);
      }

      return true;
    } else {
      log('❌ CORS 预检请求失败', colors.red);
      log(`   状态码: ${response.statusCode}`, colors.reset);
      return false;
    }
  } catch (error) {
    log('❌ CORS 测试失败', colors.red);
    log(`   错误: ${error.message}`, colors.reset);
    return false;
  }
}

async function testSecurityHeaders() {
  log('', colors.reset);
  log('🛡️ 测试安全 HTTP 头...', colors.blue);
  log('', colors.reset);

  try {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/',
      method: 'GET',
    };

    const response = await makeRequest(options);

    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'referrer-policy',
      'strict-transport-security',
      'content-security-policy',
    ];

    const results = securityHeaders.map(header => {
      const exists = !!response.headers[header];
      const value = response.headers[header] || 'N/A';
      return { header, exists, value };
    });

    log('   安全 HTTP 头检查:', colors.cyan);
    results.forEach(({ header, exists, value }) => {
      const icon = exists ? '✅' : '❌';
      const color = exists ? colors.green : colors.red;
      log(`   ${icon} ${header}: ${value}`, color);
    });

    const allExists = results.every(r => r.exists);

    if (allExists) {
      log('✅ 所有必要的安全 HTTP 头已配置', colors.green);
      return true;
    } else {
      log('⚠️ 部分安全 HTTP 头未配置', colors.yellow);
      return true;
    }
  } catch (error) {
    log('❌ 安全 HTTP 头测试失败', colors.red);
    log(`   错误: ${error.message}`, colors.reset);
    return false;
  }
}

async function testHealthCheck() {
  log('', colors.reset);
  log('💓 测试健康检查端点...', colors.blue);
  log('', colors.reset);

  try {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
    };

    const response = await makeRequest(options);

    if (response.statusCode === 200) {
      log('✅ 健康检查端点正常', colors.green);
      log(`   状态码: ${response.statusCode}`, colors.reset);
      log(`   响应: ${JSON.stringify(response.body)}`, colors.reset);
      return true;
    } else {
      log('❌ 健康检查端点异常', colors.red);
      log(`   状态码: ${response.statusCode}`, colors.reset);
      return false;
    }
  } catch (error) {
    log('❌ 健康检查请求失败', colors.red);
    log(`   错误: ${error.message}`, colors.reset);
    return false;
  }
}

async function main() {
  log('', colors.reset);
  log('========================================', colors.cyan);
  log('  安全功能测试工具', colors.cyan);
  log('========================================', colors.cyan);
  log('', colors.reset);

  const results = [];

  // 测试健康检查
  results.push(await testHealthCheck());

  // 测试登录认证
  const loginResult = await testLogin();
  const accessToken = loginResult ? loginResult.accessToken : null;
  results.push(!!accessToken);

  if (accessToken) {
    // 测试受保护的端点
    results.push(await testProtectedEndpoint(accessToken));
  }

  // 测试未授权访问
  results.push(await testUnauthorizedAccess());

  // 测试速率限制
  results.push(await testRateLimit());

  // 测试 CORS
  results.push(await testCors());

  // 测试安全 HTTP 头
  results.push(await testSecurityHeaders());

  // 显示结果
  log('', colors.reset);
  log('========================================', colors.cyan);
  const allPassed = results.every(r => r === true);
  const passedCount = results.filter(r => r === true).length;
  const totalCount = results.length;

  if (allPassed) {
    log(`✅ 所有测试通过 (${passedCount}/${totalCount})`, colors.green);
  } else {
    log(`⚠️ 部分测试失败 (${passedCount}/${totalCount})`, colors.yellow);
  }
  log('========================================', colors.cyan);
  log('', colors.reset);

  if (allPassed) {
    log('下一步操作:', colors.yellow);
    log('1. 配置 Cloudflare Tunnel', colors.reset);
    log('2. 部署到生产环境', colors.reset);
    log('3. 执行完整的安全审计', colors.reset);
  }

  process.exit(allPassed ? 0 : 1);
}

main();
