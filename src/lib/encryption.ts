import crypto from 'crypto';

/**
 * 加密算法
 */
const ALGORITHM = 'aes-256-gcm';

/**
 * 密钥长度
 */
const KEY_LENGTH = 32;

/**
 * IV 长度
 */
const IV_LENGTH = 16;

/**
 * 认证标签长度
 */
const TAG_LENGTH = 16;

/**
 * 盐长度
 */
const SALT_LENGTH = 64;

/**
 * 获取加密密钥
 * 从环境变量中获取加密密钥，如果没有提供则使用默认值
 */
function getEncryptionKey(password?: string): Buffer {
  const encryptionPassword = password || process.env.ENCRYPTION_KEY || 'default-encryption-key-change-this-in-production';
  
  // 使用 SHA-256 哈希生成固定长度的密钥
  return crypto.createHash('sha256').update(encryptionPassword).digest();
}

/**
 * 生成随机盐
 */
function generateSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH);
}

/**
 * 生成随机 IV
 */
function generateIV(): Buffer {
  return crypto.randomBytes(IV_LENGTH);
}

/**
 * 派生密钥（使用 PBKDF2）
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * 加密文本
 * 
 * @param text 要加密的文本
 * @param password 加密密码（可选，默认使用环境变量）
 * @returns Base64 编码的加密字符串
 */
export function encrypt(text: string, password?: string): string {
  try {
    // 生成盐和 IV
    const salt = generateSalt();
    const iv = generateIV();
    
    // 派生密钥
    const key = password ? deriveKey(password, salt) : getEncryptionKey(password);
    
    // 创建加密器
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // 加密数据
    let encrypted = cipher.update(text, 'utf8', 'binary');
    encrypted += cipher.final('binary');
    
    // 获取认证标签
    const tag = cipher.getAuthTag();
    
    // 拼接盐、IV、标签和加密数据
    const combined = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'binary')]);
    
    // 返回 Base64 编码
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * 解密文本
 * 
 * @param encrypted Base64 编码的加密字符串
 * @param password 加密密码（可选，必须与加密时相同）
 * @returns 解密后的原始文本
 */
export function decrypt(encrypted: string, password?: string): string {
  try {
    // 解码 Base64
    const combined = Buffer.from(encrypted, 'base64');
    
    // 提取各部分
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encryptedText = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    // 派生密钥
    const key = password ? deriveKey(password, salt) : getEncryptionKey(password);
    
    // 创建解密器
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    // 设置认证标签
    decipher.setAuthTag(tag);
    
    // 解密数据
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    // 返回 UTF-8 字符串
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * 加密 JSON 对象
 * 
 * @param obj 要加密的 JSON 对象
 * @param password 加密密码（可选）
 * @returns Base64 编码的加密字符串
 */
export function encryptObject<T extends Record<string, any>>(obj: T, password?: string): string {
  return encrypt(JSON.stringify(obj), password);
}

/**
 * 解密 JSON 对象
 * 
 * @param encrypted Base64 编码的加密字符串
 * @param password 加密密码（可选）
 * @returns 解密后的 JSON 对象
 */
export function decryptObject<T extends Record<string, any>>(encrypted: string, password?: string): T {
  const decrypted = decrypt(encrypted, password);
  return JSON.parse(decrypted) as T;
}

/**
 * 生成安全的随机字符串
 * 
 * @param length 字符串长度
 * @returns 随机字符串
 */
export function generateSecureRandom(length: number = 32): string {
  const bytes = crypto.randomBytes(Math.ceil(length / 2));
  return bytes.toString('hex').slice(0, length);
}

/**
 * 哈希数据（SHA-256）
 * 
 * @param data 要哈希的数据
 * @returns 哈希值（十六进制）
 */
export function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * 验证哈希
 * 
 * @param data 原始数据
 * @param hash 要验证的哈希值
 * @returns 是否匹配
 */
export function verifyHash(data: string, hash: string): boolean {
  return hash(data) === hash;
}

/**
 * 生成 HMAC
 * 
 * @param data 要签名的数据
 * @param secret 密钥
 * @returns HMAC 签名
 */
export function generateHMAC(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * 验证 HMAC
 * 
 * @param data 原始数据
 * @param signature 要验证的签名
 * @param secret 密钥
 * @returns 是否匹配
 */
export function verifyHMAC(data: string, signature: string, secret: string): boolean {
  return generateHMAC(data, secret) === signature;
}

/**
 * 数据库字段加密助手
 * 用于在存储到数据库前加密敏感字段
 */
export class DatabaseFieldEncryption {
  constructor(private password?: string) {}
  
  /**
   * 加密字段值
   */
  encryptField(value: string | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    return encrypt(value, this.password);
  }
  
  /**
   * 解密字段值
   */
  decryptField(encrypted: string | null | undefined): string | null {
    if (encrypted === null || encrypted === undefined) {
      return null;
    }
    try {
      return decrypt(encrypted, this.password);
    } catch (error) {
      console.error('Failed to decrypt field:', error);
      return null;
    }
  }
  
  /**
   * 加密对象中的敏感字段
   */
  encryptFields<T extends Record<string, any>>(
    obj: T,
    fieldsToEncrypt: (keyof T)[]
  ): T {
    const result = { ...obj };
    for (const field of fieldsToEncrypt) {
      const value = result[field];
      if (typeof value === 'string') {
        (result[field] as any) = this.encryptField(value);
      }
    }
    return result;
  }
  
  /**
   * 解密对象中的敏感字段
   */
  decryptFields<T extends Record<string, any>>(
    obj: T,
    fieldsToDecrypt: (keyof T)[]
  ): T {
    const result = { ...obj };
    for (const field of fieldsToDecrypt) {
      const value = result[field];
      if (typeof value === 'string') {
        (result[field] as any) = this.decryptField(value);
      }
    }
    return result;
  }
}

/**
 * 创建数据库字段加密实例
 */
export function createDBEncryption(password?: string): DatabaseFieldEncryption {
  return new DatabaseFieldEncryption(password);
}
