#!/usr/bin/env node
/**
 * 性能测试工具
 * 测试 API 响应时间和吞吐量
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
    const startTime = Date.now();

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            responseTime: endTime - startTime,
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            responseTime: endTime - startTime,
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

// 性能测试用例
const performanceTestCases = [
  { name: '首页', method: 'GET', path: '/', expectedMaxTime: 500 },
  { name: '产品库', method: 'GET', path: '/products', expectedMaxTime: 500 },
  { name: '智能选型', method: 'GET', path: '/selection', expectedMaxTime: 500 },
  { name: '水泵列表 API', method: 'GET', path: '/api/pumps', expectedMaxTime: 300 },
  { name: '健康检查 API', method: 'GET', path: '/api/health', expectedMaxTime: 200 },
];

async function performanceTest(testCase, iterations = 10) {
  const results = [];
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: testCase.path,
    method: testCase.method,
  };

  for (let i = 0; i < iterations; i++) {
    try {
      const response = await makeRequest(options);
      results.push({
        statusCode: response.statusCode,
        responseTime: response.responseTime,
      });
    } catch (error) {
      results.push({
        statusCode: 0,
        responseTime: 0,
        error: error.message,
      });
    }
  }

  // 计算统计数据
  const validResults = results.filter(r => r.statusCode > 0);
  const responseTimes = validResults.map(r => r.responseTime);

  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);
  const successRate = (validResults.length / results.length) * 100;

  return {
    ...testCase,
    iterations,
    avgResponseTime: Math.round(avgResponseTime),
    minResponseTime,
    maxResponseTime,
    successRate,
    passed: avgResponseTime <= testCase.expectedMaxTime,
  };
}

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

async function runPerformanceTests() {
  log('', colors.reset);
  log('========================================', colors.cyan);
  log('  性能测试', colors.cyan);
  log('========================================', colors.cyan);
  log('', colors.reset);

  const results = [];
  const iterations = 10;

  log(`每个测试用例执行 ${iterations} 次请求`, colors.cyan);
  log('', colors.reset);

  for (const testCase of performanceTestCases) {
    log(`测试 ${testCase.name}...`, colors.yellow);

    const result = await performanceTest(testCase, iterations);
    results.push(result);

    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? colors.green : colors.red;

    log(`${icon} ${testCase.name}`, color);
    log(`   平均响应时间: ${formatTime(result.avgResponseTime)}`, colors.reset);
    log(`   最小响应时间: ${formatTime(result.minResponseTime)}`, colors.reset);
    log(`   最大响应时间: ${formatTime(result.maxResponseTime)}`, colors.reset);
    log(`   成功率: ${result.successRate.toFixed(2)}%`, colors.reset);
    log(`   期望最大时间: ${formatTime(testCase.expectedMaxTime)}`, colors.reset);
    log('', colors.reset);
  }

  return results;
}

function generatePerformanceReport(results) {
  log('========================================', colors.cyan);
  log('  性能测试报告', colors.cyan);
  log('========================================', colors.cyan);
  log('', colors.reset);

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const passRate = ((passedTests / totalTests) * 100).toFixed(2);

  log(`总测试数: ${totalTests}`, colors.reset);
  log(`通过: ${passedTests}`, colors.green);
  log(`失败: ${failedTests}`, colors.red);
  log(`通过率: ${passRate}%`, colors.cyan);
  log('', colors.reset);

  // 平均响应时间统计
  const allAvgTimes = results.map(r => r.avgResponseTime);
  const globalAvg = allAvgTimes.reduce((a, b) => a + b, 0) / allAvgTimes.length;
  const globalMin = Math.min(...allAvgTimes);
  const globalMax = Math.max(...allAvgTimes);

  log(`全局平均响应时间: ${formatTime(globalAvg)}`, colors.cyan);
  log(`全局最小响应时间: ${formatTime(globalMin)}`, colors.cyan);
  log(`全局最大响应时间: ${formatTime(globalMax)}`, colors.cyan);
  log('', colors.reset);

  // 失败的测试
  if (failedTests > 0) {
    log('性能不达标的测试:', colors.red);
    results.filter(r => !r.passed).forEach(r => {
      log(`  ❌ ${r.name}: ${formatTime(r.avgResponseTime)} (期望: ${formatTime(r.expectedMaxTime)})`, colors.reset);
    });
    log('', colors.reset);
  }

  // 性能评级
  let performanceGrade = 'A';
  if (globalAvg > 1000) performanceGrade = 'D';
  else if (globalAvg > 500) performanceGrade = 'C';
  else if (globalAvg > 300) performanceGrade = 'B';

  log(`性能评级: ${performanceGrade}`, colors.cyan);
  log('', colors.reset);

  return {
    totalTests,
    passedTests,
    failedTests,
    passRate,
    globalAvg,
    globalMin,
    globalMax,
    performanceGrade,
    results,
  };
}

async function main() {
  log('', colors.reset);
  log('========================================', colors.cyan);
  log('  洛瓦托水泵选型系统 - 性能测试工具', colors.cyan);
  log('========================================', colors.cyan);
  log('', colors.reset);

  const startTime = Date.now();

  // 运行性能测试
  const results = await runPerformanceTests();

  // 生成报告
  const report = generatePerformanceReport(results);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log(`测试耗时: ${duration}秒`, colors.reset);
  log('', colors.reset);

  // 退出码
  process.exit(report.failedTests > 0 ? 1 : 0);
}

main();
