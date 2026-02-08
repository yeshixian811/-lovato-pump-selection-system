#!/usr/bin/env node
/**
 * 加密/解密功能测试脚本
 * 测试 AES-256-GCM 加密、PBKDF2 密钥派生等功能
 */

const crypto = require('crypto');
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

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// 加密配置
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'test-key-32-characters-long';
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const PBKDF2_ITERATIONS = 100000;

function generateKeyFromPassword(password, salt) {
  return crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    32,
    'sha256'
  );
}

function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData: encrypted,
  };
}

function decrypt(encryptedObj, key) {
  const iv = Buffer.from(encryptedObj.iv, 'hex');
  const authTag = Buffer.from(encryptedObj.authTag, 'hex');
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

function testBasicEncryption() {
  log('', colors.reset);
  log('🔒 测试基本加密/解密...', colors.blue);
  log('', colors.reset);

  try {
    const plaintext = 'Hello, World! This is a test message.';
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));

    log(`   原始文本: ${plaintext}`, colors.cyan);

    const encrypted = encrypt(plaintext, key);
    log('   ✅ 加密成功', colors.green);
    log(`   加密数据: ${encrypted.encryptedData.substring(0, 20)}...`, colors.reset);

    const decrypted = decrypt(encrypted, key);
    log('   ✅ 解密成功', colors.green);
    log(`   解密文本: ${decrypted}`, colors.reset);

    if (decrypted === plaintext) {
      log('   ✅ 加密/解密结果一致', colors.green);
      return true;
    } else {
      log('   ❌ 加密/解密结果不一致', colors.red);
      return false;
    }
  } catch (error) {
    log('   ❌ 测试失败', colors.red);
    log(`   错误: ${error.message}`, colors.reset);
    return false;
  }
}

function testObjectEncryption() {
  log('', colors.reset);
  log('🔒 测试对象加密/解密...', colors.blue);
  log('', colors.reset);

  try {
    const obj = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+86-138-0000-0000',
      address: '上海市浦东新区',
      sensitiveData: 'This is sensitive information',
    };

    log(`   原始对象:`, colors.cyan);
    log(`   ${JSON.stringify(obj, null, 2)}`, colors.reset);

    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
    const encrypted = encrypt(JSON.stringify(obj), key);
    log('   ✅ 对象加密成功', colors.green);

    const decrypted = decrypt(encrypted, key);
    const decryptedObj = JSON.parse(decrypted);
    log('   ✅ 对象解密成功', colors.green);

    if (JSON.stringify(obj) === JSON.stringify(decryptedObj)) {
      log('   ✅ 对象加密/解密结果一致', colors.green);
      return true;
    } else {
      log('   ❌ 对象加密/解密结果不一致', colors.red);
      return false;
    }
  } catch (error) {
    log('   ❌ 测试失败', colors.red);
    log(`   错误: ${error.message}`, colors.reset);
    return false;
  }
}

function testPasswordBasedEncryption() {
  log('', colors.reset);
  log('🔐 测试基于密码的加密...', colors.blue);
  log('', colors.reset);

  try {
    const plaintext = 'Sensitive data protected by password';
    const password = 'StrongPassword123!';
    const salt = crypto.randomBytes(16);

    log(`   原始文本: ${plaintext}`, colors.cyan);
    log(`   密码: ${password}`, colors.cyan);
    log(`   盐值: ${salt.toString('hex')}`, colors.cyan);

    const key = generateKeyFromPassword(password, salt);
    log(`   密钥长度: ${key.length} 字节`, colors.reset);

    const encrypted = encrypt(plaintext, key);
    log('   ✅ 加密成功', colors.green);

    const decrypted = decrypt(encrypted, key);
    log('   ✅ 解密成功', colors.green);
    log(`   解密文本: ${decrypted}`, colors.reset);

    if (decrypted === plaintext) {
      log('   ✅ 加密/解密结果一致', colors.green);
      return true;
    } else {
      log('   ❌ 加密/解密结果不一致', colors.red);
      return false;
    }
  } catch (error) {
    log('   ❌ 测试失败', colors.red);
    log(`   错误: ${error.message}`, colors.reset);
    return false;
  }
}

