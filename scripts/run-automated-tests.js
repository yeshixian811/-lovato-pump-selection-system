#!/usr/bin/env node
/**
 * 自动化测试套件
 * 全面测试洛瓦托水泵选型系统的所有页面和 API 端点
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

// 测试用例
const testCases = {
  pages: [
    { name: '首页', path: '/', expectedStatus: 200 },
    { name: '产品库', path: '/products', expectedStatus: 200 },
    { name: '智能选型', path: '/selection', expectedStatus: 200 },
    { name: '登录/注册', path: '/auth', expectedStatus: 200 },
    { name: '用户中心', path: '/dashboard', expectedStatus: 200 },
    { name: '管理员登录', path: '/admin-login', expectedStatus: 200 },
    { name: '管理后台首页', path: '/admin', expectedStatus: 200 },
    { name: '管理员仪表盘', path: '/admin/dashboard', expectedStatus: 200 },
    { name: '进销存管理', path: '/admin/inventory', expectedStatus: 200 },
    { name: '客户管理', path: '/admin/inventory/customers', expectedStatus: 200 },
    { name: '供应商管理', path: '/admin/inventory/suppliers', expectedStatus: 200 },
    { name: '销售管理', path: '/admin/inventory/sales', expectedStatus: 200 },
    { name: '采购管理', path: '/admin/inventory/purchase', expectedStatus: 200 },
    { name: '产品管理', path: '/admin/products', expectedStatus: 200 },
    { name: '系统设置', path: '/admin/settings', expectedStatus: 200 },
    { name: '导航管理', path: '/admin/navigation', expectedStatus: 200 },
    { name: '模板管理', path: '/admin/templates', expectedStatus: 200 },
    { name: '页面管理', path: '/admin/pages', expectedStatus: 200 },
    { name: '构建器', path: '/admin/builder', expectedStatus: 200 },
    { name: '设计', path: '/admin/design', expectedStatus: 200 },
    { name: '内容管理首页', path: '/admin/content', expectedStatus: 200 },
    { name: '图片管理', path: '/admin/content/images', expectedStatus: 200 },
    { name: '内容页面管理', path: '/admin/content/pages', expectedStatus: 200 },
    { name: '文本管理', path: '/admin/content/text', expectedStatus: 200 },
    { name: '版本管理', path: '/versions', expectedStatus: 200 },
    { name: '在线编辑', path: '/editor', expectedStatus: 200 },
  ],
  apis: [
    { name: '健康检查', method: 'GET', path: '/api/health', expectedStatus: 200 },
    { name: '获取水泵列表', method: 'GET', path: '/api/pumps', expectedStatus: 200 },
    { name: '用户信息', method: 'GET', path: '/api/user/me', expectedStatus: 401 },
    { name: '登出', method: 'POST', path: '/api/auth/logout', expectedStatus: 200 },
    { name: '客户列表', method: 'GET', path: '/api/inventory/customers', expectedStatus: 401 },
    { name: '管理员用户列表', method: 'GET', path: '/api/admin/users', expectedStatus: 401 },
  ],
};

async function testPages() {
  log('', colors.reset);
  log('📄 测试页面路由...', colors.blue);
  log('', colors.reset);

  const results = [];
  const baseUrl = 'http://localhost:5000';

  for (const testCase of testCases.pages) {
    try {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: testCase.path,
        method: 'GET',
      };

      const response = await makeRequest(options);
      const passed = response.statusCode === testCase.expectedStatus;

      results.push({
        ...testCase,
        actualStatus: response.statusCode,
        passed,
      });

      const icon = passed ? '✅' : '❌';
      const color = passed ? colors.green : colors.red;
      log(`${icon} ${testCase.name}: ${response.statusCode}`, color);
    } catch (error) {
      results.push({
        ...testCase,
        actualStatus: 0,
        passed: false,
        error: error.message,
      });

      log(`❌ ${testCase.name}: 连接失败`, colors.red);
    }
  }

  return results;
}

async function testAPIs() {
  log('', colors.reset);
  log('🔌 测试 API 端点...', colors.blue);
  log('', colors.reset);

  const results = [];
  const baseUrl = 'http://localhost:5000';

  for (const testCase of testCases.apis) {
    try {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: testCase.path,
        method: testCase.method,
      };

      const response = await makeRequest(options);
      const passed = response.statusCode === testCase.expectedStatus;

      results.push({
        ...testCase,
        actualStatus: response.statusCode,
        passed,
      });

      const icon = passed ? '✅' : '❌';
      const color = passed ? colors.green : colors.red;
      log(`${icon} ${testCase.method} ${testCase.path}: ${response.statusCode}`, color);
    } catch (error) {
      results.push({
        ...testCase,
        actualStatus: 0,
        passed: false,
        error: error.message,
      });

      log(`❌ ${testCase.method} ${testCase.path}: 连接失败`, colors.red);
    }
  }

  return results;
}

function generateReport(pageResults, apiResults) {
  const totalTests = pageResults.length + apiResults.length;
  const passedTests = [...pageResults, ...apiResults].filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const passRate = ((passedTests / totalTests) * 100).toFixed(2);

  log('', colors.reset);
  log('========================================', colors.cyan);
  log('  测试报告', colors.cyan);
  log('========================================', colors.cyan);
  log('', colors.reset);
  log(`总测试数: ${totalTests}`, colors.reset);
  log(`通过: ${passedTests}`, colors.green);
  log(`失败: ${failedTests}`, colors.red);
  log(`通过率: ${passRate}%`, colors.cyan);
  log('', colors.reset);

  // 页面测试结果
  const pagePassed = pageResults.filter(r => r.passed).length;
  const pageFailed = pageResults.length - pagePassed;
  log(`页面测试: ${pagePassed}/${pageResults.length} 通过`, colors.cyan);

  // API 测试结果
  const apiPassed = apiResults.filter(r => r.passed).length;
  const apiFailed = apiResults.length - apiPassed;
  log(`API 测试: ${apiPassed}/${apiResults.length} 通过`, colors.cyan);

  log('', colors.reset);

  // 失败的测试
  if (failedTests > 0) {
    log('失败的测试:', colors.red);
    [...pageResults, ...apiResults].filter(r => !r.passed).forEach(r => {
      log(`  ❌ ${r.name || r.path}: ${r.actualStatus || '连接失败'}`, colors.reset);
    });
    log('', colors.reset);
  }

  return {
    totalTests,
    passedTests,
    failedTests,
    passRate,
    pageResults,
    apiResults,
  };
}

async function main() {
  log('', colors.reset);
  log('========================================', colors.cyan);
  log('  洛瓦托水泵选型系统 - 自动化测试套件', colors.cyan);
  log('========================================', colors.cyan);
  log('', colors.reset);

  const startTime = Date.now();

  // 测试页面
  const pageResults = await testPages();

  // 测试 API
  const apiResults = await testAPIs();

  // 生成报告
  const report = generateReport(pageResults, apiResults);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log(`测试耗时: ${duration}秒`, colors.reset);
  log('', colors.reset);

  // 退出码
  process.exit(report.failedTests > 0 ? 1 : 0);
}

main();
