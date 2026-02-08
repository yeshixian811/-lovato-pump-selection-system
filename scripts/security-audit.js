#!/usr/bin/env node
/**
 * 系统安全审计工具
 * 全面检查系统安全漏洞
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

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// 安全检查项目
const securityChecks = {
  // 1. SQL注入检查
  sqlInjection: {
    name: 'SQL注入漏洞检查',
    severity: 'critical',
    patterns: [
      /execute\s*\(\s*`[\s\S]*?\$\{[\s\S]*?\}[\s\S]*?`/g,
      /query\s*\(\s*['"`][\s\S]*?\$\{[\s\S]*?\}[\s\S]*?['"`]/g,
      /SELECT\s+[\s\S]*?\s+FROM\s+[\s\S]*?\s+WHERE[\s\S]*?=\s*['"`][\s\S]*?\$\{[\s\S]*?\}[\s\S]*?['"`]/g,
    ],
  },

  // 2. XSS漏洞检查
  xss: {
    name: 'XSS漏洞检查',
    severity: 'critical',
    patterns: [
      /dangerouslySetInnerHTML\s*\(/g,
      /innerHTML\s*=\s*[\s\S]*?\$\{[\s\S]*?\}/g,
      /document\.write\s*\(/g,
    ],
  },

  // 3. 敏感信息泄露检查
  sensitiveData: {
    name: '敏感信息泄露检查',
    severity: 'high',
    patterns: [
      /password\s*[:=]\s*['"`][\s\S]*?['"`]/gi,
      /api[_-]?key\s*[:=]\s*['"`][\s\S]*?['"`]/gi,
      /secret\s*[:=]\s*['"`][\s\S]*?['"`]/gi,
      /token\s*[:=]\s*['"`][\s\S]*?['"`]/gi,
      /console\.log\s*\(\s*[\s\S]*?password[\s\S]*?\)/gi,
      /console\.log\s*\(\s*[\s\S]*?token[\s\S]*?\)/gi,
    ],
  },

  // 4. 硬编码凭证检查
  hardcodedCredentials: {
    name: '硬编码凭证检查',
    severity: 'critical',
    patterns: [
      /mongodb:\/\/[^\s'"]+:[^\s'"]+@/gi,
      /mysql:\/\/[^\s'"]+:[^\s'"]+@/gi,
      /postgresql:\/\/[^\s'"]+:[^\s'"]+@/gi,
      /aws_access_key_id\s*[:=]\s*['"`][A-Z0-9]{20}['"`]/gi,
      /aws_secret_access_key\s*[:=]\s*['"`][A-Za-z0-9\/+=]{40}['"`]/gi,
    ],
  },

  // 5. 不安全的随机数检查
  insecureRandom: {
    name: '不安全的随机数检查',
    severity: 'medium',
    patterns: [
      /Math\.random\s*\(\)/g,
    ],
  },

  // 6. 弱加密算法检查
  weakEncryption: {
    name: '弱加密算法检查',
    severity: 'high',
    patterns: [
      /crypto\.createCipher\s*\(/g,
      /crypto\.createDecipher\s*\(/g,
      /md5\s*\(/g,
      /sha1\s*\(/g,
    ],
  },

  // 7. 不安全的重定向检查
  unsafeRedirect: {
    name: '不安全的重定向检查',
    severity: 'high',
    patterns: [
      /res\.redirect\s*\(\s*[\s\S]*?req\.[\s\S]*?query[\s\S]*?\)/g,
      /res\.redirect\s*\(\s*[\s\S]*?req\.[\s\S]*?body[\s\S]*?\)/g,
      /window\.location\s*=\s*[\s\S]*?req\.[\s\S]*?query[\s\S]*?/g,
    ],
  },

  // 8. 缺少CSRF保护检查
  csrfProtection: {
    name: 'CSRF保护检查',
    severity: 'medium',
    patterns: [
      // 这个检查比较复杂，需要在API路由中检查是否有CSRF中间件
    ],
  },

  // 9. 文件路径遍历检查
  pathTraversal: {
    name: '文件路径遍历检查',
    severity: 'critical',
    patterns: [
      /fs\.readFileSync\s*\(\s*[\s\S]*?req\.[\s\S]*?query[\s\S]*?\)/g,
      /fs\.writeFileSync\s*\(\s*[\s\S]*?req\.[\s\S]*?query[\s\S]*?\)/g,
    ],
  },

  // 10. 不安全的eval检查
  insecureEval: {
    name: '不安全的eval检查',
    severity: 'critical',
    patterns: [
      /eval\s*\(/g,
      /new\s+Function\s*\(/g,
    ],
  },
};

// 需要检查的文件类型
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];

// 需要排除的目录
const excludeDirs = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  '.git',
  '.vscode',
  'public',
];

// 递归获取所有文件
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 检查是否在排除列表中
      if (!excludeDirs.includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      // 检查文件扩展名
      const ext = path.extname(file);
      if (fileExtensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// 检查单个文件
function checkFile(filePath, checkType) {
  const issues = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const check = securityChecks[checkType];

    check.patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            file: filePath,
            line: getLineNumber(content, match),
            code: match,
            severity: check.severity,
          });
        });
      }
    });
  } catch (error) {
    // 忽略读取错误
  }

  return issues;
}

// 获取代码行号
function getLineNumber(content, code) {
  const index = content.indexOf(code);
  if (index === -1) return 0;

  const before = content.substring(0, index);
  return before.split('\n').length;
}

// 运行所有安全检查
function runAllSecurityChecks() {
  log('', colors.reset);
  log('========================================', colors.cyan);
  log('  系统安全审计工具', colors.cyan);
  log('========================================', colors.cyan);
  log('', colors.reset);

  const startTime = Date.now();

  // 获取所有文件
  log('📁 扫描项目文件...', colors.blue);
  const files = getAllFiles(process.cwd());
  log(`找到 ${files.length} 个文件`, colors.green);
  log('', colors.reset);

  // 运行所有检查
  const allIssues = {};
  const checkNames = Object.keys(securityChecks);

  checkNames.forEach((checkName, index) => {
    const check = securityChecks[checkName];
    log(`[${index + 1}/${checkNames.length}] ${check.name}...`, colors.yellow);

    const issues = [];
    files.forEach(file => {
      const fileIssues = checkFile(file, checkName);
      issues.push(...fileIssues);
    });

    allIssues[checkName] = {
      name: check.name,
      severity: check.severity,
      issues: issues,
      count: issues.length,
    };

    if (issues.length === 0) {
      log(`   ✅ 未发现问题`, colors.green);
    } else {
      log(`   ❌ 发现 ${issues.length} 个问题`, colors.red);
    }

    log('', colors.reset);
  });

  // 生成报告
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  generateReport(allIssues, duration);

  return allIssues;
}

// 生成报告
function generateReport(allIssues, duration) {
  log('========================================', colors.cyan);
  log('  安全审计报告', colors.cyan);
  log('========================================', colors.cyan);
  log('', colors.reset);

  // 统计问题
  const totalIssues = Object.values(allIssues).reduce((sum, check) => sum + check.count, 0);
  const criticalIssues = Object.values(allIssues).reduce((sum, check) => {
    return sum + check.issues.filter(i => i.severity === 'critical').length;
  }, 0);
  const highIssues = Object.values(allIssues).reduce((sum, check) => {
    return sum + check.issues.filter(i => i.severity === 'high').length;
  }, 0);
  const mediumIssues = Object.values(allIssues).reduce((sum, check) => {
    return sum + check.issues.filter(i => i.severity === 'medium').length;
  }, 0);

  log(`总问题数: ${totalIssues}`, colors.reset);
  if (criticalIssues > 0) log(`严重: ${criticalIssues}`, colors.red);
  if (highIssues > 0) log(`高: ${highIssues}`, colors.yellow);
  if (mediumIssues > 0) log(`中: ${mediumIssues}`, colors.cyan);
  log(`审计耗时: ${duration}秒`, colors.reset);
  log('', colors.reset);

  // 详细问题列表
  if (totalIssues > 0) {
    log('========================================', colors.cyan);
    log('  详细问题列表', colors.cyan);
    log('========================================', colors.cyan);
    log('', colors.reset);

    Object.entries(allIssues).forEach(([checkName, check]) => {
      if (check.count > 0) {
        const severityColor = check.severity === 'critical' ? colors.red :
                             check.severity === 'high' ? colors.yellow :
                             colors.cyan;

        log(`🔍 ${check.name} (${check.severity})`, severityColor);
        log('', colors.reset);

        check.issues.forEach(issue => {
          log(`   文件: ${issue.file}`, colors.reset);
          log(`   行号: ${issue.line}`, colors.reset);
          log(`   代码: ${issue.code.substring(0, 100)}...`, colors.reset);
          log('', colors.reset);
        });
      }
    });
  }

  // 保存报告
  saveReport(allIssues, duration, criticalIssues, highIssues, mediumIssues);
}

// 保存报告到文件
function saveReport(allIssues, duration, criticalIssues, highIssues, mediumIssues) {
  const reportData = {
    timestamp: new Date().toISOString(),
    duration,
    totalIssues: Object.values(allIssues).reduce((sum, check) => sum + check.count, 0),
    criticalIssues,
    highIssues,
    mediumIssues,
    checks: allIssues,
  };

  const reportPath = path.join(process.cwd(), 'security-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

  log(`报告已保存到: ${reportPath}`, colors.green);
  log('', colors.reset);
}

// 主函数
function main() {
  runAllSecurityChecks();
}

main();
