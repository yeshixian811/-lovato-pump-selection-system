/**
 * Jest 测试设置文件
 * 在所有测试运行前执行
 */

// 设置测试环境变量
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.ENCRYPTION_KEY = 'test-encryption-key-for-testing-only';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// 全局测试超时
jest.setTimeout(10000);

// 模拟环境
global.console = {
  ...console,
  // 在测试中禁用某些日志输出
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
