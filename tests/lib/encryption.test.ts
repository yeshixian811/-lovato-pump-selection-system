/**
 * 加密工具单元测试
 * 测试 AES-256-GCM 加密、解密、哈希等功能
 */

import { describe, it, expect } from '@jest/globals';
import {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  generateSecureRandom,
  hash,
  verifyHash,
  generateHMAC,
  verifyHMAC,
  createDBEncryption,
  type DatabaseFieldEncryption,
} from '../src/lib/encryption';

describe('加密工具测试', () => {
  const testPassword = 'test-encryption-password-123';

  describe('文本加密和解密', () => {
    it('应该成功加密文本', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext, testPassword);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.length).toBeGreaterThan(plaintext.length);
    });

    it('应该成功解密文本', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext, testPassword);
      const decrypted = decrypt(encrypted, testPassword);

      expect(decrypted).toBe(plaintext);
    });

    it('应该加密和解密空字符串', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext, testPassword);
      const decrypted = decrypt(encrypted, testPassword);

      expect(decrypted).toBe(plaintext);
    });

    it('应该加密和解密特殊字符', () => {
      const plaintext = '特殊字符 !@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
      const encrypted = encrypt(plaintext, testPassword);
      const decrypted = decrypt(encrypted, testPassword);

      expect(decrypted).toBe(plaintext);
    });

    it('应该加密和解密长文本', () => {
      const plaintext = 'A'.repeat(10000);
      const encrypted = encrypt(plaintext, testPassword);
      const decrypted = decrypt(encrypted, testPassword);

      expect(decrypted).toBe(plaintext);
    });

    it('应该使用相同密码产生不同的密文（随机性）', () => {
      const plaintext = 'Hello, World!';
      const encrypted1 = encrypt(plaintext, testPassword);
      const encrypted2 = encrypt(plaintext, testPassword);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('应该拒绝错误的密码', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext, testPassword);

      expect(() => {
        decrypt(encrypted, 'wrong-password');
      }).toThrow();
    });

    it('应该拒绝无效的密文', () => {
      const invalidEncrypted = 'invalid-encrypted-data';

      expect(() => {
        decrypt(invalidEncrypted, testPassword);
      }).toThrow();
    });
  });

  describe('对象加密和解密', () => {
    it('应该成功加密对象', () => {
      const obj = {
        username: 'testuser',
        email: 'test@example.com',
        apiKey: 'secret-api-key-123',
      };

      const encrypted = encryptObject(obj, testPassword);
      const decrypted = decryptObject(encrypted, testPassword);

      expect(decrypted).toEqual(obj);
    });

    it('应该加密和解密嵌套对象', () => {
      const obj = {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          profile: {
            age: 30,
            address: {
              city: 'Test City',
              country: 'Test Country',
            },
          },
        },
      };

      const encrypted = encryptObject(obj, testPassword);
      const decrypted = decryptObject(encrypted, testPassword);

      expect(decrypted).toEqual(obj);
    });

    it('应该加密和解码数组', () => {
      const arr = [1, 2, 3, 'four', { five: 5 }];
      const encrypted = encryptObject(arr, testPassword);
      const decrypted = decryptObject(encrypted, testPassword);

      expect(decrypted).toEqual(arr);
    });
  });

  describe('数据库字段加密', () => {
    let dbEncryption: DatabaseFieldEncryption;

    beforeEach(() => {
      dbEncryption = createDBEncryption(testPassword);
    });

    it('应该成功加密字段', () => {
      const value = 'sensitive-data';
      const encrypted = dbEncryption.encryptField(value);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(value);
    });

    it('应该成功解密字段', () => {
      const value = 'sensitive-data';
      const encrypted = dbEncryption.encryptField(value);
      const decrypted = dbEncryption.decryptField(encrypted);

      expect(decrypted).toBe(value);
    });

    it('应该处理 null 值', () => {
      const encrypted = dbEncryption.encryptField(null);
      expect(encrypted).toBeNull();
    });

    it('应该处理 undefined 值', () => {
      const encrypted = dbEncryption.encryptField(undefined);
      expect(encrypted).toBeNull();
    });

    it('应该加密对象的多个字段', () => {
      const user = {
        username: 'testuser',
        email: 'test@example.com',
        phone: '123-456-7890',
        address: '123 Test St',
      };

      const encrypted = dbEncryption.encryptFields(user, ['phone', 'address']);

      expect(encrypted.username).toBe('testuser');
      expect(encrypted.email).toBe('test@example.com');
      expect(encrypted.phone).not.toBe('123-456-7890');
      expect(encrypted.address).not.toBe('123 Test St');
    });

    it('应该解密对象的多个字段', () => {
      const user = {
        username: 'testuser',
        email: 'test@example.com',
        phone: '123-456-7890',
        address: '123 Test St',
      };

      const encrypted = dbEncryption.encryptFields(user, ['phone', 'address']);
      const decrypted = dbEncryption.decryptFields(encrypted, ['phone', 'address']);

      expect(decrypted.username).toBe('testuser');
      expect(decrypted.email).toBe('test@example.com');
      expect(decrypted.phone).toBe('123-456-7890');
      expect(decrypted.address).toBe('123 Test St');
    });
  });

  describe('安全随机数生成', () => {
    it('应该生成指定长度的随机字符串', () => {
      const random = generateSecureRandom(32);

      expect(random).toBeDefined();
      expect(typeof random).toBe('string');
      expect(random.length).toBe(32);
    });

    it('应该生成不同的随机值', () => {
      const random1 = generateSecureRandom(32);
      const random2 = generateSecureRandom(32);

      expect(random1).not.toBe(random2);
    });

    it('应该使用十六进制字符', () => {
      const random = generateSecureRandom(32);
      const hexRegex = /^[0-9a-f]+$/;

      expect(hexRegex.test(random)).toBe(true);
    });
  });

  describe('哈希和验证', () => {
    it('应该生成哈希值', () => {
      const data = 'data-to-hash';
      const hashed = hash(data);

      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe('string');
      expect(hashed.length).toBe(64); // SHA-256 产生 64 字符的十六进制字符串
    });

    it('应该验证正确的哈希', () => {
      const data = 'data-to-hash';
      const hashed = hash(data);

      expect(verifyHash(data, hashed)).toBe(true);
    });

    it('应该拒绝错误的哈希', () => {
      const data = 'data-to-hash';
      const wrongData = 'wrong-data';
      const hashed = hash(data);

      expect(verifyHash(wrongData, hashed)).toBe(false);
    });

    it('相同数据产生相同哈希', () => {
      const data = 'same-data';
      const hash1 = hash(data);
      const hash2 = hash(data);

      expect(hash1).toBe(hash2);
    });
  });

  describe('HMAC', () => {
    it('应该生成 HMAC 签名', () => {
      const data = 'data-to-sign';
      const secret = 'secret-key';
      const hmac = generateHMAC(data, secret);

      expect(hmac).toBeDefined();
      expect(typeof hmac).toBe('string');
      expect(hmac.length).toBe(64); // SHA-256 HMAC 产生 64 字符的十六进制字符串
    });

    it('应该验证正确的 HMAC', () => {
      const data = 'data-to-sign';
      const secret = 'secret-key';
      const hmac = generateHMAC(data, secret);

      expect(verifyHMAC(data, hmac, secret)).toBe(true);
    });

    it('应该拒绝错误的 HMAC', () => {
      const data = 'data-to-sign';
      const secret = 'secret-key';
      const wrongHmac = 'wrong-hmac-value';

      expect(verifyHMAC(data, wrongHmac, secret)).toBe(false);
    });

    it('应该拒绝错误的密钥', () => {
      const data = 'data-to-sign';
      const secret = 'secret-key';
      const wrongSecret = 'wrong-secret';
      const hmac = generateHMAC(data, secret);

      expect(verifyHMAC(data, hmac, wrongSecret)).toBe(false);
    });

    it('相同数据产生相同 HMAC', () => {
      const data = 'same-data';
      const secret = 'same-secret';
      const hmac1 = generateHMAC(data, secret);
      const hmac2 = generateHMAC(data, secret);

      expect(hmac1).toBe(hmac2);
    });
  });
});
