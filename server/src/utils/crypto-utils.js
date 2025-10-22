/**
 * 加密工具库
 * 提供对称加密（AES）和非对称加密（RSA）功能
 */

import crypto from 'crypto';

/**
 * ==========================================
 * 对称加密（AES）
 * ==========================================
 */

/**
 * AES-256-GCM 加密
 * @param {string} plaintext - 明文
 * @param {string} secretKey - 密钥（至少32字符）
 * @returns {object} - { encrypted: string, iv: string, authTag: string }
 */
function aesEncrypt(plaintext, secretKey) {
    try {
        // 确保密钥长度为 32 字节（256位）
        const key = crypto.scryptSync(secretKey, 'salt', 32);
        
        // 生成随机初始化向量
        const iv = crypto.randomBytes(16);
        
        // 创建加密器
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        
        // 加密数据
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // 获取认证标签
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted: encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    } catch (error) {
        throw new Error(`AES 加密失败: ${error.message}`);
    }
}

/**
 * AES-256-GCM 解密
 * @param {string} encrypted - 密文
 * @param {string} secretKey - 密钥
 * @param {string} iv - 初始化向量
 * @param {string} authTag - 认证标签
 * @returns {string} - 明文
 */
function aesDecrypt(encrypted, secretKey, iv, authTag) {
    try {
        // 确保密钥长度为 32 字节
        const key = crypto.scryptSync(secretKey, 'salt', 32);
        
        // 创建解密器
        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            key,
            Buffer.from(iv, 'hex')
        );
        
        // 设置认证标签
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        
        // 解密数据
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        throw new Error(`AES 解密失败: ${error.message}`);
    }
}

/**
 * AES 加密（简化版本，返回单个字符串）
 * @param {string} plaintext - 明文
 * @param {string} secretKey - 密钥
 * @returns {string} - base64 编码的加密字符串
 */
function aesEncryptSimple(plaintext, secretKey) {
    try {
        const result = aesEncrypt(plaintext, secretKey);
        
        // 将所有部分组合成一个字符串
        const combined = JSON.stringify({
            e: result.encrypted,
            i: result.iv,
            a: result.authTag
        });
        
        return Buffer.from(combined).toString('base64');
    } catch (error) {
        throw new Error(`AES 加密失败: ${error.message}`);
    }
}

/**
 * AES 解密（简化版本）
 * @param {string} encryptedData - base64 编码的加密字符串
 * @param {string} secretKey - 密钥
 * @returns {string} - 明文
 */
function aesDecryptSimple(encryptedData, secretKey) {
    try {
        // 解析加密数据
        const combined = Buffer.from(encryptedData, 'base64').toString('utf8');
        const { e, i, a } = JSON.parse(combined);
        
        return aesDecrypt(e, secretKey, i, a);
    } catch (error) {
        throw new Error(`AES 解密失败: ${error.message}`);
    }
}

/**
 * ==========================================
 * 非对称加密（RSA）
 * ==========================================
 */

/**
 * 生成 RSA 密钥对
 * @param {number} modulusLength - 密钥长度（默认 2048）
 * @returns {object} - { publicKey: string, privateKey: string }
 */
function generateRSAKeyPair(modulusLength = 2048) {
    try {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: modulusLength,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });
        
        return { publicKey, privateKey };
    } catch (error) {
        throw new Error(`生成 RSA 密钥对失败: ${error.message}`);
    }
}

/**
 * RSA 公钥加密
 * @param {string} plaintext - 明文
 * @param {string} publicKey - 公钥（PEM 格式）
 * @returns {string} - base64 编码的密文
 */
function rsaEncrypt(plaintext, publicKey) {
    try {
        const encrypted = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            Buffer.from(plaintext, 'utf8')
        );
        
        return encrypted.toString('base64');
    } catch (error) {
        throw new Error(`RSA 加密失败: ${error.message}`);
    }
}

/**
 * RSA 私钥解密
 * @param {string} encrypted - base64 编码的密文
 * @param {string} privateKey - 私钥（PEM 格式）
 * @returns {string} - 明文
 */
function rsaDecrypt(encrypted, privateKey) {
    try {
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            Buffer.from(encrypted, 'base64')
        );
        
        return decrypted.toString('utf8');
    } catch (error) {
        throw new Error(`RSA 解密失败: ${error.message}`);
    }
}