function testDifferentKeys() {
  log('', colors.reset);
  log('🔑 测试不同密钥...', colors.blue);
  log('', colors.reset);

  try {
    const plaintext = 'Secret message';
    const key1 = Buffer.from('Key-1-32-characters-long-123456');
    const key2 = Buffer.from('Key-2-32-characters-long-654321');

    log(`   原始文本: ${plaintext}`, colors.cyan);

    const encryptedWithKey1 = encrypt(plaintext, key1);
    log('   ✅ 使用密钥 1 加密成功', colors.green);

    // 尝试用密钥 2 解密（应该失败）
    try {
      const decryptedWithKey2 = decrypt(encryptedWithKey1, key2);
      log('   ❌ 使用密钥 2 解密成功（应该失败）', colors.red);
      return false;
    } catch (error) {
      log('   ✅ 使用密钥 2 解密失败（预期行为）', colors.green);
    }

    // 使用正确的密钥解密
    const decryptedWithKey1 = decrypt(encryptedWithKey1, key1);
    log('   ✅ 使用密钥 1 解密成功', colors.green);

    if (decryptedWithKey1 === plaintext) {
      log('   ✅ 解密结果正确', colors.green);
      return true;
    } else {
      log('   ❌ 解密结果错误', colors.red);
      return false;
    }
  } catch (error) {
    log('   ❌ 测试失败', colors.red);
    log(`   错误: ${error.message}`, colors.reset);
    return false;
  }
}

function testLargeData() {
  log('', colors.reset);
  log('📊 测试大数据加密...', colors.blue);
  log('', colors.reset);

  try {
    const largeText = 'A'.repeat(100000); // 100KB 数据
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));

    log(`   数据大小: ${largeText.length} 字节`, colors.cyan);

    const startTime = Date.now();
    const encrypted = encrypt(largeText, key);
    const encryptTime = Date.now() - startTime;
    log(`   ✅ 加密完成 (${encryptTime}ms)`, colors.green);

    const startTime2 = Date.now();
    const decrypted = decrypt(encrypted, key);
    const decryptTime = Date.now() - startTime2;
    log(`   ✅ 解密完成 (${decryptTime}ms)`, colors.green);

    if (decrypted === largeText) {
      log('   ✅ 大数据加密/解密结果一致', colors.green);
      return true;
    } else {
      log('   ❌ 大数据加密/解密结果不一致', colors.red);
      return false;
    }
  } catch (error) {
    log('   ❌ 测试失败', colors.red);
    log(`   错误: ${error.message}`, colors.reset);
    return false;
  }
}

function testPerformance() {
  log('', colors.reset);
  log('⚡ 测试加密性能...', colors.blue);
  log('', colors.reset);

  try {
    const iterations = 100;
    const plaintext = 'Test data for performance measurement';
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));

    log(`   迭代次数: ${iterations}`, colors.cyan);

    // 加密性能测试
    const encryptStartTime = Date.now();
    for (let i = 0; i < iterations; i++) {
      encrypt(plaintext, key);
    }
    const encryptTime = Date.now() - encryptStartTime;
    const encryptAvg = (encryptTime / iterations).toFixed(2);
    log(`   ✅ 加密平均时间: ${encryptAvg}ms`, colors.green);

    // 解密性能测试
    const encrypted = encrypt(plaintext, key);
    const decryptStartTime = Date.now();
    for (let i = 0; i < iterations; i++) {
      decrypt(encrypted, key);
    }
    const decryptTime = Date.now() - decryptStartTime;
    const decryptAvg = (decryptTime / iterations).toFixed(2);
    log(`   ✅ 解密平均时间: ${decryptAvg}ms`, colors.green);

    log(`   📊 总耗时: ${encryptTime + decryptTime}ms`, colors.cyan);

    return true;
  } catch (error) {
    log('   ❌ 测试失败', colors.red);
    log(`   错误: ${error.message}`, colors.reset);
    return false;
  }
}

function main() {
  log('', colors.reset);
  log('========================================', colors.cyan);
  log('  加密/解密功能测试工具', colors.cyan);
  log('========================================', colors.cyan);
  log('', colors.reset);
  log(`加密算法: ${ENCRYPTION_ALGORITHM}`, colors.reset);
  log(`密钥长度: ${ENCRYPTION_KEY.length} 字节`, colors.reset);
  log(`PBKDF2 迭代次数: ${PBKDF2_ITERATIONS}`, colors.reset);
  log('', colors.reset);

  const results = [];

  // 执行所有测试
  results.push(testBasicEncryption());
  results.push(testObjectEncryption());
  results.push(testPasswordBasedEncryption());
  results.push(testDifferentKeys());
  results.push(testLargeData());
  results.push(testPerformance());

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
    log('✅ 加密/解密功能工作正常！', colors.green);
  } else {
    log('❌ 加密/解密功能存在问题，请检查配置！', colors.red);
  }

  process.exit(allPassed ? 0 : 1);
}

main();
