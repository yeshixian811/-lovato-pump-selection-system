#!/usr/bin/env node
/**
 * 环境变量验证脚本
 * 检查所有必需的环境变量是否已配置
 */

const fs = require('fs');
const path = require('path');

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

// 必需的环境变量
const requiredEnvVars = {
  JWT_SECRET: {
    description: 'JWT 签名密钥',
    minLength: 32,
    recommendation: '使用强随机密钥（至少 32 个字符）',
  },
  ENCRYPTION_KEY: {
    description: '数据加密密钥',
    minLength: 32,
    recommendation: '使用强随机密钥（至少 32 个字符）',
  },
  DATABASE_URL: {
    description: 'PostgreSQL 数据库连接 URL',
    pattern: /^postgresql:\/\/.+/,
    recommendation: '格式: postgresql://用户名:密码@主机:端口/数据库名',
  },
};

// 可选但推荐的环境变量
const optionalEnvVars = {
  ALLOWED_ORIGINS: {
    description: 'CORS 允许的源列表',
    recommendation: '格式: https://yourdomain.com,https://www.yourdomain.com',
  },
  COZE_BUCKET_ACCESS_KEY: {
    description: '对象存储访问密钥',
    recommendation: '用于文件上传功能',
  },
  COZE_BUCKET_SECRET_KEY: {
    description: '对象存储密钥',
    recommendation: '用于文件上传功能',
  },
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  if (!fs.existsSync(envPath)) {
    log('❌ .env 文件不存在！', colors.red);
    log('', colors.reset);
    log('请按照以下步骤创建 .env 文件：', colors.yellow);
    log('', colors.reset);
    log('1. 复制 .env.example 为 .env:', colors.cyan);
    log(`   cp .env.example .env`, colors.green);
    log('', colors.reset);
    log('2. 编辑 .env 文件，填写实际的配置值', colors.cyan);
    log('   nano .env  或  notepad .env', colors.green);
    log('', colors.reset);
    log('3. 保存文件并重新运行此脚本', colors.cyan);
    return false;
  }

  log('✅ .env 文件已存在', colors.green);
  return true;
}

function loadEnvVars() {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    // 跳过注释和空行
    if (line.trim().startsWith('#') || line.trim() === '') {
      return;
    }

    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  return envVars;
}

function checkRequiredEnvVars(envVars) {
  log('', colors.reset);
  log('📋 检查必需的环境变量...', colors.blue);
  log('', colors.reset);

  let allValid = true;
  const results = [];

  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = envVars[key];
    const result = {
      key,
      valid: false,
      message: '',
    };

    if (!value || value === '' || value.startsWith('your-') || value.includes('change-this')) {
      result.valid = false;
      result.message = '未配置或使用默认值';
      allValid = false;
    } else if (config.minLength && value.length < config.minLength) {
      result.valid = false;
      result.message = `长度不足（最少 ${config.minLength} 个字符，当前 ${value.length} 个）`;
      allValid = false;
    } else if (config.pattern && !config.pattern.test(value)) {
      result.valid = false;
      result.message = '格式不正确';
      allValid = false;
    } else {
      result.valid = true;
      result.message = '✅ 已配置';
    }

    results.push(result);
  }

  // 显示结果
  results.forEach(result => {
    const statusColor = result.valid ? colors.green : colors.red;
    const icon = result.valid ? '✅' : '❌';
    const config = requiredEnvVars[result.key];

    log(`${icon} ${result.key}: ${result.message}`, statusColor);
    if (!result.valid) {
      log(`   描述: ${config.description}`, colors.reset);
      log(`   建议: ${config.recommendation}`, colors.yellow);
    }
    log('', colors.reset);
  });

  return allValid;
}

function checkOptionalEnvVars(envVars) {
  log('', colors.reset);
  log('📋 检查可选的环境变量...', colors.blue);
  log('', colors.reset);

  const results = [];

  for (const [key, config] of Object.entries(optionalEnvVars)) {
    const value = envVars[key];
    const result = {
      key,
      configured: false,
      message: '',
    };

    if (!value || value === '' || value.startsWith('your-') || value.includes('your_')) {
      result.configured = false;
      result.message = '⚠️ 未配置';
    } else {
      result.configured = true;
      result.message = '✅ 已配置';
    }

    results.push(result);
  }

  // 显示结果
  results.forEach(result => {
    const statusColor = result.configured ? colors.green : colors.yellow;
    const icon = result.configured ? '✅' : '⚠️';
    const config = optionalEnvVars[result.key];

    log(`${icon} ${result.key}: ${result.message}`, statusColor);
    if (!result.configured) {
      log(`   描述: ${config.description}`, colors.reset);
      log(`   建议: ${config.recommendation}`, colors.yellow);
    }
    log('', colors.reset);
  });
}

function generateSecureKey(length = 32) {
  const crypto = require('crypto');
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

function showRecommendations() {
  log('', colors.reset);
  log('💡 安全建议:', colors.cyan);
  log('', colors.reset);
  log('1. 生成强随机密钥:', colors.yellow);
  log(`   JWT_SECRET: ${generateSecureKey(32)}`, colors.green);
  log(`   ENCRYPTION_KEY: ${generateSecureKey(32)}`, colors.green);
  log('', colors.reset);
  log('2. 使用 OpenSSL 生成密钥:', colors.yellow);
  log('   openssl rand -base64 32', colors.cyan);
  log('', colors.reset);
  log('3. 保护好 .env 文件:', colors.yellow);
  log('   - 不要提交到 Git', colors.reset);
  log('   - 限制文件权限 (chmod 600 .env)', colors.reset);
  log('   - 定期轮换密钥', colors.reset);
}

function main() {
  log('', colors.reset);
  log('========================================', colors.cyan);
  log('  环境变量配置验证工具', colors.cyan);
  log('========================================', colors.cyan);
  log('', colors.reset);

  // 检查 .env 文件是否存在
  const envFileExists = checkEnvFile();
  if (!envFileExists) {
    showRecommendations();
    process.exit(1);
  }

  // 加载环境变量
  const envVars = loadEnvVars();

  // 检查必需的环境变量
  const requiredValid = checkRequiredEnvVars(envVars);

  // 检查可选的环境变量
  checkOptionalEnvVars(envVars);

  // 显示结果
  log('', colors.reset);
  log('========================================', colors.cyan);
  if (requiredValid) {
    log('✅ 所有必需的环境变量已正确配置！', colors.green);
    log('========================================', colors.cyan);
    log('', colors.reset);
    log('您可以继续进行以下步骤:', colors.yellow);
    log('1. 测试认证流程', colors.reset);
    log('2. 测试加密/解密功能', colors.reset);
    log('3. 配置 Cloudflare Tunnel', colors.reset);
    process.exit(0);
  } else {
    log('❌ 部分必需的环境变量未正确配置！', colors.red);
    log('========================================', colors.cyan);
    log('', colors.reset);
    showRecommendations();
    process.exit(1);
  }
}

main();