/**
 * RSA 私钥签名
 * @param {string} data - 要签名的数据
 * @param {string} privateKey - 私钥
 * @returns {string} - base64 编码的签名
 */
function rsaSign(data, privateKey) {
    try {
        const sign = crypto.createSign('SHA256');
        sign.update(data);
        sign.end();
        
        const signature = sign.sign(privateKey);
        return signature.toString('base64');
    } catch (error) {
        throw new Error(`RSA 签名失败: ${error.message}`);
    }
}

/**
 * RSA 公钥验证签名
 * @param {string} data - 原始数据
 * @param {string} signature - base64 编码的签名
 * @param {string} publicKey - 公钥
 * @returns {boolean} - 验证结果
 */
function rsaVerify(data, signature, publicKey) {
    try {
        const verify = crypto.createVerify('SHA256');
        verify.update(data);
        verify.end();
        
        return verify.verify(publicKey, Buffer.from(signature, 'base64'));
    } catch (error) {
        throw new Error(`RSA 验证失败: ${error.message}`);
    }
}

/**
 * ==========================================
 * 哈希函数
 * ==========================================
 */

/**
 * MD5 哈希
 * @param {string} data - 数据
 * @returns {string} - MD5 哈希值
 */
function md5(data) {
    return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * SHA256 哈希
 * @param {string} data - 数据
 * @returns {string} - SHA256 哈希值
 */
function sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * SHA512 哈希
 * @param {string} data - 数据
 * @returns {string} - SHA512 哈希值
 */
function sha512(data) {
    return crypto.createHash('sha512').update(data).digest('hex');
}

/**
 * HMAC-SHA256
 * @param {string} data - 数据
 * @param {string} secret - 密钥
 * @returns {string} - HMAC 值
 */
function hmacSha256(data, secret) {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * ==========================================
 * 随机数生成
 * ==========================================
 */

/**
 * 生成随机字符串
 * @param {number} length - 长度
 * @returns {string} - 随机字符串
 */
function randomString(length = 32) {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
}

/**
 * 生成随机数字
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} - 随机数
 */
function randomInt(min = 0, max = 100) {
    return crypto.randomInt(min, max + 1);
}

/**
 * 生成 UUID
 * @returns {string} - UUID
 */
function generateUUID() {
    return crypto.randomUUID();
}

/**
 * ==========================================
 * Base64 编解码
 * ==========================================
 */

/**
 * Base64 编码
 * @param {string} data - 数据
 * @returns {string} - Base64 编码
 */
function base64Encode(data) {
    return Buffer.from(data, 'utf8').toString('base64');
}

/**
 * Base64 解码
 * @param {string} data - Base64 数据
 * @returns {string} - 解码后的数据
 */
function base64Decode(data) {
    return Buffer.from(data, 'base64').toString('utf8');
}

/**
 * URL 安全的 Base64 编码
 * @param {string} data - 数据
 * @returns {string} - URL 安全的 Base64
 */
function base64UrlEncode(data) {
    return Buffer.from(data, 'utf8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * URL 安全的 Base64 解码
 * @param {string} data - URL 安全的 Base64
 * @returns {string} - 解码后的数据
 */
function base64UrlDecode(data) {
    let base64 = data
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    
    // 补充 padding
    while (base64.length % 4) {
        base64 += '=';
    }
    
    return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * ==========================================
 * 导出所有方法
 * ==========================================
 */
export default {
    // 对称加密（AES）
    aes: {
        encrypt: aesEncrypt,
        decrypt: aesDecrypt,
        encryptSimple: aesEncryptSimple,
        decryptSimple: aesDecryptSimple,
    },
    
    // 非对称加密（RSA）
    rsa: {
        generateKeyPair: generateRSAKeyPair,
        encrypt: rsaEncrypt,
        decrypt: rsaDecrypt,
        sign: rsaSign,
        verify: rsaVerify,
    },
    
    // 哈希
    hash: {
        md5,
        sha256,
        sha512,
        hmac: hmacSha256,
    },
    
    // 随机数
    random: {
        string: randomString,
        int: randomInt,
        uuid: generateUUID,
    },
    
    // Base64
    base64: {
        encode: base64Encode,
        decode: base64Decode,
        urlEncode: base64UrlEncode,
        urlDecode: base64UrlDecode,
    },
};

